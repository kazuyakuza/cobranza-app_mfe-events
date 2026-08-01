# Plan: Initialize Project Info (Task 1 — 4.1b)

**TODO File:** `.agent/todos/20260631/20260631-todo-0.md`
**Global Plan:** `.kilo/plans/20260731-init-project-info-and-readme.md`
**Task:** initialize project info
**Branch:** `feat/init-project-info-readme`
**Date:** 2026-07-31

## 1. Purpose

Create the four remaining core project-info files (`product.md`, `context.md`, `architecture.md`, `tech.md`) and remove the `.agent/project-info/.initialized` marker per the workflow defined in `.agent/project-info/instructions.md` (section "Project Info Initialization").

All content must be derived strictly from verifiable sources:

- `.agent/project-info/brief.md` (primary source of truth)
- `.agent/project-info/instructions.md` (defines file responsibilities)
- `.agent/project-structure.md` (current `src/` state)
- Repo state observed: root has `.nvmrc` (Node `22.22.3`), no `package.json` at root, no `tsconfig.json`, `src/` contains only `.gitkeep`, `docs/` exists.
- `README.md` (currently the generic base-project template).

## 2. Source Verification (already performed)

| Fact | Source | Note |
| ---- | ------ | ---- |
| Package name: `@cobranza-apps/mfe-events` | `brief.md` §3 | Exact |
| Repo model: standalone lib (not monorepo) | `brief.md` header | |
| Language: TypeScript; aligns with Angular 22 ecosystem | `brief.md` §3 | |
| Angular is NOT a dependency | `brief.md` §3 | |
| Module format: ESM + typings | `brief.md` §3 | |
| Build: `tsup` / `unbuild` / `tsc` + `api-extractor` | `brief.md` §3 | Not yet chosen/created |
| Package manager: not yet fixed | `brief.md` §3 | Keep consistent with sibling `@cobranza-apps/*` |
| Testing: Vitest or Jest (unit) for helpers; types checked via `tsc --noEmit` | `brief.md` §3 | |
| `ModuleStatus` stays in sync with `@cobranza-apps/ui` | `brief.md` §6.1, §9 | |
| Event catalog (MFE→Shell, Shell→MFE) | `brief.md` §5 | |
| Payloads and EventMaps | `brief.md` §6 | |
| Helpers (`createMfeEvent`, `createShellEvent`, `isMfeEvent`, `isShellEvent`, optional dispatchers) | `brief.md` §7 | |
| Usage patterns | `brief.md` §8 | |
| Relationship to `@cobranza-apps/ui`, `@cobranza-apps/entities`, Shell, MFEs | `brief.md` §9 | |
| `.agent/project-info/.initialized` exists | Observed dir listing | Must be removed |
| No `package.json`, no `tsconfig.json` at root | Observed | Project is pre-implementation |
| `src/` empty (only `.gitkeep`) | Observed + `project-structure.md` | |
| `docs/` exists | Observed + `project-structure.md` | |
| Node version pinned: `22.22.3` | `.nvmrc` | |

## 3. High-Level Approach

The four files together form a coherent, non-redundant picture of the project. They must not duplicate `brief.md`; instead they operationalize it. Each file owns a distinct perspective:

- `product.md` → the *why* and *for whom* (UX problem, users, success criteria). No code.
- `context.md` → the *now* (current focus, recent changes, immediate next steps). Living log.
- `architecture.md` → the *how* (target system shape, communication model, paths, design patterns, critical paths).
- `tech.md` → the *with what* (stack, constraints, dev setup, tooling patterns).

The `.initialized` marker is removed last to signal completion.

The implementer will be instructed to:

1. Create the 4 files exactly as specified.
2. Delete `.agent/project-info/.initialized`.
3. Commit in the feature branch with a meaningful message.

## 4. Ambiguities / Decisions

### 4.1 Identified ambiguities

1. **Build tool not yet chosen** (`tsup` vs `unbuild` vs plain `tsc`). Decision: `tech.md` records all three as candidates, stating the choice is deferred to implementation (Task beyond current TODO). Do NOT pick one now.
2. **Package manager not fixed.** Decision: `tech.md` states "to be aligned with sibling `@cobranza-apps/*` repos; not yet pinned." Do NOT invent one.
3. **`UUID` type in `ModuleIdentity`** — brief says "or string type, but generates an UUID". Decision: `architecture.md` notes the agreed contract is a UUID v4 string (string-typed), to be finalized at implementation time. Flagged, not decided.
4. **Public entry strategy (single vs subpath exports).** Brief allows either; secondary entries optional. Decision: `architecture.md` records "single public entry for v1; secondary entries reserved for later if complexity warrants." This matches brief §4 preference for v1 simplicity.
5. **No `package.json` yet** → version/constraints sections in `tech.md` will reflect "to be created during initial implementation", referencing the brief's stack table.

