# Implementation Plan — TODO 02: Shared Types, Event Constants, Payloads & Event Maps

**Source TODO:** `.agent/todos/20260631/20260631-todo-2.md`
**Brief:** `.agent/project-info/brief.md` (§5–6)
**Global plan:** `.kilo/plans/20260801-todo-02-types-contract.md`
**Branch:** `feat/todo-02-types-contract` (already created in step 2)
**Date:** 2026-08-01
**Build tool:** `tsc` (`npm run build` / `npm run typecheck`)

---

## 1. Ambiguities & Gaps Analysis

### 1.1 Resolved from brief + TODO

| Question | Resolution |
|---|---|
| UUID type for `instanceId` | Plain `string` documented as UUID (TODO constraint). No UUID package. |
| `class-validator` / `class-transformer` | **Not** in this TODO (interfaces only). |
| `createMfeEvent` / `isMfeEvent` / `dispatch*` | **Not** in this TODO (TODO 03). |
| `helpers.ts` | Stays as placeholder (header only). |
| Maps location | In `types.ts` (per brief §6.4 and TODO §4). |

### 1.2 Import-graph / circular-import analysis

Caller-prescribed graph:

```
events.ts    → (no imports)                      [value: const objects]
payloads.ts  → types.ts  (ModuleIdentity,        [type-only imports, erased]
                ModuleStatus, ModuleSize)
types.ts     → events.ts (MFE_EVENTS,            [value import of const]
                SHELL_EVENTS)
types.ts     → payloads.ts (all payload          [type-only imports, erased]
                interfaces, for maps)
```

Surface dependency: `types.ts → payloads.ts → types.ts` forms a **type-only** cycle.
Because `payloads.ts` imports only type aliases/interfaces from `types.ts`, and
`types.ts` imports only interfaces from `payloads.ts`, both edges are **erased at
emit time** under `isolatedModules` / ESM. The only **value** import is
`types.ts → events.ts`, and `events.ts` is a leaf (zero imports) — so there is
**no runtime cycle**. This satisfies the TODO §4 cycle requirement and the
caller's "events.ts has no deps, breaking any potential cycle" statement.

**No separate `event-maps.ts` file is needed.** Maps stay in `types.ts`.

### 1.3 tsconfig strictness considerations

- `exactOptionalPropertyTypes: true` → optional `?` props must NOT be typed
  `| undefined`; brief's `title?: string` etc. are correct as-is.
- `noUncheckedIndexedAccess: true` → does NOT affect literal-keyed map interfaces
  (`[MFE_EVENTS.X]: Payload` resolves to a single property, not an index signature).
- `isolatedModules: true` → re-export of types must use `export type` where
  appropriate? `export *` is fine; TS handles it. No `import type` enforcement
  needed for value+type mixed modules, but **type-only imports** (`import type`)
  MUST be used in `payloads.ts` and in `types.ts`'s payload import to keep the
  cycle type-only and to satisfy best practice.
- Computed property keys in interfaces require literal-typed expressions;
  `as const` on `MFE_EVENTS` / `SHELL_EVENTS` provides literals. ✓

---

## 2. JSDoc Strategy

Every public export gets JSDoc with the four required elements:

1. **Who emits** (MFE / Shell)
2. **Who listens** (Shell / MFE instance filtered by instanceId)
3. **Short purpose** (one line from brief §5)
4. **schemaVersion note**: "Required; must equal `SCHEMA_VERSION` for this library major."

For primitives (`ModuleStatus`, `ModuleSize`, `ModuleIdentity`): purpose +
alignment note (`ModuleStatus` aligns with `@cobranza-apps/ui` `ModuleHeader`).

For event constants: group JSDoc on `MFE_EVENTS` / `SHELL_EVENTS` object +
per-member JSDoc with direction + purpose.

For maps: group JSDoc explaining event-name → payload association.

---

## 3. High-level Approach

1. Fill `src/events.ts` with `MFE_EVENTS`, `SHELL_EVENTS` `as const` objects +
   derived `MfeEventName` / `ShellEventName` union types + JSDoc.
2. Fill `src/types.ts` with `SCHEMA_VERSION`, `ModuleStatus`, `ModuleSize`,
   `ModuleIdentity`, optional `InstanceId` alias. Then add `MfeEventMap` /
   `ShellEventMap` (after importing events + payloads).
3. Fill `src/payloads.ts` with all 10 payload interfaces, importing primitives
   from `./types.js` via `import type`.
4. Verify `src/index.ts` re-exports cover all new symbols (they already use
   `export *` from each module). No change to `index.ts` / `public-api.ts`
   structure required.
