import {
  DEFAULT_THEME_ID,
  getStoredTheme,
  getThemeById,
  getThemeFamilyId,
  getThemeMode,
  isValidTheme,
} from "../src/game/themes.js";

describe("themes", () => {
  test("locks the app to canopy dark", () => {
    expect(DEFAULT_THEME_ID).toBe("canopy-dark");
    expect(getThemeFamilyId("anything")).toBe("canopy");
    expect(getThemeMode("anything")).toBe("dark");
    expect(isValidTheme("canopy-dark")).toBe(true);
    expect(isValidTheme("artemis-dark")).toBe(false);
  });

  test("always returns the locked theme", () => {
    window.localStorage.setItem("dungeonmaister-theme", "bogus-theme");
    expect(getStoredTheme()).toBe("canopy-dark");

    const theme = getThemeById("artemis-dark");
    expect(theme.label).toBe("Canopy");
    expect(theme.mode).toBe("dark");
  });
});