### 4.2 Non-decisions (explicitly out of scope for this plan)

- Choosing the build tool.
- Choosing the test runner.
- Creating `package.json` / `tsconfig.json`.
- Writing any `src/` code.
Those belong to future implementation tasks, not project-info initialization.

## 5. File Contents (detailed outlines)

> All files use Markdown, real newlines (per `.kilo/rules/newline-prevention.md`), and end with the standard "Important Note for AI Agents" footer linking to `AGENTS.md` (consistent with `brief.md`).

### 5.1 `.agent/project-info/product.md`

**Purpose:** Core user experience, problem definition, product goals — derived from `brief.md` §1–§2 and §9. No code.

**Structure:**

```
# @cobranza-apps/mfe-events — Product

## 1. Product Summary
- One-paragraph statement: a typed contract library bridging Shell <-> MFEs.

## 2. Users & Consumers
- Primary: Company Back-office Shell (sole listener of mfe:*).
- Secondary: all Company Micro-frontends (dispatch mfe:*, listen shell:*).
- Indirect: human developers and AI agents maintaining Shell/MFEs (consume JSDoc + USAGE.md).
- NOT for: Client Portal end users, mobile/responsive contexts, inter-MFE direct comms.

## 3. Problem Definition
- Untyped CustomEvent payloads cause runtime errors and silent drift between Shell and MFEs.
- No single source of truth for event names and payload shapes.
- Cross-team contract changes break silently.
- Multi-instance scenarios (same remote mounted N times) lack identity discipline.

## 4. Product Goals
- Type-safe event contracts: every event has a payload type; no `detail: any`.
- Stable, prefixed, kebab-case event names (mfe:* / shell:*); evolve via new optional fields + package semver, never by renaming.
- JSON-serializable-only payloads (no functions, DOM nodes, class instances).
- Multi-instance aware (moduleType + instanceId on almost every payload).
- Shell-is-listener rule enforced by design (MFEs do not listen to mfe:* of siblings).
- AI-agent friendly docs (JSDoc on every export; copy-paste USAGE examples).

## 5. Non-Goals (v1)
- No business/domain logic, no domain-specific events.
- No Angular runtime, components, services, DI.
- No event bus abstraction, RxJS, or NgModules.
- No auth/token distribution, no WORKSPACE_CONTEXT broadcast.
- No mobile/responsive concerns.
- No inter-MFE direct communication.

## 6. Success Criteria
- All consumers can import events/payloads/types/helpers from a single entry.
- Type-checking fails at compile time on wrong payload shapes.
- ModuleStatus values stay identical to @cobranza-apps/ui cba-module-header.
- USAGE.md covers both dispatch (MFE) and listen (Shell) sides with copy-paste examples.

## 7. Relationships (product view)
- @cobranza-apps/ui: owns visuals/ModuleHeader; mfe-events owns contracts only.
- @cobranza-apps/entities: domain models; not imported here.
- Shell: host of workbench, fullscreen URL, notifications, sole mfe:* listener.
- MFEs: dispatch mfe:*, filter shell:* by instanceId.

<!-- Important Note for AI Agents block -->
```

### 5.2 `.agent/project-info/context.md`

**Purpose:** Factual living log — current focus, recent changes, immediate next steps. Captures the present moment (project just initialized).

**Structure:**

```
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

<!-- Important Note for AI Agents block -->
```

### 5.3 `.agent/project-info/architecture.md`

**Purpose:** System architecture, paths, design patterns, critical paths — derived from `brief.md` §1, §4–§9. This describes the *target* architecture (project not yet implemented).

**Structure:**

