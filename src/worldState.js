import { EVENT_LOG_TYPES } from "./eventLogTypes";
import { CHARACTER_BANKS, CREW_TENSION_PATTERNS } from "./characterBanks";

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
  character,
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
    character,
  };
}

const MISSION_TEMPLATE = {
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
};

const ENVIRONMENT_TEMPLATE = {
  location: "Shackleton Crater Rim",
  hazards: ["Signal interference", "Knife-edge crater terrain", "Shadowed ice vents"],
  anomaly: "Apollo-band signal with repeating geometric carrier modulation",
  visibility: "Low-angle glare on the rim, deep shadow inside the crater",
  pressure: "EVA only",
};

const SYSTEMS_TEMPLATE = {
  o2: 71,
  power: 82,
  comms: 35,
  propulsion: 64,
  scrubber: "patched",
  thermal: 76,
  nav: 58,
};

const EVENT_LOG_TEMPLATE = [
  {
    ts: "T+14:22",
    msg: "Anomaly signal detected from Shackleton Crater interior.",
    type: EVENT_LOG_TYPES.SENSOR,
  },
  {
    ts: "T+14:19",
    msg: "Telemetry confirms the signal is repeating in deliberate geometric bursts.",
    type: EVENT_LOG_TYPES.SENSOR,
  },
  {
    ts: "T+14:18",
    msg: "Long-range comms degraded after the rover crossed the rim shadow line.",
    type: EVENT_LOG_TYPES.RISK,
  },
  {
    ts: "T+14:11",
    msg: "Okafor patched the primary scrubber bypass after a dust-line leak.",
    type: EVENT_LOG_TYPES.SYSTEM,
  },
  {
    ts: "T+13:55",
    msg: "Artemis-07 rover reached the crater rim with all crew nominal.",
    type: EVENT_LOG_TYPES.SYSTEM,
  },
];

const CREW_BLUEPRINTS = [
  {
    id: "vasquez",
    role: "Commander",
    defaultName: "Commander Alma Vasquez",
    defaultCallSign: "Aegis",
    defaultTrait: "Calm under cascading pressure",
    defaultSpecialty: "Command tempo and crisis triage",
    defaultFlaw: "Carries too much alone before delegating",
    defaultStake: "Will not lose another mission under their command",
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
    bankKey: "commander",
  },
  {
    id: "okafor",
    role: "Flight Engineer",
    defaultName: "Chief Engineer Tunde Okafor",
    defaultCallSign: "Patchbay",
    defaultTrait: "Turns panic into procedure",
    defaultSpecialty: "Life support stabilization and field repair",
    defaultFlaw: "Pushes damaged systems long past the safe window",
    defaultStake: "Knows the rover only gets one real failure before people start dying",
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
    bankKey: "flight_engineer",
  },
  {
    id: "reyes",
    role: "Science Officer",
    defaultName: "Dr. Imani Reyes",
    defaultCallSign: "Spectra",
    defaultTrait: "Curiosity sharp enough to feel dangerous",
    defaultSpecialty: "Signal analysis and anomaly interpretation",
    defaultFlaw: "Can chase understanding past the point of safety",
    defaultStake: "Believes this signal could redefine humanity's place on the moon",
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
    bankKey: "science_officer",
  },
  {
    id: "park",
    role: "Mission Specialist",
    defaultName: "Lt. Hana Park",
    defaultCallSign: "Waypoint",
    defaultTrait: "Most comfortable at the edge of the risk envelope",
    defaultSpecialty: "EVA deployment and field improvisation",
    defaultFlaw: "Understates injuries if the mission still has momentum",
    defaultStake: "Needs this mission to prove the last surface accident was not a career-ending failure",
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
    bankKey: "mission_specialist",
  },
];

function createProfileFromBlueprint(blueprint, overrides = {}) {
  return {
    id: blueprint.id,
    role: blueprint.role,
    name: overrides.name || blueprint.defaultName,
    callSign: overrides.callSign || blueprint.defaultCallSign,
    trait: overrides.trait || blueprint.defaultTrait,
    specialty: overrides.specialty || blueprint.defaultSpecialty,
    flaw: overrides.flaw || blueprint.defaultFlaw,
    personalStake: overrides.personalStake || blueprint.defaultStake,
    tensionNote: overrides.tensionNote || "",
  };
}

export const DEFAULT_CHARACTER_PROFILES = CREW_BLUEPRINTS.map((blueprint) =>
  createProfileFromBlueprint(blueprint)
);

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function hasAnyTag(entry, tags = []) {
  return entry?.tags?.some((tag) => tags.includes(tag));
}

