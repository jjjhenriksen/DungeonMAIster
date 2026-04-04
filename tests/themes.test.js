import {
  buildThemeId,
  DEFAULT_THEME_ID,
  getStoredTheme,
  getThemeById,
  getThemeFamilyId,
  getThemeMode,
} from "../src/game/themes.js";

describe("themes", () => {
  test("builds and resolves family/mode ids", () => {
    const themeId = buildThemeId("nocturne", "light");
    expect(themeId).toBe("nocturne-light");
    expect(getThemeFamilyId(themeId)).toBe("nocturne");
    expect(getThemeMode(themeId)).toBe("light");
  });

  test("normalizes legacy theme ids", () => {
    expect(getThemeFamilyId("sh2025")).toBe("canopy");
    expect(getThemeMode("sh2025")).toBe("dark");
  });

  test("falls back to the default theme when storage is invalid", () => {
    window.localStorage.setItem("dungeonmaister-theme", "bogus-theme");
    expect(getStoredTheme()).toBe(DEFAULT_THEME_ID);
  });

  test("returns a concrete theme object for valid ids", () => {
    const theme = getThemeById("artemis-dark");
    expect(theme.label).toBe("Artemis");
    expect(theme.mode).toBe("dark");
  });
});