```
# @cobranza-apps/mfe-events — Architecture

## 1. System Position
- Standalone publishable TS library; not a monorepo package.
- Sits between Shell and MFEs as the communication contract layer.
- No runtime framework dependency (Angular NOT a peer dep).
- Consumed by Shell + all MFEs via import.

## 2. Communication Model
- Mechanism: browser CustomEvent + window.dispatchEvent/addEventListener.
- Direction:
  - MFE -> Shell: mfe:* events; ONLY Shell listens.
  - Shell -> MFE: shell:* events; broadcast on window, each MFE filters by instanceId (+ usually moduleType).
- No inter-MFE direct comms (forbidden; go through Shell or BFF).
- No event bus class, no RxJS, no Angular services in this lib.

## 3. Identity & Multi-Instance
- ModuleIdentity = { moduleType: string; instanceId: UUID }.
- moduleType = remote kind ('clients','debts','dashboard',...).
- instanceId = unique per instance, generated by Shell on add.
- Almost every payload embeds ModuleIdentity.
- Decision (v1): instanceId typed as string (UUID v4); dedicated brand deferred. [FLAGGED, finalize at impl]

## 4. Naming & Evolution
- Prefixes mfe: / shell:; kebab-case after prefix; no domain segment; no version suffix in name.
- Versioning: payload.schemaVersion (number, required/throws when omitted on evolving payloads) + package semver. Names never change for a given meaning.
- Prefer many focused events over overloaded ones.

## 5. Library Layout (target, per brief §4)
- src/events.ts — MFE_EVENTS, SHELL_EVENTS constants
- src/payloads.ts — all payload interfaces
- src/types.ts — ModuleStatus, ModuleSize, ModuleIdentity, EventMaps
- src/helpers.ts — createMfeEvent, createShellEvent, isMfeEvent, isShellEvent, optional dispatchers
- src/index.ts — internal barrel re-exports
- src/public-api.ts — single public entry (v1)
- docs/USAGE.md — usage examples (MFE + Shell sides)
- docs/ exists in repo; src/ currently only .gitkeep.

## 6. Public Surface (v1)
- Primary: @cobranza-apps/mfe-events (single entry, re-exports all).
- Reserved secondary (not v1 unless complexity warrants): /events, /payloads, /types, /helpers.
- Decision: single public entry for v1 (brief §4 preference).

## 7. Event Catalog (summary, see brief §5)
- MFE->Shell: REQUEST_ADD_MODULE, REQUEST_FULLSCREEN, REQUEST_REMOVE, UPDATE_HEADER, SHOW_NOTIFICATION, MODULE_READY, MODULE_ERROR.
- Shell->MFE: MODULE_STATE, THEME_CHANGED, VISIBILITY_CHANGED.
- Deferred (not v1): WORKSPACE_CONTEXT, auth/session/token, domain-specific, notification actions.

## 8. Payloads & Maps (summary)
- Payloads: pure JSON-serializable; many embed ModuleIdentity; evolving ones carry schemaVersion.
- MfeEventMap / ShellEventMap bind event name -> payload type for type-safe dispatch/listen.
- Full definitions in brief.md §6.

## 9. Helpers (summary)
- Thin pure functions over CustomEvent; no runtime framework.
- createMfeEvent/createShellEvent, isMfeEvent/isShellEvent, optional dispatchMfeEvent/dispatchShellEvent.
- No event-bus class, no RxJS, no Angular services.

## 10. Design Patterns
- Contract-first typing (EventMap keyed by constant).
- Narrowing type guards for safe event handling.
- Broadcast + filter pattern for Shell->MFE.
- Identity-carrying payloads (moduleType + instanceId).
- Stable name + schema version evolution (no rename).

## 11. Critical Paths / Risks
- ModuleStatus drift vs @cobranza-apps/ui cba-module-header -> keep unions identical.
- Renaming an event name breaks all consumers -> forbidden; evolve via semver.
- Adding required payload fields without schemaVersion breaks consumers -> schemaVersion mandatory on evolving payloads.
- MFEs listening to mfe:* of siblings -> forbidden by design/convention.

## 12. Dependencies & Boundaries
- Does NOT import @cobranza-apps/entities (payloads stay generic string/Record).
- Does NOT depend on @cobranza-apps/ui (keeps ModuleStatus union in sync only).
- No Angular runtime peer dependency.

<!-- Important Note for AI Agents block -->
```

### 5.4 `.agent/project-info/tech.md`

**Purpose:** Stack, dev setup, technical constraints, tool usage patterns — derived from `brief.md` §3 + observed repo state. Records that tooling is not yet created.

**Structure:**

```
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
- Shell->MFE broadcast + filter: dispatch shell:* on window; each MFE filters event.detail.instanceId against its own instanceId.

## 10. Related Packages
- @cobranza-apps/ui: ModuleHeader/ModuleContainer visuals; owns ModuleStatus union (keep in sync, do not import).
- @cobranza-apps/entities: domain models; not imported by this lib.

<!-- Important Note for AI Agents block -->
```

## 6. Standard Footer (all four files)

Each file ends with the same AI-agent block used in `brief.md` to keep onboarding consistent:

