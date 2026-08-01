# Plan: Update README File — `@cobranza-apps/mfe-events`

**TODO File:** `.agent/todos/20260631/20260631-todo-0.md` (Task 2: "update readme file")
**Global Plan:** `.kilo/plans/20260731-init-project-info-and-readme.md`
**Date:** 2026-07-31
**Branch:** `feat/init-project-info-readme`
**Sub-step:** Critical Workflow 4.1b (Analysis & Planning) for Task 2

## 1. Task Analysis

### 1.1 Goal

Replace the current generic base-project `README.md` (117 lines of template content for `base-project-ai-agent-driven`) with a project-specific README for `@cobranza-apps/mfe-events`, the typed communication contract library between the Company Back-office Shell and its Micro-frontends.

### 1.2 Current State

- `README.md` exists at repo root and contains the base-project template (Kilo Code plugin compatibility, critical workflow graph mermaid, how-to-start-a-task instructions, AI agent plans overview). None of this applies to the `mfe-events` library.
- `docs/USAGE.md` does **not** exist yet (only `docs/how-to-set-up-git.md`, `docs/how-to-write-todo-files.md` remain from the template). `USAGE.md` will be authored in a future task; the README must link to it as a forward reference.
- `package.json` and `tsconfig.json` do **not** exist yet. Package manager is `[FLAGGED]` (npm vs pnpm undecided). Build tool is `[FLAGGED]`.
- `src/` is empty (`project-structure.md` confirms "# (no folders yet)").
- Project-info source of truth: `brief.md` (full catalog/payloads/helpers), `product.md` (product view), `tech.md` (stack), `CONTEXT.md` (current state).

### 1.3 Ambiguities / Gaps

- **None blocking.** All content needed is present in `brief.md` (§1–§9), `product.md`, and `tech.md`. Forward references (`docs/USAGE.md`, install commands) are intentional and will be resolved in later tasks. No assumptions invented.

### 1.4 Technical Decisions

- **Single file change:** rewrite `README.md` (repo root). No new files created in this task.
- **README is documentation** → not subject to `max-lines-per-file.md` / `max-lines-per-method.md` (those apply to `src/`). Keep it focused but complete (~120–170 lines).
- **Real newlines only** (newline-prevention rule). No literal `\n` escapes in content.
- **Install section:** provide both `npm` and `pnpm` placeholder commands with a note that the package manager / registry is not yet finalized; commands assume the package is published to the company registry once `package.json` exists.
- **Usage examples:** copy verbatim the canonical examples from `brief.md` §8.1 (MFE dispatch) and §8.2 (Shell listen) so humans/AI agents get the exact, compiler-checked snippets. Keep them short.
- **Event catalog:** summarize `brief.md` §5.2 and §5.3 as compact tables (constant | event-name string | purpose), one row per event. Deferred events listed briefly as out-of-scope.
- **Design principles:** mirror `brief.md` §2.3 bullets (typed first, serializable, stable names, shell-only-listener, broadcast+filter, multi-instance, AI-agent docs).
- **Tech stack:** small table sourced from `brief.md` §3 and `tech.md` §1 (TypeScript 5.x, ESM+typings, no Angular dependency, Node 22.22.3, Vitest/Jest candidate, tsc --noEmit type test).
- **AI-agent contributing note:** preserve the `<!-- DO NOT DELETE NEXT SECTION -->` "Important Note for AI Agents" block pattern used across all project-info files, linking to `AGENTS.md` and the critical workflow. This keeps the README consistent with the rest of the project's agent-driven docs.
- **No mermaid diagram** in the project-specific README (the base-project critical-workflow graph belongs to the base template, not this library). The critical-workflow lives in `.kilo/commands/critical-workflow.md`; reference it via AGENTS.md instead.

## 2. High-Level Approach

1. Backup-read the current `README.md` (already done in planning).
2. Compose a new `README.md` with the section structure in §3 below.
3. Overwrite `README.md` with the new content (implementer step 4.2).
4. Verify completeness against this plan (reviewer/architector steps 4.3/4.5b).
5. Commit on the current feature branch.

The implementer must follow this plan exactly. Each section below specifies the heading, source of truth, and content to include.

## 3. README Structure & Content Outline

**File:** `README.md` (repo root — overwrite existing)

