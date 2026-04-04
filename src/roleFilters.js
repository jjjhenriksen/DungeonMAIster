export function getViewForRole(ws, crewIndex) {
  const crewMember = ws.crew[crewIndex];
  const systems = ws.systems;
  const missionSpecialist = ws.crew[3];

  const views = [
    [
      { key: "OBJECTIVE", val: ws.mission.objectives[0] },
      { key: "PHASE", val: ws.mission.phase },
      {
        key: "CREW READY",
        val: `${ws.crew.filter((member) => member.health > 50).length}/${ws.crew.length}`,
      },
      {
        key: "EVA STATUS",
        val: missionSpecialist.extra.value < 50 ? "Park suit integrity low" : "Nominal",
        warn: missionSpecialist.extra.value < 50,
      },
      {
        key: "UPLINK",
        val: systems.comms < 50 ? "Earth comms degraded" : "Nominal",
        warn: systems.comms < 50,
      },
    ],
    [
      {
        key: "O2 LEVEL",
        val: `${systems.o2}% — ${systems.o2 < 80 ? "monitor closely" : "nominal"}`,
        warn: systems.o2 < 80,
      },
      {
        key: "PWR GRID",
        val: systems.power > 90 ? "Nominal" : `${systems.power}% — reduced`,
      },
      {
        key: "SCRUBBER",
        val: systems.scrubber === "patched" ? "Patched — holding" : "Nominal",
      },
      {
        key: "PROPULSION",
        val: systems.propulsion > 90 ? "Nominal" : "Degraded",
        warn: systems.propulsion < 90,
      },
      {
        key: "LIFE SUPP",
        val: systems.o2 > 60 && systems.power > 80 ? "Green" : "At risk",
        warn: systems.o2 < 60 || systems.power < 80,
      },
    ],
    [
      { key: "ANOMALY SIG", val: `${ws.environment.anomaly.slice(0, 28)}…` },
      { key: "GEOMETRY", val: "Non-natural — deliberate" },
      {
        key: "SCAN RANGE",
        val: `${crewMember.extra.value}% — interference`,
        warn: crewMember.extra.value < 70,
      },
      { key: "SAMPLES", val: "0 collected" },
      { key: "HYPOTHESIS", val: "Artificial origin likely" },
    ],
    [
      {
        key: "EVA SUIT",
        val: `Integrity ${crewMember.extra.value}% — ${crewMember.extra.value < 40 ? "critical" : "ok"}`,
        warn: crewMember.extra.value < 40,
      },
      {
        key: "COMMS RELAY",
        val: systems.comms < 50 ? "Degraded" : "Nominal",
        warn: systems.comms < 50,
      },
      { key: "EQUIPMENT", val: "Drill, beacon, patch kit" },
      {
        key: "EARTH LINK",
        val: systems.comms < 30 ? "Unavailable" : "Active",
        warn: systems.comms < 30,
      },
      {
        key: "NEXT EVA",
        val: crewMember.extra.value < 40 ? "High risk" : "Cleared",
        warn: crewMember.extra.value < 40,
      },
    ],
  ];

  return views[crewIndex] ?? [];
}
