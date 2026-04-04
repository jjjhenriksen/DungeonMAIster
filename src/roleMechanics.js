import {
  clampPercent,
  createCrewPatch,
  getCrewById,
  getWeakestSystemKey,
} from "./stateUtils.js";
import { EVENT_LOG_TYPES } from "./eventLogTypes.js";
import {
  createFollowThroughWindow,
  createRelationshipLedgerDelta,
  createSupportWindowDelta,
  getActiveSupportWindow,
  getCommanderDelegationProfile,
  getPairRelationshipProfile,
  getSupportStrengthValue,
} from "./crewCoordination.js";
import { countRoleKeywordMatches, isActionRoleAligned } from "./roleSemantics.js";

function getLowestMoraleCrew(worldState) {
  return [...(worldState?.crew || [])].sort((left, right) => left.morale - right.morale)[0];
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
  const relationshipDelta = createRelationshipLedgerDelta(
    worldState,
    supportWindow,
    baseStrength,
    activeCrew
  );
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
        ...(relationshipDelta.mission || {}),
        supportWindow: nextSupportWindow,
      },
      eventLog: [
        ...(supportEvent || []),
        ...(relationshipDelta.eventLog || []),
        ...(supportDelta.eventLog || []),
        ...(roleDelta.eventLog || []),
      ],
    },
  };
}

export function getRoleMechanicSummary(activeCrew) {
  switch (activeCrew?.role) {
    case "Commander":
      return "Aligned command actions restore comms discipline, raise the lowest crew morale, and delegation strength now depends on the commander's personality.";
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
  const delegationProfile =
    activeCrew?.role === "Commander" ? getCommanderDelegationProfile(activeCrew) : null;
  const relationshipProfile =
    supportWindow?.targetCrewId
      ? getPairRelationshipProfile(
          activeCrew,
          worldState?.crew?.find((member) => member.id === supportWindow.targetCrewId),
          worldState
        )
      : null;

  return {
    aligned,
    summary: roleSummary,
    opportunity: roleOpportunity,
    delegationProfile: delegationProfile
      ? `${activeCrew.name} currently reads as a ${delegationProfile.label}.`
      : "No commander delegation profile applies on this turn.",
    relationshipFit: relationshipProfile
      ? `${activeCrew.name} and ${supportWindow?.targetCrewName || "the target crew member"} currently read as a ${relationshipProfile.label}.`
      : "No commander relationship fit adjustment is active on this turn.",
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

export {
  getCrewCoordinationSnapshot,
  getFollowThroughTurnTarget,
  getRoleSupportPreview,
  getTopCoordinationAlert,
} from "./crewCoordination.js";
