import { useEffect, useRef } from "react";
import EventLog from "./EventLog";
import { useTypewriter } from "./useTypewriter";

export default function NarrationPanel({ text, eventLog }) {
  const { displayed, done } = useTypewriter(text);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [eventLog]);

  return (
    <div
      style={{
        background: "#0a0e14",
        padding: 16,
        borderRight: "1px solid #1e3a5f",
        display: "flex",
        flexDirection: "column",
        minHeight: 520,
      }}
    >
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
        MISSION CONTROL // DM CHANNEL
      </div>
      <div
        style={{
          flex: 1,
          lineHeight: 1.8,
          color: "#b0c4d8",
          fontSize: 13,
          marginBottom: 16,
          whiteSpace: "pre-wrap",
        }}
      >
        {displayed}
        {!done ? (
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 14,
              background: "#378ADD",
              verticalAlign: "middle",
              animation: "blink 1s step-end infinite",
            }}
          />
        ) : null}
      </div>
      <div style={{ borderTop: "1px solid #1e3a5f", paddingTop: 10 }}>
        <EventLog eventLog={eventLog} logRef={logRef} />
      </div>
    </div>
  );
}
