export default function TurnIndicator({ activeCrew, waiting }) {
  return (
    <div className={`turn-indicator${waiting ? " turn-indicator--waiting" : ""}`}>
      <div>
        <div
          className={`turn-indicator__eyebrow${
            waiting ? " turn-indicator__eyebrow--waiting" : ""
          }`}
        >
          {waiting ? "DM PROCESSING" : "ACTIVE TURN"}
        </div>
        <div
          className={`turn-indicator__copy${waiting ? " turn-indicator__copy--waiting" : ""}`}
        >
          {waiting
            ? `${activeCrew.name}'s command is being resolved. Stand by for new intel.`
            : `${activeCrew.name} on station as ${activeCrew.role}.`}
        </div>
      </div>

      <div className={`turn-indicator__badge${waiting ? " turn-indicator__badge--waiting" : ""}`}>
        {waiting ? "LOCKED" : "READY"}
      </div>
    </div>
  );
}
