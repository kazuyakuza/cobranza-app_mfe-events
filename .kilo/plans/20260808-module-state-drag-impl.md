# Implementation Plan — Drag/preview optional fields on `shell:module-state`

**Date**: 2026-08-08
**Step**: 4.1b — Analysis & Planning (Critical Workflow)
**Source TODO**: `.agent/todos/20260808/20260808-todo-0.md`
**Front-end spec**: `.kilo/plans/20260808-module-state-drag-frontend-spec.md`
**Global plan**: `.kilo/plans/20260808-module-state-drag-support.md`
**Branch (from Step 2)**: `feat/module-state-drag-support`

---

## 0. Authoritative Decision (READ FIRST)

The TODO file **literally** proposes adding a new event `shell:module-drag-state` and a
`ModuleDragStatePayload`. That proposal was **deliberately rejected** during the global plan /
front-end spec (Step 4.1a). The approved approach is to **extend the existing
`shell:module-state` event** with two **optional** fields:

- `dragState?: 'drag-start' | 'drag-end' | 'dropped'`
- `previewMode?: 'collapsed'`

Rationale (from spec §1 / global plan): drag state is a module-state concern; one event avoids
ordering races, keeps the contract surface minimal, and optional fields preserve backward
compatibility. The caller's task prompt is aligned with this decision ("adding drag-and-drop
state fields to the **existing** `shell:module-state` event").

> **Implementer MUST follow this plan (extend existing event), NOT the literal new-event text in
> the TODO.** Do NOT create `MODULE_DRAG_STATE` / `shell:module-drag-state` / a new payload / a
> new DTO / a new registry entry.

---

## 1. Current State (verified by reading source)

| File | Relevant current state |
|------|-------------------------|
| `package.json` | `"version": "0.4.0"` — **already at the target version** (Step 3 already executed). |
| `src/types.ts` | Exports `SCHEMA_VERSION = 1`, `ModuleStatus`, `ModuleSize`, `ModuleIdentity`, `InstanceId`, `MfeEventMap`, `ShellEventMap`. No drag types yet. |
| `src/payloads.ts` | `ModuleStatePayload extends ModuleIdentity` with `size`, `width`, `height`, `isCollapsed`, `isFullscreen`, `schemaVersion`. Imports `ModuleIdentity`, `ModuleSize`, `ModuleStatus` from `./types.js`. |
| `src/dtos/shell-payload-dtos.ts` | `ModuleStateDto extends ModuleIdentityDto` with `@IsIn(MODULE_SIZES) size`, `@IsNumber width/height`, `@IsBoolean isCollapsed/isFullscreen`. `MODULE_SIZES` const present. `IsBoolean, IsIn, IsNumber, IsOptional, IsString` already imported. |
| `src/dtos/payload-dto-registry.ts` | `SHELL_PAYLOAD_DTOS[MODULE_STATE] = ModuleStateDto` — already wired. **No change.** |
| `src/validate-payload.ts` | `plainToInstance` + `validateSync` with **default** options (no `whitelist`, no `forbidNonWhitelisted`). Unknown extra fields are ignored (covered by existing test V-4). Optional decorated props validate only when present. |
| `src/index.ts` / `src/public-api.ts` | Use `export *` — new exports propagate automatically. **No change.** |
| `test/validate-payload.spec.ts` | Has `describe('validatePayload via assertMfePayload')` and `describe('validatePayload via assertShellPayload')`. Imports `assertMfePayload, assertShellPayload`, `MFE_EVENTS, SHELL_EVENTS`, `SCHEMA_VERSION`, `captureError, expectErrorProperty, validUpdateHeader, validVisibilityChanged` from `./helpers.js`. Does NOT yet import `validModuleState`. |
| `test/helpers.ts` | `validModuleState()` returns a valid `ModuleStatePayload` WITHOUT the new optional fields (perfect baseline for backward-compat test). |
| `docs/USAGE.md` | §2.1 Provides list, §2.3 catalog, §2.4 payload reference, §2.6 snippet F reference `MODULE_STATE` / `ModuleStatePayload` — need updates. |
| `CHANGELOG.md` | Does **not** exist yet — create. |

