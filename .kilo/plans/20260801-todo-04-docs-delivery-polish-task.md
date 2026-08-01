# Implementation Plan — TODO 04 Task: Docs & Delivery Polish

**TODO file:** `.agent/todos/20260801/20260801-todo-1.md`
**Global plan:** `.kilo/plans/20260801-todo-04-documentation-delivery-polish.md`
**Assigned step:** 4.1b — Analysis & Planning
**Date:** 2026-08-01
**Package:** `@cobranza-apps/mfe-events` (currently `0.3.0`; will be bumped to `0.3.1` in step 3)
**Scope:** documentation-only; no new events, payloads, or helpers.

---

## 1. Gap Analysis (current state vs TODO requirements)

### Confirmed current state (read this session)

- `docs/USAGE.md` — 3-line stub (`# Usage` + one sentence). Must be fully rewritten.
- `docs/anti-patterns.md` — does **not** exist. Must be created.
- `README.md` — 182 lines, comprehensive; references `docs/USAGE.md` twice (`## Quick Usage`, `## Documentation`). Does **not** reference an anti-patterns doc. No structural rewrite needed; add cross-links only.
- JSDoc drift confirmed via grep:
  - `src/events.ts` line 4: `This module will export MFE_EVENTS and SHELL_EVENTS` — forward-looking ("will export") although already implemented.
  - `src/types.ts` line 4: `This module will export common type aliases` — same forward-looking drift.
  - `src/types.ts` line 62: `Used by typed dispatchers / listeners (TODO 03).` — vestigial TODO reference on `MfeEventMap`.
  - `src/types.ts` line 76: same `(TODO 03)` vestigial reference on `ShellEventMap`.
  - `src/assert.ts` `assertMfePayload` (line 8) and `assertShellPayload` (line 24) — JSDoc present but **no `@example`** block. TODO §3 requires `@example` on every public helper.
- "emitted by / listened by" phrasing: payloads (`src/payloads.ts`) and event-constant blocks (`src/events.ts`) already include it. No gap there; spot-check only.
- `SCHEMA_VERSION = 1` (confirmed `src/types.ts` line 27). All examples must hard-set `schemaVersion: SCHEMA_VERSION`.
- `reflect-metadata` requirement: already documented in `src/create-event.ts` module header and `src/validate-payload.ts`. USAGE.md §2.5 must repeat the consumer requirement (`import 'reflect-metadata';` once at app entry), since the library does NOT import it itself.
- Real public exports (re-exported through `src/index.ts` ← `src/public-api.ts`):
  - Constants: `MFE_EVENTS`, `SHELL_EVENTS`, `SCHEMA_VERSION`.
  - Name types: `MfeEventName`, `ShellEventName`.
  - Payload interfaces: `RequestAddModulePayload`, `RequestFullscreenPayload`, `RequestRemovePayload`, `UpdateHeaderPayload`, `ShowNotificationPayload`, `ModuleReadyPayload`, `ModuleErrorPayload`, `ModuleStatePayload`, `ThemeChangedPayload`, `VisibilityChangedPayload`.
  - Maps: `MfeEventMap`, `ShellEventMap`.
  - Shared types: `ModuleStatus`, `ModuleSize`, `ModuleIdentity`, `InstanceId`.
  - Error: `MfeEventValidationError`, `MfeValidationErrorEntry`, `MfeValidationErrorContext`.
  - Helpers: `createMfeEvent`, `createShellEvent`, `dispatchMfeEvent`, `dispatchShellEvent`, `isMfeEvent`, `isShellEvent`, `assertMfePayload`, `assertShellPayload`, `DispatchOptions`.
- Event catalog (from `src/events.ts`):
  - MFE→Shell: `REQUEST_ADD_MODULE`=`mfe:request-add-module`, `REQUEST_FULLSCREEN`=`mfe:request-fullscreen`, `REQUEST_REMOVE`=`mfe:request-remove`, `UPDATE_HEADER`=`mfe:update-header`, `SHOW_NOTIFICATION`=`mfe:show-notification`, `MODULE_READY`=`mfe:module-ready`, `MODULE_ERROR`=`mfe:module-error`.
  - Shell→MFE: `MODULE_STATE`=`shell:module-state`, `THEME_CHANGED`=`shell:theme-changed`, `VISIBILITY_CHANGED`=`shell:visibility-changed`.
