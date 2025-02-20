import { useState, useEffect } from "react";
import { injectThemeScript } from "../utils/themeScript";

// Inject the theme script immediately
injectThemeScript();

// Function to get initial theme
const getInitialTheme = () => {
  if (typeof window === "undefined") return true;
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    return savedTheme === "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

// Apply theme to document
const applyTheme = (isDark: boolean) => {
  if (typeof window === "undefined") return;
  const root = document.documentElement;

  // Remove existing theme classes
  root.classList.remove("light", "dark");

  // Add new theme class
  root.classList.add(isDark ? "dark" : "light");

  // Update color scheme
  root.style.colorScheme = isDark ? "dark" : "light";
};

export const useTheme = () => {
  const [isDark, setIsDark] = useState(getInitialTheme());

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setIsDark(e.matches);
        applyTheme(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    applyTheme(newTheme);
  };

  return { isDark, toggleTheme };
};
