import { EVENT_LOG_TYPES } from "./eventLogTypes.js";
import { getCrewByRole } from "./stateUtils.js";
import {
  getCrewNameTokens,
  getNextRoleTarget,
  getRoleTokens,
} from "./roleSemantics.js";

const COMMANDER_DELEGATION_STYLES = [
  {
    id: "stabilizing",
    positive: ["calm", "clarity", "steady", "leader", "empathetic", "discipline", "crew"],
    negative: ["closed", "alone"],
    boost: 2,
    label: "stabilizing command handoff",
  },
  {
    id: "decisive",
    positive: ["bold", "tempo", "triage", "decision", "control"],
    negative: ["impulsive", "reckless"],
    boost: 1,
    label: "decisive command handoff",
  },
  {
    id: "guarded",
    positive: [],
    negative: ["control", "closed", "rigid", "cautious", "alone", "admitting", "pivots"],
    boost: -1,
    label: "guarded command handoff",
  },
];

const RELATIONSHIP_LEDGER_MIN = -2;
const RELATIONSHIP_LEDGER_MAX = 2;

function clampRelationshipLedger(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(RELATIONSHIP_LEDGER_MIN, Math.min(RELATIONSHIP_LEDGER_MAX, Math.round(num)));
}

function getCharacterProfileText(member) {
  return `${member?.character?.trait || ""} ${member?.character?.flaw || ""} ${
    member?.character?.tensionNote || ""
  } ${member?.notes || ""}`.toLowerCase();
}

function countTextMatches(text, tokens = []) {
  return tokens.filter((token) => text.includes(token)).length;
}

function createRelationshipKey(sourceCrewId, targetCrewId) {
  if (!sourceCrewId || !targetCrewId) return null;
  return `${sourceCrewId}::${targetCrewId}`;
}

function getRelationshipLedger(worldState) {
  return worldState?.mission?.relationshipLedger || {};
}

function getRelationshipLedgerDelta(sourceCrew, targetCrew, worldState) {
  const key = createRelationshipKey(sourceCrew?.id, targetCrew?.id);
  if (!key) return 0;
  return clampRelationshipLedger(getRelationshipLedger(worldState)?.[key] || 0);
}

function getCommanderRelationshipProfile(commander, targetCrew, worldState) {
  if (!commander || !targetCrew || commander.id === targetCrew.id) {
    return {
      boost: 0,
      label: "standard relationship fit",
      state: "standard",
    };
  }

  const commanderText = getCharacterProfileText(commander);
  const targetText = getCharacterProfileText(targetCrew);
  const sharedText = `${commanderText} ${targetText}`;
  const ledgerDelta = getRelationshipLedgerDelta(commander, targetCrew, worldState);

  let score = ledgerDelta;

  score += countTextMatches(commanderText, ["calm", "clarity", "steady", "empathetic", "crew"]);
  score += countTextMatches(targetText, ["procedural", "disciplined", "measured", "careful"]);
  score += countTextMatches(sharedText, ["trust", "stabil", "consensus"]);

  score -= countTextMatches(commanderText, ["alone", "closed", "secrets", "colder", "rigid"]);
  score -= countTextMatches(targetText, ["reckless", "obsessive", "impulsive", "risk envelope"]);
  score -= countTextMatches(sharedText, ["colliding", "clashing", "argument", "slipping"]);

  if (score >= 3) {
    return {
      boost: 1,
      label: "trusted relationship fit",
      state: "trusted",
    };
  }

  if (score <= -1) {
    return {
      boost: -1,
      label: "tense relationship fit",
      state: "tense",
    };
  }

  return {
    boost: 0,
    label: "standard relationship fit",
    state: "standard",
  };
}

export function getCommanderDelegationProfile(activeCrew) {
  const traitText = `${activeCrew?.character?.trait || ""} ${activeCrew?.character?.flaw || ""} ${
    activeCrew?.character?.tensionNote || ""
  }`.toLowerCase();

  let bestStyle = COMMANDER_DELEGATION_STYLES[1];
  let bestScore = -Infinity;

  COMMANDER_DELEGATION_STYLES.forEach((style) => {
    const positiveScore = style.positive.filter((token) => traitText.includes(token)).length;
    const negativeScore = style.negative.filter((token) => traitText.includes(token)).length;
    const score = positiveScore - negativeScore;

    if (score > bestScore) {
      bestScore = score;
      bestStyle = style;
    }
  });

  return bestStyle;
}