### Open observations for the Plan Agent (not blockers)

1. **Version**: `package.json` is already at `0.4.0`. The global plan's Step 3 (version bump) has
   already been executed. The implementer in Step 4.2 MUST NOT bump the version again. If it were
   still `0.3.x`, the bump would belong to Step 3, not 4.2.
2. **Schema version**: stays `1` (purely additive, optional fields). Do NOT touch `SCHEMA_VERSION`.

---

## 2. High-level Approach

Additive, backward-compatible changes across 3 source files + test file + 2 doc files:

1. Define two reusable literal-union types in `src/types.ts`.
2. Use those types as optional fields on `ModuleStatePayload` in `src/payloads.ts`.
3. Mirror the validation on `ModuleStateDto` in `src/dtos/shell-payload-dtos.ts` with
   `@IsOptional()` + `@IsIn(...)` decorators (imports already present).
4. Add Vitest cases asserting acceptance of all valid values + omission, and rejection of invalid
   values, through `assertShellPayload`.
5. Update `docs/USAGE.md` so the public contract documentation matches the code, and create a
   `CHANGELOG.md` with the `0.4.0` entry.
6. Verify with `npm run typecheck`, `npm test`, `npm run build`.

Three commits (feat / test / docs). No git commands are authored in this plan step — the
implementer (Step 4.2) runs them.

---

## 3. Detailed Steps

### Step 3.1 — Add `ModuleDragState` and `ModulePreviewMode` type aliases

**File**: `src/types.ts`

**Anchor**: immediately after the `ModuleSize` definition (current line 42 region):

```ts
/** Width fraction of a workbench row. */
export type ModuleSize = '50%' | '100%';
```

**AFTER** (insert two new type aliases right after `ModuleSize`):

```ts
/** Width fraction of a workbench row. */
export type ModuleSize = '50%' | '100%';

/** Drag lifecycle states the Shell can broadcast for a module instance. */
export type ModuleDragState = 'drag-start' | 'drag-end' | 'dropped';

/** Preview modes the Shell can request while a module is being dragged. */
export type ModulePreviewMode = 'collapsed';
```

**No import changes** in `src/types.ts` (these are standalone unions).

> Max-lines-per-file: `src/types.ts` grows from 82 to ~86 lines — well within 200.

---

### Step 3.2 — Add optional `dragState`/`previewMode` to `ModuleStatePayload`

**File**: `src/payloads.ts`

**Change 3.2.a — update the import from `./types.js`** (current lines 12–16):

BEFORE:
```ts
import type {
  ModuleIdentity,
  ModuleSize,
  ModuleStatus,
} from './types.js';
```

AFTER:
```ts
import type {
  ModuleDragState,
  ModuleIdentity,
  ModuleSize,
  ModulePreviewMode,
  ModuleStatus,
} from './types.js';
```

**Change 3.2.b — extend the `ModuleStatePayload` interface** (current lines 110–120):

BEFORE:
```ts
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
```

AFTER:
```ts
export interface ModuleStatePayload extends ModuleIdentity {
  size: ModuleSize;
  /** Actual CSS pixel width of the module container. */
  width: number;
  /** Actual CSS pixel height of the module container. */
  height: number;
  isCollapsed: boolean;
  isFullscreen: boolean;
  /** Current drag lifecycle state, if the module is being dragged. */
  dragState?: ModuleDragState;
  /** Visual preview mode requested by the Shell during drag, e.g. a collapsed placeholder. */
  previewMode?: ModulePreviewMode;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}
```

The new fields are placed between `isFullscreen` and `schemaVersion` to match the spec §2.2.

---

### Step 3.3 — Add validation decorators on `ModuleStateDto`

**File**: `src/dtos/shell-payload-dtos.ts`

**Imports**: `IsBoolean, IsIn, IsNumber, IsOptional, IsString` are already imported
(current lines 1–7). **No import changes needed.**

BEFORE (current lines 13–31):
```ts
const MODULE_SIZES = ['50%', '100%'] as const;

/** `shell:module-state` payload validation shape. */
export class ModuleStateDto extends ModuleIdentityDto {
  @IsIn(MODULE_SIZES)
  size!: '50%' | '100%';

  @IsNumber()
  width!: number;

  @IsNumber()
  height!: number;

  @IsBoolean()
  isCollapsed!: boolean;

  @IsBoolean()
  isFullscreen!: boolean;
}
```

