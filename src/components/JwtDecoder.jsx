import React, { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  ShieldCheck,
  Upload,
  Copy,
  Trash2,
  Key,
  Lock,
  FileSignature,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Building,
  Globe,
  Hash,
  Lightbulb,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  decodeJwt,
  deriveTokenStatus,
  formatUnixTime,
  formatDurationFromNow,
  extractScopes,
  extractWids,
} from "../utils/jwtDecoder";

/* ---------- Sample token (header/payload as in the reference image) ---------- */

const SAMPLE_HEADER = {
  alg: "HS256",
  typ: "JWT",
};

const SAMPLE_PAYLOAD = {
  sub: "1234567890",
  name: "John Doe",
  roles: ["user", "admin"],
  scope: ["api:read", "api:write"],
  wid: "fe164741-123d-42dd-b9d9-66d83e899665",
  iat: 1719497280,
  nbf: 1719497280,
  exp: 1719581200,
  iss: "https://auth.example.com",
  aud: "my-api",
};

function base64UrlEncode(obj) {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const SAMPLE_TOKEN = `${base64UrlEncode(SAMPLE_HEADER)}.${base64UrlEncode(
  SAMPLE_PAYLOAD,
)}.Sf1KxwRJsMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;

/* ---------- Visual accents (purple for the JWT brand, kept project-aligned) ---------- */

const ACCENT = {
  // Red accent so the JWT brand reads as its own thing while still sitting
  // comfortably inside JSONPort's neutral palette (which already uses
  // red for destructive actions and the default `--accent` warm orange).
  brand: "#dc2626",
  brandSoft: "rgba(220, 38, 38, 0.08)",
  brandBorder: "rgba(220, 38, 38, 0.35)",
  header: "#dc2626",
  payload: "#10b981",
  signature: "#f59e0b",
  headerSoft: "rgba(220, 38, 38, 0.10)",
  payloadSoft: "rgba(16, 185, 129, 0.10)",
  signatureSoft: "rgba(245, 158, 11, 0.10)",
};

/* ---------- Helpers ---------- */

function safeStringify(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return "";
  }
}

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v == null || v === "") return [];
  return [String(v)];
}

/* ---------- Small UI primitives ---------- */

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, color, children, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
        {Icon && (
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: color, color: "white" }}
          >
            <Icon size={11} />
          </span>
        )}
        {children}
      </h3>
      {right}
    </div>
  );
}

function MetaRow({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span className="flex items-center gap-2 opacity-70">
        {Icon && <Icon size={12} />}
        {label}
      </span>
      <span
        className={`font-medium ${mono ? "font-mono" : ""} max-w-[60%] truncate text-right`}
        title={typeof value === "string" ? value : undefined}
      >
        {value ?? "N/A"}
      </span>
    </div>
  );
}

function CopyButton({ getValue }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      const v = getValue();
      if (!v) return;
      await navigator.clipboard.writeText(v);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard denied — silently ignore */
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
      title="Copy"
    >
      <Copy size={11} />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Pill({ children, color = ACCENT.brand }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider"
      style={{
        background: `${color}1a`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {children}
    </span>
  );
}

/* ---------- Main component ---------- */

export default function JwtDecoder() {
  const [token, setToken] = useState("");

  const decoded = useMemo(() => decodeJwt(token), [token]);
  const status = useMemo(
    () => deriveTokenStatus(decoded.payload),
    [decoded.payload],
  );

  const headerText = decoded.header
    ? safeStringify(decoded.header)
    : decoded.headerText || "";
  const payloadText = decoded.payload
    ? safeStringify(decoded.payload)
    : decoded.payloadText || "";

  /* ---------- Handlers ---------- */

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setToken(String(e.target.result || ""));
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleLoadSample = () => setToken(SAMPLE_TOKEN);
  const handleClear = () => setToken("");

  const handleDecode = () => {
    // Decoding happens reactively from `token`, but we expose a button so
    // the layout matches the reference and gives a tactile feel.
    setToken((t) => t.trim());
  };

  const handleCopyFull = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
    } catch {
      /* ignore */
    }
  };

  /* ---------- Derived display values ---------- */

  const roles = asArray(decoded.payload?.roles);
  const scopes = extractScopes(decoded.payload);
  const wids = extractWids(decoded.payload);

  const statusMeta = (() => {
    switch (status.state) {
      case "active":
        return { color: "#10b981", icon: CheckCircle2, label: "Active" };
      case "expired":
        return { color: "#ef4444", icon: AlertTriangle, label: "Expired" };
      case "not-yet-valid":
        return { color: "#f59e0b", icon: Clock, label: "Not yet valid" };
      case "inactive":
        return { color: "#6b7280", icon: AlertTriangle, label: "Inactive" };
      default:
        return { color: "#6b7280", icon: Info, label: "Unknown" };
    }
  })();

  /* ---------- Render ---------- */

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto bg-[var(--bg-primary)]">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: ACCENT.brandSoft, color: ACCENT.brand }}
                >
                  <ShieldCheck size={20} />
                </span>
                <h1 className="text-2xl font-bold text-[var(--text-main)]">
                  JWT Decoder
                </h1>
              </div>
              <p className="text-xs opacity-60">
                Decode and inspect JSON Web Tokens instantly.
              </p>
            </div>

            {/* Privacy banner — mirrors the reference */}
            <div
              className="hidden md:flex items-start gap-3 px-4 py-3 rounded-lg border"
              style={{
                background: "rgba(16, 185, 129, 0.06)",
                borderColor: "rgba(16, 185, 129, 0.35)",
                color: "var(--text-main)",
              }}
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: ACCENT.payloadSoft, color: ACCENT.payload }}
              >
                <Lock size={18} />
              </span>
              <div className="text-xs leading-tight">
                <div
                  className="font-semibold mb-0.5"
                  style={{ color: ACCENT.payload }}
                >
                  Your token stays in your browser.
                </div>
                <div className="opacity-70">
                  JSONPort does not send your token to any server.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="jwt-file-upload"
              className="hidden"
              accept=".jwt,.txt,application/jwt,text/plain"
              onChange={handleUpload}
            />
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all"
              onClick={() => document.getElementById("jwt-file-upload").click()}
            >
              <Upload size={14} />
              <span>Load from file</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-all"
              style={{ background: ACCENT.brand }}
              onClick={handleLoadSample}
            >
              <Key size={14} />
              <span>Load Sample Token</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all"
              onClick={handleDecode}
              disabled={!token}
            >
              <ShieldCheck size={14} />
              <span>Decode JWT</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all"
              onClick={handleClear}
              disabled={!token}
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all"
              onClick={handleCopyFull}
              disabled={!token}
            >
              <Copy size={14} />
              <span>Copy Full Token</span>
            </button>
          </div>
        </div>

        {/* Token input */}
        <div className="px-6 pt-4">
          <Card>
            <SectionTitle icon={Key} color={ACCENT.brand}>
              Paste your JWT token
            </SectionTitle>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              spellCheck={false}
              className="w-full font-mono text-xs leading-relaxed bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md p-3 outline-none focus:ring-2 resize-y"
              style={{ minHeight: 110, "--tw-ring-color": ACCENT.brand }}
            />
            {decoded.error && (
              <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{decoded.error}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Legend / segment dots */}
        <div className="px-6 pt-4 flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: ACCENT.header }}
            />
            <span className="font-semibold" style={{ color: ACCENT.header }}>
              Header
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: ACCENT.payload }}
            />
            <span className="font-semibold" style={{ color: ACCENT.payload }}>
              Payload
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: ACCENT.signature }}
            />
            <span className="font-semibold" style={{ color: ACCENT.signature }}>
              Signature
            </span>
          </div>
        </div>

        {/* Decoded panes */}
        <div className="px-6 pt-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Header */}
          <Card className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: ACCENT.header }}
                />
                <span style={{ color: ACCENT.header }}>Header</span>
              </h3>
              <CopyButton getValue={() => headerText} />
            </div>
            <div
              className="rounded-md border overflow-hidden"
              style={{ borderColor: ACCENT.brandBorder, background: "var(--bg-primary)" }}
            >
              <Editor
                height="220px"
                defaultLanguage="json"
                theme="vs"
                value={headerText || "// Paste a JWT to view its header"}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 12,
                  wordWrap: "on",
                  lineNumbers: "on",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </Card>

          {/* Payload */}
          <Card className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: ACCENT.payload }}
                />
                <span style={{ color: ACCENT.payload }}>Payload</span>
              </h3>
              <CopyButton getValue={() => payloadText} />
            </div>
            <div
              className="rounded-md border overflow-hidden"
              style={{ borderColor: "rgba(16, 185, 129, 0.35)", background: "var(--bg-primary)" }}
            >
              <Editor
                height="220px"
                defaultLanguage="json"
                theme="vs"
                value={payloadText || "// Paste a JWT to view its payload"}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 12,
                  wordWrap: "on",
                  lineNumbers: "on",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </Card>

          {/* Signature */}
          <Card className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: ACCENT.signature }}
                />
                <span style={{ color: ACCENT.signature }}>Signature</span>
              </h3>
              <CopyButton getValue={() => decoded.signature} />
            </div>
            <div
              className="rounded-md border p-3 font-mono text-xs break-all"
              style={{
                borderColor: "rgba(245, 158, 11, 0.35)",
                background: ACCENT.signatureSoft,
              }}
            >
              {decoded.signature || "—"}
            </div>
            <div
              className="mt-3 rounded-md p-3 text-xs leading-relaxed"
              style={{
                background: "rgba(59, 130, 246, 0.08)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                color: "var(--text-main)",
              }}
            >
              <div className="flex items-start gap-2">
                <Info size={14} className="mt-0.5 flex-shrink-0 text-blue-500" />
                <div>
                  <div className="font-semibold mb-0.5 text-blue-600">
                    This is the digital signature of the token.
                  </div>
                  <div className="opacity-70">
                    JWT decoding does not verify the signature.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom row: Status / Info / Important Claims / Permissions */}
        <div className="px-6 pt-4 grid grid-cols-1 lg:grid-cols-4 gap-4 pb-6">
          {/* Token Status */}
          <Card>
            <SectionTitle icon={ShieldCheck} color={ACCENT.brand}>
              Token Status
            </SectionTitle>
            <div className="flex items-center gap-3 mb-3">
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: `${statusMeta.color}1a`, color: statusMeta.color }}
              >
                <statusMeta.icon size={18} />
              </span>
              <div>
                <div className="text-sm font-bold" style={{ color: statusMeta.color }}>
                  {statusMeta.label}
                </div>
                <div className="text-[11px] opacity-70">{status.message}</div>
              </div>
            </div>
            <div className="border-t border-[var(--border-color)] pt-3 space-y-0.5">
              <MetaRow icon={Calendar} label="Issued At (iat)" value={formatUnixTime(decoded.payload?.iat)} />
              <MetaRow icon={Calendar} label="Not Before (nbf)" value={formatUnixTime(decoded.payload?.nbf)} />
              <MetaRow icon={Calendar} label="Expires At (exp)" value={formatUnixTime(decoded.payload?.exp)} />
              <MetaRow
                icon={Clock}
                label="Remaining Time"
                value={
                  typeof decoded.payload?.exp === "number"
                    ? formatDurationFromNow(decoded.payload.exp)
                    : "N/A"
                }
              />
            </div>
          </Card>

          {/* Token Information */}
          <Card>
            <SectionTitle icon={Info} color={ACCENT.brand}>
              Token Information
            </SectionTitle>
            <div className="space-y-0.5">
              <MetaRow icon={Key} label="Algorithm" value={decoded.header?.alg ?? "N/A"} />
              <MetaRow icon={Hash} label="Token Type" value={decoded.header?.typ ?? "N/A"} />
              <MetaRow icon={Building} label="Issuer (iss)" value={decoded.payload?.iss ?? "N/A"} />
              <MetaRow icon={Globe} label="Audience (aud)" value={decoded.payload?.aud ?? "N/A"} />
              <MetaRow icon={User} label="Subject (sub)" value={decoded.payload?.sub ?? "N/A"} />
              <MetaRow icon={Hash} label="JWT ID (jti)" value={decoded.payload?.jti ?? "N/A"} />
            </div>
          </Card>

          {/* Important Claims */}
          <Card>
            <SectionTitle icon={Lightbulb} color={ACCENT.brand}>
              Important Claims
            </SectionTitle>
            <div className="space-y-0.5">
              <MetaRow icon={User} label="User ID (sub)" value={decoded.payload?.sub ?? "N/A"} mono />
              <div className="flex items-start justify-between py-1.5 text-xs gap-3">
                <span className="flex items-center gap-2 opacity-70 flex-shrink-0">
                  <Building size={12} /> Roles (roles)
                </span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                  {roles.length === 0 ? (
                    <span className="opacity-50">N/A</span>
                  ) : (
                    roles.map((r) => <Pill key={r}>{r}</Pill>)
                  )}
                </div>
              </div>
              <div className="flex items-start justify-between py-1.5 text-xs gap-3">
                <span className="flex items-center gap-2 opacity-70 flex-shrink-0">
                  <Globe size={12} /> Scopes (scope / scp)
                </span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                  {scopes.length === 0 ? (
                    <span className="opacity-50">N/A</span>
                  ) : (
                    scopes.map((s) => (
                      <Pill key={s} color={ACCENT.payload}>
                        {s}
                      </Pill>
                    ))
                  )}
                </div>
              </div>
              <MetaRow
                icon={Hash}
                label="WID (wid)"
                value={decoded.payload?.wid ?? "N/A"}
                mono
              />
              {wids.length > 0 && (
                <div className="flex items-start justify-between py-1.5 text-xs gap-3">
                  <span className="flex items-center gap-2 opacity-70 flex-shrink-0">
                    <Hash size={12} /> WIDs (wids)
                  </span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                    {wids.map((w) => (
                      <Pill key={w}>{w}</Pill>
                    ))}
                  </div>
                </div>
              )}
              <MetaRow
                icon={Building}
                label="Issuer (iss)"
                value={decoded.payload?.iss ?? "N/A"}
              />
              <MetaRow
                icon={Globe}
                label="Audience (aud)"
                value={decoded.payload?.aud ?? "N/A"}
              />
            </div>
          </Card>

          {/* Permissions Overview */}
          <Card>
            <SectionTitle icon={FileSignature} color={ACCENT.brand}>
              Permissions Overview
            </SectionTitle>
            <div className="mb-3">
              <div className="text-xs font-semibold mb-1">Roles</div>
              <div className="flex flex-wrap gap-1">
                {roles.length === 0 ? (
                  <span className="text-[11px] opacity-50">No roles declared.</span>
                ) : (
                  roles.map((r) => <Pill key={r}>{r}</Pill>)
                )}
              </div>
              <p className="text-[11px] opacity-60 mt-1">
                Roles determine the level of access granted to the user.
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold mb-1">Scopes</div>
              <div className="flex flex-wrap gap-1">
                {scopes.length === 0 ? (
                  <span className="text-[11px] opacity-50">No scopes declared.</span>
                ) : (
                  scopes.map((s) => (
                    <Pill key={s} color={ACCENT.payload}>
                      {s}
                    </Pill>
                  ))
                )}
              </div>
              <p className="text-[11px] opacity-60 mt-1">
                Scopes define the specific actions this token is allowed to perform.
              </p>
            </div>
          </Card>
        </div>

        {/* Tip footer */}
        <div className="px-6 pb-6">
          <div
            className="rounded-lg p-3 flex items-start gap-3 text-xs"
            style={{
              background: ACCENT.brandSoft,
              border: `1px solid ${ACCENT.brandBorder}`,
            }}
          >
            <Lightbulb size={16} className="mt-0.5 flex-shrink-0" style={{ color: ACCENT.brand }} />
            <div className="opacity-90">
              <span className="font-semibold">Tip:</span> Look for{" "}
              <span className="font-mono" style={{ color: ACCENT.brand }}>roles</span>,{" "}
              <span className="font-mono" style={{ color: ACCENT.brand }}>wid</span>{" "}
              (workforce ID), and{" "}
              <span className="font-mono" style={{ color: ACCENT.brand }}>scope</span> to
              understand what this token is allowed to do and which user/session it
              belongs to.
            </div>
          </div>
        </div>
    </div>
  );
}
