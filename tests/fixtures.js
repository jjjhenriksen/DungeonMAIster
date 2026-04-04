export function createCrewMember(overrides = {}) {
  const role = overrides.role || "Commander";
  const id = overrides.id || role.toLowerCase().replace(/\s+/g, "-");

  return {
    id,
    name: overrides.name || `${role} Example`,
    role,
    health: overrides.health ?? 80,
    morale: overrides.morale ?? 75,
    extra: {
      label: overrides.extra?.label || "Readiness",
      value: overrides.extra?.value ?? 70,
      detail: overrides.extra?.detail || "Operational margin",
      unit: overrides.extra?.unit || "%",
    },
    status: overrides.status || "Nominal",
    inventory: overrides.inventory || [],
    notes: overrides.notes || "",
    character: {
      callSign: overrides.character?.callSign || "Echo",
      trait: overrides.character?.trait || "Calm under pressure",
      specialty: overrides.character?.specialty || "Operations",
      flaw: overrides.character?.flaw || "Carries too much alone",
      personalStake: overrides.character?.personalStake || "Bring everyone home",
      tensionNote: overrides.character?.tensionNote || "",
      controller: overrides.character?.controller || "human",
    },
  };
}

export function createWorldState(overrides = {}) {
  const crew = overrides.crew || [
    createCrewMember({ id: "commander", role: "Commander", name: "Commander Elias Ward" }),
    createCrewMember({ id: "engineer", role: "Flight Engineer", name: "Chief Tunde Okafor" }),
    createCrewMember({ id: "science", role: "Science Officer", name: "Dr. Tomas Veidt" }),
    createCrewMember({ id: "specialist", role: "Mission Specialist", name: "Lt. Niko Varela" }),
  ];

  return {
    mission: {
      id: "ARTEMIS-07",
      name: "Test Mission",
      phase: "Perimeter hold",
      met: "T+09:41",
      objectives: ["Stabilize the site", "Keep the crew alive"],
      seedId: "cryovent-whisper",
      seedLabel: "Cryovent Whisper",
      decisionPressure: "Choose whether to descend or withdraw.",
      relationshipLedger: {},
      ...(overrides.mission || {}),
    },
    environment: {
      location: "South Rim Vent Shelf",
      hazards: ["Cryogenic blowback", "Regolith collapse pockets"],
      anomaly: "Subsurface resonance",
      visibility: "Low visibility",
      pressure: "Partial EVA window",
      ...(overrides.environment || {}),
    },
    systems: {
      o2: 76,
      power: 67,
      comms: 61,
      propulsion: 59,
      scrubber: "cycling cold-loaded filters",
      thermal: 49,
      nav: 72,
      ...(overrides.systems || {}),
    },
    crew,
    eventLog: overrides.eventLog || [],
  };
}
