# Project Journal

This file is a readable summary of how the repository evolved into its current shape.

## High-Level Timeline

### Foundation

The repository started with initial scaffolding, then quickly moved into documentation and first-pass runtime structure.

Key themes:
- initial repo scaffolding
- first-pass project documentation

### UI Refactor And Structure

The next wave split the interface into focused components and pulled shared logic out of a single large UI file.

Key themes:
- component extraction
- state/filter module extraction
- styling refactor
- deduplication of turn-handling logic

### Session And Menu Systems

The project then grew from a single-screen prototype into a full application flow with saves and front-door navigation.

Key themes:
- session persistence
- vault-backed prompts
- main menu
- character creation
- multi-slot save system
- continue/load/delete flows

### Model Integration

The DM backend was switched from Anthropic to OpenAI, and the prompt/session path was hardened around that integration.

Key themes:
- OpenAI migration
- prompt and server updates
- runtime stability improvements

### Themes And Visual Identity

The UI then gained a full theming layer, renamed themes, and ambient visual polish.

Key themes:
- theme registry and picker
- stronger contrast and unified styling
- atmospheric background treatment

### Instrumentation And Systems Depth

The project shifted from “narrative UI” toward “instrumented mission simulator.”

Key themes:
- typed event log
- mission elapsed time handling
- character banks
- crew dynamics
- mission seeds
- seed templating
- autonomous crew-role support
- launch transition and theme expansion
- role mechanics and crew coordination
- mission-specific mechanics

## Feature Milestones

### Docs And Foundations

- docs folder introduced
- README expanded
- baseline architecture notes added

### Core Refactor

- UI split into smaller components
- world-state helpers extracted
- shared CSS consolidated

### Persistence

- vault-backed session persistence added
- menu and character creation introduced
- multi-slot save/load/delete support added

### Runtime And Prompting

- Anthropic replaced with OpenAI
- narrower vault-context selection added
- event-log typing and prompt expectations strengthened

### Character And Scenario Systems

- bank-driven character generation added
- crew dynamics inferred from generated and authored profiles
- mission seeds introduced
- seeded text resolved against actual launched crew names
- scenario metadata expanded with tone, decision pressure, and suggested opening

### Flexible Participation

- each crew role can be human- or autonomously controlled
- autonomous roles auto-play through the same DM pipeline
- underfilled games are now supported without changing the turn model

### Presentation And Atmosphere

- theme families and light/dark mode added
- launch sequence added between setup and play
- gameplay layout and tactical panel refined

### Mechanical Depth

- role guidance and suggestion chips added
- role mechanics made deterministic and visible
- handoff windows and delegated initiative introduced
- evolving crew trust and friction added
- mission-specific mechanics layered on top of seeded scenarios

## Notes

This journal is intentionally concise now. For exact repository history, use `git log` directly.
