const ROLE_DEFINITIONS = [
  {
    index: 0,
    key: "captain",
    name: "Captain",
    crewIds: ["pc-captain"],
    clearances: ["bridge", "command", "mission", "shipwide"],
  },
  {
    index: 1,
    key: "chief_engineer",
    name: "Chief Engineer",
    crewIds: ["pc-engineer"],
    clearances: ["engineering", "maintenance", "power", "shipwide"],
  },
  {
    index: 2,
    key: "science_officer",
    name: "Science Officer",
    crewIds: ["pc-science"],
    clearances: ["science", "sensors", "anomalies", "shipwide"],
  },
  {
    index: 3,
    key: "security_medic",
    name: "Security Medic",
    crewIds: ["pc-security"],
    clearances: ["security", "medical", "crew", "shipwide"],
  },
];

const INITIAL_WORLD_STATE = {
  meta: {
    schemaVersion: "1.0.0",
    setting: "The research vessel Ossa drifts at the edge of the Shroud Reef.",
    currentTurn: 0,
    currentPhase: "briefing",
    lastUpdatedIso: "2147-06-18T06:00:00.000Z",
  },
  crew: {
    players: [
      {
        id: "pc-captain",
        role: "captain",
        callsign: "Comet",
        displayName: "Captain Mara Vance",
        locationId: "bridge",
        vitals: { stress: 2, fatigue: 1, harm: 0 },
        inventory: ["command-badge", "cipher-key", "sidearm"],
        notes: ["Crew morale is fragile after the Eridani Relay incident."],
      },
      {
        id: "pc-engineer",
        role: "chief_engineer",
        callsign: "Patch",
        displayName: "Chief Engineer Ilya Sato",
        locationId: "engine-bay",
        vitals: { stress: 1, fatigue: 2, harm: 0 },
        inventory: ["plasma-spanner", "diagnostic-tablet", "sealant-foam"],
        notes: ["Knows the portside reactor manifold is nearing failure."],
      },
      {
        id: "pc-science",
        role: "science_officer",
        callsign: "Specter",
        displayName: "Science Officer Nadiya Quill",
        locationId: "sensorium",
        vitals: { stress: 1, fatigue: 1, harm: 0 },
        inventory: ["field-scanner", "sample-kit", "reef-map"],
        notes: ["Has seen patterns in the Reef signal no one else can parse."],
      },
      {
        id: "pc-security",
        role: "security_medic",
        callsign: "Ward",
        displayName: "Security Medic Tom Ardent",
        locationId: "med-bay",
        vitals: { stress: 1, fatigue: 1, harm: 0 },
        inventory: ["med-gel", "shock-baton", "restraint-cuffs"],
        notes: ["Keeping a private list of crew members exposed to spores."],
      },
    ],
    npcs: [
      {
        id: "npc-exec",
        displayName: "Executive Officer Selene Rook",
        role: "executive_officer",
        locationId: "bridge",
        disposition: "controlled",
        trust: 1,
        publicSummary: "Keeps the chain of command intact when the room gets loud.",
        privateNotes: [
          {
            visibility: ["captain"],
            text: "Rook is concealing a corporate standing order to retrieve Reef biomass intact.",
          },
          {
            visibility: ["security_medic"],
            text: "Rook has logged unauthorized access attempts to the brig inventory.",
          },
        ],
      },
      {
        id: "npc-pilot",
        displayName: "Helmsman Jae Orlov",
        role: "pilot",
        locationId: "bridge",
        disposition: "nervy",
        trust: 0,
        publicSummary: "Superb pilot, visibly shaken by impossible navigational echoes.",
        privateNotes: [
          {
            visibility: ["captain", "science_officer"],
            text: "Orlov claims the Reef sometimes moves before the ship does.",
          },
        ],
      },
      {
        id: "npc-xeno",
        displayName: "Xenobiologist Dr. Ena Vale",
        role: "xenobiologist",
        locationId: "wet-lab",
        disposition: "obsessed",
        trust: -1,
        publicSummary: "Treats each anomaly like a sacred text waiting to be translated.",
        privateNotes: [
          {
            visibility: ["science_officer"],
            text: "Vale believes the Shroud Reef is not a habitat but a distributed nervous system.",
          },
          {
            visibility: ["captain", "chief_engineer"],
            text: "Vale ignored containment protocol during the last specimen thaw.",
          },
        ],
      },
      {
        id: "npc-quartermaster",
        displayName: "Quartermaster Pritchard Kells",
        role: "quartermaster",
        locationId: "cargo-spine",
        disposition: "helpful",
        trust: 2,
        publicSummary: "Knows where everything is stored and who took it.",
        privateNotes: [
          {
            visibility: ["chief_engineer", "security_medic"],
            text: "Kells has hidden a reserve of oxygen scrubbers behind false cargo seals.",
          },
        ],
      },
    ],
    relationships: [
      {
        id: "rel-rook-vale",
        sourceId: "npc-exec",
        targetId: "npc-xeno",
        type: "professional-rivalry",
        visibility: ["captain", "science_officer"],
        summary: "Rook wants the mission contained; Vale wants it to escalate into discovery.",
      },
      {
        id: "rel-kells-ardent",
        sourceId: "npc-quartermaster",
        targetId: "pc-security",
        type: "quiet-alliance",
        visibility: ["security_medic"],
        summary: "Kells tips Ardent off before contraband inspections become public.",
      },
    ],
  },
  systems: {
    power: {
      status: "strained",
      integrity: 68,
      alerts: [
        {
          id: "alert-power-1",
          severity: "high",
          visibility: ["captain", "chief_engineer"],
          text: "Portside reactor manifold is oscillating above safety threshold.",
        },
      ],
    },
    lifeSupport: {
      status: "stable",
      integrity: 87,
      alerts: [
        {
          id: "alert-life-1",
          severity: "medium",
          visibility: ["security_medic", "chief_engineer"],
          text: "Trace fungal particulates detected in Med Bay air recyclers.",
        },
      ],
    },
    navigation: {
      status: "intermittent",
      integrity: 72,
      alerts: [
        {
          id: "alert-nav-1",
          severity: "medium",
          visibility: ["captain", "science_officer"],
          text: "Star fixes disagree with local inertial data by 0.8 AU.",
        },
      ],
    },
    sensors: {
      status: "noisy",
      integrity: 61,
      alerts: [
        {
          id: "alert-scan-1",
          severity: "high",
          visibility: ["science_officer"],
          text: "Passive scans identify repeating bioelectric harmonics in nearby wreckage.",
        },
      ],
    },
    security: {
      status: "armed",
      integrity: 79,
      alerts: [
        {
          id: "alert-sec-1",
          severity: "low",
          visibility: ["captain", "security_medic"],
          text: "Brig door reports a manual override attempt 03:14 ship time.",
        },
      ],
    },
  },
  mission: {
    title: "Operation Silent Aster",
    publicBrief: "Map the Shroud Reef, recover the missing relay probe, and bring the crew home.",
    objectives: [
      {
        id: "obj-1",
        title: "Stabilize the Ossa",
        status: "active",
        visibility: "all",
        summary: "Address compounding reactor and navigation faults before deep insertion.",
      },
      {
        id: "obj-2",
        title: "Locate Relay Probe Khepri-9",
        status: "active",
        visibility: "all",
        summary: "Last telemetry places the probe within the Reef's mirrored canyons.",
      },
      {
        id: "obj-3",
        title: "Secure viable anomalous biomass",
        status: "hidden",
        visibility: ["captain", "science_officer"],
        summary: "Corporate black-file objective. Extraction takes priority if sentience is ruled out.",
      },
    ],
    clocks: [
      {
        id: "clock-reactor-breach",
        label: "Reactor Cascade",
        progress: 1,
        max: 6,
        visibility: ["captain", "chief_engineer"],
      },
      {
        id: "clock-reef-awakening",
        label: "Reef Awakening",
        progress: 0,
        max: 8,
        visibility: ["science_officer"],
      },
      {
        id: "clock-crew-panic",
        label: "Crew Panic",
        progress: 1,
        max: 6,
        visibility: ["captain", "security_medic"],
      },
    ],
    secrets: [
      {
        id: "secret-relay",
        visibility: ["captain"],
        text: "Khepri-9 transmitted a human voiceprint from a crew member who died three years ago.",
      },
      {
        id: "secret-spores",
        visibility: ["security_medic", "science_officer"],
        text: "The airborne spores respond to elevated cortisol and gather around distressed crew.",
      },
    ],
  },
  environment: {
    currentLocationId: "bridge",
    dangerLevel: "amber",
    conditions: ["low-light", "electromagnetic interference", "sporadic hull resonance"],
    ship: {
      name: "RSV Ossa",
      class: "Tethys-class survey corvette",
      hullIntegrity: 74,
    },
    locations: [
      {
        id: "bridge",
        name: "Bridge",
        tags: ["command", "shipwide"],
        publicSummary: "Dim tactical displays wash the bridge in glacial blue.",
        hiddenDetails: [
          {
            visibility: ["captain"],
            text: "A sealed command terminal contains old relay transcriptions that do not match the official archive.",
          },
        ],
      },
      {
        id: "engine-bay",
        name: "Engine Bay",
        tags: ["engineering", "power"],
        publicSummary: "Heat and ionized metal fill the cramped cathedral around the reactor core.",
        hiddenDetails: [
          {
            visibility: ["chief_engineer"],
            text: "A hairline fracture is spreading along the manifold collar behind a maintenance panel.",
          },
        ],
      },
      {
        id: "sensorium",
        name: "Sensorium",
        tags: ["science", "sensors"],
        publicSummary: "A dome of instruments listens to the Reef like a stethoscope pressed to a sleeping giant.",
        hiddenDetails: [
          {
            visibility: ["science_officer"],
            text: "The signal lattice resolves into pulse trains uncannily close to language structures.",
          },
        ],
      },
      {
        id: "med-bay",
        name: "Med Bay",
        tags: ["medical", "crew"],
        publicSummary: "Sterile cabinets and sealed biobeds contrast with the smell of antiseptic and ozone.",
        hiddenDetails: [
          {
            visibility: ["security_medic"],
            text: "Three crew scans display identical foreign filament growths at different stages.",
          },
        ],
      },
      {
        id: "shroud-reef",
        name: "Shroud Reef",
        tags: ["anomalies", "mission"],
        publicSummary: "A maze of translucent biomass and broken hulls arcs around a lightless void.",
        hiddenDetails: [
          {
            visibility: ["science_officer", "captain"],
            text: "Long-range imagery suggests the Reef is folding wreckage into repeating anatomical shapes.",
          },
        ],
      },
    ],
    anomalies: [
      {
        id: "anomaly-echo-bloom",
        name: "Echo Bloom",
        severity: "high",
        status: "active",
        visibility: ["science_officer", "captain"],
        summary: "A drifting flower of light that repeats spoken phrases several minutes before they occur.",
      },
      {
        id: "anomaly-spore-front",
        name: "Spore Front",
        severity: "medium",
        status: "contained",
        visibility: ["science_officer", "security_medic"],
        summary: "Reactive particulates that migrate toward elevated stress biomarkers.",
      },
    ],
  },
  eventLog: [
    {
      id: "event-000",
      turn: 0,
      timestamp: "2147-06-18T06:00:00.000Z",
      type: "briefing",
      visibility: "all",
      summary: "The Ossa arrives at the edge of the Shroud Reef after losing contact with Relay Probe Khepri-9.",
    },
    {
      id: "event-001",
      turn: 0,
      timestamp: "2147-06-18T06:03:00.000Z",
      type: "system-alert",
      visibility: ["captain", "chief_engineer"],
      summary: "Reactor manifold enters an unstable oscillation window.",
    },
    {
      id: "event-002",
      turn: 0,
      timestamp: "2147-06-18T06:05:00.000Z",
      type: "science",
      visibility: ["science_officer"],
      summary: "Passive sensors pick up a patterned response pulse from inside the Reef.",
    },
    {
      id: "event-003",
      turn: 0,
      timestamp: "2147-06-18T06:06:00.000Z",
      type: "medical",
      visibility: ["security_medic"],
      summary: "A deckhand reports auditory hallucinations after handling wet-lab sample crates.",
    },
  ],
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createInitialWorldState() {
  return deepClone(INITIAL_WORLD_STATE);
}

function getRoleDefinition(roleIndex) {
  return ROLE_DEFINITIONS.find((role) => role.index === roleIndex) || null;
}

module.exports = {
  ROLE_DEFINITIONS,
  INITIAL_WORLD_STATE,
  createInitialWorldState,
  getRoleDefinition,
};
