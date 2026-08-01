# @cobranza-apps/mfe-events — Context

## Current Focus

- Project initialization. brief.md fully defined; core project-info files being created (product.md, context.md, architecture.md, tech.md).
- No source code yet; src/ empty (only .gitkeep).
- No package.json / tsconfig.json yet.

## Recent Changes

- 2026-07-31: brief.md authored with full event catalog, payloads, helpers, design principles.
- 2026-07-31: feature branch feat/init-project-info-readme created.
- 2026-07-31: project-info core files (product, context, architecture, tech) created; .initialized marker removed.
- 2026-07-31: README overwritten from base-project template to project-specific (separate but parallel task).

## Immediate Next Steps

- Create package.json (name @cobranza-apps/mfe-events, ESM module, TypeScript, peer deps none).
- Choose build tool among tsup / unbuild / plain tsc + api-extractor.
- Choose test runner (Vitest or Jest) for helper unit tests.
- Create tsconfig.json (strict, target ES2022+ aligned with Angular 22 / TS 5.x).
- Scaffold src/ per brief §4: events.ts, payloads.ts, types.ts, helpers.ts, index.ts, public-api.ts (decide single vs subpath entry).
- Author docs/USAGE.md (brief §8 examples).
- Publishable v1.

## Open Questions

- Package manager (align with sibling @cobranza-apps/* TBD).
- UUID type: string-typed UUID v4 (preferred) vs dedicated UUID brand.
- Build tool final selection.

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