AFTER:
```ts
const MODULE_SIZES = ['50%', '100%'] as const;
const DRAG_STATES = ['drag-start', 'drag-end', 'dropped'] as const;
const PREVIEW_MODES = ['collapsed'] as const;

/** `shell:module-state` payload validation shape. */
export class ModuleStateDto extends ModuleIdentityDto {
  @IsIn(MODULE_SIZES)
  size!: '50%' | '100%';

  @IsNumber()
  width!: number;

  @IsNumber()
  height!: number;

  @IsBoolean()
  isCollapsed!: boolean;

  @IsBoolean()
  isFullscreen!: boolean;

  @IsOptional()
  @IsIn(DRAG_STATES)
  dragState?: 'drag-start' | 'drag-end' | 'dropped';

  @IsOptional()
  @IsIn(PREVIEW_MODES)
  previewMode?: 'collapsed';
}
```

**Design notes** (self-documenting consistency):
- DTO property types use **inline literals** (`'drag-start' | 'drag-end' | 'dropped'`) — matching
  the existing DTO style (e.g. `size!: '50%' | '100%'` rather than `ModuleSize`). Keep this style;
  do not import the public type alias into the internal DTO module.
- `schemaVersion` validation is inherited from `SchemaVersionDto` via `ModuleIdentityDto` —
  unchanged (spec §3).

---

### Step 3.4 — Public exports (`src/index.ts`, `src/public-api.ts`)

**NO CHANGE.** Both files use `export *` re-export semantics:

```ts
export * from './types.js';      // src/index.ts — ModuleDragState, ModulePreviewMode auto-exported
export * from './payloads.js';   // updated ModuleStatePayload auto-exported
```

The new types become part of the public surface automatically. Do not edit these files for this
task. (Spec §2.5 confirms this.)

---

### Step 3.5 — DTO registry (`src/dtos/payload-dto-registry.ts`)

**NO CHANGE.** `ModuleStateDto` is already registered under `SHELL_EVENTS.MODULE_STATE` in both
`SHELL_PAYLOAD_DTOS` and `PAYLOAD_DTO_MAP` (current lines 31–35, 38–41). The new optional fields are
on the same DTO, so the registry keeps working. (Spec §2.4 confirms.)

---

### Step 3.6 — Vitest cases for module-state drag/preview validation

**File**: `test/validate-payload.spec.ts`

**Change 3.6.a — import `validModuleState` helper**. Update the existing helpers import
(current line 5):

BEFORE:
```ts
import { captureError, expectErrorProperty, validUpdateHeader, validVisibilityChanged } from './helpers.js';
```

AFTER:
```ts
import { captureError, expectErrorProperty, validModuleState, validUpdateHeader, validVisibilityChanged } from './helpers.js';
```

**Change 3.6.b — append a new `describe` block** at the end of the file (after the existing
`describe('validatePayload via assertShellPayload', ...)` block that ends with the V-8 test, around
current line 74):

```ts
describe('validatePayload via assertShellPayload (module-state drag/preview)', () => {
  it('accepts a valid dragState (V-9)', () => {
    expect(() =>
      assertShellPayload(SHELL_EVENTS.MODULE_STATE, {
        ...validModuleState(),
        dragState: 'drag-start',
      }),
    ).not.toThrow();
  });

  it('accepts a valid previewMode (V-10)', () => {
    expect(() =>
      assertShellPayload(SHELL_EVENTS.MODULE_STATE, {
        ...validModuleState(),
        previewMode: 'collapsed',
      }),
    ).not.toThrow();
  });

  it('accepts all dragState lifecycle values (V-11)', () => {
    const lifecycleValues = ['drag-start', 'drag-end', 'dropped'] as const;
    for (const dragState of lifecycleValues) {
      expect(() =>
        assertShellPayload(SHELL_EVENTS.MODULE_STATE, {
          ...validModuleState(),
          dragState,
        }),
      ).not.toThrow();
    }
  });

  it('accepts a payload without optional drag/preview fields (V-12)', () => {
    expect(() => assertShellPayload(SHELL_EVENTS.MODULE_STATE, validModuleState())).not.toThrow();
  });

  it('rejects an invalid dragState value (V-13)', () => {
    const error = captureError(() =>
      assertShellPayload(SHELL_EVENTS.MODULE_STATE, {
        ...validModuleState(),
        dragState: 'dragging',
      } as never),
    );
    expectErrorProperty(error, 'dragState');
  });

  it('rejects an invalid previewMode value (V-14)', () => {
    const error = captureError(() =>
      assertShellPayload(SHELL_EVENTS.MODULE_STATE, {
        ...validModuleState(),
        previewMode: 'expanded',
      } as never),
    );
    expectErrorProperty(error, 'previewMode');
  });
});
```

