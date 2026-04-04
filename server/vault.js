import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const vaultRoot = path.join(projectRoot, "vault");

async function safeRead(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

function slugify(value = "") {
  return value
    .toLowerCase()
    .replace(/\b(rim|station|seat|bench|cabin)\b/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function trimToSection(label, content) {
  if (!content) return "";
  return `FILE: ${label}\n${content}`.trim();
}

async function readStaticContext(worldState, activeCrew) {
  const staticRoot = path.join(vaultRoot, "static");
  const locationSlug = slugify(worldState?.environment?.location);
  const crewId = activeCrew?.id;

  const [locationFile, crewFile, missionBrief, anomaly] = await Promise.all([
    locationSlug
      ? safeRead(path.join(staticRoot, "locations", `${locationSlug}.md`))
      : "",
    crewId ? safeRead(path.join(staticRoot, "crew", `${crewId}.md`)) : "",
    safeRead(path.join(staticRoot, "lore", "mission-brief.md")),
    safeRead(path.join(staticRoot, "lore", "anomaly.md")),
  ]);

  return {
    location: trimToSection(`${locationSlug || "current-location"}.md`, locationFile),
    crew: trimToSection(`${crewId || "active-crew"}.md`, crewFile),
    missionBrief: trimToSection("mission-brief.md", missionBrief),
    anomaly: trimToSection("anomaly.md", anomaly),
  };
}

export async function loadVaultContext({ worldState, activeCrew }) {
  const dynamicRoot = path.join(vaultRoot, "dynamic");
  const [staticContext, sessionState, log, npcOverride, locationDelta] = await Promise.all([
    readStaticContext(worldState, activeCrew),
    safeRead(path.join(dynamicRoot, "session-state.md")),
    safeRead(path.join(dynamicRoot, "log.md")),
    safeRead(path.join(dynamicRoot, "overrides", "npc-override.md")),
    safeRead(path.join(dynamicRoot, "overrides", "location-delta.md")),
  ]);

  return {
    ...staticContext,
    sessionState,
    log,
    npcOverride,
    locationDelta,
  };
}

export function formatVaultContext(vaultContext) {
  return [
    "Vault mission context:",
    "",
    "## Current Location",
    vaultContext.location || "No location file found for the current scene.",
    "",
    "## Active Crew",
    vaultContext.crew || "No crew file found for the active role.",
    "",
    "## Mission Brief",
    vaultContext.missionBrief || "No mission brief found.",
    "",
    "## Anomaly Lore",
    vaultContext.anomaly || "No anomaly lore found.",
    "",
    "## Session State",
    vaultContext.sessionState || "No session state yet.",
    "",
    "## Session Log",
    vaultContext.log || "No session log yet.",
    "",
    "## NPC Overrides",
    vaultContext.npcOverride || "No active NPC overrides.",
    "",
    "## Location Deltas",
    vaultContext.locationDelta || "No active location deltas.",
  ].join("\n");
}
