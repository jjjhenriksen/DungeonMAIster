import TurnIndicator from "./TurnIndicator";

export default function ActionInput({
  activeCrew,
  input,
  inputRef,
  onChange,
  onKeyDown,
  onSubmit,
  waiting,
}) {
  return (
    <div
      style={{
        background: "#0d1219",
        borderTop: "1px solid #1e3a5f",
        padding: 12,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#378ADD",
          letterSpacing: 2,
          marginBottom: 6,
        }}
      >
        ACTION INPUT
      </div>

      <TurnIndicator activeCrew={activeCrew} waiting={waiting} />

      <div
        style={{
          background: waiting ? "#10161f" : "#0b1016",
          border: `1px solid ${waiting ? "#5f3824" : "#1a304a"}`,
          borderRadius: 10,
          padding: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: waiting ? "#F6B15A" : "#7f9db9",
            marginBottom: 8,
            lineHeight: 1.5,
          }}
        >
          {waiting
            ? "The DM is resolving the last move. Controls are temporarily locked."
            : `Queue a concise action for ${activeCrew.name}. Short, decisive commands read best.`}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={inputRef}
            className="al-input"
            style={{
              flex: 1,
              background: "#0a0e14",
              border: `1px solid ${waiting ? "#5f3824" : "#1e3a5f"}`,
              borderRadius: 6,
              color: waiting ? "#8d8d8d" : "#c8d6e5",
              fontFamily: "inherit",
              fontSize: 12,
              padding: "8px 10px",
            }}
            placeholder={
              waiting
                ? "Command link locked while the DM responds..."
                : `What does ${activeCrew.name} do?`
            }
            value={input}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            disabled={waiting}
          />
          <button
            className="al-btn"
            style={{
              background: "#378ADD22",
              border: `1px solid ${waiting ? "#5f3824" : "#378ADD55"}`,
              color: waiting ? "#7f6b55" : "#378ADD",
              fontFamily: "inherit",
              fontSize: 11,
              letterSpacing: 1,
              padding: "0 14px",
              borderRadius: 6,
              cursor: waiting ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
            onClick={onSubmit}
            disabled={waiting}
          >
            {waiting ? "AWAITING DM" : "TRANSMIT"}
          </button>
        </div>
      </div>
    </div>
  );
}
