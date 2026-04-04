# Session State Schema

This file is the dynamic turn-by-turn handoff for the prompt assembler. It should be rewritten each turn in a consistent, human-readable format.

## Required sections

### Meta

- `turn`
- `phase`
- `lastUpdatedIso`

### Snapshot

- `currentLocationId`
- `dangerLevel`
- `activeObjectives`
- `openClocks`

### Crew Status

One bullet per player or NPC requiring attention:

- `name | location | vitals/condition | short note`

### Systems

One bullet per system:

- `system | status | integrity | outstanding alerts`

### New Events

Append only for the current turn:

- `timestamp | visibility | type | summary`

### GM Notes

Freeform short notes for prompt assembly:

- tone shifts
- revealed secrets
- unresolved threats
