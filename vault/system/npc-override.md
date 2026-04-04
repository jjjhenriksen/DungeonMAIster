# NPC Override Convention

Use this file when a single NPC's behavior, condition, or revealed information needs to override the baseline vault seed without rewriting their source profile.

## Format

Repeat this block once per NPC override:

```md
## npc-id
- status: active | resolved
- appliesFromTurn: 3
- summary: Short replacement or additive note
- behavior: How the DM should portray them now
- secretsRevealed: Any secret now considered public or role-visible
```

## Example

```md
## npc-exec
- status: active
- appliesFromTurn: 2
- summary: Rook is openly prioritizing specimen recovery over crew trust.
- behavior: clipped, urgent, intolerant of dissent
- secretsRevealed: Captain knows the corporate order is no longer deniable.
```
