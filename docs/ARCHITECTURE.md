# Architecture

This project is currently a small full-stack prototype with one frontend app and one local DM server.

## High-Level Layout

- [src/App.jsx](/Users/jacquelinehenriksen/DungeonMAIster/src/App.jsx): minimal app entry that renders the main UI
- [src/UI.jsx](/Users/jacquelinehenriksen/DungeonMAIster/src/UI.jsx): primary gameplay container and turn orchestration
- [src/worldState.js](/Users/jacquelinehenriksen/DungeonMAIster/src/worldState.js): seeded mission state and opening narration
- [src/roleFilters.js](/Users/jacquelinehenriksen/DungeonMAIster/src/roleFilters.js): role-specific dashboard data selection
- [src/NarrationPanel.jsx](/Users/jacquelinehenriksen/DungeonMAIster/src/NarrationPanel.jsx): DM narration display and event-log shell
- [src/EventLog.jsx](/Users/jacquelinehenriksen/DungeonMAIster/src/EventLog.jsx): recent mission history display
- [src/CrewCard.jsx](/Users/jacquelinehenriksen/DungeonMAIster/src/CrewCard.jsx): crew summary cards and stat bars
- [src/RoleView.jsx](/Users/jacquelinehenriksen/DungeonMAIster/src/RoleView.jsx): active role telemetry panel
- [src/ActionInput.jsx](/Users/jacquelinehenriksen/DungeonMAIster/src/ActionInput.jsx): player input form and waiting-state handling
- [src/TurnIndicator.jsx](/Users/jacquelinehenriksen/DungeonMAIster/src/TurnIndicator.jsx): active-turn status line
- [src/CrewStatusBar.jsx](/Users/jacquelinehenriksen/DungeonMAIster/src/CrewStatusBar.jsx): mission header metrics
- [src/useTypewriter.js](/Users/jacquelinehenriksen/DungeonMAIster/src/useTypewriter.js): narration typing effect hook
- [src/dmApi.js](/Users/jacquelinehenriksen/DungeonMAIster/src/dmApi.js): browser-side helper for posting turn requests to the local API
- [src/applyStateDelta.js](/Users/jacquelinehenriksen/DungeonMAIster/src/applyStateDelta.js): merges model-generated state changes into the current world state
- [server/dmServer.mjs](/Users/jacquelinehenriksen/DungeonMAIster/server/dmServer.mjs): Express server that validates input, calls Anthropic, and returns structured narration plus state updates

## Runtime Responsibilities

### Frontend

The React app currently owns:
- the current world state in memory
- active-turn selection
- composition of presentational gameplay components
- local action submission flow
- application of returned `stateDelta` objects

The refactor now separates seeded data, role filtering, and major UI surfaces into their own modules, while keeping the game loop orchestration in one place.

### Backend

The local Express server currently owns:
- reading environment variables
- constructing the Anthropic system prompt
- sending the current world state and player action to the model
- extracting JSON from the model response
- returning normalized `narration` and `stateDelta` data to the UI

## Current World State Contract

The app centers around a shared `worldState` object with these top-level areas:

```js
{
  mission:     { id, name, phase, met, objectives },
  environment: { location, hazards, anomaly },
  systems:     { o2, power, comms, propulsion, scrubber },
  crew:        [{ id, name, role, health, morale, extra }],
  eventLog:    [{ ts, msg, type }],
}
```

## State Update Model

The backend asks the model to return JSON in this shape:

```json
{
  "narration": "string",
  "stateDelta": {}
}
```

`stateDelta` is partial. Only changed fields should be returned. The frontend then merges those changes into the previous state using [src/applyStateDelta.js](/Users/jacquelinehenriksen/DungeonMAIster/src/applyStateDelta.js).

Merge behavior today:
- `mission`, `environment`, and `systems` are shallow-merged
- `crew` entries are matched and patched by `id`
- `eventLog` entries are prepended and capped to 12 items

## Known Structural Gaps

- there is no persistence layer for mission sessions, logs, or vault content yet
- model response validation is serviceable but still lightweight
- most styling is still inline, which is fine for a prototype but will get harder to maintain

## Recommended Refactor Path

1. Move shared styling tokens into CSS modules, a theme file, or a design-system layer.
2. Add stronger response validation in [server/dmServer.mjs](/Users/jacquelinehenriksen/DungeonMAIster/server/dmServer.mjs).
3. Introduce session persistence once the game loop stabilizes.
4. Separate domain logic such as turn progression and event-log capping into dedicated helpers if gameplay rules grow.
