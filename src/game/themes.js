export const DEFAULT_THEME_FAMILY_ID = "canopy";
export const DEFAULT_THEME_MODE = "dark";
export const DEFAULT_THEME_ID = "canopy-dark";
export const THEME_STORAGE_KEY = "dungeonmaister-theme";

export const LOCKED_THEME = {
  id: DEFAULT_THEME_ID,
  familyId: DEFAULT_THEME_FAMILY_ID,
  mode: DEFAULT_THEME_MODE,
  label: "Canopy",
  modeLabel: "Dark",
  accent: "#2d6a4f",
  description: "High-contrast sage, carbon, and gold with a clean signal-room edge.",
};

export const THEMES = [LOCKED_THEME];

export function buildThemeId() {
  return DEFAULT_THEME_ID;
}

export function getThemeFamilyId() {
  return DEFAULT_THEME_FAMILY_ID;
}

export function getThemeMode() {
  return DEFAULT_THEME_MODE;
}

export function getThemeById() {
  return LOCKED_THEME;
}

export function isValidTheme(themeId) {
  return themeId === DEFAULT_THEME_ID;
}

export function getStoredTheme() {
  return DEFAULT_THEME_ID;
}
