const SYSTEM_KEYS = ["o2", "power", "comms", "thermal", "nav", "propulsion"];

export function clampPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

export function getCrewById(worldState, crewId) {
  return worldState?.crew?.find((member) => member.id === crewId);
}

export function getCrewByRole(worldState, role) {
  return worldState?.crew?.find((member) => member.role === role);
}

export function createCrewPatch(member, fields) {
  if (!member) return null;
  return {
    id: member.id,
    ...fields,
  };
}

export function getWeakestSystemKey(worldState) {
  return SYSTEM_KEYS.filter((key) => typeof worldState?.systems?.[key] === "number").sort(
    (left, right) => worldState.systems[left] - worldState.systems[right]
  )[0];
}

export function getPrimaryHazard(worldState) {
  return worldState?.environment?.hazards?.[0] || worldState?.environment?.anomaly || "the anomaly";
}

export function getSecondaryHazard(worldState) {
  return (
    worldState?.environment?.hazards?.[1] ||
    worldState?.environment?.visibility ||
    "terrain instability"
  );
}