5. Leave `src/helpers.ts` as the existing placeholder.
6. Run `npm run typecheck` then `npm run build`; commit.

---

## 4. Detailed Steps

### Step 4.1 — Implement `src/events.ts`

**Replace** the entire placeholder content of `src/events.ts` with the header +
constants. Keep the existing file-level JSDoc header (lines 1–11) and append
the implementation below it.

Exact content to add (after the existing header block):

```ts
/**
 * Event name constants for MFE → Shell communication.
 *
 * Direction: MFE → Shell. Only the Shell listens to these events; MFEs never
 * listen to each other. Values are stable string literals; never change a
 * value for a given meaning (evolve via new fields + package semver instead).
 */
export const MFE_EVENTS = {
  /** Ask the Shell to add a new module instance to the workbench. */
  REQUEST_ADD_MODULE: 'mfe:request-add-module',
  /** Ask the Shell to switch this instance to fullscreen. */
  REQUEST_FULLSCREEN: 'mfe:request-fullscreen',
  /** Ask the Shell to remove this instance from the workbench. */
  REQUEST_REMOVE: 'mfe:request-remove',
  /** MFE updates its own header chrome data (title, status). */
  UPDATE_HEADER: 'mfe:update-header',
  /** Ask the Shell to show a global toast/notification. */
  SHOW_NOTIFICATION: 'mfe:show-notification',
  /** MFE finished mounting and is ready. */
  MODULE_READY: 'mfe:module-ready',
  /** Unrecoverable load/init error for this instance. */
  MODULE_ERROR: 'mfe:module-error',
} as const;

/**
 * Event name constants for Shell → MFE communication.
 *
 * Direction: Shell → MFE. Dispatched on `window`; each MFE instance filters by
 * `instanceId` (and usually `moduleType`). Values are stable string literals.
 */
export const SHELL_EVENTS = {
  /** Notify size / collapse / fullscreen / pixel dimensions for this instance. */
  MODULE_STATE: 'shell:module-state',
  /** Theme token set changed. */
  THEME_CHANGED: 'shell:theme-changed',
  /** Instance became visible or hidden. */
  VISIBILITY_CHANGED: 'shell:visibility-changed',
} as const;

/** Union of all MFE → Shell event name string literals. */
export type MfeEventName =
  (typeof MFE_EVENTS)[keyof typeof MFE_EVENTS];

/** Union of all Shell → MFE event name string literals. */
export type ShellEventName =
  (typeof SHELL_EVENTS)[keyof typeof SHELL_EVENTS];
```

**Verification:** `events.ts` has zero imports. Values are literal types via
`as const`.

---

### Step 4.2 — Implement `src/types.ts`

**Replace** the placeholder body (keep/refresh file header) with primitives +
maps. Use `import type` for payload interfaces (keeps the cycle type-only).

Exact content (after a refreshed file header):

```ts
/**
 * @file Shared types and EventMap definitions for Shell–MFE communication.
 *
 * Exports common type aliases (`ModuleStatus`, `ModuleSize`, `ModuleIdentity`)
 * and the `MfeEventMap` / `ShellEventMap` interfaces that map event name
 * literals to their payload interfaces, enabling type-safe dispatch/listen.
 *
 * @see {@link ./events.ts} for event name constants.
 * @see {@link ./payloads.ts} for payload interfaces.
 */

import { MFE_EVENTS, SHELL_EVENTS } from './events.js';
import type {
  RequestAddModulePayload,
  RequestFullscreenPayload,
  RequestRemovePayload,
  UpdateHeaderPayload,
  ShowNotificationPayload,
  ModuleReadyPayload,
  ModuleErrorPayload,
  ModuleStatePayload,
  ThemeChangedPayload,
  VisibilityChangedPayload,
} from './payloads.js';

/** Current payload schema version for this library release. Required on every payload. */
export const SCHEMA_VERSION = 1 as const;

/**
 * Status values for a module header. Aligned with the `status` union of
 * `ModuleHeader` in `@cobranza-apps/ui` (`loading | loaded | success |
 * warning | error | dirty | null`); keep values in sync across packages.
 */
export type ModuleStatus =
  | 'loading'
  | 'loaded'
  | 'success'
  | 'warning'
  | 'error'
  | 'dirty'
  | null;

/** Width fraction of a workbench row. */
export type ModuleSize = '50%' | '100%';

/**
 * Identity of a module instance in the workspace.
 * `instanceId` is a UUID string generated by the Shell when the module is added.
 */
export interface ModuleIdentity {
  /** Remote / MFE kind, e.g. 'clients', 'debts', 'dashboard'. */
  moduleType: string;
  /** Unique per instance (UUID string); generated by the Shell. */
  instanceId: string;
}

/** Convenience alias for an instance UUID string. */
export type InstanceId = string;

/**
 * Event map for MFE → Shell events. Maps each `mfe:*` event name literal to its
 * payload interface. Used by typed dispatchers / listeners (TODO 03).
 */
export interface MfeEventMap {
  [MFE_EVENTS.REQUEST_ADD_MODULE]: RequestAddModulePayload;
  [MFE_EVENTS.REQUEST_FULLSCREEN]: RequestFullscreenPayload;
  [MFE_EVENTS.REQUEST_REMOVE]: RequestRemovePayload;
  [MFE_EVENTS.UPDATE_HEADER]: UpdateHeaderPayload;
  [MFE_EVENTS.SHOW_NOTIFICATION]: ShowNotificationPayload;
  [MFE_EVENTS.MODULE_READY]: ModuleReadyPayload;
  [MFE_EVENTS.MODULE_ERROR]: ModuleErrorPayload;
}

/**
 * Event map for Shell → MFE events. Maps each `shell:*` event name literal to
 * its payload interface. Used by typed dispatchers / listeners (TODO 03).
 */
export interface ShellEventMap {
  [SHELL_EVENTS.MODULE_STATE]: ModuleStatePayload;
  [SHELL_EVENTS.THEME_CHANGED]: ThemeChangedPayload;
  [SHELL_EVENTS.VISIBILITY_CHANGED]: VisibilityChangedPayload;
}
```

