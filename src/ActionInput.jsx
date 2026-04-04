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

      <div style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          className="al-input"
          style={{
            flex: 1,
            background: "#0a0e14",
            border: "1px solid #1e3a5f",
            borderRadius: 4,
            color: "#c8d6e5",
            fontFamily: "inherit",
            fontSize: 12,
            padding: "8px 10px",
          }}
          placeholder={waiting ? "…" : `What does ${activeCrew.name} do?`}
          value={input}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          disabled={waiting}
        />
        <button
          className="al-btn"
          style={{
            background: "#378ADD22",
            border: "1px solid #378ADD55",
            color: "#378ADD",
            fontFamily: "inherit",
            fontSize: 11,
            letterSpacing: 1,
            padding: "0 14px",
            borderRadius: 4,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onClick={onSubmit}
          disabled={waiting}
        >
          TRANSMIT
        </button>
      </div>
    </div>
  );
}
