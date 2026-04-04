export const DEFAULT_THEME_ID = "artemis";
export const THEME_STORAGE_KEY = "dungeonmaister-theme";

export const THEMES = [
  {
    id: "artemis",
    label: "Artemis",
    accent: "#6fd3ff",
    description: "Cold command-console blues with a sharper editorial sci-fi finish.",
  },
  {
    id: "sh2025",
    label: "SH2025",
    accent: "#2d6a4f",
    description: "A modern sage-and-carbon reinterpretation of the SH2025 palette.",
  },
  {
    id: "sh1991",
    label: "SH1991",
    accent: "#8c3d4f",
    description: "A cleaner late-night noir take on SH1991 with rose, smoke, and brass.",
  },
];

export function isValidTheme(themeId) {
  return THEMES.some((theme) => theme.id === themeId);
}

export function getStoredTheme() {
  if (typeof window === "undefined") return DEFAULT_THEME_ID;

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isValidTheme(storedTheme) ? storedTheme : DEFAULT_THEME_ID;
}