```text
# @cobranza-apps/mfe-events
<one-line description>

## Purpose
<what this library provides / does NOT provide — from brief §1>

## Installation
<npm & pnpm placeholders + note package manager not finalized>

## Quick Usage
<two code blocks: MFE dispatch (brief §8.1), Shell listen (brief §8.2)>

## Event Catalog
### MFE -> Shell
<table from brief §5.2>
### Shell -> MFE
<table from brief §5.3>
### Deferred (not in v1)
<brief bullet list from brief §5.4>

## Design Principles
<bullets from brief §2.3>

## Tech Stack
<small table from brief §3 / tech.md §1>

## Documentation
<link to docs/USAGE.md forward reference; note JSDoc on every export>

## Development & Contributing (for AI Agents)
<reference AGENTS.md, critical-workflow, project-info files, branch model>

## Related Packages
<brief §9 table>

<!-- Important Note for AI Agents — DO NOT DELETE block -->
```

### 3.1 Title + one-line description

```markdown
# @cobranza-apps/mfe-events

Typed TypeScript contract library for communication between the Company Back-office Shell and its Micro-frontends (MFEs).
```

### 3.2 Purpose section

Source: `brief.md` §1, `product.md` §1/§4.

Content bullets:

- Provides: named event constants (`MFE_EVENTS`, `SHELL_EVENTS`) with stable `mfe:` / `shell:` prefixes.
- Provides: strongly typed payload interfaces (one per event).
- Provides: `EventMap` types for type-safe dispatch and listen.
- Provides: thin type-level + runtime helpers (`createMfeEvent`, `createShellEvent`, `isMfeEvent`, `isShellEvent`) around the browser `CustomEvent` / `window` APIs.
- Provides: JSDoc on every public export; copy-paste USAGE examples.
- Does NOT contain: business/domain logic, Angular components/services/DI, RxJS, an event-bus class, BFF/api communication, theme/UI chrome (owned by `@cobranza-apps/ui`), or any DOM manipulation by MFEs outside their own container.
- Core rule: MFEs dispatch `mfe:*`; only the Shell listens. The Shell may push info to MFEs via Angular Inputs and/or `shell:*` events.

### 3.3 Installation section

```markdown
## Installation

> The package manager and publish registry are not yet finalized (see `.agent/project-info/tech.md`). Once `package.json` is created and the library is published, install with whichever manager the repo adopts:

```bash
# npm
npm install @cobranza-apps/mfe-events

# pnpm
pnpm add @cobranza-apps/mfe-events
```

No Angular peer dependency is required. TypeScript 5.x and a modern browser `CustomEvent`/`window` API are the only runtime expectations.

```

### 3.4 Quick Usage section

Copy verbatim from `brief.md` §8.1 and §8.2.

**MFE dispatch block (from brief §8.1):**

```ts
import {
  MFE_EVENTS,
  createMfeEvent,
  type UpdateHeaderPayload,
} from '@cobranza-apps/mfe-events';

const detail: UpdateHeaderPayload = {
  moduleType: 'clients',
  instanceId: myInstanceId,
  status: 'dirty',
  title: 'Clientes — sin guardar',
};

window.dispatchEvent(createMfeEvent(MFE_EVENTS.UPDATE_HEADER, detail));
```

**Shell listen block (from brief §8.2):**

```ts
import { MFE_EVENTS, isMfeEvent } from '@cobranza-apps/mfe-events';

window.addEventListener(MFE_EVENTS.REQUEST_FULLSCREEN, (event: Event) => {
  if (!isMfeEvent(event, MFE_EVENTS.REQUEST_FULLSCREEN)) return;
  const { moduleType, instanceId } = event.detail;
  // Shell navigates to fullscreen for this instance
});
```

Add a one-line note after the two blocks: "Full examples (Shell→MFE broadcast + filter, multi-instance handling) live in [docs/USAGE.md](docs/USAGE.md)."

### 3.5 Event Catalog section

#### 3.5.1 MFE -> Shell table (brief §5.2)

| Constant | Event name | Purpose |
| --- | --- | --- |
| `REQUEST_ADD_MODULE` | `mfe:request-add-module` | Ask the Shell to add a new module instance to the workbench |
| `REQUEST_FULLSCREEN` | `mfe:request-fullscreen` | Ask the Shell to switch this instance to fullscreen |
| `REQUEST_REMOVE` | `mfe:request-remove` | Ask the Shell to remove this instance from the workbench |
| `UPDATE_HEADER` | `mfe:update-header` | MFE updates its own header chrome (title, status) |
| `SHOW_NOTIFICATION` | `mfe:show-notification` | Ask the Shell to show a global toast/notification |
| `MODULE_READY` | `mfe:module-ready` | MFE finished mounting and is ready |
| `MODULE_ERROR` | `mfe:module-error` | Unrecoverable load/init error for this instance |

