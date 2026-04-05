import { describe, expect, test } from "vitest";

import {
  generateCrewAroundPlayer,
  getSpecialCrewOverride,
  nameMatchesPreferredRole,
} from "../src/game/worldState.js";

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
    expect(nameMatchesPreferredRole("Jacqueline Henriksen", "Mission Specialist")).toBe(true);
    expect(nameMatchesPreferredRole("Jacqueline Henriksen", "Commander")).toBe(false);
  });

  test("generates non-player crew as autonomous by default", () => {
    const crew = generateCrewAroundPlayer({
      playerName: "Jacqueline Henriksen",
      playerRole: "Science Officer",
    });

    expect(crew.find((profile) => profile.role === "Science Officer")?.controller).toBe("human");
    expect(crew.filter((profile) => profile.role !== "Science Officer").every((profile) => profile.controller === "bot")).toBe(true);
  });
});
