import {
  extractTurnResult,
  mergeStateDelta,
  normalizeStateDelta,
} from "../src/game/deltaParser.js";
import { createWorldState } from "./fixtures.js";

describe("deltaParser", () => {
  test("normalizes and clamps malformed partial deltas", () => {
    const delta = normalizeStateDelta({
      systems: { comms: 140 },
      crew: [{ id: "commander", health: -10, extra: { value: 150 } }],
      eventLog: [{ msg: "Signal spike", type: "weird-type" }],
    });

    expect(delta.systems.comms).toBe(100);
    expect(delta.crew[0].health).toBe(0);
    expect(delta.crew[0].extra.value).toBe(100);
    expect(delta.eventLog[0].type).toBe("system");
  });

  test("constrains oversized system and crew changes per turn", () => {
    const worldState = createWorldState({
      systems: { comms: 50, thermal: 50 },
      crew: [
        {
          ...createWorldState().crew[0],
          id: "commander",
          health: 80,
          morale: 80,
          extra: { label: "Authority", value: 60, detail: "Command bandwidth", unit: "%" },
        },
      ],
    });

    const next = mergeStateDelta(worldState, {
      systems: { comms: 100 },
      crew: [{ id: "commander", health: 10, extra: { value: 100 } }],
    });

    expect(next.systems.comms).toBe(62);
    expect(next.crew[0].health).toBe(65);
    expect(next.crew[0].extra.value).toBe(78);
  });

  test("deduplicates event log entries and keeps newest first", () => {
    const worldState = createWorldState({
      eventLog: [{ ts: "T+00:01", type: "risk", msg: "Existing alert" }],
    });

    const next = mergeStateDelta(worldState, {
      eventLog: [
        { ts: "T+00:02", type: "risk", msg: "New alert" },
        { ts: "T+00:01", type: "risk", msg: "Existing alert" },
      ],
    });

    expect(next.eventLog).toHaveLength(2);
    expect(next.eventLog[0].msg).toBe("New alert");
  });

  test("extracts narration and state delta from mixed model output", () => {
    const result = extractTurnResult(`Narration first.\n\nSTATE_DELTA: {"systems":{"nav":80}}`);
    expect(result.narration).toBe("Narration first.");
    expect(result.stateDelta.systems.nav).toBe(80);
  });
});
