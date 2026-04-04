function summarizeCrewReadiness(crew = []) {
  const readyCount = crew.filter((member) => member.health >= 60).length;
  return `${readyCount}/${crew.length}`;
}

function createItem(key, val, warn = false) {
  return { key, val, warn };
}

function getCrewById(ws, id) {
  return ws.crew.find((member) => member.id === id);
}

function commanderView(ws) {
  const park = getCrewById(ws, "park");

  return [
    createItem("OBJECTIVE", ws.mission.objectives[0]),
    createItem("PHASE", ws.mission.phase, /critical|breach|drift/i.test(ws.mission.phase)),
    createItem("CREW READY", summarizeCrewReadiness(ws.crew), ws.crew.some((member) => member.health < 60)),
    createItem("COMMS", ws.systems.comms < 50 ? "Earth link degraded" : "Command relay nominal", ws.systems.comms < 50),
    createItem(
      "EVA RISK",
      park && park.extra.value < 40 ? "Park suit integrity below safe margin" : "Park cleared for short EVA",
      Boolean(park && park.extra.value < 40)
    ),
  ];
}

function engineerView(ws, crewMember) {
  return [
    createItem("O2 LEVEL", `${ws.systems.o2}% reserve`, ws.systems.o2 < 75),
    createItem("SCRUBBER", ws.systems.scrubber, ws.systems.scrubber !== "nominal"),
    createItem("POWER", `${ws.systems.power}% available`, ws.systems.power < 70),
    createItem("PROP", `${ws.systems.propulsion}% thrust authority`, ws.systems.propulsion < 70),
    createItem("PATCH", crewMember.status, /leak|risk|unstable/i.test(crewMember.status)),
  ];
}

function scienceView(ws, crewMember) {
  return [
    createItem("ANOMALY", ws.environment.anomaly),
    createItem("HAZARDS", ws.environment.hazards.slice(0, 2).join(", ")),
    createItem("SCAN RNG", `${crewMember.extra.value}% confidence`, crewMember.extra.value < 70),
    createItem("VISUAL", ws.environment.visibility),
    createItem("THESIS", "Signal source appears artificial and buried below the rim"),
  ];
}

function specialistView(ws, crewMember) {
  return [
    createItem("EVA SUIT", `${crewMember.extra.value}% integrity`, crewMember.extra.value < 40),
    createItem("LOADOUT", crewMember.inventory.slice(0, 3).join(", ")),
    createItem("COMMS", ws.systems.comms < 30 ? "Relay blackout risk" : "Short-range relay holding", ws.systems.comms < 30),
    createItem("SURFACE", ws.environment.hazards[1] || "Terrain uncertain"),
    createItem("ORDERS", ws.mission.objectives[1], /alive|restore/i.test(ws.mission.objectives[1])),
  ];
}

const VIEW_BY_ROLE = {
  Commander: commanderView,
  "Flight Engineer": engineerView,
  "Science Officer": scienceView,
  "Mission Specialist": specialistView,
};

export function getViewForRole(ws, roleIndex) {
  const crewMember = ws?.crew?.[roleIndex];
  if (!crewMember) return [];

  const builder = VIEW_BY_ROLE[crewMember.role];
  if (!builder) return [];

  return builder(ws, crewMember);
}
