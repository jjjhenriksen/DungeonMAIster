export default function TurnIndicator({ activeCrew, waiting }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 10px",
        marginBottom: 10,
        borderRadius: 8,
        border: `1px solid ${waiting ? "#5f3824" : "#1e3a5f"}`,
        background: waiting ? "#251912" : "#0c141d",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 9,
            color: waiting ? "#F6B15A" : "#5a7a99",
            letterSpacing: 1.5,
            marginBottom: 2,
          }}
        >
          {waiting ? "DM PROCESSING" : "ACTIVE TURN"}
        </div>
        <div style={{ fontSize: 11, color: waiting ? "#ffd7a1" : "#e8f4ff" }}>
          {waiting
            ? `${activeCrew.name}'s command is being resolved. Stand by for new intel.`
            : `${activeCrew.name} on station as ${activeCrew.role}.`}
        </div>
      </div>

      <div
        style={{
          fontSize: 10,
          color: waiting ? "#F6B15A" : "#5DCAA5",
          border: `1px solid ${waiting ? "#8f5d2a" : "#245c4d"}`,
          background: waiting ? "#3b2414" : "#10251f",
          borderRadius: 999,
          padding: "4px 8px",
          letterSpacing: 1,
          whiteSpace: "nowrap",
        }}
      >
        {waiting ? "LOCKED" : "READY"}
      </div>
    </div>
  );
}