```
<!-- DO NOT DELETE NEXT SECTION -->

## Important Note for AI Agents

All agents working on this project MUST adhere to the workflows and rules outlined in [AI Agent Onboarding document](../../AGENTS.md).

Before starting any task:

1. **Review `AGENTS.md`**: is the primary source of instructions for agents.
2. **Follow Workflows**: follow the procedures defined in `.agent/WORKFLOWS.md`, especially the `.kilo/commands/critical-workflow.md`.

<!-- END DO NOT DELETE -->
```

The `../../AGENTS.md` relative link is correct: each file lives at `.agent/project-info/<file>.md`, so `../../AGENTS.md` resolves to repo root `AGENTS.md` (same as `brief.md` uses).

## 7. Atomic, Verifiable Steps (for implementer — step 4.2)

> Implementer executes ONLY these steps. No code files, no other tasks.

### Step 1 — Create `.agent/project-info/product.md`

- Use `vscode-mcp-server_create_file_code` (or `write`) with `overwrite=false`, `ignoreIfExists=true`.
- Content: outline in §5.1 of this plan, with the standard footer (§6).
- Verify: file exists at path; links resolve.

### Step 2 — Create `.agent/project-info/context.md`

- Same tool, `overwrite=false`, `ignoreIfExists=true`.
- Content: outline in §5.2 + footer §6.
- Verify: file exists.

### Step 3 — Create `.agent/project-info/architecture.md`

- Same tool.
- Content: outline in §5.3 + footer §6.
- Verify: file exists.

### Step 4 — Create `.agent/project-info/tech.md`

- Same tool.
- Content: outline in §5.4 + footer §6.
- Verify: file exists.

### Step 5 — Remove `.agent/project-info/.initialized`

- Run: `git rm .agent/project-info/.initialized` (it is tracked). If untracked, fall back to `Remove-Item -LiteralPath ".agent/project-info/.initialized"`.
- Verify: directory listing of `.agent/project-info/` shows only `brief.md`, `instructions.md`, `product.md`, `context.md`, `architecture.md`, `tech.md`.

### Step 6 — Verify gitignore compliance

- Read `.gitignore`; run `git status`; ensure no `.gitignore`-matching files staged (per `.kilo/rules/gitignore-compliance.md`).

### Step 7 — Stage and commit

- Stage the 4 new files + the removal of `.initialized`.
- Commit message (single line, meaningful): `docs(project-info): add product/context/architecture/tech files and remove .initialized marker`.
- Verify: `git status` clean; `git log -1` shows the commit.

## 8. Acceptance Criteria

- [ ] `.agent/project-info/product.md` exists with content per §5.1.
- [ ] `.agent/project-info/context.md` exists with content per §5.2.
- [ ] `.agent/project-info/architecture.md` exists with content per §5.3.
- [ ] `.agent/project-info/tech.md` exists with content per §5.4.
- [ ] All four files contain real newlines (no literal `\n`).
- [ ] All four files include the standard "Important Note for AI Agents" footer with working relative link to `../../AGENTS.md`.
- [ ] `.agent/project-info/.initialized` removed (verified by directory listing).
- [ ] Content consistent with `brief.md` (no contradictions, no invented facts beyond documented decisions/flags).
- [ ] Build-round/pending decisions explicitly flagged (build tool, package manager, UUID type) rather than silently chosen.
- [ ] Changes committed on `feat/init-project-info-readme` with the specified message.
- [ ] No `src/` code created (out of scope).

## 9. Out of Scope (explicit)

- README update (Task 2 of global plan).
- Creating `package.json`, `tsconfig.json`, or any `src/` code.
- Choosing build tool / test runner / package manager.
- Modifying `brief.md` or `instructions.md`.

## 10. Notes for Downstream Steps

- Step 4.3 (code review) should check the four files against `brief.md` for factual consistency and against `instructions.md` for role coverage.
- Step 4.4 (docs) may add cross-links between the four files and AGENTS.md if needed.
- Step 4.5b (adherence) verifies all acceptance criteria in §8.
- Step 4.6 marks Task 1 done in the TODO file (append `[DONE]` to "initialize project info" line).

## Simplification Findings

The four project-info files are already concise and well-structured. They follow the intended per-file perspective and avoid heavy duplication. Only minor streamlining opportunities were found.

### 1. `architecture.md` — minor redundancy

