import { EVENT_LOG_TYPES } from "./eventLogTypes.js";

const SYSTEM_KEYS = ["o2", "power", "comms", "thermal", "nav", "propulsion"];

const ROLE_KEYWORDS = {
  Commander: [
    "order",
    "direct",
    "command",
    "coordinate",
    "fallback",
    "hold",
    "triage",
    "crew",
    "plan",
  ],
  "Flight Engineer": [
    "repair",
    "patch",
    "reroute",
    "stabilize",
    "seal",
    "diagnostic",
    "power",
    "scrubber",
    "system",
  ],
  "Science Officer": [
    "scan",
    "analyze",
    "signal",
    "sample",
    "spectral",
    "calibrate",
    "read",
    "pattern",
    "anomaly",
  ],
  "Mission Specialist": [
    "eva",
    "route",
    "anchor",
    "secure",
    "deploy",
    "scout",
    "surface",
    "suit",
    "beacon",
  ],
};

const ROLE_CHAIN_TARGETS = {
  Commander: ["Flight Engineer", "Science Officer", "Mission Specialist"],
  "Flight Engineer": ["Mission Specialist", "Commander"],
  "Science Officer": ["Commander", "Mission Specialist"],
  "Mission Specialist": ["Science Officer", "Flight Engineer"],
};

function clampPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function getCrewById(worldState, crewId) {
  return worldState?.crew?.find((member) => member.id === crewId);
}

function getWeakestSystemKey(worldState) {
  return SYSTEM_KEYS.filter((key) => typeof worldState?.systems?.[key] === "number").sort(
    (left, right) => worldState.systems[left] - worldState.systems[right]
  )[0];
}

function getLowestMoraleCrew(worldState) {
  return [...(worldState?.crew || [])].sort((left, right) => left.morale - right.morale)[0];
}

function isActionRoleAligned(role, actionText = "") {
  const normalized = actionText.toLowerCase();
  return (ROLE_KEYWORDS[role] || []).some((keyword) => normalized.includes(keyword));
}

function countRoleKeywordMatches(role, actionText = "") {
  const normalized = actionText.toLowerCase();
  return (ROLE_KEYWORDS[role] || []).filter((keyword) => normalized.includes(keyword)).length;
}

function getRoleChainTargets(role) {
  return ROLE_CHAIN_TARGETS[role] || [];
}

