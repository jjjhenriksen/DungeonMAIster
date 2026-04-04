import { applyMissionOutcome, getMissionOutcome } from "../src/game/missionOutcome.js";
import { createCrewMember, createWorldState } from "./fixtures.js";

describe("missionOutcome", () => {
  test("does not grant victory immediately from a healthy starting state", () => {
    const worldState = createWorldState({
      mission: {
        seedId: "apollo-signal",
        met: "T+00:01",
        outcome: { status: "active", title: "", summary: "" },
      },
      systems: {
        o2: 88,
        power: 84,
        comms: 82,
        thermal: 70,
        nav: 60,
      },
      crew: [
        createCrewMember({ id: "commander", role: "Commander", health: 84 }),
        createCrewMember({ id: "engineer", role: "Flight Engineer", health: 72 }),
        createCrewMember({
          id: "science",
          role: "Science Officer",
          health: 81,
          extra: { label: "Scan Rng", value: 78 },
        }),
        createCrewMember({ id: "specialist", role: "Mission Specialist", health: 67 }),
      ],
    });

    const outcome = getMissionOutcome(worldState);
    expect(outcome.status).toBe("active");
  });

  test("grants an easy victory once seed goals and survivability thresholds are met", () => {
    const scienceOfficer = createCrewMember({
      id: "science",
      role: "Science Officer",
      extra: { label: "Scan Rng", value: 70 },
    });
    const worldState = createWorldState({
      mission: {
        seedId: "apollo-signal",
        met: "T+00:04",
        outcome: { status: "active", title: "", summary: "" },
      },
      systems: {
        o2: 61,
        power: 58,
        comms: 52,
        thermal: 70,
        nav: 60,
      },
      crew: [
        createCrewMember({ id: "commander", role: "Commander", health: 84 }),
        createCrewMember({ id: "engineer", role: "Flight Engineer", health: 72 }),
        scienceOfficer,
        createCrewMember({ id: "specialist", role: "Mission Specialist", health: 67 }),
      ],
    });

    const outcome = getMissionOutcome(worldState);
    expect(outcome.status).toBe("victory");

    const resolved = applyMissionOutcome(worldState);
    expect(resolved.mission.outcome.status).toBe("victory");
    expect(resolved.eventLog[0].msg).toContain("Signal Secured");
  });

  test("declares defeat when the mission is no longer survivable", () => {
    const worldState = createWorldState({
      mission: {
        seedId: "cryovent-whisper",
        met: "T+00:05",
        outcome: { status: "active", title: "", summary: "" },
      },
      systems: {
        o2: 6,
        power: 14,
        comms: 44,
        thermal: 42,
        nav: 60,
      },
      crew: [
        createCrewMember({ id: "commander", role: "Commander", health: 50 }),
        createCrewMember({ id: "engineer", role: "Flight Engineer", health: 12 }),
        createCrewMember({ id: "science", role: "Science Officer", health: 10 }),
        createCrewMember({ id: "specialist", role: "Mission Specialist", health: 45 }),
      ],
    });

    const outcome = getMissionOutcome(worldState);
    expect(outcome.status).toBe("defeat");
    expect(outcome.title).toBe("Mission Lost");
  });

  test("does not declare defeat immediately from an early rough state unless it is catastrophic", () => {
    const worldState = createWorldState({
      mission: {
        seedId: "cryovent-whisper",
        met: "T+00:01",
        outcome: { status: "active", title: "", summary: "" },
      },
      systems: {
        o2: 7,
        power: 14,
        comms: 44,
        thermal: 42,
        nav: 60,
      },
      crew: [
        createCrewMember({ id: "commander", role: "Commander", health: 50 }),
        createCrewMember({ id: "engineer", role: "Flight Engineer", health: 18 }),
        createCrewMember({ id: "science", role: "Science Officer", health: 17 }),
        createCrewMember({ id: "specialist", role: "Mission Specialist", health: 45 }),
      ],
    });

    const outcome = getMissionOutcome(worldState);
    expect(outcome.status).toBe("active");
  });
});
