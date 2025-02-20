// This script runs immediately and prevents flash of wrong theme
export const themeScript = `
(function() {
  function getInitialTheme() {
    const persistedColorPreference = window.localStorage.getItem('theme');
    const hasPersistedPreference = typeof persistedColorPreference === 'string';

    if (hasPersistedPreference) {
      return persistedColorPreference === 'dark';
    }

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const hasMediaQueryPreference = typeof mql.matches === 'boolean';

    if (hasMediaQueryPreference) {
      return mql.matches;
    }

    return true; // Default to dark theme
  }

  const isDark = getInitialTheme();
  
  // Remove any existing theme class
  document.documentElement.classList.remove('light', 'dark');
  
  // Add the correct theme class
  document.documentElement.classList.add(isDark ? 'dark' : 'light');
  
  // Prevent transition flash
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
})()
`;

// Function to inject the script
export const injectThemeScript = () => {
  if (typeof window === "undefined") return;

  const scriptId = "theme-script";
  if (document.getElementById(scriptId)) return;

  const script = document.createElement("script");
  script.id = scriptId;
  script.innerHTML = themeScript;

  // Insert the script at the beginning of head to run as early as possible
  const head = document.head || document.getElementsByTagName("head")[0];
  head.insertBefore(script, head.firstChild);
};
