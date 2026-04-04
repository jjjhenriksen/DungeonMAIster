import { mergeStateDelta } from "./deltaParser";

export function applyStateDelta(worldState, delta) {
  return mergeStateDelta(worldState, delta);
}
