import { normalizeEventType } from "./eventLogTypes.js";
import { clampPercent } from "./stateUtils.js";

const MAX_EVENT_LOG_ENTRIES = 12;
const NUMERIC_SYSTEM_FIELDS = new Set(["o2", "power", "comms", "propulsion", "thermal", "nav"]);
const NUMERIC_CREW_FIELDS = new Set(["health", "morale"]);
const MAX_SYSTEM_DELTA_PER_TURN = 12;
const MAX_CREW_DELTA_PER_TURN = 15;
const MAX_EXTRA_VALUE_DELTA_PER_TURN = 18;

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function constrainPercentChange(currentValue, nextValue, maxDelta) {
  const current = clampPercent(currentValue);
  const next = clampPercent(nextValue);
  const delta = next - current;

  if (Math.abs(delta) <= maxDelta) {
    return next;
  }

  return clampPercent(current + Math.sign(delta) * maxDelta);
}

function extractJsonObject(text) {
  if (typeof text !== "string") {
    throw new Error("Expected a string response when parsing state delta");
  }

  const trimmed = text.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in response");
  }

  return unfenced.slice(start, end + 1);
}

function normalizeSystemsPatch(systems) {
  if (!isRecord(systems)) return undefined;

  const next = {};
  for (const [key, value] of Object.entries(systems)) {
    next[key] = NUMERIC_SYSTEM_FIELDS.has(key) ? clampPercent(value) : value;
  }

  return next;
}

function normalizeCrewPatch(member) {
  if (!isRecord(member) || typeof member.id !== "string" || !member.id.trim()) {
    return undefined;
  }

  const next = { id: member.id };
  for (const [key, value] of Object.entries(member)) {
    if (key === "id") continue;

    if (NUMERIC_CREW_FIELDS.has(key)) {
      next[key] = clampPercent(value);
      continue;
    }

    if (key === "extra" && isRecord(value)) {
      next.extra = {
        ...value,
        ...(value.label ? { label: String(value.label) } : {}),
        ...(Object.prototype.hasOwnProperty.call(value, "value")
          ? { value: clampPercent(value.value) }
          : {}),
      };
      continue;
    }

    next[key] = value;
  }

  return next;
}

function normalizeEventEntry(entry) {
  if (!isRecord(entry)) return undefined;

  const ts = typeof entry.ts === "string" && entry.ts.trim() ? entry.ts.trim() : "T+00:00";
  const msg = typeof entry.msg === "string" ? entry.msg.trim() : "";
  const type = normalizeEventType(entry.type);

  if (!msg) return undefined;

  return { ts, msg, type };
}

export function normalizeStateDelta(delta) {
  if (!isRecord(delta)) return {};

  const next = {};

  if (isRecord(delta.mission)) {
    next.mission = { ...delta.mission };
  }

  if (isRecord(delta.environment)) {
    next.environment = { ...delta.environment };
  }

  const normalizedSystems = normalizeSystemsPatch(delta.systems);
  if (normalizedSystems && Object.keys(normalizedSystems).length > 0) {
    next.systems = normalizedSystems;
  }

  if (Array.isArray(delta.crew)) {
    next.crew = delta.crew.map(normalizeCrewPatch).filter(Boolean);
  }

  if (Array.isArray(delta.eventLog)) {
    next.eventLog = delta.eventLog.map(normalizeEventEntry).filter(Boolean);
  }

  return next;
}

function mergeCrew(wsCrew = [], deltaCrew = []) {
  return wsCrew.map((member) => {
    const patch = deltaCrew.find((entry) => entry.id === member.id);
    if (!patch) return member;

    const constrainedPatch = { ...patch };

    for (const field of NUMERIC_CREW_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(constrainedPatch, field)) {
        constrainedPatch[field] = constrainPercentChange(
          member[field],
          constrainedPatch[field],
          MAX_CREW_DELTA_PER_TURN
        );
      }
    }

    if (
      constrainedPatch.extra &&
      Object.prototype.hasOwnProperty.call(constrainedPatch.extra, "value")
    ) {
      constrainedPatch.extra = {
        ...constrainedPatch.extra,
        value: constrainPercentChange(
          member.extra?.value,
          constrainedPatch.extra.value,
          MAX_EXTRA_VALUE_DELTA_PER_TURN
        ),
      };
    }

    return {
      ...member,
      ...constrainedPatch,
      extra: constrainedPatch.extra
        ? { ...member.extra, ...constrainedPatch.extra }
        : member.extra,
    };
  });
}

function mergeSystems(currentSystems = {}, deltaSystems = {}) {
  const next = { ...currentSystems };

  for (const [key, value] of Object.entries(deltaSystems)) {
    if (NUMERIC_SYSTEM_FIELDS.has(key)) {
      next[key] = constrainPercentChange(
        currentSystems[key],
        value,
        MAX_SYSTEM_DELTA_PER_TURN
      );
      continue;
    }

    next[key] = value;
  }

  return next;
}

function mergeEventLog(currentLog = [], deltaLog = [], limit = MAX_EVENT_LOG_ENTRIES) {
  const seen = new Set();
  const merged = [...deltaLog, ...currentLog]
    .map((entry) => normalizeEventEntry(entry))
    .filter(Boolean)
    .filter((entry) => {
      const key = `${entry.ts}::${entry.type}::${entry.msg}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return merged.slice(0, limit);
}

export function mergeStateDelta(worldState, delta, options = {}) {
  if (!isRecord(worldState)) return worldState;

  const safeDelta = normalizeStateDelta(delta);
  const eventLogLimit = options.eventLogLimit || MAX_EVENT_LOG_ENTRIES;

  return {
    ...worldState,
    mission: safeDelta.mission ? { ...worldState.mission, ...safeDelta.mission } : worldState.mission,
    environment: safeDelta.environment
      ? { ...worldState.environment, ...safeDelta.environment }
      : worldState.environment,
    systems: safeDelta.systems
      ? mergeSystems(worldState.systems, safeDelta.systems)
      : worldState.systems,
    crew: safeDelta.crew ? mergeCrew(worldState.crew, safeDelta.crew) : worldState.crew,
    eventLog: safeDelta.eventLog
      ? mergeEventLog(worldState.eventLog, safeDelta.eventLog, eventLogLimit)
      : worldState.eventLog,
  };
}

export function parseStateDeltaBlock(text) {
  if (typeof text !== "string") return {};

  const match = text.match(/STATE_DELTA:\s*({[\s\S]*})/i);
  if (!match) return {};

  return normalizeStateDelta(JSON.parse(match[1]));
}

export function extractTurnResult(text) {
  try {
    const raw = extractJsonObject(text);
    const parsed = JSON.parse(raw);
    const narration = typeof parsed.narration === "string" ? parsed.narration.trim() : "";
    const stateDelta = normalizeStateDelta(parsed.stateDelta);

    if (!narration) {
      throw new Error("Model returned empty narration");
    }

    return { narration, stateDelta };
  } catch (jsonError) {
    const narrationMatch = text.match(/^(.*?)STATE_DELTA:/is);
    const narration = narrationMatch?.[1]?.trim();
    const stateDelta = parseStateDeltaBlock(text);

    if (!narration) {
      throw jsonError;
    }

    return { narration, stateDelta };
  }
}
