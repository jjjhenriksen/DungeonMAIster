import { memo, useEffect, useRef, useState } from "react";
import { getEventTypeLabel, normalizeEventType } from "../game/eventLogTypes.js";

function EventLog({ eventLog, logRef }) {
  const latestEntryKey = eventLog[0] ? `${eventLog[0].ts}-${eventLog[0].msg}` : "";
  const previousLatestKeyRef = useRef(latestEntryKey);
  const [animatedLatestKey, setAnimatedLatestKey] = useState("");

  useEffect(() => {
    if (!latestEntryKey) return;
    if (previousLatestKeyRef.current === latestEntryKey) return;

    previousLatestKeyRef.current = latestEntryKey;
    setAnimatedLatestKey(latestEntryKey);
    const timer = window.setTimeout(() => setAnimatedLatestKey(""), 720);
    return () => window.clearTimeout(timer);
  }, [latestEntryKey]);

  return (
    <>
      <div className="section-title section-title--mb-6">
        EVENT LOG
      </div>
      <div ref={logRef} className="event-log">
        {eventLog.map((event, index) => (
          <div
            key={`${event.ts}-${event.msg}-${index}`}
            className={`event-log__row event-log__row--${normalizeEventType(event.type)}${
              `${event.ts}-${event.msg}` === animatedLatestKey ? " event-log__row--entered" : ""
            }`}
          >
            <span className="event-log__timestamp">{event.ts}</span>
            <span
              className={`event-log__tag event-log__tag--${normalizeEventType(event.type)}`}
            >
              {getEventTypeLabel(event.type)}
            </span>
            <span
              className={`event-log__message${
                index === 0 ? " event-log__message--latest" : ""
              }`}
            >
              {event.msg}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default memo(EventLog);