**Conventions matched to the existing suite**:
- Test IDs follow the existing `V-<n>` sequence (last existing is V-8; new ones V-9..V-14).
- Invalid-payload casts use `as never` (same pattern as V-3/V-6/V-7/V-8).
- `validModuleState()` (from `test/helpers.ts`) already omits the new optional fields, so V-12 is
  a true backward-compatibility assertion.
- Max-depth rule: each `it` body has at most 2 levels of nesting (`it → for → expect`) — compliant.
- The `for...of` over a readonly tuple keeps the single-section boolean-condition rule intact (no
  compound boolean conditions introduced).

---

### Step 3.7 — Documentation: `docs/USAGE.md`

**File**: `docs/USAGE.md`

**Change 3.7.a — §2.1 Overview "Provides" sentence** (current line 22). Append drag/preview
mention so the overview lists the new capabilities.

BEFORE (end of the **Provides** line):
```
`assertMfePayload` / `assertShellPayload` validators, and `MfeEventValidationError`.
```

AFTER:
```
`assertMfePayload` / `assertShellPayload` validators, `MfeEventValidationError`, and the
`ModuleDragState` / `ModulePreviewMode` literal-union types for `shell:module-state` drag state.
```

**Change 3.7.b — §2.3 Event catalog, Shell→MFE `MODULE_STATE` row** (current line 55). Mention
drag/preview in the purpose.

BEFORE:
```
| `MODULE_STATE` | `shell:module-state` | Notify size / collapse / fullscreen / pixel dimensions for this instance | `ModuleStatePayload` |
```

AFTER:
```
| `MODULE_STATE` | `shell:module-state` | Notify size / collapse / fullscreen / pixel dimensions and optional drag-and-drop state for this instance | `ModuleStatePayload` |
```

**Change 3.7.c — §2.4 Payload reference, `ModuleStatePayload` block** (current lines 104–111).
Add the two optional fields after `isFullscreen`.

BEFORE:
```
ModuleStatePayload (extends ModuleIdentity → moduleType, instanceId)
  size          '50%'|'100%'        Required width fraction.
  width         number              Required CSS pixel width of the module container.
  height        number              Required CSS pixel height of the module container.
  isCollapsed   boolean             Required.
  isFullscreen  boolean             Required.
```

AFTER:
```
ModuleStatePayload (extends ModuleIdentity → moduleType, instanceId)
  size          '50%'|'100%'        Required width fraction.
  width         number              Required CSS pixel width of the module container.
  height        number              Required CSS pixel height of the module container.
  isCollapsed   boolean             Required.
  isFullscreen  boolean             Required.
  dragState?    ModuleDragState     Optional drag lifecycle state ('drag-start'|'drag-end'|'dropped'). Omitted when the module is at rest.
  previewMode?  ModulePreviewMode   Optional drag preview mode requested by the Shell ('collapsed'). Omitted unless a preview placeholder is shown.
```

**Change 3.7.d — §2.6 Copy-paste pattern F** (current lines 237–259). Add a `dragState` example
to the Shell broadcast snippet.

BEFORE:
```ts
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

AFTER:
```ts
// At rest — dragState / previewMode omitted (backward compatible).
const restingDetail: ModuleStatePayload = {
  moduleType: 'clients',
  instanceId: 'inst-abc',
  size: '50%',
  width: 640,
  height: 720,
  isCollapsed: false,
  isFullscreen: false,
  schemaVersion: SCHEMA_VERSION,
};

