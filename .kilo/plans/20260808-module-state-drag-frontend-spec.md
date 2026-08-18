# Front-end Technical Specification — Drag-and-drop state on `shell:module-state`

**Date**: 2026-08-08  
**Scope**: `@cobranza-apps/mfe-events` event-contract library  
**Status**: Step 4.1a specification for TODO task `.agent/todos/20260808/20260808-todo-0.md`  

## 1. Decision

Extend the existing `shell:module-state` event (`SHELL_EVENTS.MODULE_STATE`) with two **optional** fields instead of creating a new event:

- `dragState?: 'drag-start' | 'drag-end' | 'dropped'`
- `previewMode?: 'collapsed'`

Rationale: drag state is a module-state concern; keeping it on one event avoids ordering races between separate state/drag broadcasts and keeps the contract surface minimal. Optional fields preserve backward compatibility.

## 2. API Changes

### 2.1 New public type aliases (`src/types.ts`)

Export two reusable literal unions so the payload interface and the DTO can share the same allowed values:

```ts
/** Drag lifecycle states the Shell can broadcast for a module instance. */
export type ModuleDragState = 'drag-start' | 'drag-end' | 'dropped';

/** Preview modes the Shell can request while a module is being dragged. */
export type ModulePreviewMode = 'collapsed';
```

### 2.2 `ModuleStatePayload` interface (`src/payloads.ts`)

Append the two optional fields to `ModuleStatePayload` (after `isFullscreen`):

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

### 2.3 `ModuleStateDto` validation shape (`src/dtos/shell-payload-dtos.ts`)

Add two private constant arrays and two optional validated properties to `ModuleStateDto`:

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

### 2.4 Registry (`src/dtos/payload-dto-registry.ts`)

No change. `ModuleStateDto` is already mapped under `SHELL_EVENTS.MODULE_STATE` in `SHELL_PAYLOAD_DTOS` and `PAYLOAD_DTO_MAP`.

### 2.5 Public exports

Because `src/index.ts` re-exports `src/types.ts` and `src/payloads.ts`, the new types `ModuleDragState` and `ModulePreviewMode` and the new optional fields become available automatically.

## 3. Validation Rules

| Field | Required | Decorators | Runtime behavior |
|-------|----------|------------|------------------|
| `size` | Yes | `@IsIn(['50%','100%'])` | Existing — unchanged. |
| `width` | Yes | `@IsNumber()` | Existing — unchanged. |
| `height` | Yes | `@IsNumber()` | Existing — unchanged. |
| `isCollapsed` | Yes | `@IsBoolean()` | Existing — unchanged. |
| `isFullscreen` | Yes | `@IsBoolean()` | Existing — unchanged. |
| `dragState` | No | `@IsOptional()` + `@IsIn(['drag-start','drag-end','dropped'])` | Allows `undefined`; rejects any other string. |
| `previewMode` | No | `@IsOptional()` + `@IsIn(['collapsed'])` | Allows `undefined`; rejects any other string. |
| `schemaVersion` | Yes | Inherited from `SchemaVersionDto` (`@IsNumber()`) | Existing — unchanged. |

Validation is invoked by `createShellEvent`, `dispatchShellEvent`, `assertShellPayload`, and the internal `validatePayload` pipeline via `PAYLOAD_DTO_MAP[SHELL_EVENTS.MODULE_STATE]`.

## 4. Consumer Patterns

### 4.1 Shell — broadcast drag state

Use the same helper as today; set `dragState` when relevant and omit it otherwise:

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
  dragState: 'drag-start',
  schemaVersion: SCHEMA_VERSION,
};