function getCrewNameTokens(name = "") {
  return String(name)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function getRoleTokens(role = "") {
  const normalized = String(role).trim().toLowerCase();
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const aliases = {
    commander: ["command"],
    engineer: ["engineering"],
    science: ["scientist", "scans"],
    specialist: ["eva"],
  };

  return [...new Set(tokens.flatMap((token) => [token, ...(aliases[token] || [])]))];
}

function getNextRoleTarget(role, actionText = "") {
  const normalized = actionText.toLowerCase();
  const targets = getRoleChainTargets(role);

  if (targets.length === 0) return null;

  if (normalized.includes("engineer") || normalized.includes("repair") || normalized.includes("stabilize")) {
    return targets.find((target) => target === "Flight Engineer") || targets[0];
  }

  if (normalized.includes("science") || normalized.includes("scan") || normalized.includes("signal")) {
    return targets.find((target) => target === "Science Officer") || targets[0];
  }

  if (normalized.includes("specialist") || normalized.includes("eva") || normalized.includes("surface")) {
    return targets.find((target) => target === "Mission Specialist") || targets[0];
  }

  if (normalized.includes("command") || normalized.includes("crew") || normalized.includes("coordinate")) {
    return targets.find((target) => target === "Commander") || targets[0];
  }

  return targets[0];
}

function getCrewByRole(worldState, role) {
  return worldState?.crew?.find((member) => member.role === role);
}

function inferDirectedCrew(worldState, actionText = "") {
  const normalized = actionText.toLowerCase();
  const crew = worldState?.crew || [];

  return (
    crew.find((member) =>
      getCrewNameTokens(member.name).some((token) => token.length > 2 && normalized.includes(token))
    ) ||
    crew.find((member) =>
      getRoleTokens(member.role).some((token) => token.length > 2 && normalized.includes(token))
    ) ||
    null
  );
}

function createFollowThroughWindow(worldState, activeCrew, actionText, effectStrength) {
  const directedCrew =
    activeCrew?.role === "Commander" ? inferDirectedCrew(worldState, actionText) : null;
  const targetCrew =
    directedCrew ||
    getCrewByRole(worldState, getNextRoleTarget(activeCrew?.role, actionText));
  if (!targetCrew) return null;

  return {
    sourceRole: activeCrew.role,
    sourceCrewId: activeCrew.id,
    sourceCrewName: activeCrew.name,
    targetRole: targetCrew.role,
    targetCrewId: targetCrew.id,
    targetCrewName: targetCrew.name,
    strength: effectStrength >= 4 ? "strong" : "soft",
    priorityHandoff: Boolean(directedCrew && directedCrew.id !== activeCrew.id),
    label: `${activeCrew.role} setup for ${targetCrew.role}`,
  };
}

function getSupportStrengthValue(strength) {
  return strength === "strong" ? 4 : 2;
}

function createSupportWindowDelta(worldState, supportWindow) {
  if (!supportWindow?.targetRole) return {};

  return {
    mission: {
      supportWindow,
    },
    eventLog: [
      {
        ts: worldState?.mission?.met || "T+00:00",
        type: EVENT_LOG_TYPES.TRAIT,
        msg: `${supportWindow.sourceCrewName} creates a follow-through window for ${supportWindow.targetCrewName}.`,
      },
    ],
  };
}

function getActiveSupportWindow(worldState, activeCrew) {
  const supportWindow = worldState?.mission?.supportWindow;
  if (!supportWindow || !activeCrew?.role) return null;

  if (supportWindow.targetCrewId === activeCrew.id || supportWindow.targetRole === activeCrew.role) {
    return supportWindow;
  }

  return null;
}

function createCrewPatch(member, fields) {
  if (!member) return null;
  return {
    id: member.id,
    ...fields,
  };
}

function createCommanderEffect(worldState, activeCrew, effectStrength) {
  const targetCrew = getLowestMoraleCrew(worldState) || activeCrew;
  const moraleBoost = effectStrength + 1;
  const commsBoost = Math.max(1, effectStrength - 1);

  return {
    delta: {
      systems: {
        comms: clampPercent((worldState?.systems?.comms || 0) + commsBoost),
      },
      crew: [
        createCrewPatch(targetCrew, {
          morale: clampPercent((targetCrew?.morale || 0) + moraleBoost),
        }),
      ].filter(Boolean),
      eventLog: [
        {
          ts: worldState?.mission?.met || "T+00:00",
          type: EVENT_LOG_TYPES.COMMAND,
          msg: `${activeCrew.name} steadies the crew tempo, lifting ${targetCrew?.name || "crew"} morale and tightening relay discipline.`,
        },
      ],
    },
  };
}

function createEngineerEffect(worldState, activeCrew, effectStrength) {
  const targetSystem = getWeakestSystemKey(worldState) || "power";
  const systemBoost = effectStrength + 1;

  return {
    delta: {
      systems: {
        [targetSystem]: clampPercent((worldState?.systems?.[targetSystem] || 0) + systemBoost),
      },
      eventLog: [
        {
          ts: worldState?.mission?.met || "T+00:00",
          type: EVENT_LOG_TYPES.SYSTEM,
          msg: `${activeCrew.name} buys margin back in ${targetSystem.toUpperCase()} with disciplined field stabilization.`,
        },
      ],
    },
  };
}

function createScienceEffect(worldState, activeCrew, effectStrength) {
  const liveCrew = getCrewById(worldState, activeCrew.id) || activeCrew;
  const supportSystem =
    (worldState?.systems?.nav || 0) <= (worldState?.systems?.comms || 0) ? "nav" : "comms";
  const insightBoost = effectStrength + 1;
  const systemBoost = Math.max(1, effectStrength - 1);

  return {
    delta: {
      systems: {
        [supportSystem]: clampPercent((worldState?.systems?.[supportSystem] || 0) + systemBoost),
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
          msg: `${activeCrew.name} converts noisy anomaly data into usable telemetry, sharpening ${supportSystem.toUpperCase()} confidence.`,
        },
      ],
    },
  };
}

