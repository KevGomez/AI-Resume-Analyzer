import { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    setIsDark(savedTheme === "dark" || (!savedTheme && systemPrefersDark));

    // Apply the initial theme
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("light", !isDark);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem("theme", !isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", !isDark);
    document.documentElement.classList.toggle("light", isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-tertiary hover:bg-dark-200/50 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <SunIcon className="w-5 h-5 text-primary-400" />
      ) : (
        <MoonIcon className="w-5 h-5 text-primary-400" />
      )}
    </button>
  );
};
