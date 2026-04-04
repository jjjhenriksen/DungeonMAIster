# Location Delta Convention

Use this file to record temporary or evolving changes to locations without mutating the original static location markdown.

## Format

Repeat this block once per location change:

```md
## location-id
- status: active | resolved
- appliesFromTurn: 4
- visibleTo: all | captain,chief_engineer
- change: What is different right now
- consequence: Why it matters for scene framing or available actions
```

## Example

```md
## engine-bay
- status: active
- appliesFromTurn: 1
- visibleTo: chief_engineer,captain
- change: Coolant fog now obscures the outer catwalk and halves visibility.
- consequence: Repairs take longer and failed checks risk a fall into the maintenance trench.
```
