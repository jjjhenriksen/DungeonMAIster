import { describe, expect, test } from "vitest";

import { getSpecialCrewOverride, nameMatchesPreferredRole } from "../src/game/worldState.js";

describe("special crew overrides", () => {
  test("applies fixed call signs for named easter eggs", () => {
    expect(getSpecialCrewOverride("LouAnne Boyd")).toMatchObject({
      callSigns: ["Disco Ball"],
      preferredRole: "Flight Engineer",
    });
  });

  test("respects preferred role matching for named crew", () => {
    expect(nameMatchesPreferredRole("LouAnne Boyd", "Flight Engineer")).toBe(true);
    expect(nameMatchesPreferredRole("LouAnne Boyd", "Commander")).toBe(false);
    expect(nameMatchesPreferredRole("Jacqueline Henriksen", "Commander")).toBe(true);
  });
});