export function getPairRelationshipProfile(sourceCrew, targetCrew, worldState) {
  if (!sourceCrew || !targetCrew || sourceCrew.id === targetCrew.id) {
    return {
      boost: 0,
      label: "standard crew fit",
      state: "standard",
    };
  }

  if (sourceCrew.role === "Commander") {
    return getCommanderRelationshipProfile(sourceCrew, targetCrew, worldState);
  }

  const sourceText = getCharacterProfileText(sourceCrew);
  const targetText = getCharacterProfileText(targetCrew);
  const sharedText = `${sourceText} ${targetText}`;
  const ledgerDelta = getRelationshipLedgerDelta(sourceCrew, targetCrew, worldState);

  let score = ledgerDelta;

  score += countTextMatches(sharedText, ["procedural", "measured", "steady", "stabil", "careful"]);
  score += countTextMatches(sharedText, ["signal", "pattern", "repair", "route", "field"]);
  score -= countTextMatches(sharedText, ["clashing", "colliding", "argument", "reckless", "obsessive"]);
  score -= countTextMatches(sharedText, ["impulsive", "rigid", "slipping"]);

  if (score >= 3) {
    return {
      boost: 1,
      label: "trusted crew fit",
      state: "trusted",
    };
  }

  if (score <= -1) {
    return {
      boost: -1,
      label: "tense crew fit",
      state: "tense",
    };
  }

  return {
    boost: 0,
    label: "standard crew fit",
    state: "standard",
  };
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

export function createFollowThroughWindow(worldState, activeCrew, actionText, effectStrength) {
  const delegationProfile =
    activeCrew?.role === "Commander" ? getCommanderDelegationProfile(activeCrew) : null;
  const directedCrew =
    activeCrew?.role === "Commander" ? inferDirectedCrew(worldState, actionText) : null;
  const targetCrew =
    directedCrew ||
    getCrewByRole(worldState, getNextRoleTarget(activeCrew?.role, actionText));
  if (!targetCrew || targetCrew.id === activeCrew?.id) return null;
  const relationshipProfile = getPairRelationshipProfile(activeCrew, targetCrew, worldState);

  return {
    sourceRole: activeCrew.role,
    sourceCrewId: activeCrew.id,
    sourceCrewName: activeCrew.name,
    targetRole: targetCrew.role,
    targetCrewId: targetCrew.id,
    targetCrewName: targetCrew.name,
    strength:
      effectStrength + (delegationProfile?.boost || 0) + (relationshipProfile?.boost || 0) >= 5
        ? "strong"
        : effectStrength + (delegationProfile?.boost || 0) + (relationshipProfile?.boost || 0) >= 3
          ? "soft"
          : "fragile",
    priorityHandoff: Boolean(directedCrew && directedCrew.id !== activeCrew.id),
    delegationStyle: delegationProfile?.id || null,
    delegationLabel: delegationProfile?.label || null,
    relationshipState: relationshipProfile?.state || null,
    relationshipLabel: relationshipProfile?.label || null,
    label: `${activeCrew.role} setup for ${targetCrew.role}`,
  };
}

export function getSupportStrengthValue(strength) {
  if (strength === "strong") return 4;
  if (strength === "soft") return 2;
  return 1;
}

export function createSupportWindowDelta(worldState, supportWindow) {
  if (!supportWindow?.targetRole) return {};

  return {
    mission: {
      supportWindow,
    },
    eventLog: [
      {
        ts: worldState?.mission?.met || "T+00:00",
        type: EVENT_LOG_TYPES.TRAIT,
        msg: `${supportWindow.sourceCrewName} creates a ${supportWindow.strength} follow-through window for ${supportWindow.targetCrewName}.`,
      },
    ],
  };
}

export function getActiveSupportWindow(worldState, activeCrew) {
  const supportWindow = worldState?.mission?.supportWindow;
  if (!supportWindow || !activeCrew?.role) return null;

  if (supportWindow.targetCrewId === activeCrew.id || supportWindow.targetRole === activeCrew.role) {
    return supportWindow;
  }

  return null;
}

export function createRelationshipLedgerDelta(worldState, supportWindow, baseStrength, activeCrew) {
  if (
    !supportWindow?.sourceCrewId ||
    !supportWindow?.targetCrewId ||
    supportWindow.targetCrewId !== activeCrew?.id
  ) {
    return {};
  }

  const relationshipShift = baseStrength >= 4 ? 1 : -1;
  const key = createRelationshipKey(supportWindow.sourceCrewId, supportWindow.targetCrewId);
  if (!key || !relationshipShift) return {};

  const currentLedger = getRelationshipLedger(worldState);
  const relationshipLedger = {
    ...currentLedger,
    [key]: clampRelationshipLedger((currentLedger[key] || 0) + relationshipShift),
  };

  return {
    mission: {
      relationshipLedger,
    },
    eventLog: [
      {
        ts: worldState?.mission?.met || "T+00:00",
        type: EVENT_LOG_TYPES.TRAIT,
        msg:
          relationshipShift > 0
            ? `${activeCrew.name} validates the crew handoff and strengthens operational trust.`
            : `${activeCrew.name} fumbles the handoff window, putting strain on crew coordination.`,
      },
    ],
  };
}

export function getRoleSupportPreview(worldState, activeCrew, actionText = "") {
  const incoming = getActiveSupportWindow(worldState, activeCrew);
  const directedCrew =
    activeCrew?.role === "Commander" ? inferDirectedCrew(worldState, actionText) : null;
  const outgoingTargetRole = directedCrew?.role || getNextRoleTarget(activeCrew?.role, actionText);
  const outgoingTargetCrew = directedCrew || getCrewByRole(worldState, outgoingTargetRole);
  const delegationProfile =
    activeCrew?.role === "Commander" ? getCommanderDelegationProfile(activeCrew) : null;
  const relationshipProfile = outgoingTargetCrew
    ? getPairRelationshipProfile(activeCrew, outgoingTargetCrew, worldState)
    : null;

  return {
    incoming,
    delegationProfile,
    relationshipProfile,
    outgoing:
      outgoingTargetRole && outgoingTargetCrew
        ? {
            targetRole: outgoingTargetRole,
            targetCrewName: outgoingTargetCrew.name,
            priorityHandoff: Boolean(directedCrew && directedCrew.id !== activeCrew?.id),
            strength:
              (activeCrew?.role === "Commander" ? delegationProfile?.boost || 0 : 0) +
                (relationshipProfile?.boost || 0) >= 2
                ? "strong"
                : (activeCrew?.role === "Commander" ? delegationProfile?.boost || 0 : 0) +
                      (relationshipProfile?.boost || 0) >=
                    0
                  ? "soft"
                  : "fragile",
          }
        : null,
  };
}

export function getFollowThroughTurnTarget(worldState) {
  const supportWindow = worldState?.mission?.supportWindow;
  if (!supportWindow?.targetCrewId) {
    return null;
  }

  if (supportWindow.priorityHandoff) {
    return worldState?.crew?.find((member) => member.id === supportWindow.targetCrewId) || null;
  }

  if (supportWindow.strength === "strong") {
    return worldState?.crew?.find((member) => member.id === supportWindow.targetCrewId) || null;
  }

  if (supportWindow.strength === "soft" && supportWindow.relationshipState !== "tense") {
    return worldState?.crew?.find((member) => member.id === supportWindow.targetCrewId) || null;
  }

  return null;
}

export function getCrewCoordinationSnapshot(worldState) {
  const crew = worldState?.crew || [];
  const relationshipLedger = getRelationshipLedger(worldState);
  const entries = [];

  crew.forEach((sourceCrew) => {
    crew.forEach((targetCrew) => {
      if (!sourceCrew?.id || !targetCrew?.id || sourceCrew.id === targetCrew.id) return;

      const profile = getPairRelationshipProfile(sourceCrew, targetCrew, worldState);
      const key = createRelationshipKey(sourceCrew.id, targetCrew.id);

      entries.push({
        key,
        sourceCrewId: sourceCrew.id,
        sourceCrewName: sourceCrew.name,
        targetCrewId: targetCrew.id,
        targetCrewName: targetCrew.name,
        state: profile.state,
        label: profile.label,
        ledger: clampRelationshipLedger(relationshipLedger[key] || 0),
      });
    });
  });

  return entries.sort((left, right) => {
    const priority = { tense: 0, trusted: 1, standard: 2 };
    const leftRank = priority[left.state] ?? 3;
    const rightRank = priority[right.state] ?? 3;
    if (leftRank !== rightRank) return leftRank - rightRank;
    return `${left.sourceCrewName}${left.targetCrewName}`.localeCompare(
      `${right.sourceCrewName}${right.targetCrewName}`
    );
  });
}

export function getTopCoordinationAlert(worldState) {
  const activeSupportWindow = worldState?.mission?.supportWindow || null;
  if (activeSupportWindow?.priorityHandoff) {
    return {
      tone: "info",
      label: "Priority Handoff",
      msg: `${activeSupportWindow.sourceCrewName} has pushed initiative to ${activeSupportWindow.targetCrewName}.`,
    };
  }

  const coordination = getCrewCoordinationSnapshot(worldState);
  const topEntry = coordination[0];
  if (!topEntry) return null;

  if (topEntry.state === "tense") {
    return {
      tone: "risk",
      label: "Crew Friction",
      msg: `${topEntry.sourceCrewName} -> ${topEntry.targetCrewName} is running tense (${topEntry.ledger}).`,
    };
  }

  if (topEntry.state === "trusted") {
    return {
      tone: "good",
      label: "Crew Sync",
      msg: `${topEntry.sourceCrewName} -> ${topEntry.targetCrewName} is running trusted (${topEntry.ledger > 0 ? `+${topEntry.ledger}` : topEntry.ledger}).`,
    };
  }

  return null;
}
