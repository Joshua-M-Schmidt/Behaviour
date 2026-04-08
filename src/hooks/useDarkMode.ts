"use client";

import { useEffect, useCallback, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("behaviour-theme");
    const dark = stored === "dark";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("behaviour-theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  const setDark = useCallback((dark: boolean) => {
    setIsDark(dark);
    localStorage.setItem("behaviour-theme", dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  return { isDark, toggle, setDark };
}
