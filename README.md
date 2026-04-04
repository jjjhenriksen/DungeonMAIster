# DungeonMAIster

DungeonMAIster is a lightweight prototype for "Artemis Lost," a turn-based sci-fi roleplaying experience where a language model acts as the dungeon master for a stranded lunar mission.

The current app is a React + Vite frontend with a small Express development server that proxies requests to Anthropic. A player submits an action, the DM responds with narration plus a structured state delta, and the UI applies those changes to the shared mission state.

## Current Stack

- Frontend: React + Vite
- Backend: Express dev server
- Model provider: Anthropic API
- State model: in-memory world state with delta-based updates

## Project Structure

```txt
.
├── docs/
│   ├── ARCHITECTURE.md
│   ├── GAMEPLAY_LOOP.md
│   ├── INDEX.md
│   └── team/
├── server/
│   └── dmServer.mjs
├── src/
│   ├── App.jsx
│   ├── UI.jsx
│   ├── applyStateDelta.js
│   └── dmApi.js
├── index.html
├── package.json
└── vite.config.js
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your Anthropic credentials:

```bash
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-sonnet-4-20250514
DM_API_PORT=8787
```

3. Start the app:

```bash
npm run dev
```

This should start the Vite app and the local DM server used by the frontend.

## How It Works

1. The frontend renders a seeded mission state and a role-based UI.
2. A player enters an action for the active crew member.
3. The frontend posts the current world state, action, and active crew member to `/api/turn`.
4. The Express server calls Anthropic with a structured system prompt.
5. The model returns JSON containing:
   - `narration`
   - `stateDelta`
6. The frontend merges `stateDelta` into the current world state and advances the turn.

## Documentation

- Overview and navigation: [docs/INDEX.md](/Users/jacquelinehenriksen/DungeonMAIster/docs/INDEX.md)
- Architecture notes: [docs/ARCHITECTURE.md](/Users/jacquelinehenriksen/DungeonMAIster/docs/ARCHITECTURE.md)
- Turn loop and data flow: [docs/GAMEPLAY_LOOP.md](/Users/jacquelinehenriksen/DungeonMAIster/docs/GAMEPLAY_LOOP.md)
- Team planning docs: [docs/team/TEAM_RESPONSIBILITIES.md](/Users/jacquelinehenriksen/DungeonMAIster/docs/team/TEAM_RESPONSIBILITIES.md)

## Current Status

The prototype already includes:
- a seeded mission world state
- role-specific UI panels
- DM narration rendering
- event log updates
- state-delta application
- Anthropic-backed turn requests through a local server

The next natural improvements are:
- splitting the large UI file into focused components
- moving world state and role filters into dedicated modules
- adding persistence for session state and logs
- hardening the model response validation path

## Notes

The current implementation keeps most gameplay logic in [src/UI.jsx](/Users/jacquelinehenriksen/DungeonMAIster/src/UI.jsx), which makes iteration fast but leaves room for cleanup as the prototype grows.