- **Section 2 (Communication Model)** and **Section 9 (Helpers)** both state "No event bus class, no RxJS, no Angular services in this lib." Keep the statement in one place only; Section 2 (direction rules) is the better owner.
- **Section 1 (System Position)** already says "No runtime framework dependency" and "Consumed by Shell + all MFEs via import." **Section 12 (Dependencies & Boundaries)** repeats the "no Angular peer dependency" and relationship notes that are already covered in `product.md` §7. Remove the overlap or move boundary statements into Section 1.
- **Section 9 (Helpers)** and **Section 10 (Design Patterns)** both describe the same helper functions. Consider folding Section 9 into Section 10 as a concrete pattern, so the file has one fewer section without losing information.

### 2. `tech.md` — minor duplication

- **Section 1 (Stack)** and **Section 7 (Development Setup)** both mention `Node 22.22.3` and the empty repo state. Keep the Node version in Section 1; Section 7 can focus on workflow/tooling specifics (`src/ empty`, `docs/ exists`, `.kilo/`).
- **Section 8 (Technical Constraints)** repeats the "no Angular services/DI/NgModules" boundary. This is already stated in `architecture.md` and `product.md`; one line in Section 8 is enough.

### 3. Wording tightening (all files)

- Replace "aligns with Angular 22 ecosystem" with "Angular 22 ecosystem" in `tech.md` §1 and `context.md` §Constraints; the word "aligns" is unnecessary when the rest of the sentence already states the alignment.
- In `product.md` §5, "No business/domain logic, no domain-specific events" can be tightened to "No business logic or domain-specific events" without losing meaning.
- In `architecture.md` §4, "Names never change for a given meaning" can be tightened to "Names never change once published".

### 4. What was NOT simplified

- The "Important Note for AI Agents" footer is intentionally duplicated across all four files per the plan (to keep onboarding consistent). It should remain.
- The `[FLAGGED]` markers for deferred decisions (build tool, package manager, UUID type) are intentional and should remain.
- Event catalogs and cross-file references (e.g., "see brief §5") are deliberate; they avoid duplicating payload details from `brief.md`.

### 5. Overall recommendation

No structural changes are required. The files are fit for purpose. If the implementer wants to act, the highest-value minor edits are:

1. Remove the duplicate "No event bus class, no RxJS, no Angular services" sentence in `architecture.md` §9.
2. Merge `architecture.md` §9 into §10.
3. De-duplicate the Node-version and repo-state notes between `tech.md` §1 and §7.
4. Apply the three wording tightening edits listed above.

These are optional polish items, not blockers.

## Code Review Findings

### Scope

Reviewed the four files created in Step 4.2:

- `.agent/project-info/product.md`
- `.agent/project-info/context.md`
- `.agent/project-info/architecture.md`
- `.agent/project-info/tech.md`

Sources used for verification:

- `.kilo/plans/20260731-init-project-info.md` (per-task plan)
- `.agent/project-info/brief.md`
- `.agent/project-info/instructions.md`
- Directory listing of `.agent/project-info/`

### Findings

**No blockers or factual errors found.**

| Check | Result | Notes |
| --- | --- | --- |
| Required sections present | OK | All sections outlined in the plan (§5.1–§5.4) are present in each file. |
| Factual accuracy vs `brief.md` | OK | Event catalog, payload rules, event prefixes, helper names, public-surface strategy, and boundaries all match `brief.md`. |
| Cross-file consistency | OK | Build-tool candidates, package-manager flag, UUID type decision, and footer are consistent across all four files. |
| Formatting | OK | Markdown headers, bullet lists, and code spans are well-formed. Files use real newlines (no literal `\n`). |
| Standard footer | OK | All four files contain the "Important Note for AI Agents" footer with the correct relative link `../../AGENTS.md`, matching the plan §6 and `brief.md`. |
| Links | OK | `../../AGENTS.md` resolves to the repository root `AGENTS.md` from `.agent/project-info/<file>.md`. |
| `.initialized` marker removal | OK | Directory listing shows `.agent/project-info/` contains only `brief.md`, `instructions.md`, `product.md`, `context.md`, `architecture.md`, `tech.md`; no `.initialized` file remains. |
| Role coverage per `instructions.md` | OK | `product.md` covers UX/goals, `context.md` covers current focus/next steps, `architecture.md` covers system shape/communication, and `tech.md` covers stack/constraints/tooling — matching the required core project-info roles. |

### Minor notes (non-blocking)

- The duplicate sentence "No event bus class, no RxJS, no Angular services in this lib" appears in both `architecture.md` §2 and §9; the simplification review already flagged this. Not a correctness issue.
- `tech.md` §8 references the project rules (max depth, max args, file length) generically; this is correct because the rules are still in force even though the source files are not yet created.

### Conclusion

The implementation in Step 4.2 is compliant with the per-task plan. No code-review fixes are required. The simplification findings (above) are optional polish items only.