function pickTaggedEntry(entries, preferredTags = [], usedTexts = new Set()) {
  const matching = entries.filter(
    (entry) => hasAnyTag(entry, preferredTags) && !usedTexts.has(entry.text)
  );
  if (matching.length > 0) return pickRandom(matching);

  const unused = entries.filter((entry) => !usedTexts.has(entry.text));
  if (unused.length > 0) return pickRandom(unused);

  return pickRandom(entries);
}

const TAG_KEYWORDS = {
  steady: ["calm", "clarity", "composure", "steady", "stabil", "discipline"],
  leader: ["command", "lead", "crew", "tempo", "triage", "decision"],
  empathetic: ["morale", "crew", "people", "compassion", "stabilization"],
  social: ["morale", "crew", "speaks", "vulnerability", "consensus"],
  procedural: ["procedure", "repair", "systems", "maintenance", "patch", "stabilization"],
  analytical: ["pattern", "analysis", "telemetry", "signal", "model", "geology"],
  curious: ["curiosity", "discovery", "anomaly", "signal", "meaning", "phenomena"],
  risk: ["risk", "edge", "eva", "surface", "hazard", "violent"],
  bold: ["decisive", "confident", "forward", "alive", "high-risk", "danger"],
  measured: ["disciplined", "deliberate", "balanced", "observation", "careful"],
  cautious: ["safety", "worst-case", "margin", "caution", "slipping"],
  control: ["control", "delegating", "consensus", "plan", "command"],
  obsessive: ["obsession", "vindicate", "walk away", "proof", "redefine"],
  closed: ["hides", "secrets", "admitting", "alone", "sound colder"],
  impulsive: ["reflex", "instinct", "faster", "forward"],
  rigid: ["commits", "pivots", "overcorrects", "doctrine"],
  intuitive: ["instinct", "meaning", "fragments"],
  self_erasing: ["injuries", "pain", "exhaustion", "relief"],
  reckless: ["risk", "dangerous", "pain", "highest-risk", "one more"],
};

function inferTagsFromText(text = "") {
  const normalized = text.toLowerCase();
  return Object.entries(TAG_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))
    .map(([tag]) => tag);
}

function inferProfileTags(profile = {}) {
  const parts = [profile.trait, profile.flaw, profile.specialty, profile.personalStake].filter(Boolean);
  return new Set(parts.flatMap((part) => inferTagsFromText(part)));
}

function scorePatternForProfiles(pattern, profilesByRole) {
  return pattern.roles.reduce((score, role, index) => {
    const profile = profilesByRole.get(role);
    if (!profile) return score;

    const tags = inferProfileTags(profile);
    const preferred = pattern.preferredTags[index] || [];
    return score + preferred.filter((tag) => tags.has(tag)).length;
  }, 0);
}

export function deriveCrewDynamics(profiles = []) {
  const profilesByRole = new Map(profiles.map((profile) => [profile.role, profile]));
  let bestPattern = null;
  let bestScore = 0;

  CREW_TENSION_PATTERNS.forEach((pattern) => {
    const score = scorePatternForProfiles(pattern, profilesByRole);
    if (score > bestScore) {
      bestPattern = pattern;
      bestScore = score;
    }
  });

  const notesById = {};
  let summary = "";

  if (bestPattern && bestScore > 0) {
    summary = bestPattern.summary;
    bestPattern.roles.forEach((role) => {
      const profile = profilesByRole.get(role);
      if (profile?.id) {
        notesById[profile.id] = bestPattern.summary;
      }
    });
  }

  return { summary, notesById };
}

export function createRandomCharacterProfiles() {
  const usedNames = new Set();
  const usedCallSigns = new Set();
  const usedTraits = new Set();
  const usedFlaws = new Set();
  const selectedProfiles = new Map();
  const tensionPattern = Math.random() < 0.55 ? pickRandom(CREW_TENSION_PATTERNS) : null;
  const tensionRoles = new Map(
    tensionPattern
      ? tensionPattern.roles.map((role, index) => [role, tensionPattern.preferredTags[index]])
      : []
  );

  CREW_BLUEPRINTS.forEach((blueprint) => {
    const roleBank = CHARACTER_BANKS[blueprint.bankKey] || {};
    const availableNames = (roleBank.names || [blueprint.defaultName]).filter(
      (name) => !usedNames.has(name)
    );
    const availableCallSigns = (roleBank.callSigns || [blueprint.defaultCallSign]).filter(
      (callSign) => !usedCallSigns.has(callSign)
    );
    const preferredTags = tensionRoles.get(blueprint.role) || [];
    const traitEntry = pickTaggedEntry(CHARACTER_BANKS.global.traits, preferredTags, usedTraits);
    const flawEntry = pickTaggedEntry(CHARACTER_BANKS.global.flaws, preferredTags, usedFlaws);

    const selected = {
      name: pickRandom(availableNames.length > 0 ? availableNames : roleBank.names || [blueprint.defaultName]),
      callSign: pickRandom(
        availableCallSigns.length > 0 ? availableCallSigns : roleBank.callSigns || [blueprint.defaultCallSign]
      ),
      trait: traitEntry.text,
      specialty: pickRandom(roleBank.specialties || [blueprint.defaultSpecialty]),
      flaw: flawEntry.text,
      personalStake: pickRandom(roleBank.stakes || [blueprint.defaultStake]),
    };

    usedNames.add(selected.name);
    usedCallSigns.add(selected.callSign);
    usedTraits.add(selected.trait);
    usedFlaws.add(selected.flaw);

    selectedProfiles.set(
      blueprint.id,
      createProfileFromBlueprint(blueprint, {
        ...selected,
        tensionNote: tensionRoles.has(blueprint.role) ? tensionPattern.summary : "",
      })
    );
  });

  return CREW_BLUEPRINTS.map((blueprint) => selectedProfiles.get(blueprint.id));
}