**Notes:**
- `import { MFE_EVENTS, SHELL_EVENTS } from './events.js'` is a **value** import
  (needed because map keys are computed from the const object). This is the
  only value import; it points to a leaf module → no runtime cycle.
- `import type { ... } from './payloads.js'` is **type-only** → erased → no
  runtime cycle with `payloads.ts`.
- Computed keys in interfaces work because `as const` gives literal types.

**Verification:** No runtime circular import. `tsc` accepts computed literal
keys in interfaces.

---

### Step 4.3 — Implement `src/payloads.ts`

**Replace** the placeholder (keep/refresh header) with all 10 payload
interfaces. Use `import type` for primitives from `./types.js`.

Exact content (after a refreshed file header):

```ts
/**
 * @file Payload interfaces for Shell–MFE events.
 *
 * Each event in `events.ts` has a corresponding strongly typed payload
 * interface here. Payloads are plain, JSON-serializable data objects — no
 * functions, DOM nodes, or class instances. Every payload requires a
 * `schemaVersion` field equal to `SCHEMA_VERSION` for this library major.
 *
 * @see {@link ./events.ts} for event name constants.
 * @see {@link ./types.ts} for `MfeEventMap` / `ShellEventMap`.
 */

import type {
  ModuleIdentity,
  ModuleSize,
  ModuleStatus,
} from './types.js';

/**
 * `mfe:request-add-module` payload. Emitted by an MFE (or cross-module
 * navigation) to ask the Shell to add a new module instance to the workbench.
 * Listened to by the Shell only. `schemaVersion` required (use `SCHEMA_VERSION`).
 */
export interface RequestAddModulePayload {
  /** Which remote to add. */
  moduleType: string;
  /** Optional initial title shown in the header. */
  title?: string;
  /** Opaque data the new instance may read (filters, preselected id, etc.). */
  initialData?: Record<string, unknown>;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `mfe:request-fullscreen` payload. Emitted by an MFE instance to ask the Shell
 * to switch THIS instance to fullscreen (Shell owns URL change + workbench
 * replacement). Listened to by the Shell only. `schemaVersion` required.
 */
export interface RequestFullscreenPayload extends ModuleIdentity {
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `mfe:request-remove` payload. Emitted by an MFE instance to ask the Shell to
 * remove THIS instance from the workbench. Listened to by the Shell only.
 * `schemaVersion` required.
 */
export interface RequestRemovePayload extends ModuleIdentity {
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `mfe:update-header` payload. Emitted by an MFE to update its own header chrome
 * data (title, status). Header action buttons visibility is owned by the Shell /
 * `@cobranza-apps/ui`. Listened to by the Shell only. `schemaVersion` required.
 */
export interface UpdateHeaderPayload extends ModuleIdentity {
  /** Optional new header title. */
  title?: string;
  /** Optional new header status (aligned with `@cobranza-apps/ui` `ModuleHeader`). */
  status?: ModuleStatus;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `mfe:show-notification` payload. Emitted by an MFE to ask the Shell to show a
 * global toast/notification (no module identity — Shell hosts the UI). Listened
 * to by the Shell only. `schemaVersion` required.
 */
export interface ShowNotificationPayload {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  title?: string;
  /** Auto-dismiss in ms; Shell may apply a default if omitted. */
  duration?: number;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `mfe:module-ready` payload. Emitted by an MFE when it finished mounting and is
 * ready (Shell can hide skeleton, register instance). Listened to by the Shell
 * only. `schemaVersion` required.
 */
export interface ModuleReadyPayload extends ModuleIdentity {
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `mfe:module-error` payload. Emitted by an MFE on an unrecoverable load/init
 * error for THIS instance. Listened to by the Shell only. `schemaVersion` required.
 */
export interface ModuleErrorPayload extends ModuleIdentity {
  message: string;
  /** Optional machine-readable code. */
  code?: string;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `shell:module-state` payload. Emitted by the Shell to notify THIS instance of
 * its size / collapse / fullscreen / pixel dimensions. Listened to by the target
 * MFE instance (filter by `instanceId`). `schemaVersion` required.
 */
export interface ModuleStatePayload extends ModuleIdentity {
  size: ModuleSize;
  /** Actual CSS pixel width of the module container. */
  width: number;
  /** Actual CSS pixel height of the module container. */
  height: number;
  isCollapsed: boolean;
  isFullscreen: boolean;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `shell:theme-changed` payload. Emitted by the Shell when the theme token set
 * changed (global — no module identity). Listened to by all MFE instances.
 * `schemaVersion` required.
 */
export interface ThemeChangedPayload {
  /** Theme identifier; currently only 'gray-intermediate' is expected. */
  theme: 'gray-intermediate' | string;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `shell:visibility-changed` payload. Emitted by the Shell when an instance
 * became visible or hidden (fullscreen enter/exit, collapse, or workbench
 * visibility). Listened to by the target MFE instance (filter by `instanceId`).
 * `schemaVersion` required.
 */
export interface VisibilityChangedPayload extends ModuleIdentity {
  visible: boolean;
  reason?: 'fullscreen' | 'collapse' | 'workbench' | string;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}
```

