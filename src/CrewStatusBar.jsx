export default function CrewStatusBar({ mission, systems }) {
  const statusItems = [
    { label: "MET", val: mission.met, warn: false },
    { label: "O2", val: `${systems.o2}%`, warn: systems.o2 < 80 },
    {
      label: "PWR",
      val: systems.power > 90 ? "NOMINAL" : `${systems.power}%`,
      warn: systems.power < 80,
    },
    {
      label: "COMMS",
      val: systems.comms < 50 ? "DEGRADED" : "NOMINAL",
      warn: systems.comms < 50,
    },
  ];

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      {statusItems.map((item) => (
        <div key={item.label} style={{ fontSize: 11, color: "#5a7a99", letterSpacing: 1 }}>
          {item.label}{" "}
          <span style={{ color: item.warn ? "#EF9F27" : "#1D9E75" }}>{item.val}</span>
        </div>
      ))}
    </div>
  );
}