- Deferred (NOT in v1; document so agents don't invent): `WORKSPACE_CONTEXT`, auth/session/token events, domain-specific events (`mfe:client:*`), notification actions.

### Gaps to close

| # | Gap | TODO ref | Output file |
|---|-----|----------|-------------|
| G1 | USAGE.md is a stub | §1 (all of 2.1–2.8) | `docs/USAGE.md` (full rewrite) |
| G2 | anti-patterns doc absent | §2 | `docs/anti-patterns.md` (new) |
| G3 | README missing anti-patterns cross-link | §2 ("link file to README") | `README.md` (edit) |
| G4 | Forward-looking JSDoc in `events.ts` | §3 | `src/events.ts` (edit module header) |
| G5 | Forward-looking JSDoc + `(TODO 03)` in `types.ts` | §3 | `src/types.ts` (edits) |
| G6 | Missing `@example` on `assertMfePayload` / `assertShellPayload` | §3 | `src/assert.ts` (edits) |

---

## 2. High-Level Approach

1. **Docs structure:** keep both files under `docs/` (already referenced by README, matches `.agent/project-structure.md` which lists `docs/`).
2. **USAGE.md ordering:** follow TODO §2.1–§2.8 exactly, in order. Insert a Markdown Table of Contents right after the title (file will exceed 100 lines → TOC required per repo doc convention).
3. **Snippets A–H:** provide complete, runnable-in-spirit TypeScript examples using only real exports. Use the TODO's pre-written snippets A, E, G verbatim (they already match real exports); write B/C/D/F/H from scratch matching real payload shapes.
4. **anti-patterns.md:** one section per anti-pattern (6 total), each with "Don't"/"Do" framing, a short rationale, and a cross-link back to USAGE.md / README.
5. **Cross-linking:**
   - README `## Documentation` section gets a new bullet linking to `docs/anti-patterns.md`.
   - USAGE.md `## 2.6 Copy-paste patterns` snippet H links to anti-patterns anti-pattern #3 (schemaVersion) as a "see also".
   - anti-patterns.md top/bottom link back to `README.md` and `docs/USAGE.md`.
6. **JSDoc fixes:** surgical, present-tense, remove "TODO 03", add two `@example` blocks. Preserve all existing valid content (`@param`, `@throws`, `@see`).
7. **Snippet validation strategy:** implementer must, before commit, run `npm run typecheck` to ensure JSDoc edits did not break compilation; and visually verify each snippet's imports and payload fields against the real interfaces in `src/payloads.ts` / `src/types.ts`. Snippets are doc-only (not compiled), so typecheck only guards the source edits. A short manual verification checklist is included in step 5 of the implementation.
8. **No code-format rules apply** to `docs/*.md` (they are docs, not `src/`). The max-lines-per-file rule is `src/`-only.

---

## 3. Detailed Implementation Steps

### Step 3.1 — Edit `src/events.ts` (G4)

**File:** `src/events.ts`
**Target:** module-level `@file` block, lines 1–11.
**Old text (exact):**
```
/**
 * @file Event name constants for Shell–MFE communication.
 *
 * This module will export `MFE_EVENTS` and `SHELL_EVENTS` — frozen objects
 * mapping logical names to their string event identifiers (e.g. `mfe:update-header`,
 * `shell:module-state`). All event name strings are defined here so that
 * consumers never hard-code raw strings.
 *
 * @see {@link file://./payloads.ts} for the payload interfaces that accompany each event.
 * @see {@link file://./create-event.ts} for `createMfeEvent` / `createShellEvent` helpers.
 */
```
**New text (exact):**
```
/**
 * @file Event name constants for Shell–MFE communication.
 *
 * Exports `MFE_EVENTS` and `SHELL_EVENTS` — frozen objects mapping logical
 * names to their stable string event identifiers (e.g. `mfe:update-header`,
 * `shell:module-state`). All event name strings are defined here so that
 * consumers never hard-code raw strings. Also exports the `MfeEventName` and
 * `ShellEventName` literal unions.
 *
 * @see {@link file://./payloads.ts} for the payload interfaces that accompany each event.
 * @see {@link file://./create-event.ts} for `createMfeEvent` / `createShellEvent` helpers.
 */
```
Rationale: present-tense ("Exports" instead of "will export"); mention literal-union exports; no behaviour change.

### Step 3.2 — Edit `src/types.ts` (G5, three edits)

**File:** `src/types.ts`

**Edit 3.2a — module `@file` block, lines 1–11.**
Old:
```
/**
 * @file Shared types and EventMap definitions for Shell–MFE communication.
 *
 * This module will export common type aliases (e.g. `ModuleStatus`, `ModuleSize`,
 * `ModuleIdentity`) and `EventMap` types that map event name strings to their
 * payload interfaces, enabling type-safe dispatch and listen.
 *
 * @see {@link file://./events.ts} for event name constants.
 * @see {@link file://./payloads.ts} for payload interfaces.
 */
```
New:
```
/**
 * @file Shared types and EventMap definitions for Shell–MFE communication.
 *
 * Exports shared type aliases (`ModuleStatus`, `ModuleSize`, `ModuleIdentity`,
 * `InstanceId`), the `SCHEMA_VERSION` constant, and the `MfeEventMap` /
 * `ShellEventMap` types that map event name strings to their payload interfaces,
 * enabling type-safe dispatch and listen.
 *
 * @see {@link file://./events.ts} for event name constants.
 * @see {@link file://./payloads.ts} for payload interfaces.
 */
```

**Edit 3.2b — `MfeEventMap` JSDoc, lines 60–63.**
Old:
```
/**
 * Event map for MFE → Shell events. Maps each `mfe:*` event name literal to its
 * payload interface. Used by typed dispatchers / listeners (TODO 03).
 */
```
New:
```
/**
 * Event map for MFE → Shell events. Maps each `mfe:*` event name literal to its
 * payload interface. Consumed by {@link createMfeEvent}, {@link dispatchMfeEvent},
 * {@link isMfeEvent}, and {@link assertMfePayload} for type-safe dispatch, listen,
 * and validation.
 */
```

**Edit 3.2c — `ShellEventMap` JSDoc, lines 74–77.**
Old:
```
/**
 * Event map for Shell → MFE events. Maps each `shell:*` event name literal to
 * its payload interface. Used by typed dispatchers / listeners (TODO 03).
 */
```
New:
```
/**
 * Event map for Shell → MFE events. Maps each `shell:*` event name literal to
 * its payload interface. Consumed by {@link createShellEvent},
 * {@link dispatchShellEvent}, {@link isShellEvent}, and
 * {@link assertShellPayload} for type-safe dispatch, listen, and validation.
 */
```

Rationale: present-tense, replace vestigial "TODO 03" with concrete `{@link}` cross-references to the real helpers; improves AI-agent navigation.

### Step 3.3 — Add `@example` to `src/assert.ts` (G6)

**File:** `src/assert.ts`

**Edit 3.3a — `assertMfePayload` JSDoc, lines 8–16.**
Old:
```
/**
 * Validates an MFE payload without constructing/dispatching a `CustomEvent`.
 * Throws {@link MfeEventValidationError} on failure. Useful for Shell/MFE
 * pre-checks (e.g. before proxying an inbound event).
 *
 * @param type - MFE event name constant from {@link MFE_EVENTS}.
 * @param detail - Payload matching `MfeEventMap[K]`. Must include `schemaVersion: SCHEMA_VERSION`.
 * @throws {MfeEventValidationError} if `detail` is invalid.
 */
```
New:
```
/**
 * Validates an MFE payload without constructing/dispatching a `CustomEvent`.
 * Throws {@link MfeEventValidationError} on failure. Useful for Shell/MFE
 * pre-checks (e.g. before proxying an inbound event).
 *
 * @param type - MFE event name constant from {@link MFE_EVENTS}.
 * @param detail - Payload matching `MfeEventMap[K]`. Must include `schemaVersion: SCHEMA_VERSION`.
 * @throws {MfeEventValidationError} if `detail` is invalid.
 *
 * @example
 * import { MFE_EVENTS, SCHEMA_VERSION, assertMfePayload } from '@cobranza-apps/mfe-events';
 *
 * assertMfePayload(MFE_EVENTS.UPDATE_HEADER, {
 *   schemaVersion: SCHEMA_VERSION,
 *   moduleType: 'clients',
 *   instanceId: 'inst-abc',
 *   status: 'dirty',
 *   title: 'Clientes — sin guardar',
 * });
 */
```

**Edit 3.3b — `assertShellPayload` JSDoc, lines 24–31.**
Old:
```
/**
 * Shell-side counterpart of {@link assertMfePayload}. Validates a Shell
 * payload without constructing/dispatching a `CustomEvent`.
 *
 * @param type - Shell event name constant from {@link SHELL_EVENTS}.
 * @param detail - Payload matching `ShellEventMap[K]`. Must include `schemaVersion: SCHEMA_VERSION`.
 * @throws {MfeEventValidationError} if `detail` is invalid.
 */
```
New:
```
/**
 * Shell-side counterpart of {@link assertMfePayload}. Validates a Shell
 * payload without constructing/dispatching a `CustomEvent`.
 *
 * @param type - Shell event name constant from {@link SHELL_EVENTS}.
 * @param detail - Payload matching `ShellEventMap[K]`. Must include `schemaVersion: SCHEMA_VERSION`.
 * @throws {MfeEventValidationError} if `detail` is invalid.
 *
 * @example
 * import { SHELL_EVENTS, SCHEMA_VERSION, assertShellPayload } from '@cobranza-apps/mfe-events';
 *
 * assertShellPayload(SHELL_EVENTS.MODULE_STATE, {
 *   schemaVersion: SCHEMA_VERSION,
 *   moduleType: 'clients',
 *   instanceId: 'inst-abc',
 *   size: '50%',
 *   width: 640,
 *   height: 720,
 *   isCollapsed: false,
 *   isFullscreen: false,
 * });
 */
```

Rationale: satisfies TODO §3 "ensure each helper has `@example`"; examples use real exports and real payload shapes verifiable against `src/payloads.ts`.

### Step 3.4 — JSDoc spot-check pass (TODO §3, confirm no further edits)

After edits 3.1–3.3, run a final grep to confirm zero remaining drift:
```
rg -n "TODO 03|will export" src/
```
Expected: no matches. If any appear, fix per the same present-tense convention. Also confirm every public helper (`createMfeEvent`, `createShellEvent`, `dispatchMfeEvent`, `dispatchShellEvent`, `isMfeEvent`, `isShellEvent`, `assertMfePayload`, `assertShellPayload`) has a `@example` — these already do except `assert*` (fixed in 3.3). No further JSDoc edits expected.

### Step 3.5 — Create `docs/USAGE.md` (G1) — full rewrite

**File:** `docs/USAGE.md` (overwrite existing 3-line stub).
**Language:** English.
**Structure (exact section order, matching TODO 2.1–2.8):**

```
# @cobranza-apps/mfe-events — Usage Guide

[intro sentence: practical, copy-paste guide for Shell and MFE consumers; AI-agent friendly]

## Table of Contents

- [2.1 Overview](#21-overview)
- [2.2 Core rules (must follow)](#22-core-rules-must-follow)
- [2.3 Event catalog](#23-event-catalog)
- [2.4 Payload reference](#24-payload-reference)
- [2.5 Helpers](#25-helpers)
- [2.6 Copy-paste patterns](#26-copy-paste-patterns)
- [2.7 Multi-instance guidance](#27-multi-instance-guidance)
- [2.8 Relationship to `@cobranza-apps/ui`](#28-relationship-to-cobranza-appsui)
- [See also](#see-also)

### 2.1 Overview

[bullets: what it provides; what it deliberately does NOT provide]
```

**2.1 expected bullets:**

- Provides: `MFE_EVENTS` / `SHELL_EVENTS` constants; strongly typed `*Payload` interfaces; `MfeEventMap` / `ShellEventMap`; `SCHEMA_VERSION`; `createMfeEvent` / `createShellEvent` / `dispatchMfeEvent` / `dispatchShellEvent` (runtime-validated); `isMfeEvent` / `isShellEvent` guards; `assertMfePayload` / `assertShellPayload` validators; `MfeEventValidationError`.
- Does NOT provide: an event bus class, RxJS subjects, Angular services/components/DI, workspace layout logic, BFF/API communication, UI chrome (owned by `@cobranza-apps/ui`), DOM manipulation by MFEs outside their container.

**2.2 Core rules (must follow)** — numbered list, verbatim meaning from TODO 2.2 (7 rules): only Shell listens to `mfe:*`; MFEs never talk to each other via these events; almost every payload carries `moduleType` + `instanceId`; payloads must be JSON-serializable; `schemaVersion` required and must equal `SCHEMA_VERSION`; fullscreen/workbench composition owned by Shell (MFEs only request); header content owned by MFE via `UPDATE_HEADER`, header action visibility owned by Shell / `@cobranza-apps/ui`.

**2.3 Event catalog** — two tables (MFE→Shell, Shell→MFE) with columns: `Constant | Event name | Purpose | Payload type name`. Data sourced from `src/events.ts` + `src/payloads.ts`:

| Constant | Event name | Purpose | Payload |
|---|---|---|---|
| `REQUEST_ADD_MODULE` | `mfe:request-add-module` | Ask the Shell to add a new module instance to the workbench | `RequestAddModulePayload` |
| `REQUEST_FULLSCREEN` | `mfe:request-fullscreen` | Ask the Shell to switch this instance to fullscreen | `RequestFullscreenPayload` |
| `REQUEST_REMOVE` | `mfe:request-remove` | Ask the Shell to remove this instance from the workbench | `RequestRemovePayload` |
| `UPDATE_HEADER` | `mfe:update-header` | MFE updates its own header chrome (title, status) | `UpdateHeaderPayload` |
| `SHOW_NOTIFICATION` | `mfe:show-notification` | Ask the Shell to show a global toast/notification | `ShowNotificationPayload` |
| `MODULE_READY` | `mfe:module-ready` | MFE finished mounting and is ready | `ModuleReadyPayload` |
| `MODULE_ERROR` | `mfe:module-error` | Unrecoverable load/init error for this instance | `ModuleErrorPayload` |

| Constant | Event name | Purpose | Payload |
|---|---|---|---|
| `MODULE_STATE` | `shell:module-state` | Notify size / collapse / fullscreen / pixel dimensions for this instance | `ModuleStatePayload` |
| `THEME_CHANGED` | `shell:theme-changed` | Theme token set changed (global) | `ThemeChangedPayload` |
| `VISIBILITY_CHANGED` | `shell:visibility-changed` | Instance became visible or hidden | `VisibilityChangedPayload` |

Then a "Deferred (not in v1)" note listing: `WORKSPACE_CONTEXT`, auth/session/token, domain-specific events (`mfe:client:*`), notification actions — "do not invent these".

**2.4 Payload reference** — compact per-interface field lists. For each interface (10), a fenced block listing fields with required/optional marker and short description. Call out the three specials in a sub-block:
- `ShowNotificationPayload` — no `moduleType` / `instanceId` (global).
- `ThemeChangedPayload` — no `moduleType` / `instanceId` (global).
- `RequestAddModulePayload` — has `moduleType` but no `instanceId` (instance does not exist yet).

Use this compact form (example for `UpdateHeaderPayload`):
```
UpdateHeaderPayload (extends ModuleIdentity → moduleType: string, instanceId: string)
  title?        string        Optional new header title
  status?       ModuleStatus  Optional status (loading|loaded|success|warning|error|dirty|null)
  schemaVersion number        Required; === SCHEMA_VERSION (1)
```
Repeat for all 10 interfaces, deriving fields from `src/payloads.ts`.

**2.5 Helpers** — bullet sections:
- **`createMfeEvent` / `createShellEvent`** — create a validated `CustomEvent` (bubbles: true). Throws `MfeEventValidationError` on invalid shape/`schemaVersion`/unknown type. Use when you need the event object (e.g. dispatch on a scoped target later).
- **`dispatchMfeEvent` / `dispatchShellEvent`** — validate + dispatch in one call; default target `window`. Pass `DispatchOptions.target` for SSR/tests/scoped elements. Throws `MfeEventValidationError` (invalid payload) or `Error` (no `window` and no explicit target).
- **`isMfeEvent` / `isShellEvent`** — cheap `event instanceof CustomEvent && event.type === type` narrowing guards. **Do not** re-validate inside hot listeners (use `assert*` if you must validate).
- **`assertMfePayload` / `assertShellPayload`** — validate without building/dispatching; same exceptions as creators. Useful for pre-checks before proxying events.
- **`MfeEventValidationError`** — error class; carries `.errors` (per-field messages) and `.eventType`.
- **`reflect-metadata` requirement:** before the first import of `@cobranza-apps/mfe-events` in the app entry, `import 'reflect-metadata';` once. The library does NOT import it itself (avoids forcing a global side effect on every consumer). Required because helpers use `class-validator` decorators internally on DTOs.

**2.6 Copy-paste patterns** — snippets A–H. Use the TODO's verbatim text for A, E, G; write B, C, D, F, H. Each snippet fenced ````ts` and self-contained (own imports). Exact content:

**A. MFE — update header when form is dirty** (verbatim from TODO §A):
```ts
import {
  MFE_EVENTS,
  SCHEMA_VERSION,
  dispatchMfeEvent,
  type UpdateHeaderPayload,
} from '@cobranza-apps/mfe-events';

const detail: UpdateHeaderPayload = {
  moduleType: 'clients',
  instanceId: myInstanceId,
  status: 'dirty',
  title: 'Clientes — sin guardar',
  schemaVersion: SCHEMA_VERSION,
};

dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, detail);
```

**B. MFE — request fullscreen**:
```ts
import {
  MFE_EVENTS,
  SCHEMA_VERSION,
  dispatchMfeEvent,
  type RequestFullscreenPayload,
} from '@cobranza-apps/mfe-events';

const detail: RequestFullscreenPayload = {
  moduleType: 'clients',
  instanceId: myInstanceId,
  schemaVersion: SCHEMA_VERSION,
};

dispatchMfeEvent(MFE_EVENTS.REQUEST_FULLSCREEN, detail);
```

**C. MFE — module ready on init**:
```ts
import {
  MFE_EVENTS,
  SCHEMA_VERSION,
  dispatchMfeEvent,
  type ModuleReadyPayload,
} from '@cobranza-apps/mfe-events';

const detail: ModuleReadyPayload = {
  moduleType: 'clients',
  instanceId: myInstanceId,
  schemaVersion: SCHEMA_VERSION,
};

dispatchMfeEvent(MFE_EVENTS.MODULE_READY, detail);
```

**D. MFE — show notification** (no `instanceId`; global):
```ts
import {
  MFE_EVENTS,
  SCHEMA_VERSION,
  dispatchMfeEvent,
  type ShowNotificationPayload,
} from '@cobranza-apps/mfe-events';

const detail: ShowNotificationPayload = {
  type: 'success',
  message: 'Cliente guardado correctamente.',
  schemaVersion: SCHEMA_VERSION,
};

dispatchMfeEvent(MFE_EVENTS.SHOW_NOTIFICATION, detail);
```

**E. Shell — listen for fullscreen request** (verbatim from TODO §E):
```ts
import { MFE_EVENTS, isMfeEvent } from '@cobranza-apps/mfe-events';

window.addEventListener(MFE_EVENTS.REQUEST_FULLSCREEN, (event: Event) => {
  if (!isMfeEvent(event, MFE_EVENTS.REQUEST_FULLSCREEN)) return;
  const { moduleType, instanceId } = event.detail;
  // navigate / replace workbench with this instance
});
```

**F. Shell — broadcast module state**:
```ts
import {
  SHELL_EVENTS,
  SCHEMA_VERSION,
  dispatchShellEvent,
  type ModuleStatePayload,
} from '@cobranza-apps/mfe-events';

const detail: ModuleStatePayload = {
  moduleType: 'clients',
  instanceId: 'inst-abc',
  size: '50%',
  width: 640,
  height: 720,
  isCollapsed: false,
  isFullscreen: false,
  schemaVersion: SCHEMA_VERSION,
};

dispatchShellEvent(SHELL_EVENTS.MODULE_STATE, detail);
```

**G. MFE — filter shell state by instanceId** (verbatim from TODO §G):
```ts
window.addEventListener(SHELL_EVENTS.MODULE_STATE, (event: Event) => {
  if (!isShellEvent(event, SHELL_EVENTS.MODULE_STATE)) return;
  if (event.detail.instanceId !== myInstanceId) return;
  // apply size / fullscreen / collapse
});
```
Note: prepend the full import line for completeness — `import { SHELL_EVENTS, isShellEvent } from '@cobranza-apps/mfe-events';` above the snippet body (the TODO version omitted imports; add them so the snippet is self-contained, consistent with A/E).

**H. Handling validation errors**:
```ts
import {
  MFE_EVENTS,
  SCHEMA_VERSION,
  dispatchMfeEvent,
  MfeEventValidationError,
  type UpdateHeaderPayload,
} from '@cobranza-apps/mfe-events';

const detail: UpdateHeaderPayload = {
  moduleType: 'clients',
  instanceId: myInstanceId,
  status: 'dirty',
  title: 'Clientes — sin guardar',
  schemaVersion: SCHEMA_VERSION,
};

try {
  dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, detail);
} catch (error) {
  if (error instanceof MfeEventValidationError) {
    console.error('[mfe-events] invalid', error.eventType, error.errors);
  } else {
    throw error;
  }
}
```
After snippet H, add a one-line cross-link: `> See also: [Anti-patterns](anti-patterns.md) — omitting `schemaVersion` is anti-pattern #3.`

**2.7 Multi-instance guidance** — bullets:
- Why `instanceId` exists: the same `moduleType` (e.g. `'clients'`) can appear multiple times in the workbench with different filters/state; `instanceId` disambiguates them.
- Shell generates a UUID when adding a module; MFE must receive it (Angular Input or equivalent) and echo it on **every** `mfe:*` event it dispatches.
- Filtering rule for `shell:*` listeners in MFEs: always `if (event.detail.instanceId !== myInstanceId) return;` first (see snippet G). For global payloads (`ThemeChangedPayload`) no filter is needed.

**2.8 Relationship to `@cobranza-apps/ui`** — bullets:
- `ModuleStatus` values (`loading | loaded | success | warning | error | dirty | null`) MUST stay identical to the `status` union of `cba-module-header` in `@cobranza-apps/ui`. Keep them in sync across packages.
- `@cobranza-apps/ui` does **not** dispatch these events; the MFE or Shell does. `mfe-events` is the contract, `@cobranza-apps/ui` is the visual chrome.
- Header chrome action buttons (collapse, size toggle, remove, fullscreen) visibility is owned by the Shell / `@cobranza-apps/ui` inputs. Header **content** (title, status) is owned by the MFE via `UPDATE_HEADER`.

**See also** (bottom section):
- [`README.md`](../README.md) — overview, install, event catalog summary.
- [Anti-patterns](anti-patterns.md) — what NOT to do and why.
- [`.agent/project-info/brief.md`](../.agent/project-info/brief.md) — authoritative source of truth.

### Step 3.6 — Create `docs/anti-patterns.md` (G2) — new file

**File:** `docs/anti-patterns.md`
**Structure:**
```
# Anti-patterns — @cobranza-apps/mfe-events

[intro: 1–2 sentences; these patterns break the contract; AI agents must avoid them]

## Table of Contents
- [#1 Listening to `mfe:*` from inside an MFE](#1-listening-to-mfe-from-inside-an-mfe)
- [#2 Dispatching `shell:*` from an MFE](#2-dispatching-shell-from-an-mfe)
- [#3 Omitting `schemaVersion` or hard-coding a wrong version](#3-omitting-schemaversion-or-hard-coding-a-wrong-version)
- [#4 Putting functions / class instances / DOM nodes in `detail`](#4-putting-functions--class-instances--dom-nodes-in-detail)
- [#5 Using domain event names (`mfe:client:open`) instead of generic catalog + payload data](#5-using-domain-event-names-mfeclientopen-instead-of-generic-catalog--payload-data)
- [#6 Building a shared RxJS bus inside this package](#6-building-a-shared-rxjs-bus-inside-this-package)
- [See also](#see-also)
```

For each of the 6 anti-patterns, use a fixed mini-template:

```
### #N <title>

**Don't** — <one line> + minimal bad snippet (````ts ... ````).

**Do** — <one line> + minimal good snippet or pointer to USAGE pattern.

**Why** — <1–2 sentences linking back to Core rules / brief>.
```

Exact content per anti-pattern:

**#1 Listening to `mfe:*` from inside an MFE**
- Don't: an MFE adds `window.addEventListener('mfe:update-header', …)`.
- Do: only the Shell listens to `mfe:*`; MFEs listen to `shell:*` filtered by `instanceId` (see [USAGE §2.2](USAGE.md#22-core-rules-must-follow), snippet G).
- Why: `mfe:*` events are MFE→Shell contracts; siblings must not observe each other (brief §2.3, §8.4 rule 1–2).

**#2 Dispatching `shell:*` from an MFE**
- Don't: an MFE calls `dispatchShellEvent(SHELL_EVENTS.MODULE_STATE, …)`.
- Do: MFEs dispatch `mfe:*` to request changes; only the Shell dispatches `shell:*` (see [USAGE snippet A/D](USAGE.md#26-copy-paste-patterns)).
- Why: Shell→MFE events represent authoritative state; an MFE dispatching them would corrupt broadcast+filter model and break multi-instance (brief §8.4 rule 6).

**#3 Omitting `schemaVersion` or hard-coding a wrong version**
- Don't: spread payload without `schemaVersion`, or hard-code `schemaVersion: 0` / a literal.
- Do: always import `SCHEMA_VERSION` and set `schemaVersion: SCHEMA_VERSION` on every payload (see [USAGE snippet A](USAGE.md#26-copy-paste-patterns)). `createMfeEvent`/`dispatchMfeEvent` throw `MfeEventValidationError` otherwise.
- Why: required for evolution; mismatched versions break consumers on upgrade (brief §6.1).

**#4 Putting functions / class instances / DOM nodes in `detail`**
- Don't: `detail.handler = () => …` or `detail.element = document.querySelector(…)`.
- Do: keep payloads plain JSON-serializable (primitives, plain objects, arrays). Pass behaviour hints as string codes, not callbacks.
- Why: `detail` is dispatched as `CustomEvent` and must survive serialization boundaries, postMessage, and devtools inspection (brief §2.3 design principles).

**#5 Using domain event names (`mfe:client:open`) instead of generic catalog + payload data**
- Don't: invent `mfe:client:open`, `mfe:debt:edit`, etc.
- Do: use the generic catalog (`MFE_EVENTS.REQUEST_ADD_MODULE` + `initialData`) and put domain specifics inside `initialData` / payload fields.
- Why: event names are stable forever; domain proliferation explodes the contract and breaks the naming rules (brief §5.1, out-of-scope domain-specific events).

**#6 Building a shared RxJS bus inside this package**
- Don't: add `Subject`, `BehaviorSubject`, or an `EventBus` class to `mfe-events`.
- Do: keep helpers thin over `CustomEvent`/`window`. RxJS in the Shell/MFE apps is fine — just not in this library.
- Why: this package is a typed contract + thin helpers, intentionally framework-free; a bus therein would force a runtime dependency and collide with consumer buses (brief §2.2, §7).

**See also** (bottom): link to [README](../README.md), [USAGE.md](USAGE.md), [brief.md](../.agent/project-info/brief.md).

### Step 3.7 — Update `README.md` cross-links (G3)

**File:** `README.md`
**Edit:** `## Documentation` section (lines 143–148). Add a bullet linking to `docs/anti-patterns.md`.

Old (lines 143–148):
```
## Documentation

- [Quick Usage](#quick-usage) (above) — minimal dispatch + listen.
- Full copy-paste examples (Shell→MFE broadcast, filtering, multi-instance) are in [docs/USAGE.md](docs/USAGE.md).
- JSDoc on every public export (event constants, payload interfaces, type maps, helpers).
- Project knowledge base: [`.agent/project-info/`](.agent/project-info/) (`brief.md`, `product.md`, `tech.md`, `architecture.md`, `context.md`).
```
New:
```
## Documentation

- [Quick Usage](#quick-usage) (above) — minimal dispatch + listen.
- Full copy-paste examples (Shell→MFE broadcast, filtering, multi-instance) are in [docs/USAGE.md](docs/USAGE.md).
- [Anti-patterns](docs/anti-patterns.md) — what NOT to do and why (MFEs listening to `mfe:*`, non-serializable payloads, domain event names, in-package RxJS bus, etc.).
- JSDoc on every public export (event constants, payload interfaces, type maps, helpers).
- Project knowledge base: [`.agent/project-info/`](.agent/project-info/) (`brief.md`, `product.md`, `tech.md`, `architecture.md`, `context.md`).
```
No other README edits (catalog tables already correct; "Documentation" anchor in its own TOC stays valid since the heading text is unchanged).

### Step 3.8 — Update `.agent/project-info/context.md` (per Project Info closing rule)

This is the architector step (4.1b), so the **context.md final update** is conventionally done at the end of the workflow (4.6) by the implementer. **Do NOT edit context.md in this step** — leave a note here so step 4.4 / 4.6 records: "TODO 04 docs authored: USAGE.md, anti-patterns.md; JSDoc drift fixed in events.ts/types.ts/assert.ts; README cross-link added."

---

## 4. Verification Strategy (for implementer in step 4.2, before commit)

1. **Source integrity:** `npm run typecheck` (`tsc --noEmit`) — must pass after JSDoc edits (JSDoc inside `/** */` is erased by tsc; confirms no accidental code damage).
2. **JSDoc drift sweep:** `rg -n "TODO 03|will export" src/` — must return no matches.
3. **Snippet audit (manual, against `src/payloads.ts` / `src/types.ts`):**
   - Snippet A: `UpdateHeaderPayload` fields — `moduleType`, `instanceId` (via `ModuleIdentity`), `status?`, `title?`, `schemaVersion`. ✓.
   - Snippet B: `RequestFullscreenPayload` extends `ModuleIdentity` + `schemaVersion` only. ✓.
   - Snippet C: `ModuleReadyPayload` extends `ModuleIdentity` + `schemaVersion` only. ✓.
   - Snippet D: `ShowNotificationPayload` — `type`, `message`, `title?`, `duration?`, `schemaVersion`; NO `moduleType`/`instanceId`. ✓.
   - Snippet F: `ModuleStatePayload` — `moduleType`+`instanceId` + `size`, `width`, `height`, `isCollapsed`, `isFullscreen`, `schemaVersion`. ✓.
   - Snippet H: catches `MfeEventValidationError`, reads `.errors` + `.eventType` (both exist on the class). ✓.
4. **Cross-link check:** `rg -n "anti-patterns" README.md docs/USAGE.md` → matches in both. `rg -n "USAGE.md\|README.md" docs/anti-patterns.md` → matches in "See also".
5. **Doc TOC:** confirm `docs/USAGE.md` and `docs/anti-patterns.md` both exceed 100 lines (they will) and each has a `## Table of Contents`.

---

## 5. Build / Test / Git Steps

- **No build/test invocation is required to author the docs.** The only command that must be run during verification is `npm run typecheck` (to protect source edits).
- Existing Vitest suite (`test/`) is unaffected by doc-only edits; implementer may run `npm test` for sanity but it is not mandatory for this task.
- **Git commits (implementer, step 4.2 — one per logical chunk, meaningful messages):**
  1. `docs: rewrite docs/USAGE.md with full event/payload/snippet guide` — `docs/USAGE.md`.
  2. `docs: add docs/anti-patterns.md` — `docs/anti-patterns.md`.
  3. `docs: link anti-patterns from README` — `README.md`.
  4. `docs(jsdoc): present-tense headers, drop vestigial TODO refs, add assert examples` — `src/events.ts`, `src/types.ts`, `src/assert.ts`.
  - The implementer commits on the `feat/todo-04-docs-delivery-polish` branch (created in step 2; expects version bump commit from step 3 already present).
- **No push in this step.** Push to `origin/main` happens only in step 5 of the workflow, after merge.

---

## 6. Out of Scope (per global plan & TODO)

- New events / payload fields / helpers.
- Secondary package entry points.
- Publishing to a registry.
- Demo application.
- Translating docs to Spanish.
- Any change to runtime behaviour of helpers.

---

## 7. Boundary Check Against TODO

- TODO §1 (USAGE.md 2.1–2.8): addressed by step 3.5 (all sub-sections + snippets A–H).
- TODO §2 (anti-patterns doc, 6 items + link from README): addressed by steps 3.6 + 3.7.
- TODO §3 (JSDoc pass on public exports): addressed by steps 3.1, 3.2, 3.3, 3.4.
- All 6 anti-patterns match the TODO list verbatim in meaning.
- All 8 snippets (A–H) present; A/E/G use TODO's verbatim text (G's imports added for self-containment).
- No invented APIs; every symbol referenced exists in `src/public-api.ts`/`src/index.ts`.

---

## 8. Review Fix & Simplification Plan

Produced during step 4.3 by code-reviewer and code-simplifier.

### Required fixes (must do)

1. **README.md Quick Usage snippet — add `schemaVersion`**
   - File: `README.md`, lines 51–56 (Quick Usage MFE dispatch snippet).
   - Update the import line to include `SCHEMA_VERSION`.
   - Add `schemaVersion: SCHEMA_VERSION,` to the `detail` object.
   - Rationale: `schemaVersion` is required on every payload and enforced at runtime. The snippet will throw `MfeEventValidationError` without it.

### Selected simplifications (apply where they improve clarity without losing TODO-mandated content)

2. **README.md Purpose section — tighten bullets**
   - Split the long bullet 3 into two lines.
   - Compact the "Does NOT provide" list to match USAGE.md §2.1 wording.
   - Remove the duplicate paragraph after the Tech Stack table.
   - Tighten `## Documentation` bullets and `## Development & Contributing` to a single sentence + link.

3. **docs/USAGE.md §2.1 Overview — tighten**
   - Collapse the provide/does-not-provide lists into two compact groups.

4. **docs/USAGE.md §2.2 Core rules — split rule 7**
   - Split the combined header-ownership bullet into two explicit bullets.

5. **docs/USAGE.md §2.4 Payload reference — de-duplicate `schemaVersion` note**
   - Add a top-of-section note: "Every payload requires `schemaVersion: number` equal to `SCHEMA_VERSION` (currently `1`)."
   - Remove the redundant `schemaVersion` line from each per-interface block, keeping only unique fields.
   - Preserve all 10 interfaces and the 3 specials call-outs.

6. **docs/USAGE.md §2.5 Helpers — tighten bullets**
   - Shorten helper descriptions while keeping `MfeEventValidationError`, `DispatchOptions.target`, and `reflect-metadata` mentions.

7. **docs/USAGE.md §2.7 Multi-instance guidance — tighten**
   - Collapse the three bullets into concise form without losing meaning.

8. **docs/USAGE.md §2.8 Relationship to `@cobranza-apps/ui` — tighten**
   - Remove repetition of header ownership already covered in §2.2; keep only status-sync and dispatch-ownership.

9. **docs/anti-patterns.md — tighten**
   - Shorten opening paragraph.
   - Collapse repetitive "Why" rationales.
   - Tighten #4 and #6 wording.

10. **src/events.ts file-level JSDoc — tighten**
    - Apply shorter file-level block (still mentions literal-union exports and `@see` links).

11. **src/types.ts file-level JSDoc — tighten**
    - Apply shorter file-level block.
    - Shorten `MfeEventMap` / `ShellEventMap` comments.
    - Shorten `InstanceId` comment to remove "Convenience alias" filler.

### Simplifications intentionally rejected

- **Collapsing snippets A/B/C into one generic pattern** — rejected because the TODO explicitly requests separate, complete snippets for each event type.
- **Removing `@example` imports from `src/assert.ts`** — rejected because the examples were just added and are appropriately self-contained.
- **Inlining `assertPayload` wrapper** — rejected because it may be required to satisfy max-args rules; no behaviour change needed.

### Commit

Single commit on `feat/todo-04-docs-delivery-polish`:
- `docs: apply review fixes — README schemaVersion, tighten prose across docs and JSDoc`