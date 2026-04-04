# DungeonMAIster

DungeonMAIster is a full-stack prototype for "Artemis Lost," a turn-based sci-fi mission simulator where an OpenAI model acts as the dungeon master for a stranded lunar crew.

The app now includes:
- a main menu with save-slot support
- full character creation for a four-role crew
- a launch sequence between setup and mission start
- human or autonomous control per crew role
- mission seed variation
- light/dark theme switching plus theme families
- role-aware tactical suggestions and follow-through previews
- evolving crew coordination and handoff state
- vault-backed prompt context
- structured state-delta updates from the DM

## Stack

- Frontend: React + Vite
- Backend: Express dev server
- Model provider: OpenAI Responses API
- Persistence: slot saves plus vault-backed session mirrors

## Run

Install dependencies:

```bash
npm install
```

Create `.env`:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
DM_API_PORT=8787
```

Start development:

```bash
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Opening `dist/index.html` directly is fine for checking the built UI shell, but interactive DM turns still require the local API server.

## Current Gameplay Flow

1. Choose a save slot from the main menu.
2. Create or load a mission.
3. Configure the crew, including `Human` or `Autonomous` per role.
4. Pick or reroll a mission seed.
5. Launch through the cinematic intro sequence.
6. Submit actions on human turns while autonomous roles auto-play theirs.
7. Use live tactical guidance, role-fit previews, and follow-through indicators to shape the next move.
8. The DM returns narration plus a partial `STATE_DELTA`.
9. The UI merges the update, applies local role and mission mechanics, resolves handoff-driven turn priority, updates the instrumented log, and autosaves.

## Major Systems

- Character creation with reroll, lock, and crew-dynamic inference
- Bank-driven crew generation with authored defaults
- Mission seeds with scenario-specific mission, environment, systems, and opening event logs
- Mission-specific mechanics with per-seed leverage windows
- Autonomous crew roles for underfilled games
- Role-specific tactical guidance and clickable action suggestions
- Role mechanics, handoff windows, delegation strength, and evolving crew coordination
- Instrumented event log with `command`, `system`, `sensor`, `trait`, and `risk` tags
- OpenAI-backed DM turn resolution
- Save slots and vault-backed session mirrors
- Theme system with persistent selection, light/dark variants, and themed launch treatment

## Project Structure

```txt
.
├── docs/
│   ├── ARCHITECTURE.md
│   ├── FEATURES.md
│   ├── GAMEPLAY_LOOP.md
│   ├── INDEX.md
│   └── PROJECT_JOURNAL.md
├── server/
│   ├── api.js
│   ├── dmServer.mjs
│   ├── prompts.js
│   ├── sessionStore.js
│   └── vault.js
├── src/
│   ├── App.jsx
│   ├── ActionInput.jsx
│   ├── CharacterCreation.jsx
│   ├── CrewCard.jsx
│   ├── crewCoordination.js
│   ├── EventLog.jsx
│   ├── LaunchSequence.jsx
│   ├── MainMenu.jsx
│   ├── NarrationPanel.jsx
│   ├── RoleView.jsx
│   ├── ThemePicker.jsx
│   ├── UI.jsx
│   ├── missionMechanics.js
│   ├── botTurns.js
│   ├── characterBanks.js
│   ├── gameLoop.js
│   ├── missionSeeds.js
│   ├── roleGuidance.js
│   ├── roleMechanics.js
│   ├── roleSemantics.js
│   ├── stateUtils.js
│   ├── themes.js
│   └── worldState.js
├── vault/
│   ├── dynamic/
│   └── static/
└── README.md
```

## Docs

- Overview: [docs/INDEX.md](/Users/jacquelinehenriksen/DungeonMAIster/docs/INDEX.md)
- Features: [docs/FEATURES.md](/Users/jacquelinehenriksen/DungeonMAIster/docs/FEATURES.md)
- Architecture: [docs/ARCHITECTURE.md](/Users/jacquelinehenriksen/DungeonMAIster/docs/ARCHITECTURE.md)
- Gameplay loop: [docs/GAMEPLAY_LOOP.md](/Users/jacquelinehenriksen/DungeonMAIster/docs/GAMEPLAY_LOOP.md)
- Project journal: [docs/PROJECT_JOURNAL.md](/Users/jacquelinehenriksen/DungeonMAIster/docs/PROJECT_JOURNAL.md)
