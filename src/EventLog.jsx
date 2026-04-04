export default function EventLog({ eventLog, logRef }) {
  return (
    <>
      <div
        style={{
          fontSize: 10,
          color: "#378ADD",
          letterSpacing: 2,
          marginBottom: 6,
        }}
      >
        EVENT LOG
      </div>
      <div ref={logRef} style={{ maxHeight: 120, overflow: "hidden" }}>
        {eventLog.map((event, index) => (
          <div
            key={`${event.ts}-${event.msg}-${index}`}
            style={{ display: "flex", gap: 8, fontSize: 11, padding: "2px 0" }}
          >
            <span style={{ color: "#1e3a5f", flexShrink: 0 }}>{event.ts}</span>
            <span style={{ color: index === 0 ? "#5DCAA5" : "#4a7a9a" }}>
              {event.msg}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