#### 3.5.2 Shell -> MFE table (brief §5.3)

| Constant | Event name | Purpose |
| --- | --- | --- |
| `MODULE_STATE` | `shell:module-state` | Notify size / collapse / fullscreen / pixel dimensions for this instance |
| `THEME_CHANGED` | `shell:theme-changed` | Theme token set changed |
| `VISIBILITY_CHANGED` | `shell:visibility-changed` | Instance became visible or hidden |

#### 3.5.3 Naming rules (compact, from brief §5.1)

- MFE → Shell: prefix `mfe:`; Shell → MFE: prefix `shell:`.
- kebab-case after the prefix.
- No company/domain segment, no version suffix in the name.

#### 3.5.4 Deferred (not in v1) — from brief §5.4

- `WORKSPACE_CONTEXT` (sibling instances list)
- Auth / session / token events
- Domain-specific events (`mfe:client:*`, etc.)
- Notification actions (button that fires another event)

### 3.6 Design Principles section

Bullets (verbatim intent from brief §2.3):

- **Typed first.** Every event has a payload type. No untyped `detail: any`.
- **Serializable only.** Payloads are plain JSON-serializable data (no functions, DOM nodes, class instances).
- **Stable names.** Event name strings never change for a given meaning; evolve via optional new fields + package major version.
- **Many focused events** over a few overloaded ones that keep growing props.
- **Shell is the only listener of `mfe:*` events.** MFEs do not listen to each other.
- **Broadcast + filter.** `shell:*` events are dispatched on `window`; each MFE instance filters by `instanceId` (and usually `moduleType`).
- **Multi-instance aware.** The same `moduleType` can appear multiple times; almost every payload carries `moduleType` + `instanceId`.
- **AI-agent friendly docs.** JSDoc on every export; copy-paste USAGE examples.

### 3.7 Tech Stack section

| Item | Choice | Notes |
| --- | --- | --- |
| Language | TypeScript 5.x | Angular 22 ecosystem |
| Module format | ESM + typings | publishable package |
| Angular | Not a dependency | types + thin helpers only |
| Runtime | Browser `CustomEvent` + `window` | no Node runtime at consumer side |
| Node | 22.22.3 (`.nvmrc`) | dev toolchain |
| Build | `tsup` / `unbuild` / `tsc` + `api-extractor` (TBD) | no Angular compiler needed |
| Testing | Vitest or Jest (helpers) + `tsc --noEmit` (types) | no browser/E2E |
| Docs | JSDoc + README + `docs/USAGE.md` | no Storybook |

Note row: Build tool and package manager are `[FLAGGED]` (decided at initial implementation; see `.agent/project-info/tech.md`).

### 3.8 Documentation section

```markdown
## Documentation

- [Quick Usage](#quick-usage) (above) — minimal dispatch + listen.
- [docs/USAGE.md](docs/USAGE.md) — full copy-paste examples from both the MFE and Shell sides, including Shell→MFE broadcast + instance filtering (authored in a follow-up task; aligned with `brief.md` §8).
- JSDoc on every public export (event constants, payload interfaces, type maps, helpers).
- Project knowledge base: [`.agent/project-info/`](.agent/project-info/) (`brief.md`, `product.md`, `tech.md`, `architecture.md`, `context.md`).
```

### 3.9 Development & Contributing (for AI Agents) section

```markdown
## Development & Contributing (for AI Agents)

This repo is maintained AI-agent-first via the Kilo Code critical workflow.

- **Before any change**, read and follow [`AGENTS.md`](AGENTS.md) — primary source of agent instructions.
- Follow the Critical Workflow in [`.kilo/commands/critical-workflow.md`](.kilo/commands/critical-workflow.md) (TODO → branch → plan → implement → review → docs → verify → merge).
- Project rules live in [`.kilo/rules/`](.kilo/rules/): max 2 args per method, max depth 2, private-by-default, self-documenting code, no commented code, strict typing (no `detail: any`).
- Source code goes in `src/` per [`.agent/project-structure.md`](.agent/project-structure.md).
- Plans are stored in [`.kilo/plans/`](.kilo/plans/).
- To start a task, open a TODO file under `.agent/todos/<YYYYMMDD>/` and run `/critical-workflow`.
- Branch model: `feat/<name>` (features) / `fix/<name>` (fixes) off `main`; merge back at end of the workflow.
```

