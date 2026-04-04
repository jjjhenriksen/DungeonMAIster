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

function getRoleChainTargets(role) {
  return ROLE_CHAIN_TARGETS[role] || [];
}

export function isActionRoleAligned(role, actionText = "") {
  const normalized = actionText.toLowerCase();
  return (ROLE_KEYWORDS[role] || []).some((keyword) => normalized.includes(keyword));
}

export function countRoleKeywordMatches(role, actionText = "") {
  const normalized = actionText.toLowerCase();
  return (ROLE_KEYWORDS[role] || []).filter((keyword) => normalized.includes(keyword)).length;
}

export function getCrewNameTokens(name = "") {
  return String(name)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export function getRoleTokens(role = "") {
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

export function getNextRoleTarget(role, actionText = "") {
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
