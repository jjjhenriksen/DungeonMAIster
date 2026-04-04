import { createFollowThroughWindow } from "../src/game/crewCoordination.js";
import { getFollowThroughTurnTarget } from "../src/game/roleMechanics.js";
import { createCrewMember, createWorldState } from "./fixtures.js";

describe("role coordination", () => {
  test("never creates a self-targeted follow-through window", () => {
    const commander = createCrewMember({
      id: "commander",
      role: "Commander",
      name: "Commander Elias Ward",
      character: {
        trait: "Calm leader with steady crew discipline",
        flaw: "Carries too much alone",
      },
    });
    const worldState = createWorldState({ crew: [commander] });

    const supportWindow = createFollowThroughWindow(
      worldState,
      commander,
      "Ward, take command and coordinate the crew.",
      4
    );

    expect(supportWindow).toBeNull();
  });

  test("soft non-tense follow-through windows can claim the next turn", () => {
    const target = createCrewMember({
      id: "science",
      role: "Science Officer",
      name: "Dr. Tomas Veidt",
    });
    const worldState = createWorldState({
      crew: [
        createCrewMember({ id: "commander", role: "Commander" }),
        createCrewMember({ id: "engineer", role: "Flight Engineer" }),
        target,
        createCrewMember({ id: "specialist", role: "Mission Specialist" }),
      ],
      mission: {
        supportWindow: {
          targetCrewId: "science",
          strength: "soft",
          relationshipState: "standard",
        },
      },
    });

    expect(getFollowThroughTurnTarget(worldState)).toEqual(
      expect.objectContaining({ id: "science" })
    );
  });

  test("fragile follow-through windows fall back to round-robin", () => {
    const worldState = createWorldState({
      mission: {
        supportWindow: {
          targetCrewId: "science",
          strength: "fragile",
          relationshipState: "standard",
        },
      },
    });

    expect(getFollowThroughTurnTarget(worldState)).toBeNull();
  });
});