**Notes:**
- `import type` from `./types.js` → type-only, erased → no runtime cycle.
- No `class-validator` decorators (interfaces only, per TODO).
- `exactOptionalPropertyTypes: true` compatible (no `| undefined` on `?` props).
- `ThemeChangedPayload.theme` and `VisibilityChangedPayload.reason` kept as
  brief-specified unions (which widen to `string`); matches brief §6.3 exactly.

**Verification:** All 10 interfaces present with correct shapes; `extends
ModuleIdentity` where required; `ShowNotificationPayload` and
`ThemeChangedPayload` do NOT extend `ModuleIdentity` (global events).

---

### Step 4.4 — Verify `src/index.ts` re-exports

Current `src/index.ts`:
```ts
export * from './events.js';
export * from './payloads.js';
export * from './types.js';
export * from './helpers.js';
```

`export *` already re-exports every public symbol from each module, including
all new symbols (`SCHEMA_VERSION`, `ModuleStatus`, `ModuleSize`,
`ModuleIdentity`, `InstanceId`, `MFE_EVENTS`, `SHELL_EVENTS`, `MfeEventName`,
`ShellEventName`, all 10 payload interfaces, `MfeEventMap`, `ShellEventMap`).

**Action: NO change required.** Structure preserved per constraint.

---

### Step 4.5 — Verify `src/public-api.ts`

Current: `export * from './index.js';` — already re-exports the full barrel.
**Action: NO change required.** Structure preserved per constraint.

---

### Step 4.6 — Leave `src/helpers.ts` as placeholder

No changes. The existing header stays. Per TODO "Out of scope" and caller
constraint: helpers are TODO 03.

---

### Step 4.7 — Typecheck + Build

Console commands (run sequentially, single command each per tool rule):

1. `npm run typecheck` (runs `tsc --noEmit`)
   - Expect: 0 errors.
   - If errors: inspect (likely computed-key or missing import); fix; re-run.
2. `npm run build` (runs `tsc`, emits `dist/`)
   - Expect: `dist/` populated with `.js`, `.d.ts`, `.d.ts.map` for each src file.
   - Verify `dist/public-api.d.ts` exports the new symbols (optional grep).

**Acceptance:**
- `tsc --noEmit` exits 0.
- `tsc` exits 0 and produces `dist/`.

---

### Step 4.8 — Git commit

Per gitignore-compliance: read `.gitignore`, run `git status`, ensure no
`dist/` or `node_modules/` staged (both must be gitignored).

