const THEME_STORAGE_KEY = "wintopay_theme";
const themeRoot = document.documentElement;

function getPreferredTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  themeRoot.dataset.theme = theme;
  document.querySelectorAll(".theme-toggle").forEach((button) => {
    button.textContent = isDark ? "☀" : "☾";
    button.setAttribute("aria-label", isDark ? "Activar modo claro" : "Activar modo nocturno");
    button.setAttribute("aria-pressed", String(isDark));
  });
}

applyTheme(getPreferredTheme());

document.querySelectorAll(".theme-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const nextTheme = themeRoot.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  });
});
