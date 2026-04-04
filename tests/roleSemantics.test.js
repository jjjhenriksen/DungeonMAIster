import {
  countRoleKeywordMatches,
  getNextRoleTarget,
  isActionRoleAligned,
} from "../src/game/roleSemantics.js";

describe("roleSemantics", () => {
  test("identifies aligned role language", () => {
    expect(isActionRoleAligned("Flight Engineer", "Repair the scrubber and reroute power.")).toBe(true);
    expect(countRoleKeywordMatches("Flight Engineer", "Repair the scrubber and reroute power.")).toBeGreaterThanOrEqual(2);
  });

  test("routes commander handoffs toward the referenced specialty", () => {
    expect(getNextRoleTarget("Commander", "Engineer, stabilize the thermal loop.")).toBe("Flight Engineer");
    expect(getNextRoleTarget("Commander", "Science, isolate the signal pattern.")).toBe("Science Officer");
    expect(getNextRoleTarget("Commander", "Specialist, prep the EVA route.")).toBe("Mission Specialist");
  });

  test("falls back to the default chain target when no hint is present", () => {
    expect(getNextRoleTarget("Science Officer", "I need a call on this.")).toBe("Commander");
  });
});
