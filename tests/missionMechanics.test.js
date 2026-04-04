import {
  createMissionTurnEffect,
  getMissionOpportunityPreview,
} from "../src/missionMechanics.js";
import { createCrewMember, createWorldState } from "./fixtures.js";

describe("missionMechanics", () => {
  test("applies cryovent mission bonuses for aligned specialist actions", () => {
    const specialist = createCrewMember({
      id: "specialist",
      role: "Mission Specialist",
      name: "Lt. Niko Varela",
      extra: { value: 34, label: "EVA Suit" },
    });
    const worldState = createWorldState({
      mission: { seedId: "cryovent-whisper" },
      crew: [
        createCrewMember({ id: "commander", role: "Commander" }),
        createCrewMember({ id: "engineer", role: "Flight Engineer" }),
        createCrewMember({ id: "science", role: "Science Officer" }),
        specialist,
      ],
    });

    const result = createMissionTurnEffect(
      worldState,
      specialist,
      "Scout the vent shelf and secure the EVA route."
    );

    expect(result.delta.systems.thermal).toBe(53);
    expect(result.delta.crew).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "specialist",
          extra: { value: 38 },
        }),
      ])
    );
  });

  test("returns an aligned mission preview only for eligible role wording", () => {
    const scientist = createCrewMember({ role: "Science Officer", id: "science" });
    const worldState = createWorldState({ mission: { seedId: "apollo-signal" } });

    const preview = getMissionOpportunityPreview(
      worldState,
      scientist,
      "Isolate the Apollo carrier signal and read the pattern."
    );

    expect(preview.level).toBe("aligned");
    expect(preview.label).toBe("Mission leverage");
  });

  test("does not apply mission effects for off-role or unaligned actions", () => {
    const commander = createCrewMember({ role: "Commander", id: "commander" });
    const worldState = createWorldState({ mission: { seedId: "blackglass-breach" } });

    const result = createMissionTurnEffect(worldState, commander, "Check on crew morale and hold position.");

    expect(result).toEqual({ delta: {} });
  });
});