### 3.10 Related Packages section

| Package | Relationship |
| --- | --- |
| `@cobranza-apps/ui` | Owns `ModuleHeader`/`ModuleContainer` visuals and the `ModuleStatus` union (keep values in sync). Does NOT dispatch these events. |
| `@cobranza-apps/entities` | Domain models. Not imported by `mfe-events`; payloads stay generic. |
| Shell | Sole `mfe:*` listener; owns workbench state, fullscreen URL, notification host. |
| Individual MFEs | Dispatch `mfe:*`; filter `shell:*` by `instanceId`. |

### 3.11 Important Note for AI Agents block (DO NOT DELETE)

Preserve the exact block pattern used in `brief.md`/`product.md`/`tech.md`/`context.md` so it can be regenerated/protected by future agents:

```markdown
<!-- DO NOT DELETE NEXT SECTION -->

## Important Note for AI Agents

All agents working on this project MUST adhere to the workflows and rules outlined in [AI Agent Onboarding document](AGENTS.md).

Before starting any task:

1. **Review `AGENTS.md`**: it is the primary source of instructions for agents.
2. **Follow Workflows**: follow the procedures defined in `.agent/WORKFLOWS.md`, especially the `.kilo/commands/critical-workflow.md`.

<!-- END DO NOT DELETE -->
```

(Fix the minor grammar `is the primary` → `it is the primary` from the template: source files use "is the primary"; keep the corrected form for clarity since self-documenting-code rule applies to docs too.)

## 4. Detailed Implementation Steps (for Implementer — 4.2)

1. **Read** current `README.md` (use `read` / `vscode-mcp-server_read_file_code`) to confirm it is still the base template.
2. **Overwrite** `README.md` (use `write` or `vscode-mcp-server_create_file_code` with `overwrite=true`) with the content composed from §3.1–§3.11 above, in that exact order.
3. Verify the file:
   - Title line is `# @cobranza-apps/mfe-events`.
   - No literal `\n` escape sequences (real newlines only).
   - Both `npm` and `pnpm` install commands present.
   - Both MFE dispatch and Shell listen code blocks present and import from `@cobranza-apps/mfe-events`.
   - Both event tables (MFE→Shell, Shell→MFE) present with all 7 + 3 rows respectively.
   - Design principles bullets present (8 bullets).
   - Tech stack table present with the `[FLAGGED]` note row.
   - Link to `docs/USAGE.md` present (relative `docs/USAGE.md`).
   - AGENTS.md link present and pointing to repo-root `AGENTS.md`.
   - `<!-- DO NOT DELETE NEXT SECTION -->` block present at the end.
4. **Do NOT** create `docs/USAGE.md`, `package.json`, or any other file in this task — out of scope.
5. **Commit** with message: `docs: rewrite README for @cobranza-apps/mfe-events contract library` (single commit, no staging of gitignored files — verify with `git status` per gitignore-compliance rule).

## 5. Git Actions

- Branch already created by Step 2: `feat/init-project-info-readme`. No new branch needed.
- Stage only `README.md`. Run `git status` to confirm no `node_modules/`, lock files, or `.kilo/plans/*.md` unintended staging.
- Commit message: `docs: rewrite README for @cobranza-apps/mfe-events contract library`.
- Do NOT push (push happens only at Step 5 of the critical workflow, to `origin` only).

## 6. Verification / Review Steps (for 4.3 & 4.5b)

