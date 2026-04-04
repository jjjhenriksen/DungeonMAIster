import { useEffect, useState } from "react";

export function useTypewriter(text, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayed("");
      setDone(true);
      return undefined;
    }

    setDisplayed("");
    setDone(false);

    let index = 0;
    const chunkSize = text.length > 420 ? 4 : text.length > 180 ? 3 : 2;
    const interval = setInterval(() => {
      index += chunkSize;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        setDisplayed(text);
        setDone(true);
      }
    }, Math.max(speed, 28));

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}
