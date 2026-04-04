import { getMissionSuggestion } from "./missionMechanics.js";
import {
  getCrewByRole,
  getPrimaryHazard,
  getSecondaryHazard,
  getWeakestSystemKey,
} from "./stateUtils.js";

function getObjective(worldState, index = 0) {
  return (
    worldState?.mission?.objectives?.[index] ||
    worldState?.mission?.decisionPressure ||
    "stabilize the crew and keep the mission viable"
  );
}

function createCommanderGuidance(worldState) {
  const engineer = getCrewByRole(worldState, "Flight Engineer");
  const scientist = getCrewByRole(worldState, "Science Officer");
  const specialist = getCrewByRole(worldState, "Mission Specialist");
  const weakestSystem = getWeakestSystemKey(worldState) || "systems";

  return {
    focus: `Set the crew's tempo around ${weakestSystem} pressure and decide who absorbs the next risk.`,
    suggestions: [
      `Order ${engineer?.name || "the engineer"} to stabilize ${weakestSystem} before anyone pushes deeper.`,
      `Direct ${scientist?.name || "the science officer"} to verify the signal while ${specialist?.name || "the specialist"} holds position.`,
      `Call a conservative fallback plan that protects crew survival over mission speed.`,
    ],
  };
}

function createEngineerGuidance(worldState, activeCrew) {
  const weakestSystem = getWeakestSystemKey(worldState) || "systems";
  const hazard = getPrimaryHazard(worldState);

  return {
    focus: `Recover system margin before ${weakestSystem} failure turns the anomaly into a cascade.`,
    suggestions: [
      `${activeCrew?.name || "The engineer"} reroutes load away from ${weakestSystem} and reports the recovery margin.`,
      `Inspect the current fault path for damage tied to ${hazard} and patch the weakest point first.`,
      `Trade short-term capability for stability by shutting down nonessential draw and protecting life support.`,
    ],
  };
}

function createScienceGuidance(worldState, activeCrew) {
  const anomaly = worldState?.environment?.anomaly || "the signal";
  const pressure = getObjective(worldState);

  return {
    focus: `Turn noisy anomaly data into a decision the rest of the crew can actually act on.`,
    suggestions: [
      `${activeCrew?.name || "The science officer"} isolates the cleanest read on ${anomaly} and flags whether it is trustworthy.`,
      `Compare the latest signal behavior against the last sweep and call out what changed.`,
      `Frame a recommendation around ${pressure} so command can choose between caution and pursuit.`,
    ],
  };
}

function createSpecialistGuidance(worldState, activeCrew) {
  const hazard = getPrimaryHazard(worldState);
  const terrain = getSecondaryHazard(worldState);

  return {
    focus: `Translate mission intent into a physical move the crew can survive in this terrain.`,
    suggestions: [
      `${activeCrew?.name || "The specialist"} scouts the safest route around ${hazard} and marks a fallback path.`,
      `Secure the immediate area against ${terrain} before committing the next EVA movement.`,
      `Use field gear to buy the crew a safer physical option instead of the fastest one.`,
    ],
  };
}

export function getRoleGuidance(worldState, activeCrew) {
  const missionSuggestion = getMissionSuggestion(worldState, activeCrew);

  if (!activeCrew) {
    return {
      focus: "Stabilize the mission state and create one safe, decisive next move.",
      suggestions: [],
    };
  }

  const withMissionSuggestion = (guidance) => ({
    ...guidance,
    suggestions: [missionSuggestion, ...guidance.suggestions].filter(Boolean).slice(0, 3),
  });

  switch (activeCrew.role) {
    case "Commander":
      return withMissionSuggestion(createCommanderGuidance(worldState));
    case "Flight Engineer":
      return withMissionSuggestion(createEngineerGuidance(worldState, activeCrew));
    case "Science Officer":
      return withMissionSuggestion(createScienceGuidance(worldState, activeCrew));
    case "Mission Specialist":
      return withMissionSuggestion(createSpecialistGuidance(worldState, activeCrew));
    default:
      return {
        focus: "Assess the immediate danger and create a safe next move for the crew.",
        suggestions: [],
      };
  }
}
