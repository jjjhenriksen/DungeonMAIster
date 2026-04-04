function clampPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function createCrewMember({
  id,
  name,
  role,
  health,
  morale,
  extra,
  location,
  status,
  inventory,
  notes,
}) {
  return {
    id,
    name,
    role,
    health: clampPercent(health),
    morale: clampPercent(morale),
    extra: {
      label: extra.label,
      value: clampPercent(extra.value),
      detail: extra.detail,
      unit: extra.unit || "%",
    },
    location,
    status,
    inventory,
    notes,
  };
}

export const INITIAL_WORLD_STATE = {
  mission: {
    id: "ARTEMIS-07",
    name: "Lost Signal",
    phase: "Crater approach - active",
    met: "T+14:22:07",
    objectives: [
      "Trace the dormant Apollo-band signal source.",
      "Keep the rover crew alive until a stable comms link is restored.",
      "Recover enough anomaly data to justify a return window.",
    ],
    briefing:
      "Artemis-07 diverted after receiving a structured radio pulse from Shackleton Crater. Mission control lost clean contact twelve minutes later.",
  },
  environment: {
    location: "Shackleton Crater Rim",
    hazards: [
      "Signal interference",
      "Knife-edge crater terrain",
      "Shadowed ice vents",
    ],
    anomaly: "Apollo-band signal with repeating geometric carrier modulation",
    visibility: "Low-angle glare on the rim, deep shadow inside the crater",
    pressure: "EVA only",
  },
  systems: {
    o2: 71,
    power: 82,
    comms: 35,
    propulsion: 64,
    scrubber: "patched",
    thermal: 76,
    nav: 58,
  },
  crew: [
    createCrewMember({
      id: "vasquez",
      name: "Commander Alma Vasquez",
      role: "Commander",
      health: 92,
      morale: 78,
      extra: {
        label: "Authority",
        value: 88,
        detail: "Crew discipline and crisis command bandwidth",
      },
      location: "Command seat, rover cabin",
      status: "Coordinating the crater hold and crew assignments",
      inventory: ["Command slate", "Mission uplink keys", "Emergency flare tags"],
      notes:
        "Prioritizes crew survival over mission prestige. Keeping anxiety contained after the signal spike.",
    }),
    createCrewMember({
      id: "okafor",
      name: "Chief Engineer Tunde Okafor",
      role: "Flight Engineer",
      health: 86,
      morale: 73,
      extra: {
        label: "O2 Sys",
        value: 71,
        detail: "Confidence in life support stability after the scrubber patch",
      },
      location: "Life-support maintenance alcove",
      status: "Monitoring scrubber leaks and power routing",
      inventory: ["Patch kit", "Diagnostic wafer", "Portable sealant gun"],
      notes:
        "Knows the patched scrubber can fail if dust clogs the bypass a second time.",
    }),
    createCrewMember({
      id: "reyes",
      name: "Dr. Imani Reyes",
      role: "Science Officer",
      health: 95,
      morale: 81,
      extra: {
        label: "Scan Rng",
        value: 62,
        detail: "Effective scan confidence through interference noise",
      },
      location: "Sensor mast station",
      status: "Filtering anomaly harmonics from terrain reflections",
      inventory: ["Spectral tablet", "Core sampler", "Signal library"],
      notes:
        "Convinced the source is artificial and older than the current mission profile suggests.",
    }),
    createCrewMember({
      id: "park",
      name: "Lt. Hana Park",
      role: "Mission Specialist",
      health: 79,
      morale: 69,
      extra: {
        label: "EVA Suit",
        value: 34,
        detail: "Suit integrity after a micrometeor scoring hit",
      },
      location: "Airlock prep bench",
      status: "Prepping for a risky surface check near the rim beacon",
      inventory: ["Beacon spool", "Drill", "Backup relay", "Patch foam"],
      notes:
        "Most capable EVA operator on site, but the suit breach margin is uncomfortably thin.",
    }),
  ],
  eventLog: [
    {
      ts: "T+14:22",
      msg: "Anomaly signal detected from Shackleton Crater interior.",
      type: "alert",
    },
    {
      ts: "T+14:19",
      msg: "Telemetry confirms the signal is repeating in deliberate geometric bursts.",
      type: "info",
    },
    {
      ts: "T+14:18",
      msg: "Long-range comms degraded after the rover crossed the rim shadow line.",
      type: "warn",
    },
    {
      ts: "T+14:11",
      msg: "Okafor patched the primary scrubber bypass after a dust-line leak.",
      type: "info",
    },
    {
      ts: "T+13:55",
      msg: "Artemis-07 rover reached the crater rim with all crew nominal.",
      type: "info",
    },
  ],
};

export const OPENING_NARRATION = `The rover eases to a halt on the knife-edge rim of Shackleton Crater, and every speaker in the cabin hisses with an impossible transmission. The signal is old Apollo-band hardware, dead for decades, yet it is pulsing from the darkness below with machine-perfect rhythm.

Dr. Reyes has already stripped the noise away once and the pattern only became stranger. Engineer Okafor warns the scrubber patch may not survive a long delay. Park is halfway into a damaged EVA suit. Commander Vasquez, the crew is looking to you.`;
