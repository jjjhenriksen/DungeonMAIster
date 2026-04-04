# Artemis Lost Vault

Canonical Artemis Lost prompt content lives under the `static/` and `dynamic/` folders.

- `static/` holds durable lore and reference markdown that can be read into prompts repeatedly.
- `dynamic/` holds session files that are expected to change between turns.
- `dynamic/overrides/` contains narrow, high-priority override files that can supersede static lore for the current run.

Legacy vault files from earlier prototypes may still exist beside this structure, but new Artemis prompt assembly should prefer the folders listed above.
