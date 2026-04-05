import { describe, expect, test } from "vitest";

import {
  generateCrewAroundPlayer,
  getCallSignExamplesForRole,
  getSpecialCrewOverride,
  nameMatchesPreferredRole,
} from "../src/game/worldState.js";
import { CHARACTER_BANKS } from "../src/game/characterBanks.js";

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

  test("returns randomized role-appropriate call sign examples", () => {
    const examples = getCallSignExamplesForRole("Flight Engineer");

    expect(examples).toHaveLength(3);
    expect(new Set(examples).size).toBe(3);
    expect(examples.every((example) => CHARACTER_BANKS.flight_engineer.callSigns.includes(example))).toBe(true);
  });
});
