import { memo, useEffect, useRef, useState } from "react";

function CrewStatusBar({ mission, systems, uiState }) {
  const [pulseLabels, setPulseLabels] = useState([]);
  const previousStateRef = useRef({
    o2: systems.o2,
    power: systems.power,
    comms: systems.comms,
    state: `${uiState?.dangerLevel || "guarded"}|${uiState?.coordinationAlert?.label || ""}`,
  });

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
    { label: "STATE", val: uiState?.dangerLevel?.toUpperCase() || "GUARDED", warn: uiState?.dangerLevel !== "guarded" },
  ];

  useEffect(() => {
    const currentState = {
      o2: systems.o2,
      power: systems.power,
      comms: systems.comms,
      state: `${uiState?.dangerLevel || "guarded"}|${uiState?.coordinationAlert?.label || ""}`,
    };

    const changedLabels = [];
    if (previousStateRef.current.o2 !== currentState.o2) changedLabels.push("O2");
    if (previousStateRef.current.power !== currentState.power) changedLabels.push("PWR");
    if (previousStateRef.current.comms !== currentState.comms) changedLabels.push("COMMS");
    if (previousStateRef.current.state !== currentState.state) changedLabels.push("STATE");

    previousStateRef.current = currentState;

    if (changedLabels.length === 0) return;
    setPulseLabels(changedLabels);
    const timer = window.setTimeout(() => setPulseLabels([]), 760);
    return () => window.clearTimeout(timer);
  }, [systems.o2, systems.power, systems.comms, uiState?.dangerLevel, uiState?.coordinationAlert?.label]);

  return (
    <div className={`status-strip status-strip--${uiState?.dangerLevel || "guarded"}`}>
      {statusItems.map((item) => (
        <div
          key={item.label}
          className={`status-strip__item${
            pulseLabels.includes(item.label) ? " status-strip__item--pulse" : ""
          }`}
        >
          {item.label}{" "}
          <span
            className={
              item.warn ? "status-strip__value--warn" : "status-strip__value--good"
            }
          >
            {item.val}
          </span>
        </div>
      ))}
    </div>
  );
}

export default memo(CrewStatusBar);