dispatchShellEvent(SHELL_EVENTS.MODULE_STATE, detail);
```

### 4.2 Shell — broadcast collapsed preview while dragging

When the dragged module is represented by a collapsed placeholder, include `previewMode: 'collapsed'`:

```ts
const detail: ModuleStatePayload = {
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

dispatchShellEvent(SHELL_EVENTS.MODULE_STATE, detail);
```

### 4.3 MFE — react to drag state

Listen to `shell:module-state` as today; inspect the optional fields only when present:

```ts
import {
  SHELL_EVENTS,
  isShellEvent,
  type ModuleStatePayload,
} from '@cobranza-apps/mfe-events';

window.addEventListener(SHELL_EVENTS.MODULE_STATE, (event: Event) => {
  if (!isShellEvent(event, SHELL_EVENTS.MODULE_STATE)) return;

  const detail = event.detail as ModuleStatePayload;
  if (detail.instanceId !== myInstanceId) return;

  // Existing size / collapse / fullscreen handling
  applyLayout(detail);

  // Optional drag-state handling
  if (detail.dragState === 'drag-start') {
    enterDragPreview();
  } else if (detail.dragState === 'drag-end') {
    exitDragPreview();
  } else if (detail.dragState === 'dropped') {
    finalizeDrop();
  }

  // Optional preview-mode handling
  if (detail.previewMode === 'collapsed') {
    renderCollapsedPreview();
  }
});
```

### 4.4 MFE — ignore drag state (backward-compatible path)

Existing consumers that do not read `dragState` or `previewMode` continue to work unchanged; they simply apply the required layout fields.

## 5. Backward Compatibility

- **Optional fields**: `dragState` and `previewMode` are both `?` in the interface and `@IsOptional()` in the DTO. Payloads without them validate exactly as before.
- **Existing listeners**: MFEs that only destructure `size`, `width`, `height`, `isCollapsed`, `isFullscreen` are unaffected.
- **Schema version**: `SCHEMA_VERSION` remains `1`. The change is purely additive and backward-compatible, so the payload schema version does not need a bump.
- **Package version**: Per the global plan, bump the package minor version from `0.3.3` to `0.4.0` to signal a backward-compatible feature addition.

## 6. Event Sequence Examples

### 6.1 Typical drag-and-drop flow

| Order | Event | `size` | `isCollapsed` | `dragState` | `previewMode` | Meaning |
|-------|-------|--------|---------------|-------------|---------------|---------|
| 1 | `shell:module-state` | `50%` | `false` | `undefined` | `undefined` | Module at rest in the workbench. |
| 2 | `shell:module-state` | `50%` | `false` | `'drag-start'` | `undefined` | User picked up the module. |
| 3 | `shell:module-state` | `50%` | `true` | `'drag-start'` | `'collapsed'` | Shell shows a collapsed preview placeholder. |
| 4 | `shell:module-state` | `100%` | `false` | `'dropped'` | `undefined` | User dropped the module into a new position/size. |
| 5 | `shell:module-state` | `100%` | `false` | `undefined` | `undefined` | Drag lifecycle complete; module at rest again. |

### 6.2 Drag cancelled

| Order | Event | `dragState` | `previewMode` | Meaning |
|-------|-------|-------------|---------------|---------|
| 1 | `shell:module-state` | `'drag-start'` | `undefined` | Drag begins. |
| 2 | `shell:module-state` | `'drag-start'` | `'collapsed'` | Collapsed preview shown. |
| 3 | `shell:module-state` | `'drag-end'` | `undefined` | Drag cancelled; no drop occurred. |
| 4 | `shell:module-state` | `undefined` | `undefined` | Module returns to normal state. |

## 7. Documentation Updates

`docs/USAGE.md` must be updated by the docs step (4.4) to reflect:

- Event catalog description for `MODULE_STATE` now mentions drag/preview state.
- Payload reference block for `ModuleStatePayload` lists `dragState?` and `previewMode?`.
- Copy-paste snippet **F** (Shell broadcast module state) includes an example with `dragState`.

## 8. Acceptance Criteria

- [ ] `ModuleDragState` and `ModulePreviewMode` are exported from `src/types.ts`.
- [ ] `ModuleStatePayload` includes `dragState?` and `previewMode?` exactly as specified.
- [ ] `ModuleStateDto` validates the new fields with `@IsOptional()` + `@IsIn(...)`.
- [ ] `PAYLOAD_DTO_MAP` still resolves `SHELL_EVENTS.MODULE_STATE` to `ModuleStateDto`.
- [ ] `schemaVersion` remains `1`; no breaking changes to existing consumers.
- [ ] All existing and new validator tests pass (`npm test` / `npx vitest`).
- [ ] `docs/USAGE.md` accurately documents the new optional fields.