function withDerivedCrewDynamics(profiles = DEFAULT_CHARACTER_PROFILES) {
  const normalizedProfiles = profiles.map((profile) => ({
    ...profile,
    name: profile.name?.trim() || "",
    callSign: profile.callSign?.trim() || "",
    trait: profile.trait?.trim() || "",
    specialty: profile.specialty?.trim() || "",
    flaw: profile.flaw?.trim() || "",
    personalStake: profile.personalStake?.trim() || "",
  }));
  const { notesById } = deriveCrewDynamics(normalizedProfiles);

  return normalizedProfiles.map((profile) => ({
    ...profile,
    tensionNote: profile.tensionNote?.trim() || notesById[profile.id] || "",
  }));
}

function getCharacterProfileMap(profiles = DEFAULT_CHARACTER_PROFILES) {
  return new Map(profiles.map((profile) => [profile.id, profile]));
}

export function createInitialWorldState(profiles = DEFAULT_CHARACTER_PROFILES) {
  const profilesById = getCharacterProfileMap(profiles);

  return {
    mission: { ...MISSION_TEMPLATE },
    environment: { ...ENVIRONMENT_TEMPLATE },
    systems: { ...SYSTEMS_TEMPLATE },
    crew: CREW_BLUEPRINTS.map((blueprint) => {
      const profile = profilesById.get(blueprint.id) || {};
      const name = profile.name?.trim() || blueprint.defaultName;
      const callSign = profile.callSign?.trim() || blueprint.defaultCallSign;
      const trait = profile.trait?.trim() || blueprint.defaultTrait;
      const specialty = profile.specialty?.trim() || blueprint.defaultSpecialty;
      const flaw = profile.flaw?.trim() || blueprint.defaultFlaw;
      const personalStake = profile.personalStake?.trim() || blueprint.defaultStake;
      const tensionNote = profile.tensionNote?.trim();

      return createCrewMember({
        ...blueprint,
        name,
        extra: {
          ...blueprint.extra,
          detail: specialty,
        },
        notes: `${blueprint.notes} Trait: ${trait}. Flaw: ${flaw}. Stake: ${personalStake}. Call sign: ${callSign}.${tensionNote ? ` Crew tension: ${tensionNote}.` : ""}`,
        character: {
          callSign,
          trait,
          specialty,
          flaw,
          personalStake,
          tensionNote,
        },
      });
    }),
    eventLog: EVENT_LOG_TEMPLATE.map((entry) => ({ ...entry })),
  };
}

export function createOpeningNarration(worldState) {
  const commander = worldState?.crew?.[0]?.name || "Commander Vasquez";
  const engineer = worldState?.crew?.[1]?.name || "Okafor";
  const scientist = worldState?.crew?.[2]?.name || "Reyes";
  const specialist = worldState?.crew?.[3]?.name || "Park";

  return `The rover eases to a halt on the knife-edge rim of Shackleton Crater, and every speaker in the cabin hisses with an impossible transmission. The signal is old Apollo-band hardware, dead for decades, yet it is pulsing from the darkness below with machine-perfect rhythm.

${scientist} has already stripped the noise away once and the pattern only became stranger. ${engineer} warns the scrubber patch may not survive a long delay. ${specialist} is halfway into a damaged EVA suit. ${commander}, the crew is looking to you.`;
}

export function createMissionSession(profiles = DEFAULT_CHARACTER_PROFILES) {
  const worldState = createInitialWorldState(withDerivedCrewDynamics(profiles));
  return {
    worldState,
    narration: createOpeningNarration(worldState),
    turn: 0,
    conversationHistory: [
      {
        role: "system",
        turn: 0,
        crewName: worldState.crew[0]?.name || "n/a",
        content: "Mission initialized from character roster.",
      },
    ],
    createdFromCharacterCreation: true,
  };
}

export const INITIAL_WORLD_STATE = createInitialWorldState();
export const OPENING_NARRATION = createOpeningNarration(INITIAL_WORLD_STATE);
