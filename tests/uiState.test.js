import { getUiState } from "../src/uiState.js";
import { createCrewMember, createWorldState } from "./fixtures.js";

describe("uiState", () => {
  test("derives high-risk shell state from stressed systems and crew", () => {
    const worldState = createWorldState({
      systems: { o2: 40, power: 44, comms: 28, thermal: 42, nav: 30 },
      crew: [
        createCrewMember({ role: "Commander", health: 52, morale: 48 }),
        createCrewMember({ role: "Flight Engineer", health: 58, morale: 50 }),
      ],
    });

    const uiState = getUiState(worldState);

    expect(uiState.dangerLevel).toBe("critical");
    expect(uiState.dominantFailure).toBe("comms");
  });

  test("builds action panel state for the active crew and current input", () => {
    const activeCrew = createCrewMember({
      id: "science",
      role: "Science Officer",
      name: "Dr. Tomas Veidt",
    });
    const worldState = createWorldState({
      mission: { seedId: "apollo-signal" },
      crew: [
        createCrewMember({ id: "commander", role: "Commander" }),
        createCrewMember({ id: "engineer", role: "Flight Engineer" }),
        activeCrew,
        createCrewMember({ id: "specialist", role: "Mission Specialist" }),
      ],
    });

    const uiState = getUiState(worldState, {
      activeCrew,
      input: "Isolate the Apollo signal and read the pattern.",
    });

    expect(uiState.actionPanel.roleGuidance.focus).toBeTruthy();
    expect(uiState.actionPanel.roleAlignmentPreview.level).toBe("aligned");
    expect(uiState.actionPanel.missionOpportunityPreview.level).toBe("aligned");
  });

  test("surfaces the most recent risk or trait alert", () => {
    const worldState = createWorldState({
      eventLog: [
        { ts: "T+00:02", type: "risk", msg: "Thermal margin is collapsing." },
        { ts: "T+00:01", type: "system", msg: "Older event" },
      ],
    });

    const uiState = getUiState(worldState);
    expect(uiState.latestAlert.label).toBe("Risk Alert");
    expect(uiState.latestAlert.msg).toBe("Thermal margin is collapsing.");
  });
});
