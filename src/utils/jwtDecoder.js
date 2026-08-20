/**
 * JWT utilities for the JWT Decoder tool.
 *
 * Decodes the three base64url-encoded segments of a JSON Web Token into
 * plain text so the UI can display and pretty-print them.  This module
 * deliberately does NOT verify the signature — decoding JWTs and
 * verifying JWTs are separate concerns.
 */

/**
 * Convert a base64url string into a "normal" base64 string.
 *
 * base64url replaces `+` with `-`, `/` with `_`, and strips padding
 * (`=`).  The browser's `atob` only accepts the standard alphabet so
 * we translate back before decoding.
 */
function base64UrlToBase64(input) {
  let str = input.replace(/-/g, "+").replace(/_/g, "/");
  // Pad to a multiple of 4
  const pad = str.length % 4;
  if (pad === 2) str += "==";
  else if (pad === 3) str += "=";
  else if (pad === 1)
    throw new Error("Invalid base64url length");
  return str;
}

/**
 * Decode a base64url-encoded string into a UTF-8 string.
 * Returns an empty string on failure.
 */
export function decodeBase64Url(input) {
  if (!input) return "";
  try {
    const base64 = base64UrlToBase64(input);
    const binary = atob(base64);
    // atob gives us a binary string; convert bytes → UTF-8
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return "";
  }
}

/**
 * Try to JSON-parse a string.  Returns the parsed value (or `null`)
 * and a flag indicating whether parsing succeeded.
 */
export function safeJsonParse(text) {
  if (!text) return { value: null, ok: false };
  try {
    return { value: JSON.parse(text), ok: true };
  } catch {
    return { value: null, ok: false };
  }
}

/**
 * Decode a JWT and return its three segments.
 *
 * Return shape:
 *   {
 *     raw:        "eyJ..." // the original token
 *     header:     { alg, typ, ... } | null   // parsed JSON object
 *     headerText: string                       // raw JSON text
 *     payload:    { ... }    | null
 *     payloadText: string
 *     signature:  string                       // opaque base64url text
 *     error:      string | null                // human-readable error
 *   }
 */
export function decodeJwt(token) {
  const result = {
    raw: token || "",
    header: null,
    headerText: "",
    payload: null,
    payloadText: "",
    signature: "",
    error: null,
  };

  const trimmed = (token || "").trim();
  if (!trimmed) {
    result.error = "Paste a JWT to decode it.";
    return result;
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    result.error = `A JWT must contain exactly 3 dot-separated parts — found ${parts.length}.`;
    return result;
  }

  const [headerPart, payloadPart, signaturePart] = parts;

  const headerText = decodeBase64Url(headerPart);
  const payloadText = decodeBase64Url(payloadPart);

  const header = safeJsonParse(headerText);
  const payload = safeJsonParse(payloadText);

  if (!header.ok) {
    result.error = "Header segment is not valid base64url-encoded JSON.";
  } else if (!payload.ok) {
    result.error = "Payload segment is not valid base64url-encoded JSON.";
  }

  result.header = header.ok ? header.value : null;
  result.headerText = headerText;
  result.payload = payload.ok ? payload.value : null;
  result.payloadText = payloadText;
  result.signature = signaturePart;

  return result;
}

/**
 * Derive a token-status summary used by the "Token Status" panel.
 *
 *   {
 *     state:  "active" | "expired" | "inactive" | "not-yet-valid" | "unknown"
 *     message: string
 *   }
 */
export function deriveTokenStatus(payload) {
  if (!payload || typeof payload !== "object") {
    return { state: "unknown", message: "No payload to inspect." };
  }

  const now = Math.floor(Date.now() / 1000);

  if (typeof payload.exp === "number") {
    if (now >= payload.exp) {
      return { state: "expired", message: "The token has expired." };
    }
    return { state: "active", message: "The token is valid and not expired." };
  }
  if (typeof payload.nbf === "number" && now < payload.nbf) {
    return {
      state: "not-yet-valid",
      message: "Token is not yet valid (nbf is in the future).",
    };
  }
  if (payload.active === false) {
    return { state: "inactive", message: "The token is marked inactive." };
  }
  return { state: "active", message: "The token is valid and not expired." };
}

/**
 * Convert a UNIX timestamp (seconds) into a human-readable UTC string.
 * Returns "N/A" when the input is missing.
 */
export function formatUnixTime(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A";
  const ms = value * 1000;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "N/A";
  const pad = (n) => String(n).padStart(2, "0");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const m = months[d.getUTCMonth()];
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  return `${m} ${day}, ${year} ${hh}:${mm}:${ss} UTC`;
}

/**
 * Compute the human-readable distance between two timestamps (seconds).
 * Returns a string like "23 hours 54 minutes 12 seconds".
 *
 * When `unixSeconds` is in the past (e.g. an expired `exp`), the result is
 * prefixed with "expired " so callers can still surface a positive magnitude
 * ("Expired 230 days ago" rather than "N/A").
 */
export function formatDurationFromNow(unixSeconds) {
  if (typeof unixSeconds !== "number" || !Number.isFinite(unixSeconds)) return "N/A";
  const diff = unixSeconds - Math.floor(Date.now() / 1000);
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400);
  const hours = Math.floor((abs % 86400) / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = abs % 60;
  const parts = [];
  if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours || days) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (minutes || hours || days) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  parts.push(`${seconds} second${seconds === 1 ? "" : "s"}`);
  const body = parts.join(" ");
  return diff < 0 ? `expired ${body} ago` : body;
}

/**
 * Normalize the OAuth-style "scopes" claim.
 *
 * Tokens vary in how they expose scopes — Azure AD uses `scp` as a
 * space-delimited string, Auth0/OIDC commonly use `scope` as either an
 * array or a space-delimited string. We accept any of these shapes and
 * always return a flat array of trimmed, non-empty strings.
 */
export function extractScopes(payload) {
  if (!payload || typeof payload !== "object") return [];

  const candidates = [payload.scope, payload.scp, payload.scopes];
  for (const raw of candidates) {
    if (raw == null) continue;
    if (Array.isArray(raw)) {
      const out = raw
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean);
      if (out.length) return out;
      continue;
    }
    if (typeof raw === "string") {
      const out = raw
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (out.length) return out;
    }
  }
  return [];
}

/**
 * Extract the workforce IDs (wids) array from the payload.
 *
 * Azure AD exposes workforce IDs as the `wids` array. Tokens may also
 * carry a single `wid` string. This helper returns a normalized array
 * so callers don't have to special-case each shape.
 */
export function extractWids(payload) {
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.wids)) {
    return payload.wids
      .map((v) => (v == null ? "" : String(v)))
      .filter(Boolean);
  }
  if (typeof payload.wid === "string" && payload.wid.trim()) {
    return [payload.wid.trim()];
  }
  return [];
}