dispatchShellEvent(SHELL_EVENTS.MODULE_STATE, restingDetail);

// While dragging — broadcast drag lifecycle + optional collapsed preview.
const draggingDetail: ModuleStatePayload = {
  moduleType: 'clients',
  instanceId: 'inst-abc',
  size: '50%',
  width: 320,
  height: 48,
  isCollapsed: true,
  isFullscreen: false,
  dragState: 'drag-start',
  previewMode: 'collapsed',
  schemaVersion: SCHEMA_VERSION,
};

dispatchShellEvent(SHELL_EVENTS.MODULE_STATE, draggingDetail);
```

> Note: Step 4.4 (docs-specialist) will expand the docs further (e.g., a "MFE — react to drag
> state" pattern mirroring spec §4.3). The edits above are the minimum required by spec §7 so the
> implementation step leaves the docs accurate and consistent with the code.

---

### Step 3.8 — Create `CHANGELOG.md`

**File**: `CHANGELOG.md` (new, repo root)

```markdown
# Changelog

All notable changes to `@cobranza-apps/mfe-events` are documented here.
This project adheres to [Keep a Changelog](https://keepachangelog.com/) and uses
[Semantic Versioning](https://semver.org/).

## [0.4.0] - 2026-08-08

### Added
- `ModuleDragState` and `ModulePreviewMode` literal-union types, exported from
  `src/types.ts` as part of the public surface.
- `ModuleStatePayload.dragState?` optional field
  (`'drag-start' | 'drag-end' | 'dropped'`) on `shell:module-state`.
- `ModuleStatePayload.previewMode?` optional field (`'collapsed'`) on
  `shell:module-state`.
- `ModuleStateDto` runtime validation for the new optional fields
  (`@IsOptional()` + `@IsIn(...)`), enforced by `createShellEvent`,
  `dispatchShellEvent`, and `assertShellPayload`.

### Changed
- `docs/USAGE.md` documents the new optional `dragState` and `previewMode`
  fields on `shell:module-state` (event catalog, payload reference, copy-paste
  snippet F).

### Backward Compatibility
- Both new fields are optional. Payloads omitting them validate exactly as
  before. `SCHEMA_VERSION` remains `1`; no breaking changes for existing Shell
  or MFE consumers.
```

---

## 4. Files NOT to modify

| File | Reason |
|------|--------|
| `package.json` | Version already `0.4.0` (Step 3 executed). Do NOT bump again. |
| `src/events.ts` | Decision is to extend the **existing** `MODULE_STATE` event — no new event constant/name. |
| `src/types.ts` `SCHEMA_VERSION` | Stays `1` (additive, optional fields). |
| `src/index.ts` / `src/public-api.ts` | `export *` auto-propagates new exports. |
| `src/dtos/payload-dto-registry.ts` | `ModuleStateDto` already registered under `MODULE_STATE`. |
| `src/validate-payload.ts`, `src/create-event.ts`, `src/assert.ts`, `src/dispatch.ts`, `src/guards.ts` | Unaffected — they already route the registered DTO through the existing validation pipeline. |
| `README.md` | Summary catalog rows are unchanged in meaning (drag mention is a USAGE.md concern). Optional for 4.4 to touch. |

---

## 5. Verification Steps (after Step 4.2 implementation)

Run from the project root (single commands, not chained):

1. **Typecheck**: `npx tsc --noEmit`
   - Expect: no errors. Verifies the new types/fields/DTO props compile and that `index.ts`
     `export *` still resolves.
2. **Tests**: `npm test`
   - Expect: all pre-existing tests (33) plus the 6 new cases (V-9..V-14) pass.
   - Specifically: V-9, V-10, V-11, V-12 pass without throwing; V-13 reports property `dragState`;
     V-14 reports property `previewMode`.
3. **Build**: `npm run build`
   - Expect: `dist/` regenerated cleanly (confirms `.d.ts` includes the new public types and the
     DTO emits valid decorator metadata). No need to commit `dist/` (it is gitignored — verify
     with `git status` per the gitignore-compliance rule before any commit).

If any step fails, fix within the same task before committing.

---

## 6. Code Review Checklist (for Step 4.3 / 4.5)

- [ ] Acceptance criteria from spec §8 all met:
  - [ ] `ModuleDragState` and `ModulePreviewMode` exported from `src/types.ts`.
  - [ ] `ModuleStatePayload` includes `dragState?` and `previewMode?` exactly as specified.
  - [ ] `ModuleStateDto` validates the new fields with `@IsOptional()` + `@IsIn(...)`.
  - [ ] `PAYLOAD_DTO_MAP` still resolves `SHELL_EVENTS.MODULE_STATE` to `ModuleStateDto`.
  - [ ] `schemaVersion` remains `1`; no breaking changes.
  - [ ] All existing + new validator tests pass (`npm test`).
  - [ ] `docs/USAGE.md` documents the new optional fields.
- [ ] No new event constant / event name introduced (decision respected).
- [ ] No `SCHEMA_VERSION` change.
- [ ] No `package.json` version change (already `0.4.0`).
- [ ] No commented-out code (rule `no-commented-code`).
- [ ] Max lines per file ≤ 200 for `src/` files (types.ts ~86, payloads.ts ~149, DTO ~43 — all OK).
- [ ] Method bodies ≤ 50 lines and max depth ≤ 2 (new test bodies compliant).
- [ ] Single-section boolean conditions preserved (no compound conditions introduced).
- [ ] JSDoc present on new public types/fields (added in plan; 4.4 may expand).
- [ ] `git status` clean of `dist/` / `node_modules/` before commits.

---

## 7. Commit Sequence (executed by implementer in Step 4.2)

The implementer stages only the files listed per commit and uses the messages verbatim. Before
each commit, follow `gitignore-compliance.md`: read `.gitignore`, run `git status`, ensure no
`dist/` or `node_modules/` is staged.

**Commit A — feature (source types + payload interface + DTO):**
- Files: `src/types.ts`, `src/payloads.ts`, `src/dtos/shell-payload-dtos.ts`
- Message: `feat: add dragState and previewMode optional fields to shell:module-state`
- Body (optional):
  ```
  Export ModuleDragState and ModulePreviewMode literal-unions; add optional
  dragState?/previewMode? to ModuleStatePayload; validate them on ModuleStateDto
  with @IsOptional() + @IsIn(...). Backward compatible; SCHEMA_VERSION unchanged.
  ```

**Commit B — tests:**
- Files: `test/validate-payload.spec.ts`
- Message: `test: cover module-state drag/preview validation`
- Body (optional):
  ```
  Add V-9..V-14: accept valid dragState/previewMode and their omission; reject
  invalid values via assertShellPayload(SHELL_EVENTS.MODULE_STATE, ...).
  ```

**Commit C — documentation:**
- Files: `docs/USAGE.md`, `CHANGELOG.md`
- Message: `docs: document module-state drag/preview fields and add CHANGELOG`
- Body (optional):
  ```
  Update USAGE.md §2.1/§2.3/§2.4/§2.6 for the new optional fields; create
  CHANGELOG.md with the v0.4.0 entry.
  ```

> If the implementer prefers finer granularity, source types/payload/DTO may be split into up to
> three commits — but they are intentionally coupled (a type used by both the payload interface and
> the DTO), so a single feature commit is preferred to keep the tree consistent at each commit.

---

## 8. Summary

- **Scope**: extend existing `shell:module-state` with two **optional**, backward-compatible
  fields (`dragState?`, `previewMode?`); NO new event.
- **Source touched**: `src/types.ts`, `src/payloads.ts`, `src/dtos/shell-payload-dtos.ts`.
- **Exports/registry**: no change (auto via `export *`; reusing existing `MODULE_STATE` DTO).
- **Tests**: 6 new Vitest cases (V-9..V-14) in `test/validate-payload.spec.ts`.
- **Docs**: `docs/USAGE.md` updates + new `CHANGELOG.md`.
- **Version**: already `0.4.0` — do NOT bump.
- **Schema**: `SCHEMA_VERSION` stays `1`.
- **Verify**: `npx tsc --noEmit`, `npm test`, `npm run build`.
- **Commits**: 3 (feat / test / docs).
```