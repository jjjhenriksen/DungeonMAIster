import { useRef, useState } from "react";
import ActionInput from "./ActionInput";
import CrewCard from "./CrewCard";
import CrewStatusBar from "./CrewStatusBar";
import NarrationPanel from "./NarrationPanel";
import RoleView from "./RoleView";
import { applyStateDelta } from "./applyStateDelta";
import { requestDmTurn } from "./dmApi";
import { createActionLogEntry, getNextTurnIndex } from "./gameLoop";
import { getViewForRole } from "./roleFilters";
import { INITIAL_WORLD_STATE, OPENING_NARRATION } from "./worldState";

export default function ArtemisLost() {
  const [ws, setWs] = useState(INITIAL_WORLD_STATE);
  const [turn, setTurn] = useState(0);
  const [narration, setNarration] = useState(OPENING_NARRATION);
  const [input, setInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const inputRef = useRef(null);

  const activeCrew = ws.crew[turn];
  const roleView = getViewForRole(ws, turn);

  async function handleSubmit() {
    if (!input.trim() || waiting) return;

    const action = input.trim();
    setInput("");
    setWaiting(true);

    const newLog = createActionLogEntry(ws, activeCrew, action);

    const result = await requestDmTurn({
      worldState: ws,
      action,
      activeCrew,
    });

    if (result.error) {
      setNarration(
        `Could not reach the DM service.\n\n${result.error}\n\nCheck that both dev servers are running (\`npm run dev\`), your .env has ANTHROPIC_API_KEY, and ANTHROPIC_MODEL matches an available model.`
      );
      setWs((prev) => ({
        ...prev,
        eventLog: [newLog, ...prev.eventLog].slice(0, 12),
      }));
      setWaiting(false);
      setTurn((currentTurn) => getNextTurnIndex(ws.crew, currentTurn));
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    const { narration: nextText, stateDelta } = result;
    setWs((prev) => {
      const withAction = {
        ...prev,
        eventLog: [newLog, ...prev.eventLog].slice(0, 12),
      };
      return applyStateDelta(withAction, stateDelta);
    });
    setNarration(nextText);
    setWaiting(false);
    setTurn((currentTurn) => getNextTurnIndex(ws.crew, currentTurn));
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .al-input::placeholder { color: #2a4a6a; }
        .al-input:focus { outline: none; border-color: #378ADD; }
        .al-btn:hover { background: #378ADD44 !important; }
        .al-btn:active { transform: scale(0.97); }
      `}</style>

      <div
        style={{
          background: "#0a0e14",
          color: "#c8d6e5",
          fontFamily: "'Share Tech Mono', 'Courier New', monospace",
          fontSize: 13,
          minHeight: 640,
        }}
      >
        <div
          style={{
            background: "#0d1219",
            borderBottom: "1px solid #1e3a5f",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#378ADD", letterSpacing: 2 }}>
              {ws.mission.id} // {ws.mission.name.toUpperCase()}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "#e8f4ff",
                letterSpacing: 1,
              }}
            >
              Artemis Lost
            </div>
          </div>

          <CrewStatusBar mission={ws.mission} systems={ws.systems} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplate: "auto 1fr / 1fr 320px",
            gap: 1,
            background: "#1e3a5f22",
          }}
        >
          <div style={{ gridRow: "1 / 3" }}>
            <NarrationPanel text={narration} eventLog={ws.eventLog} />
          </div>

          <div style={{ background: "#0a0e14", padding: 12 }}>
            <div
              style={{
                fontSize: 10,
                color: "#378ADD",
                letterSpacing: 2,
                marginBottom: 10,
                borderBottom: "1px solid #1e3a5f",
                paddingBottom: 6,
              }}
            >
              CREW STATUS
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {ws.crew.map((member, index) => (
                <CrewCard key={member.id} member={member} isActive={index === turn} />
              ))}
            </div>

            <RoleView activeCrew={activeCrew} roleView={roleView} />
          </div>

          <ActionInput
            activeCrew={activeCrew}
            input={input}
            inputRef={inputRef}
            onChange={setInput}
            onKeyDown={handleKeyDown}
            onSubmit={handleSubmit}
            waiting={waiting}
          />
        </div>
      </div>
    </>
  );
}
