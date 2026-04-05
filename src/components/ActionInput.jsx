import TurnIndicator from "./TurnIndicator.jsx";

function formatSetupStrength(strength) {
  if (strength === "strong") return "strong";
  if (strength === "fragile") return "fragile";
  return "soft";
}

export default function ActionInput({
  activeCrew,
  input,
  inputRef,
  onChange,
  onKeyDown,
  onSubmit,
  waiting,
  isBotTurn,
  botPreview,
  botPreviewLoading,
  narrationReady,
  uiState,
  missionResolved = false,
}) {
  const actionPanelState = uiState?.actionPanel;
  const roleGuidance = actionPanelState?.roleGuidance;
  const roleMechanicSummary = actionPanelState?.roleMechanicSummary;
  const roleAlignmentPreview = actionPanelState?.roleAlignmentPreview;
  const roleSupportPreview = actionPanelState?.roleSupportPreview;
  const missionMechanicSummary = actionPanelState?.missionMechanicSummary;
  const missionOpportunityPreview = actionPanelState?.missionOpportunityPreview;
  const isDraftingAutonomousTurn =
    !missionResolved && isBotTurn && !waiting && (botPreviewLoading || !narrationReady);

  return (
    <div className="action-input panel-boot" style={{ "--boot-delay": "240ms" }}>
      <div className="section-title section-title--mb-6">
        ACTION INPUT
      </div>

      <TurnIndicator
        activeCrew={activeCrew}
        waiting={waiting}
        coordinationAlert={uiState?.coordinationAlert}
      />

      <div
        className={`action-input__panel${waiting ? " action-input__panel--waiting" : ""}${
          isDraftingAutonomousTurn ? " action-input__panel--drafting" : ""
        }`}
      >
        {!waiting && !isBotTurn && !missionResolved ? (
          <div className="action-input__focus">
            <div className="action-input__focus-label">TACTICAL FOCUS</div>
            <div className="action-input__focus-copy">{roleGuidance?.focus}</div>
            <div className="action-input__hint">
              Role leverage: {roleMechanicSummary}
            </div>
            <div className="action-input__hint">
              Mission leverage: {missionMechanicSummary}
            </div>
            <div
              className={`action-input__alignment action-input__alignment--${roleAlignmentPreview.level}`}
            >
              <div className="action-input__alignment-chip">{roleAlignmentPreview.label}</div>
              <div className="action-input__alignment-copy">{roleAlignmentPreview.detail}</div>
            </div>
            <div
              className={`action-input__alignment action-input__alignment--${missionOpportunityPreview.level}`}
            >
              <div className="action-input__alignment-chip">{missionOpportunityPreview.label}</div>
              <div className="action-input__alignment-copy">{missionOpportunityPreview.detail}</div>
            </div>
            {roleSupportPreview?.incoming || roleSupportPreview?.outgoing ? (
              <div className="action-input__support">
                {roleSupportPreview?.delegationProfile ? (
                  <div className="action-input__support-row">
                    <span className="action-input__support-label">Command style</span>
                    <span className="action-input__support-copy">
                      {roleSupportPreview.delegationProfile.label[0].toUpperCase() +
                        roleSupportPreview.delegationProfile.label.slice(1)}
                      .
                    </span>
                  </div>
                ) : null}
                {roleSupportPreview?.relationshipProfile ? (
                  <div className="action-input__support-row">
                    <span className="action-input__support-label">Crew fit</span>
                    <span className="action-input__support-copy">
                      {roleSupportPreview.relationshipProfile.label[0].toUpperCase() +
                        roleSupportPreview.relationshipProfile.label.slice(1)}
                      .
                    </span>
                  </div>
                ) : null}
                {roleSupportPreview?.incoming ? (
                  <div className="action-input__support-row">
                    <span className="action-input__support-label">Incoming setup</span>
                    <span className="action-input__support-copy">
                      {roleSupportPreview.incoming.sourceCrewName} has opened a{" "}
                      {roleSupportPreview.incoming.strength} window for {activeCrew.name}.
                    </span>
                  </div>
                ) : null}
                {roleSupportPreview?.outgoing ? (
                  <div className="action-input__support-row">
                    <span className="action-input__support-label">Follow-through</span>
                    <span className="action-input__support-copy">
                      {roleSupportPreview.outgoing.priorityHandoff
                        ? `This command hands initiative to ${roleSupportPreview.outgoing.targetCrewName} next with a ${formatSetupStrength(roleSupportPreview.outgoing.strength)} setup.`
                        : `This move can tee up ${roleSupportPreview.outgoing.targetCrewName} next${
                            roleSupportPreview.outgoing.strength
                              ? ` with a ${formatSetupStrength(roleSupportPreview.outgoing.strength)} setup`
                              : ""
                          }.`}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className={`action-input__hint${waiting ? " action-input__hint--waiting" : ""}`}>
          {missionResolved
            ? "Mission state resolved. Turn input is now locked while recovery and debrief proceed."
            : waiting
              ? "The last move is still resolving. Controls are temporarily locked."
            : isBotTurn
              ? botPreviewLoading
                ? `${activeCrew.name} is in autonomous mode and assembling a response.`
                : narrationReady
                ? `${activeCrew.name} is in autonomous mode. Advance when you're ready for the next turn.`
                : `${activeCrew.name} is in autonomous mode and waiting for the channel to clear.`
              : `Queue a concise action for ${activeCrew.name}. Clear, decisive commands read best.`}
        </div>

        {isBotTurn && botPreview && !missionResolved ? (
          <div className="action-input__bot-preview">
            {botPreviewLoading ? "Drafting autonomous action..." : "Autonomous action:"} {botPreview}
          </div>
        ) : null}

        {isDraftingAutonomousTurn ? (
          <div className="action-input__drafting" aria-hidden="true">
            <span className="action-input__drafting-label">COMPOSING RESPONSE</span>
            <span className="action-input__drafting-dots">
              <span />
              <span />
              <span />
            </span>
          </div>
        ) : null}

        {!waiting && !isBotTurn && !missionResolved && roleGuidance?.suggestions?.length > 0 ? (
          <div className="action-input__suggestions">
            {roleGuidance.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="action-input__suggestion"
                onClick={() => onChange(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        <div className="action-input__row">
          <textarea
            ref={inputRef}
            className="al-input"
            placeholder={
              waiting
                ? "Command link locked while the channel answers..."
                : missionResolved
                  ? "Mission resolved. Command channel archived."
                  : isBotTurn
                    ? botPreviewLoading
                      ? "Autonomous planner is drafting the next move..."
                      : narrationReady
                        ? `${activeCrew.name} is preparing an autonomous response...`
                        : "Autonomous handoff is waiting on the current transmission..."
                    : `What does ${activeCrew.name} do?`
            }
            value={input}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            disabled={waiting || isBotTurn || missionResolved}
            rows={5}
          />
          <button
            className="al-btn"
            onClick={onSubmit}
            disabled={missionResolved || waiting || (isBotTurn && (!narrationReady || botPreviewLoading))}
          >
            {missionResolved
              ? "MISSION RESOLVED"
              : waiting
              ? "AWAITING RESPONSE"
              : isBotTurn
                ? botPreviewLoading
                  ? "DRAFTING TURN"
                  : narrationReady
                  ? "CONTINUE AUTONOMOUS TURN"
                  : "READING CHANNEL"
                : "TRANSMIT"}
          </button>
        </div>
      </div>
    </div>
  );
}