Commands (single, sequential):
1. `git status`
2. `git add src/events.ts src/payloads.ts src/types.ts`
3. `git commit -m "feat(types): add shared types, event constants, payloads & event maps (TODO 02)"`
   - Only these three files changed in this step (`index.ts` / `public-api.ts`
     / `helpers.ts` unchanged → nothing to stage from them).

**Do NOT push** (push happens at step 5 of the global critical workflow).

---

## 5. Verification Checklist (maps to TODO §1–5)

- [ ] `types.ts`: `SCHEMA_VERSION = 1 as const`
- [ ] `types.ts`: `ModuleStatus` union (7 values incl. `null`)
- [ ] `types.ts`: `ModuleSize = '50%' | '100%'`
- [ ] `types.ts`: `ModuleIdentity` interface (`moduleType`, `instanceId`)
- [ ] `types.ts`: `ModuleStatus` JSDoc notes alignment with `@cobranza-apps/ui`
- [ ] `types.ts`: `InstanceId` alias (optional) — included
- [ ] `events.ts`: `MFE_EVENTS` `as const` with 7 entries (exact string values)
- [ ] `events.ts`: `SHELL_EVENTS` `as const` with 3 entries (exact string values)
- [ ] `events.ts`: `MfeEventName` + `ShellEventName` union types
- [ ] `events.ts`: zero imports
- [ ] `payloads.ts`: `RequestAddModulePayload` (no `ModuleIdentity` extend)
- [ ] `payloads.ts`: `RequestFullscreenPayload extends ModuleIdentity`
- [ ] `payloads.ts`: `RequestRemovePayload extends ModuleIdentity`
- [ ] `payloads.ts`: `UpdateHeaderPayload extends ModuleIdentity` (title?, status?)
- [ ] `payloads.ts`: `ShowNotificationPayload` (no ModuleIdentity)
- [ ] `payloads.ts`: `ModuleReadyPayload extends ModuleIdentity`
- [ ] `payloads.ts`: `ModuleErrorPayload extends ModuleIdentity` (message, code?)
- [ ] `payloads.ts`: `ModuleStatePayload extends ModuleIdentity` (size, width, height, isCollapsed, isFullscreen)
- [ ] `payloads.ts`: `ThemeChangedPayload` (no ModuleIdentity; theme)
- [ ] `payloads.ts`: `VisibilityChangedPayload extends ModuleIdentity` (visible, reason?)
- [ ] `payloads.ts`: all payloads have required `schemaVersion: number`
- [ ] `payloads.ts`: no `class-validator` decorators
- [ ] `payloads.ts`: `import type` from `./types.js`
- [ ] `types.ts`: `MfeEventMap` with 7 computed keys
- [ ] `types.ts`: `ShellEventMap` with 3 computed keys
- [ ] `types.ts`: value import of `MFE_EVENTS`/`SHELL_EVENTS`; type import of payloads
- [ ] `index.ts` / `public-api.ts`: unchanged, re-export all new symbols via `export *`
- [ ] `helpers.ts`: unchanged placeholder
- [ ] JSDoc on every public export (emitter / listener / purpose / schemaVersion note)
- [ ] `npm run typecheck` passes (exit 0)
- [ ] `npm run build` passes (exit 0, `dist/` produced)
- [ ] No circular runtime import (events.ts leaf; type-only cycle erased)
- [ ] No `createMfeEvent` / `isMfeEvent` / `dispatch*` added
- [ ] No `class-validator` / `class-transformer` dependency added

---

## 6. Out-of-scope (explicitly NOT done in this step)

- Helpers (`createMfeEvent`, `createShellEvent`, `isMfeEvent`, `isShellEvent`,
  `dispatch*`) — TODO 03.
- `class-validator` / `class-transformer` — later TODO with helpers.
- `USAGE.md` / README examples — docs step (4.4) handles minimal JSDoc only.
- Unit tests — not required by TODO 02.
- New events beyond brief §5.
- Secondary package entry points — single entry kept.
- Git push — deferred to global step 5.

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Computed property keys rejected by `tsc` | `as const` ensures literal types; brief §6.4 uses this exact pattern. |
| `exactOptionalPropertyTypes` errors on optional props | All `?` props use plain types (no `\| undefined`); compliant. |
| Runtime circular import crash | `events.ts` is a leaf; payloads↔types edges are `import type` (erased). |
| Missing re-export of new symbol | `export *` covers all; verify with a grep on `dist/public-api.d.ts`. |
| `noUnusedLocals`/`noUnusedParameters` | All declared symbols are exported or used; no unused locals expected. |

---

**Plan file:** `.kilo/plans/20260801-todo-02-types-contract-impl.md`