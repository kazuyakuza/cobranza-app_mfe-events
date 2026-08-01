# @cobranza-apps/mfe-events — Tech

## 1. Stack

- Language: TypeScript 5.x (align with Angular 22 ecosystem).
- Module format: ESM + typings (publishable package).
- Runtime: modern browser CustomEvent + window APIs; no Node runtime at consumer side.
- Angular: NOT a dependency (types + thin helpers only).
- Node: pinned 22.22.3 (.nvmrc at repo root).

## 2. Build (decision pending)

- Candidates: tsup | unbuild | plain tsc + api-extractor.
- Requirement: simple, no Angular compiler needed; emit ESM + .d.ts.
- Not yet created (no package.json / tsconfig.json at repo root).
- [FLAGGED] Choice deferred to initial implementation task.

## 3. Package Manager

- Not fixed yet; align with sibling @cobranza-apps/* repos.
- [FLAGGED] TBD at implementation.

## 4. Testing

- Unit tests for helpers: Vitest or Jest (candidate, not chosen).
- Type correctness: tsc --noEmit as type test.
- No browser/E2E tests (pure types + thin pure functions).

## 5. Validation

- class-transform & class-validator when/where required (brief §3). Not auto-applied; only where payload validation needed at runtime; not a v1 requirement unless consumer demands.

## 6. Documentation Pattern

- JSDoc on every public export.
- README.md (project overview).
- docs/USAGE.md (copy-paste examples, both MFE and Shell sides).
- No Storybook.

## 7. Development Setup (current state)

- Repo cloned; brief.md defined.
- src/ empty (only .gitkeep); docs/ exists; .nvmrc pins Node 22.22.3.
- No package.json yet -> npm/pnpm install not yet applicable.
- AI agent workflow via .kilo/ + .agent/ (see AGENTS.md).
- Follow critical-workflow; plans stored in .kilo/plans/.

## 8. Technical Constraints

- Strict typing; no `detail: any`; payloads JSON-serializable only (no functions/DOM/class instances).
- Event names stable; evolve via optional fields + package semver + payload.schemaVersion (throws when omitted on evolving payloads).
- No runtime framework coupling (no Angular services/DI/NgModules).
- Max depth 2, max 2 args per method, private-by-default, self-documenting code (per .kilo/rules).
- Files in src/ <= 200 lines; methods <= 50 lines (project rules).

## 9. Tool Usage Patterns (consumers)

- MFE dispatch: import { MFE_EVENTS, createMfeEvent } -> window.dispatchEvent(createMfeEvent(...)).
- Shell listen: window.addEventListener(MFE_EVENTS.X, e => if (!isMfeEvent(e, X)) return; ...).
- Shell->MFE broadcast + filter: dispatch `shell:*` on window; each MFE filters event.detail.instanceId against its own instanceId.

## 10. Related Packages

- @cobranza-apps/ui: ModuleHeader/ModuleContainer visuals; owns ModuleStatus union (keep in sync, do not import).
- @cobranza-apps/entities: domain models; not imported by this lib.

<!-- DO NOT DELETE NEXT SECTION -->

## Important Note for AI Agents

All agents working on this project MUST adhere to the workflows and rules outlined in [AI Agent Onboarding document](../../AGENTS.md).

Before starting any task:

1. **Review `AGENTS.md`**: is the primary source of instructions for agents.
2. **Follow Workflows**: follow the procedures defined in `.agent/WORKFLOWS.md`, especially the `.kilo/commands/critical-workflow.md`.

<!-- END DO NOT DELETE -->
