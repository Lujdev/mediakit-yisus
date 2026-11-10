# Brand videos

Adapt Susan's brand-video interaction to Jesus's media kit.

## Specs

- S1: "añadir los videos a las marcas en movimiento."
- S2: "Si avancemos"

## Tasks

- [x] T1 (S1-S2, inline): Design compatible association and persistence checks; commit: pending.
- [x] T2 (S1-S2, inline): Implement video association and marquee interaction; commit: pending.
- [x] T3 (S1-S2, browser verification): Verify functionality and existing data preservation; commit: pending.

## Log

- L1: "1. Quiero que leas el repo de mediakit de Susan usando mi gh Luijdev
2. Despues de eso vamos a implementar las mejoras en las marcas para agregarlas al mediakit de jesus que es añadir los videos a las marcas en movimiento."
- L2: "Si avancemos"
- L3: Existing video replacement API needs to preserve associations for old clients. Focused tests observed RED before implementation and pass against the current partial change.
- L4: Added UI and migration; five isolated API/data tests pass. Typecheck, lint, and build passed (lint: one pre-existing warning in scripts/init-db.ts). No browser check performed. Independent verifier was not admitted; no retry. Implementation remains uncommitted and unverified for delivery.
- L5: Browser verification: marquee counters and hint render only for brands with videos; hover tooltip previews up to three videos and pauses the track; dialog opens on click and closes with the close button, Escape and backdrop click, restoring focus. Mobile 390x844 scrolls to the last card. Admin select preselects and persists the association; deleting a brand nulls its videos. Default state with no videos leaves the marquee unchanged. Migration re-run on a copy of local.db preserved existing rows and failed only with "duplicate column name".
