function getCrewByRole(worldState, role) {
  return worldState?.crew?.find((member) => member.role === role);
}

function getWeakestSystem(worldState) {
  const systems = [
    ["o2", worldState?.systems?.o2],
    ["power", worldState?.systems?.power],
    ["comms", worldState?.systems?.comms],
    ["thermal", worldState?.systems?.thermal],
    ["nav", worldState?.systems?.nav],
    ["propulsion", worldState?.systems?.propulsion],
  ].filter(([, value]) => typeof value === "number");

  return systems.sort((a, b) => a[1] - b[1])[0]?.[0] || "systems";
}

function getPrimaryHazard(worldState) {
  return worldState?.environment?.hazards?.[0] || worldState?.environment?.anomaly || "the anomaly";
}

function getSecondaryHazard(worldState) {
  return worldState?.environment?.hazards?.[1] || worldState?.environment?.visibility || "terrain instability";
}

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
  const weakestSystem = getWeakestSystem(worldState);

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
  const weakestSystem = getWeakestSystem(worldState);
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
  if (!activeCrew) {
    return {
      focus: "Stabilize the mission state and create one safe, decisive next move.",
      suggestions: [],
    };
  }

  switch (activeCrew.role) {
    case "Commander":
      return createCommanderGuidance(worldState);
    case "Flight Engineer":
      return createEngineerGuidance(worldState, activeCrew);
    case "Science Officer":
      return createScienceGuidance(worldState, activeCrew);
    case "Mission Specialist":
      return createSpecialistGuidance(worldState, activeCrew);
    default:
      return {
        focus: "Assess the immediate danger and create a safe next move for the crew.",
        suggestions: [],
      };
  }
}
