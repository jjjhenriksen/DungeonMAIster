# Architecture

DungeonMAIster is a small full-stack app with a React frontend, a local Express DM server, and a vault-backed session layer.

## High-Level Modules

### App Shell And Navigation

- [src/App.jsx](../src/App.jsx): app entry, screen routing, theme persistence, save-slot hydration
- [src/MainMenu.jsx](../src/MainMenu.jsx): front-door flow for new mission, continue, load, and delete
- [src/CharacterCreation.jsx](../src/CharacterCreation.jsx): crew editing, lock/reroll controls, human-vs-autonomous role assignment, mission-seed preview
- [src/LaunchSequence.jsx](../src/LaunchSequence.jsx): cinematic transition between setup and live mission
- [src/UI.jsx](../src/UI.jsx): in-mission turn orchestration, autosave, autonomous-turn auto-play, and DM integration

### World-State And Scenario Layer

- [src/worldState.js](../src/worldState.js): crew blueprints, mission-session creation, seed resolution, opening narration, and world-state creation
- [src/missionSeeds.js](../src/missionSeeds.js): scenario-seed definitions and mission-seed helpers
- [src/missionMechanics.js](../src/missionMechanics.js): seed-specific leverage windows and local mission effects
- [src/characterBanks.js](../src/characterBanks.js): names, call signs, traits, flaws, specialties, stakes, and tension patterns
- [src/botTurns.js](../src/botTurns.js): autonomous-action generation for underfilled crews
- [src/gameLoop.js](../src/gameLoop.js): turn helpers, MET advancement, conversation helpers, and log-entry creation
- [src/stateUtils.js](../src/stateUtils.js): shared state selectors and numeric clamping helpers

### Presentation Layer

- [src/NarrationPanel.jsx](../src/NarrationPanel.jsx): DM narration plus event-log panel
- [src/EventLog.jsx](../src/EventLog.jsx): instrumented log rendering
- [src/ActionInput.jsx](../src/ActionInput.jsx): human-turn controls and autonomous-turn status
- [src/CrewCard.jsx](../src/CrewCard.jsx): crew cards, status bars, and controller badges
- [src/RosterSummary.jsx](../src/RosterSummary.jsx): crew dossier with trait, flaw, and controller mode
- [src/RoleView.jsx](../src/RoleView.jsx): active-role console and operational context
- [src/CrewStatusBar.jsx](../src/CrewStatusBar.jsx): mission/system header strip
- [src/ThemePicker.jsx](../src/ThemePicker.jsx): shared theme-switching control
- [src/roleFilters.js](../src/roleFilters.js): role-specific view selection and console brief generation
- [src/uiState.js](../src/uiState.js): derived UI-facing state for headers, alerts, and action-panel previews
- [src/styles.css](../src/styles.css): shared tokens, themes, component styles, and ambient background treatment
- [src/themes.js](../src/themes.js): theme registry and storage helpers

### Role And Coordination Systems

- [src/roleSemantics.js](../src/roleSemantics.js): role-alignment keywords and follow-through targeting rules
- [src/roleGuidance.js](../src/roleGuidance.js): tactical focus generation and suggested commands
- [src/crewCoordination.js](../src/crewCoordination.js): delegation profiles, crew-fit scoring, handoff windows, and coordination alerts
- [src/roleMechanics.js](../src/roleMechanics.js): local per-role effects and public role/coordination selectors

### DM Integration Layer

- [src/dmApi.js](../src/dmApi.js): browser request helper for `/api/turn`
- [server/dmServer.mjs](../server/dmServer.mjs): Express API for DM turns and sessions
- [server/api.js](../server/api.js): OpenAI Responses API call path and response extraction
- [server/prompts.js](../server/prompts.js): system and user prompt assembly rules
- [src/deltaParser.js](../src/deltaParser.js): normalizes model output into safe state deltas
- [src/applyStateDelta.js](../src/applyStateDelta.js): merges validated deltas into local state

### Session And Vault Layer

- [src/sessionApi.js](../src/sessionApi.js): load/save/delete/list session helpers
- [server/sessionStore.js](../server/sessionStore.js): slot persistence and vault markdown mirrors
- [server/vault.js](../server/vault.js): static/dynamic vault loading and prompt-context assembly

## Runtime Responsibilities

### Frontend

The frontend owns:
- menu and character-creation flow
- selected theme
- current `worldState`
- active `turn`
- current narration
- local conversation history
- autosave coordination
- autonomous-turn auto-play
- event-log and role-view rendering

### Backend

The backend owns:
- environment validation
- session loading and saving
- vault-context assembly
- OpenAI request execution
- DM response parsing and normalization
- safe `STATE_DELTA` extraction

## World-State Contract

The current `worldState` shape is centered around:

```js
{
  mission: {
    id,
    name,
    phase,
    met,
    objectives,
    seedId,
    seedLabel,
    seedSummary,
    seedTone,
    decisionPressure,
    suggestedOpening,
  },
  environment: {
    location,
    hazards,
    anomaly,
    visibility,
    pressure,
  },
  systems: {
    o2,
    power,
    comms,
    propulsion,
    scrubber,
    thermal,
    nav,
  },
  crew: [
    {
      id,
      name,
      role,
      health,
      morale,
      extra,
      notes,
      character: {
        callSign,
        trait,
        specialty,
        flaw,
        personalStake,
        tensionNote,
        controller,
      },
    },
  ],
  eventLog: [{ ts, msg, type }],
}
```

## Mission Seed Contract

Mission seeds are data-first scenario packets. Each seed includes:

```js
{
  id,
  label,
  summary,
  tone,
  decisionPressure,
  suggestedOpening,
  mission,
  environment,
  systems,
  eventLog,
}
```

Before launch, a seed is resolved against the selected crew so placeholder text like `{engineerShort}` becomes the actual launched roster name.

## Turn And Control Model

- base turn order is round-robin across the four crew seats
- follow-through windows can now override round-robin and jump initiative to the targeted role
- each role can be `human` or `autonomous`
- human seats expose the text action input
- autonomous roles generate a role-aware action automatically and submit it through the same DM path
- the session must contain at least one human-controlled role

## Local Gameplay Systems

The frontend no longer relies only on the DM for progression. It also applies local gameplay layers after DM resolution:

- role mechanics: aligned actions create role-specific numeric benefits
- mission mechanics: certain seeds expose bespoke leverage windows with custom local bonuses
- crew coordination: handoff windows, delegation strength, and trust/friction evolve over time
- derived UI state: action recommendations and warnings are computed from the live world state before submission

## Event Log Model

The event log is now typed and instrumented. Supported types are:
- `command`
- `system`
- `sensor`
- `trait`
- `risk`

These types are normalized in the delta parser and rendered as badges in the UI.

## Save And Vault Model

Persistent state is stored in slot JSON files and mirrored into vault markdown:

- slot JSON keeps the canonical session payload
- `vault/dynamic/session-state.md` keeps a handoff-friendly state snapshot
- `vault/dynamic/log.md` keeps recent conversation history
- `vault/dynamic/slots/` stores multi-slot save files

The prompt layer also loads relevant static lore from `vault/static/`.

## Prompt Contract

The DM prompt now explicitly encodes:
- structured `STATE_DELTA` output
- mission-seed pressure and atmosphere
- crew traits, flaws, stakes, and tension
- role specialization and off-role friction
- active crew coordination and follow-through context
- typed event-log expectations

Trait-driven outcomes are expected to produce `trait` log entries when personality materially affects the turn result.
