# Architecture

This project is currently a small full-stack prototype with one frontend app and one local DM server.

## High-Level Layout

- [src/App.jsx](/Users/jacquelinehenriksen/DungeonMAIster/src/App.jsx): minimal app entry that renders the main UI
- [src/UI.jsx](/Users/jacquelinehenriksen/DungeonMAIster/src/UI.jsx): primary gameplay surface, world-state seed, role views, narration display, turn handling, and interaction logic
- [src/dmApi.js](/Users/jacquelinehenriksen/DungeonMAIster/src/dmApi.js): browser-side helper for posting turn requests to the local API
- [src/applyStateDelta.js](/Users/jacquelinehenriksen/DungeonMAIster/src/applyStateDelta.js): merges model-generated state changes into the current world state
- [server/dmServer.mjs](/Users/jacquelinehenriksen/DungeonMAIster/server/dmServer.mjs): Express server that validates input, calls Anthropic, and returns structured narration plus state updates

## Runtime Responsibilities

### Frontend

The React app currently owns:
- the initial world state seed
- active-turn selection
- role-filtered view generation
- local action submission flow
- narration display
- event log rendering
- application of returned `stateDelta` objects

This keeps iteration fast for a hackathon-style prototype, but it means several responsibilities are concentrated in one file.

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

- [src/UI.jsx](/Users/jacquelinehenriksen/DungeonMAIster/src/UI.jsx) combines presentational components, seeded data, turn control, and role filtering
- the canonical world state schema is not yet extracted into its own module
- role filters still live alongside rendering logic
- there is no persistence layer for mission sessions, logs, or vault content yet
- model response validation is serviceable but still lightweight

## Recommended Refactor Path

1. Extract `INITIAL_WORLD_STATE` into `src/worldState.js`.
2. Move `getViewForRole()` into `src/roleFilters.js`.
3. Split [src/UI.jsx](/Users/jacquelinehenriksen/DungeonMAIster/src/UI.jsx) into focused components for crew cards, narration, action input, and status bars.
4. Add stronger response validation in [server/dmServer.mjs](/Users/jacquelinehenriksen/DungeonMAIster/server/dmServer.mjs).
5. Introduce session persistence once the game loop stabilizes.
