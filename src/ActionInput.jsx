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
    <div className="action-input">
      <div className="section-title section-title--mb-6">
        ACTION INPUT
      </div>

      <TurnIndicator activeCrew={activeCrew} waiting={waiting} />

      <div className={`action-input__panel${waiting ? " action-input__panel--waiting" : ""}`}>
        <div className={`action-input__hint${waiting ? " action-input__hint--waiting" : ""}`}>
          {waiting
            ? "The DM is resolving the last move. Controls are temporarily locked."
            : `Queue a concise action for ${activeCrew.name}. Short, decisive commands read best.`}
        </div>

        <div className="action-input__row">
          <textarea
            ref={inputRef}
            className="al-input"
            placeholder={
              waiting
                ? "Command link locked while the DM responds..."
                : `What does ${activeCrew.name} do?`
            }
            value={input}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            disabled={waiting}
            rows={5}
          />
          <button
            className="al-btn"
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