function createSpecialistEffect(worldState, activeCrew, effectStrength) {
  const liveCrew = getCrewById(worldState, activeCrew.id) || activeCrew;
  const suitBoost = effectStrength + 1;
  const healthBoost = Math.max(1, effectStrength - 1);

  return {
    delta: {
      crew: [
        createCrewPatch(liveCrew, {
          health: clampPercent((liveCrew?.health || 0) + healthBoost),
          extra: {
            value: clampPercent((liveCrew?.extra?.value || 0) + suitBoost),
          },
        }),
      ].filter(Boolean),
      eventLog: [
        {
          ts: worldState?.mission?.met || "T+00:00",
          type: EVENT_LOG_TYPES.RISK,
          msg: `${activeCrew.name} turns field improvisation into safer footing, recovering EVA margin for the next move.`,
        },
      ],
    },
  };
}

export function createRoleTurnEffect(worldState, activeCrew, actionText = "") {
  if (!worldState || !activeCrew?.role) {
    return { delta: {} };
  }

  const supportWindow = getActiveSupportWindow(worldState, activeCrew);
  const baseStrength = isActionRoleAligned(activeCrew.role, actionText) ? 4 : 2;
  const supportStrength = supportWindow && baseStrength >= 4
    ? getSupportStrengthValue(supportWindow?.strength)
    : 0;
  const effectStrength = baseStrength + supportStrength;
  const nextSupportWindow = createFollowThroughWindow(
    worldState,
    activeCrew,
    actionText,
    baseStrength
  );

  const roleDelta = (() => {
    switch (activeCrew.role) {
      case "Commander":
        return createCommanderEffect(worldState, activeCrew, effectStrength).delta;
      case "Flight Engineer":
        return createEngineerEffect(worldState, activeCrew, effectStrength).delta;
      case "Science Officer":
        return createScienceEffect(worldState, activeCrew, effectStrength).delta;
      case "Mission Specialist":
        return createSpecialistEffect(worldState, activeCrew, effectStrength).delta;
      default:
        return {};
    }
  })();

  const supportDelta = createSupportWindowDelta(worldState, nextSupportWindow);
  const supportEvent =
    supportWindow && baseStrength >= 4
      ? [
          {
            ts: worldState?.mission?.met || "T+00:00",
            type: EVENT_LOG_TYPES.COMMAND,
            msg: `${activeCrew.name} capitalizes on ${supportWindow.sourceCrewName}'s setup and converts it into a cleaner execution window.`,
          },
        ]
      : [];

  return {
    delta: {
      ...roleDelta,
      mission: {
        ...(roleDelta.mission || {}),
        supportWindow: nextSupportWindow,
      },
      eventLog: [
        ...(supportEvent || []),
        ...(supportDelta.eventLog || []),
        ...(roleDelta.eventLog || []),
      ],
    },
  };
}

export function getRoleMechanicSummary(activeCrew) {
  switch (activeCrew?.role) {
    case "Commander":
      return "Aligned command actions restore comms discipline and raise the lowest crew morale.";
    case "Flight Engineer":
      return "Aligned engineering actions recover the weakest ship system faster.";
    case "Science Officer":
      return "Aligned science actions improve scan confidence and sharpen nav or comms telemetry.";
    case "Mission Specialist":
      return "Aligned field actions recover EVA margin and help the specialist absorb physical strain.";
    default:
      return "Role-aligned actions create a small mechanical edge each turn.";
  }
}

