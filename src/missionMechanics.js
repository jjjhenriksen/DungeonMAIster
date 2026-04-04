import { EVENT_LOG_TYPES } from "./eventLogTypes.js";
import { clampPercent, createCrewPatch, getCrewById } from "./stateUtils.js";

function actionIncludesAny(actionText = "", keywords = []) {
  const normalized = actionText.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

const MISSION_MECHANICS = {
  "apollo-signal": {
    label: "Apollo-band lock",
    summary:
      "Signal-isolation and relay discipline create cleaner Apollo-band reads while comms are fragile.",
    roles: ["Commander", "Science Officer"],
    keywords: ["signal", "apollo", "carrier", "relay", "comms", "isolate", "pattern"],
    suggestionByRole: {
      Commander: "Direct the science officer to isolate the Apollo-band carrier while command tightens relay discipline.",
      "Science Officer":
        "Strip the Apollo-band noise down to the cleanest carrier trace and report whether the pattern is intentional.",
    },
  },
  "cryovent-whisper": {
    label: "Cryovent thermal window",
    summary:
      "Thermal stabilization and controlled EVA prep matter more than raw speed around the vent shelf.",
    roles: ["Flight Engineer", "Mission Specialist"],
    keywords: ["thermal", "vent", "cryo", "shelf", "eva", "anchor", "stabilize", "heat"],
    suggestionByRole: {
      "Flight Engineer":
        "Cycle thermal load away from the vent-facing systems and buy the specialist a safer EVA margin.",
      "Mission Specialist":
        "Confirm a controlled route across the vent shelf before anyone commits deeper into the cold sink.",
    },
  },
  "buried-array": {
    label: "Reflector triangulation",
    summary:
      "Navigation recovery depends on coordinated sweeps, isolation, and debris-safe route marking.",
    roles: ["Flight Engineer", "Science Officer", "Mission Specialist"],
    keywords: ["nav", "reflector", "array", "ghost", "triangulate", "route", "sweep", "lidar"],
    suggestionByRole: {
      "Flight Engineer":
        "Isolate the nav stack from the reflector ghosts and call out what movement assumptions are still safe.",
      "Science Officer":
        "Triangulate the buried reflector behavior against the latest ghost returns and narrow the false bearings.",
      "Mission Specialist":
        "Mark a debris-safe route that holds even if the next nav sweep lies.",
    },
  },
  "blackglass-breach": {
    label: "Shielding seam read",
    summary:
      "The strongest play is pairing field shielding discipline with clean machine-band interpretation.",
    roles: ["Science Officer", "Mission Specialist"],
    keywords: ["glass", "seam", "shield", "hot", "machine", "pulse", "fallback", "shelf"],
    suggestionByRole: {
      "Science Officer":
        "Separate the machine-band pulse from the thermal bloom so command knows whether the seam is reacting or signaling.",
      "Mission Specialist":
        "Re-anchor the fallback line and protect shielding margin before the seam throws another thermal spike.",
    },
  },
};

function getMissionMechanic(seedId) {
  return MISSION_MECHANICS[seedId] || null;
}

function isMissionAligned(worldState, activeCrew, actionText = "") {
  const mechanic = getMissionMechanic(worldState?.mission?.seedId);
  if (!mechanic || !activeCrew?.role) return false;
  if (!mechanic.roles.includes(activeCrew.role)) return false;
  return actionIncludesAny(actionText, mechanic.keywords);
}

function createApolloSignalEffect(worldState, activeCrew) {
  const liveCrew = getCrewById(worldState, activeCrew.id) || activeCrew;
  const commsBoost = 3;
  const insightBoost = activeCrew.role === "Science Officer" ? 4 : 2;

  return {
    systems: {
      comms: clampPercent((worldState?.systems?.comms || 0) + commsBoost),
    },
    crew: [
      createCrewPatch(liveCrew, {
        extra: {
          value: clampPercent((liveCrew?.extra?.value || 0) + insightBoost),
        },
      }),
    ].filter(Boolean),
    eventLog: [
      {
        ts: worldState?.mission?.met || "T+00:00",
        type: EVENT_LOG_TYPES.SENSOR,
        msg: `${activeCrew.name} exploits the Apollo-band lock and clears a cleaner signal picture through the relay noise.`,
      },
    ],
  };
}

function createCryoventEffect(worldState, activeCrew) {
  const liveCrew = getCrewById(worldState, activeCrew.id) || activeCrew;
  const thermalBoost = 4;
  const suitBoost = activeCrew.role === "Mission Specialist" ? 4 : 2;

  return {
    systems: {
      thermal: clampPercent((worldState?.systems?.thermal || 0) + thermalBoost),
    },
    crew: [
      createCrewPatch(liveCrew, {
        extra: {
          value: clampPercent((liveCrew?.extra?.value || 0) + suitBoost),
        },
      }),
    ].filter(Boolean),
    eventLog: [
      {
        ts: worldState?.mission?.met || "T+00:00",
        type: EVENT_LOG_TYPES.SYSTEM,
        msg: `${activeCrew.name} catches the cryovent thermal window before the shelf strips away more margin.`,
      },
    ],
  };
}

function createBuriedArrayEffect(worldState, activeCrew) {
  const liveCrew = getCrewById(worldState, activeCrew.id) || activeCrew;
  const navBoost = 4;
  const commsBoost = 2;
  const extraBoost = activeCrew.role === "Science Officer" ? 4 : 2;

  return {
    systems: {
      nav: clampPercent((worldState?.systems?.nav || 0) + navBoost),
      comms: clampPercent((worldState?.systems?.comms || 0) + commsBoost),
    },
    crew: [
      createCrewPatch(liveCrew, {
        extra: {
          value: clampPercent((liveCrew?.extra?.value || 0) + extraBoost),
        },
      }),
    ].filter(Boolean),
    eventLog: [
      {
        ts: worldState?.mission?.met || "T+00:00",
        type: EVENT_LOG_TYPES.SYSTEM,
        msg: `${activeCrew.name} turns the reflector field into a usable nav solution instead of another ghost return.`,
      },
    ],
  };
}

function createBlackglassEffect(worldState, activeCrew) {
  const liveCrew = getCrewById(worldState, activeCrew.id) || activeCrew;
  const healthBoost = activeCrew.role === "Mission Specialist" ? 3 : 1;
  const extraBoost = 4;
  const thermalBoost = 2;

  return {
    systems: {
      thermal: clampPercent((worldState?.systems?.thermal || 0) + thermalBoost),
    },
    crew: [
      createCrewPatch(liveCrew, {
        health: clampPercent((liveCrew?.health || 0) + healthBoost),
        extra: {
          value: clampPercent((liveCrew?.extra?.value || 0) + extraBoost),
        },
      }),
    ].filter(Boolean),
    eventLog: [
      {
        ts: worldState?.mission?.met || "T+00:00",
        type: EVENT_LOG_TYPES.RISK,
        msg: `${activeCrew.name} works the blackglass seam on its own terms and preserves shielding margin through the flare.`,
      },
    ],
  };
}

export function createMissionTurnEffect(worldState, activeCrew, actionText = "") {
  if (!isMissionAligned(worldState, activeCrew, actionText)) {
    return { delta: {} };
  }

  let delta = {};
  switch (worldState?.mission?.seedId) {
    case "apollo-signal":
      delta = createApolloSignalEffect(worldState, activeCrew);
      break;
    case "cryovent-whisper":
      delta = createCryoventEffect(worldState, activeCrew);
      break;
    case "buried-array":
      delta = createBuriedArrayEffect(worldState, activeCrew);
      break;
    case "blackglass-breach":
      delta = createBlackglassEffect(worldState, activeCrew);
      break;
    default:
      delta = {};
  }

  return { delta };
}

export function getMissionMechanicSummary(worldState, activeCrew) {
  const mechanic = getMissionMechanic(worldState?.mission?.seedId);
  if (!mechanic) {
    return "Mission pressure is shaping what counts as the highest-leverage move.";
  }

  if (!activeCrew?.role || !mechanic.roles.includes(activeCrew.role)) {
    return `${mechanic.label}: ${mechanic.summary}`;
  }

  return `${mechanic.label}: ${mechanic.summary}`;
}

export function getMissionOpportunityPreview(worldState, activeCrew, actionText = "") {
  const mechanic = getMissionMechanic(worldState?.mission?.seedId);
  if (!mechanic) {
    return {
      level: "neutral",
      label: "Mission pressure",
      detail: "This mission still has distinct constraints, but no bespoke trigger is in focus for this role.",
    };
  }

  const roleEligible = mechanic.roles.includes(activeCrew?.role);
  const aligned = roleEligible && actionIncludesAny(actionText, mechanic.keywords);

  if (!actionText.trim()) {
    return {
      level: "neutral",
      label: mechanic.label,
      detail: mechanic.summary,
    };
  }

  if (aligned) {
    return {
      level: "aligned",
      label: "Mission leverage",
      detail: `${mechanic.label} is live here. This move matches the seed's strongest pressure point.`,
    };
  }

  if (roleEligible) {
    return {
      level: "stretch",
      label: mechanic.label,
      detail: "This role can exploit the mission-specific opening, but the current wording is not leaning into it yet.",
    };
  }

  return {
    level: "neutral",
    label: mechanic.label,
    detail: "This seed has a bespoke opening, but another role is better positioned to cash it in right now.",
  };
}

export function getMissionSuggestion(worldState, activeCrew) {
  const mechanic = getMissionMechanic(worldState?.mission?.seedId);
  if (!mechanic || !activeCrew?.role) return null;
  return mechanic.suggestionByRole?.[activeCrew.role] || null;
}

export function getMissionPromptBrief(worldState, activeCrew, actionText = "") {
  const mechanic = getMissionMechanic(worldState?.mission?.seedId);
  if (!mechanic) {
    return {
      label: "No bespoke mission hook",
      summary: "Resolve the scene through the general crew and system pressures.",
      aligned: false,
    };
  }

  return {
    label: mechanic.label,
    summary: mechanic.summary,
    aligned: isMissionAligned(worldState, activeCrew, actionText),
    favoredRoles: mechanic.roles,
  };
}
