import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

/**
 * ThemeProvider manages the global visual state of the application.
 * It handles theme persistence via localStorage.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("jsonport-theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jsonport-theme", theme);
  }, [theme]);

  /**
   * Updates the current theme.
   * @param {string} newTheme - The theme key (e.g., 'dark', 'forest', 'sunset').
   */
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
