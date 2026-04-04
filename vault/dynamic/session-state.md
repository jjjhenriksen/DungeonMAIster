# Session State

## Purpose
This file is the persisted markdown mirror of the canonical `worldState` object for the active Artemis Lost run.

## Update Rules
- Rewrite sections atomically after a validated turn.
- Treat the in-memory `worldState` object as the source of truth if markdown and runtime diverge.
- Keep list ordering stable so diffs stay readable.

## Mission
- id: ARTEMIS-07
- name: Lost Signal
- phase: Crater approach - active
- met: T+14:22:07
- objectives:
  - Trace the dormant Apollo-band signal source.
  - Keep the rover crew alive until a stable comms link is restored.
  - Recover enough anomaly data to justify a return window.

## Environment
- location: Shackleton Crater Rim
- hazards:
  - Signal interference
  - Knife-edge crater terrain
  - Shadowed ice vents
- anomaly: Apollo-band signal with repeating geometric carrier modulation

## Systems
- o2: 71
- power: 82
- comms: 35
- propulsion: 64
- scrubber: patched
- thermal: 76
- nav: 58

## Crew
- vasquez | Commander Alma Vasquez | Commander | health 92 | morale 78 | Authority 88
- okafor | Chief Engineer Tunde Okafor | Flight Engineer | health 86 | morale 73 | O2 Sys 71
- reyes | Dr. Imani Reyes | Science Officer | health 95 | morale 81 | Scan Rng 62
- park | Lt. Hana Park | Mission Specialist | health 79 | morale 69 | EVA Suit 34

## Event Log
- T+14:22 | alert | Anomaly signal detected from Shackleton Crater interior.
- T+14:19 | info | Telemetry confirms the signal is repeating in deliberate geometric bursts.
- T+14:18 | warn | Long-range comms degraded after the rover crossed the rim shadow line.
