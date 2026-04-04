export const INITIAL_WORLD_STATE = {
  mission: {
    id: "ARTEMIS-07",
    name: "Lost Signal",
    phase: "Crater approach — active",
    met: "T+14:22:07",
    objectives: ["Investigate anomaly signal", "Maintain crew safety"],
  },
  environment: {
    location: "Shackleton Crater Rim",
    hazards: ["Signal interference", "Terrain instability"],
    anomaly: "Apollo-band signal — 50yr dormant, geometric origin suspected",
  },
  systems: {
    o2: 71,
    power: 100,
    comms: 35,
    propulsion: 98,
    scrubber: "patched",
  },
  crew: [
    {
      id: "vasquez",
      name: "Vasquez",
      role: "Commander",
      health: 90,
      morale: 75,
      extra: { label: "Authority", value: 100 },
    },
    {
      id: "okafor",
      name: "Okafor",
      role: "Flight Engineer",
      health: 85,
      morale: 80,
      extra: { label: "O2 Sys", value: 71 },
    },
    {
      id: "reyes",
      name: "Reyes",
      role: "Science Officer",
      health: 95,
      morale: 85,
      extra: { label: "Scan Rng", value: 60 },
    },
    {
      id: "park",
      name: "Park",
      role: "Mission Specialist",
      health: 80,
      morale: 70,
      extra: { label: "EVA Suit", value: 30 },
    },
  ],
  eventLog: [
    {
      ts: "T+14:22",
      msg: "Anomaly signal detected — Shackleton Crater",
      type: "alert",
    },
    {
      ts: "T+14:18",
      msg: "Comms array degraded — unknown interference",
      type: "warn",
    },
    {
      ts: "T+13:55",
      msg: "Rover reached crater rim — all crew nominal",
      type: "info",
    },
    {
      ts: "T+12:30",
      msg: "Okafor patched O2 scrubber — leak sealed",
      type: "info",
    },
  ],
};

export const OPENING_NARRATION = `The rover crests the rim of Shackleton Crater and your displays flood with interference. Whatever is down there, it's broadcasting on a frequency that shouldn't exist — one reserved for Apollo-era transponders, silent for fifty years.\n\nDr. Reyes pulls up the geological scan. The anomaly isn't natural. Geometric. Deliberate.\n\nCommander Vasquez, you have the conn. What are your orders?`;