function getRoleOpportunity(worldState, activeCrew) {
  switch (activeCrew?.role) {
    case "Commander":
      return `Crew cohesion is fragile and comms are at ${worldState?.systems?.comms ?? "unknown"}%.`;
    case "Flight Engineer":
      return `The weakest live system is ${String(getWeakestSystemKey(worldState) || "power").toUpperCase()}.`;
    case "Science Officer":
      return `The anomaly is ${worldState?.environment?.anomaly || "behaving unpredictably"}, and telemetry confidence remains contested.`;
    case "Mission Specialist":
      return `The immediate physical hazard is ${worldState?.environment?.hazards?.[0] || worldState?.environment?.visibility || "terrain instability"}.`;
    default:
      return "The next move should reduce pressure without wasting the crew's narrow margin.";
  }
}

export function getRolePromptBrief(worldState, activeCrew, actionText = "") {
  const aligned = isActionRoleAligned(activeCrew?.role, actionText);
  const roleSummary = getRoleMechanicSummary(activeCrew);
  const roleOpportunity = getRoleOpportunity(worldState, activeCrew);
  const supportWindow = getActiveSupportWindow(worldState, activeCrew);

  return {
    aligned,
    summary: roleSummary,
    opportunity: roleOpportunity,
    incomingSupport: supportWindow
      ? `${supportWindow.sourceCrewName} has created a ${supportWindow.strength} follow-through window for ${activeCrew.name}.`
      : "No active cross-role setup window is currently open.",
    commandPriority:
      supportWindow?.priorityHandoff && supportWindow?.targetCrewId === activeCrew?.id
        ? `${supportWindow.sourceCrewName} explicitly handed initiative to ${activeCrew.name}; treat this as a high-clarity chain-of-command follow-through.`
        : "No explicit command handoff is currently in effect.",
    framing: aligned
      ? "The action is role-aligned, so treat success as more efficient, controlled, and lower-cost unless the fiction clearly justifies complications."
      : "The action is off-role or only weakly aligned, so it may still work, but it should usually carry more friction, delay, exposure, or collateral pressure than a role-native move.",
  };
}

export function getRoleAlignmentPreview(activeCrew, actionText = "") {
  const trimmed = actionText.trim();
  if (!activeCrew?.role || !trimmed) {
    return {
      level: "neutral",
      label: "Awaiting vector",
      detail: "Role-aligned wording will usually resolve cleaner than a stretch play.",
    };
  }

  const matchCount = countRoleKeywordMatches(activeCrew.role, trimmed);

  if (matchCount >= 2) {
    return {
      level: "aligned",
      label: "Role-aligned",
      detail: "This reads like core role work and should usually resolve with better efficiency and lower fallout.",
    };
  }

  if (matchCount === 1) {
    return {
      level: "stretch",
      label: "Reach, but workable",
      detail: "Part of this fits the role, but the DM is more likely to attach cost, delay, or extra pressure.",
    };
  }

  return {
    level: "offrole",
    label: "Off-role pressure",
    detail: "This is a meaningful stretch for the current station, so expect more friction if it works at all.",
  };
}

export function getRoleSupportPreview(worldState, activeCrew, actionText = "") {
  const incoming = getActiveSupportWindow(worldState, activeCrew);
  const directedCrew =
    activeCrew?.role === "Commander" ? inferDirectedCrew(worldState, actionText) : null;
  const outgoingTargetRole = directedCrew?.role || getNextRoleTarget(activeCrew?.role, actionText);
  const outgoingTargetCrew = directedCrew || getCrewByRole(worldState, outgoingTargetRole);

  return {
    incoming,
    outgoing:
      outgoingTargetRole && outgoingTargetCrew
        ? {
            targetRole: outgoingTargetRole,
            targetCrewName: outgoingTargetCrew.name,
            priorityHandoff: Boolean(directedCrew && directedCrew.id !== activeCrew?.id),
          }
        : null,
  };
}

export function getPriorityHandoffTarget(worldState) {
  const supportWindow = worldState?.mission?.supportWindow;
  if (!supportWindow?.priorityHandoff || !supportWindow?.targetCrewId) {
    return null;
  }

  return worldState?.crew?.find((member) => member.id === supportWindow.targetCrewId) || null;
}
