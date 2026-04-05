import { memo } from "react";

function TurnIndicator({ activeCrew, waiting, coordinationAlert }) {
  return (
    <div className={`turn-indicator${waiting ? " turn-indicator--waiting" : ""}`}>
      <div>
        <div
          className={`turn-indicator__eyebrow${
            waiting ? " turn-indicator__eyebrow--waiting" : ""
          }`}
        >
          {waiting ? "CHANNEL BUSY" : "ACTIVE WATCH"}
        </div>
        <div
          className={`turn-indicator__copy${waiting ? " turn-indicator__copy--waiting" : ""}`}
        >
          {waiting
            ? `${activeCrew.name}'s order is moving through the stack. Stand by for fresh telemetry.`
            : `${activeCrew.name} on station as ${activeCrew.role}.`}
        </div>
        {coordinationAlert ? (
          <div
            className={`turn-indicator__coordination turn-indicator__coordination--${coordinationAlert.tone}`}
          >
            <span className="turn-indicator__coordination-label">{coordinationAlert.label}</span>
            <span>{coordinationAlert.msg}</span>
          </div>
        ) : null}
      </div>

      <div className={`turn-indicator__badge${waiting ? " turn-indicator__badge--waiting" : ""}`}>
        {waiting ? "HOLD" : "READY"}
      </div>
    </div>
  );
}

export default memo(TurnIndicator);