- **Completeness:** README contains all sections listed in §3.
- **Accuracy:** event names, constants, payloads, design principles match `brief.md` §2.3, §5, §6 verbatim intent (no invented events).
- **Links resolve:** intra-doc anchors (#quick-usage) and relative links (`docs/USAGE.md`, `AGENTS.md`, `.kilo/commands/critical-workflow.md`, `.agent/project-info/`, `.kilo/rules/`, `.agent/project-structure.md`) use correct relative paths. `docs/USAGE.md` is the only allowed broken-forward-reference.
- **No base-project leftovers:** no "Base Project for AI Agent Driven Development", no mermaid critical-workflow graph, no "how-to-start-a-task" template instructions, no Kilo Code plugin compatibility section.
- **Rules adherence:** real newlines; no commented-out code; self-documenting tone.
- **Line count:** ~120–170 lines (acceptable for a docs file; not subject to src max-lines rule).

## 7. Documentation Cross-Links to Maintain

- `brief.md` → README (canonical source; README summarizes it).
- `product.md`, `tech.md`, `architecture.md` (when created), `context.md` → README Development section links to `.agent/project-info/`.
- `docs/USAGE.md` (future) → README Documentation section links to it.
- `AGENTS.md` → README AI Agents block links to it.

## 8. What Was NOT Done (out of scope for this plan)

- No source code scaffolding (`src/events.ts`, `payloads.ts`, etc.) — separate future task.
- No `package.json` / `tsconfig.json` creation — separate future task.
- No `docs/USAGE.md` authoring — separate future task.
- No dependency installation / build / test commands — no runtime yet.
- No branch creation or push — handled by Steps 2 and 5 of the critical workflow.
- No TODO file modification — handled by Step 4.6.

## 9. Plan Self-Check vs Original Task

Original TODO task: "update readme file".
This plan covers exactly that: rewrites `README.md` to be project-specific for `@cobranza-apps/mfe-events` with all minimum sections required by the caller (name+description, purpose, installation placeholders, quick usage, event catalog, design principles, USAGE link, AI-agent dev notes, tech stack). No scope creep into source scaffolding, package.json, or USAGE.md authoring. Plan is correct.

## Code Review Findings

**Reviewer:** code-reviewer sub-agent (Step 4.3)  
**Date:** 2026-08-01  
**File reviewed:** `README.md` (repo root)  
**Branch:** `feat/init-project-info-readme`  

### Summary

No blocking issues or deviations from the implementation plan were found. The README.md matches the structure, content, and sources of truth specified in this plan.

### Section-by-section verification

| Plan Section | README Location | Status |
| --- | --- | --- |
| Title + one-line description | Lines 1-3 | Matches plan §3.1 |
| Purpose | Lines 5-13 | Matches plan §3.2 / `brief.md` §1 |
| Installation | Lines 15-27 | npm + pnpm commands present; note about `[FLAGGED]` package manager present |
| Quick Usage - MFE dispatch | Lines 29-48 | Matches plan §3.4 / `brief.md` §8.1 |
| Quick Usage - Shell listen | Lines 50-60 | Matches plan §3.4 / `brief.md` §8.2 |
| USAGE.md forward-reference note | Line 62 | Present exactly as specified |
| Event Catalog - MFE -> Shell | Lines 64-77 | 7 rows, names/constants/purposes match `brief.md` §5.2 |
| Event Catalog - Shell -> MFE | Lines 78-84 | 3 rows, names/constants/purposes match `brief.md` §5.3 |
| Naming rules | Lines 86-90 | Matches plan §3.5.3 / `brief.md` §5.1 |
| Deferred events | Lines 92-97 | 4 bullets match `brief.md` §5.4 |
| Design Principles | Lines 99-108 | 8 bullets match `brief.md` §2.3 |
| Tech Stack | Lines 110-123 | Matches plan §3.7 / `brief.md` §3; `[FLAGGED]` note present |
| Documentation | Lines 125-130 | `#quick-usage` anchor + `docs/USAGE.md` + `.agent/project-info/` links present |
| Development & Contributing | Lines 132-142 | AGENTS.md, critical-workflow, rules, project-structure links present |
| Related Packages | Lines 144-151 | 4 rows match `brief.md` §9 |
| Important Note for AI Agents | Lines 153-164 | DO NOT DELETE block present; grammar fix applied (`it is the primary`) |

### Link correctness

- Intra-doc anchor `#quick-usage` resolves to the `## Quick Usage` heading.
- Relative links (`AGENTS.md`, `.kilo/commands/critical-workflow.md`, `.kilo/rules/`, `.agent/project-structure.md`, `.agent/project-info/`) point to the correct repo-root-relative paths.
- `docs/USAGE.md` is the single allowed forward-reference broken link, as documented in the plan.

### Rules adherence

- Real newlines used throughout; no literal `\n` escape sequences observed.
- No commented-out code.
- No base-project template leftovers (no mermaid critical-workflow graph, no "how-to-start-a-task" instructions, no plugin compatibility section).
- Line count: 164 lines, within the planned 120-170 range.

### Minor observations (non-blocking)

1. The README's MFE dispatch block omits the inline comment `// Update header status when form becomes dirty` that appears in `brief.md` §8.1. However, this is not a deviation from the plan because the plan's own §3.4 example also omitted that comment; the README is identical to the plan-specified snippet.

### Fix plan

No fixes required. The README is ready for the documentation specialist (Step 4.4) and overall plan-adherence verification (Step 4.5b).

## Simplification Findings

**Reviewer:** code-simplifier sub-agent (Step 4.3)
**Date:** 2026-08-01
**File reviewed:** `README.md` (repo root)
**Branch:** `feat/init-project-info-readme`

### Summary

No blocking complexity or structural issues. The README is well-organized, accurate, and matches the implementation plan. Simplification opportunities are limited to redundant wording and minor consolidation.

### 1. One-line description is redundant

- **Location:** Line 3.
- **Current:** `Typed TypeScript contract library for communication between the Company Back-office Shell and its Micro-frontends (MFEs).`
- **Issue:** `Typed` is redundant with `TypeScript`; the rest is wordier than necessary.
- **Proposed:** `TypeScript contract library for Shell–MFE communication.`

### 2. Purpose section repeats `Provides`

- **Location:** Lines 7–11.
- **Current:** Five consecutive bullets each start with `Provides`.
- **Issue:** Repetitive sentence structure; the reader can infer the library owns all listed items.
- **Proposed:** Consolidate into a concise list:
  - Named constants: `MFE_EVENTS`, `SHELL_EVENTS` with stable `mfe:` / `shell:` prefixes.
  - Strongly typed payload interfaces and `EventMap` types for type-safe dispatch and listen.
  - Thin helpers for `CustomEvent` / `window`: `createMfeEvent`, `createShellEvent`, `isMfeEvent`, `isShellEvent`.
  - JSDoc + copy-paste usage examples on every public export.

### 3. `Does NOT contain` bullet is too verbose

- **Location:** Line 12.
- **Current:** `Does NOT contain: business/domain logic, Angular components/services/DI, RxJS, an event-bus class, BFF/api communication, theme/UI chrome (owned by @cobranza-apps/ui), or any DOM manipulation by MFEs outside their own container.`
- **Issue:** Long list with mixed capitalization; some items can be grouped.
- **Proposed:** `Does NOT contain: business logic, Angular/RxJS/DI, an event bus, BFF/API calls, or UI chrome (owned by @cobranza-apps/ui).`

### 4. Installation note is wordy

- **Location:** Line 17.
- **Current:** `The package manager and publish registry are not yet finalized (see .agent/project-info/tech.md). Once package.json is created and the library is published, install with whichever manager the repo adopts:`
- **Issue:** `publish registry` and `whichever manager the repo adopts` add unnecessary words.
- **Proposed:** `Package manager and registry are not yet finalized (see .agent/project-info/tech.md). Once published, install with the adopted manager:`

### 5. Design principle `Typed first` is redundant

- **Location:** Line 101.
- **Current:** `Typed first. Every event has a payload type. No untyped detail: any.`
- **Issue:** The heading and the explanation overlap.
- **Proposed:** `Every event has a typed payload; no detail: any.`

### 6. `AI-agent friendly docs` duplicates the Purpose section

- **Location:** Line 108.
- **Current:** `AI-agent friendly docs. JSDoc on every export; copy-paste USAGE examples.`
- **Issue:** Same point already appears in the Purpose section (line 11).
- **Proposed:** Remove this bullet from Design Principles, or fold it into a single documentation note in the Purpose section.

### 7. Documentation bullet 2 is verbose

- **Location:** Line 128.
- **Current:** `docs/USAGE.md — full copy-paste examples from both the MFE and Shell sides, including Shell→MFE broadcast + instance filtering (authored in a follow-up task; aligned with brief.md §8).`
- **Issue:** `from both the MFE and Shell sides` and the parenthetical add length without adding critical README value.
- **Proposed:** `Full copy-paste examples (Shell→MFE broadcast, filtering, multi-instance) are in docs/USAGE.md.`

### 8. Tech Stack build row can be terser

- **Location:** Line 119.
- **Current:** `tsup / unbuild / tsc + api-extractor (TBD)`
- **Issue:** Candidates are optional detail; the row reads a bit messy.
- **Proposed:** `TBD (tsup / unbuild / tsc + api-extractor)` (optional; minor improvement).

### Simplification plan

- No structural or accuracy changes needed.
- Apply the eight wording/verbosity reductions above.
- Estimated reduction: approximately 10–15 lines.
- The README should remain clear and self-documenting for both human and AI-agent readers.
