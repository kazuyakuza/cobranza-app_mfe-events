# @cobranza-apps/mfe-events — Context

## Current Focus

- TODO 20260817 completed and merged to `main`.
- Source code scaffolded: `src/events.ts`, `src/payloads.ts`, `src/types.ts`, `src/index.ts`, `src/public-api.ts` (from TODO 02).
- Helpers & runtime validation implemented: `src/create-event.ts`, `src/guards.ts`, `src/dispatch.ts`, `src/assert.ts`, `src/validation-error.ts`.
- Internal DTOs created under `src/dtos/` for `class-validator` runtime checks.
- Vitest test suite added (`test/` — 5 spec files, 41 tests passing).
- Version bumped to `0.5.0`.
- `reflect-metadata` consumer documentation completed: README Runtime Setup, USAGE.md dual-path setup, example files, troubleshooting, JSDoc updates, peerDependencies declaration.

## Recent Changes

- 2026-07-31: brief.md authored with full event catalog, payloads, helpers, design principles.
- 2026-07-31: feature branch feat/init-project-info-readme created.
- 2026-07-31: project-info core files (product, context, architecture, tech) created; .initialized marker removed.
- 2026-07-31: README overwritten from base-project template to project-specific.
- 2026-08-01: TODO 03 implemented on `feat/todo-03-helpers-validation` — added `class-validator`, `class-transformer`, `reflect-metadata`, `vitest`; created DTOs, validation error, helpers, tests.
- 2026-08-01: TODO 03 merged into `main` and pushed to `origin`. TODO file renamed to `20260801-todo-0-DONE.md`.
- 2026-08-17: TODO 20260817 implemented on `feat/reflect-metadata-docs` — consumer documentation for `reflect-metadata` loading (README Runtime Setup, USAGE.md dual-path setup, `docs/examples/`, `docs/troubleshooting.md`, JSDoc updates, `peerDependencies` declaration).
- 2026-08-17: TODO 20260817 merged into `main` and pushed to `origin`. TODO file renamed to `20260817-todo-0-DONE.md`. Version `0.5.0`.

## Immediate Next Steps

- Consider secondary package entry points (`@cobranza-apps/mfe-events/events`, `/payloads`, etc.) if consumer demand arises.
- Publishable v1 when any remaining integration tests and final API review are complete.

## Open Questions

> Items marked `[FLAGGED]` in [architecture.md](./architecture.md) and [tech.md](./tech.md) require resolution at implementation time.

- Package manager (align with sibling @cobranza-apps/* TBD) — `[FLAGGED]` in tech.md §3.
- UUID type: string-typed UUID v4 (preferred) vs dedicated UUID brand — `[FLAGGED]` in architecture.md §3.
- Build tool: **plain `tsc`** selected (simplest, no Angular compiler needed) — resolved.
- Test runner: **Vitest** selected — resolved.

## Constraints in Force

- TypeScript 5.x; Node pinned 22.22.3 (.nvmrc).
- Strict typing; no `any` payloads.
- Stable event names; version via package semver + schemaVersion.
- Desktop-only Back-office scope.

<!-- DO NOT DELETE NEXT SECTION -->

## Important Note for AI Agents

All agents working on this project MUST adhere to the workflows and rules outlined in [AI Agent Onboarding document](../../AGENTS.md).

Before starting any task:

1. **Review `AGENTS.md`**: is the primary source of instructions for agents.
2. **Follow Workflows**: follow the procedures defined in `.agent/WORKFLOWS.md`, especially the `.kilo/commands/critical-workflow.md`.

<!-- END DO NOT DELETE -->
