# Code Simplification Report — Module Drag State

**Date:** 2026-08-08
**Task:** Add `shell:module-drag-state` event support to `@cobranza-apps/mfe-events`.
**Scope:** Review modified files for simplification opportunities without modifying source files.

## Scope / Plan Adherence Note

The TODO (`.agent/todos/20260808/20260808-todo-0.md`) requires:

> Add `MODULE_DRAG_STATE: 'shell:module-drag-state'` to the `SHELL_EVENTS` constant and to the `ShellEventName` union. Add `ModuleDragStatePayload` interface: `state: 'drag-start' | 'drag-end' | 'dropped'`, `previewMode: 'collapsed'`, plus `moduleType`, `instanceId`, `schemaVersion`.

The current implementation instead added `dragState?` and `previewMode?` as optional fields on `ModuleStatePayload` and did **not** introduce a new `shell:module-drag-state` event or `ModuleDragStatePayload`. This is a material deviation from the task requirements and is outside the scope of simplification. It should be resolved by the Plan Agent / Code Reviewer before finalization.

The simplifications below assume the current optional-fields approach remains; they are localized to `src/dtos/shell-payload-dtos.ts` and `test/validate-payload.spec.ts`.

## Findings

### 1. `src/dtos/shell-payload-dtos.ts` — Reuse type aliases instead of repeating literal unions

The DTO currently repeats the `'drag-start' | 'drag-end' | 'dropped'` and `'collapsed'` literals even though `ModuleDragState` and `ModulePreviewMode` already exist in `src/types.ts`. Importing those types removes duplication and keeps the source of truth in one place.

**Current:**

```ts
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ModuleIdentityDto,
  SchemaVersionDto,
} from './module-identity-dto.js';

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

**Simplified:**

```ts
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import type { ModuleDragState, ModulePreviewMode } from '../types.js';
import {
  ModuleIdentityDto,
  SchemaVersionDto,
} from './module-identity-dto.js';

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
  dragState?: ModuleDragState;

  @IsOptional()
  @IsIn(PREVIEW_MODES)
  previewMode?: ModulePreviewMode;
}
```

**Rationale:** Avoids duplicating literal unions between `src/types.ts` and the DTO. The runtime arrays (`DRAG_STATES`, `PREVIEW_MODES`) remain for `class-validator`; the compile-time type is now a single source of truth.

### 2. `test/validate-payload.spec.ts` — Use parameterized tests for lifecycle / invalid values

The drag-state tests manually loop over valid values and duplicate nearly identical invalid-value tests. Vitest's `it.each` collapses these into concise, table-driven cases that are easier to extend.

**Current:**

```ts
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

  // ...

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
```

**Simplified:**

```ts
  it.each(['drag-start', 'drag-end', 'dropped'])(
    'accepts dragState "%s" (V-9/V-11)',
    (dragState) => {
      expect(() =>
        assertShellPayload(SHELL_EVENTS.MODULE_STATE, {
          ...validModuleState(),
          dragState,
        }),
      ).not.toThrow();
    },
  );

  it('accepts a valid previewMode (V-10)', () => {
    expect(() =>
      assertShellPayload(SHELL_EVENTS.MODULE_STATE, {
        ...validModuleState(),
        previewMode: 'collapsed',
      }),
    ).not.toThrow();
  });

  // ...

  it.each([
    { field: 'dragState', value: 'dragging' },
    { field: 'previewMode', value: 'expanded' },
  ])('rejects invalid $field "$value"', ({ field, value }) => {
    const error = captureError(() =>
      assertShellPayload(SHELL_EVENTS.MODULE_STATE, {
        ...validModuleState(),
        [field]: value,
      } as never),
    );
    expectErrorProperty(error, field);
  });
```

**Rationale:** Removes the manual `for...of` loop and collapses the two near-identical invalid-value tests into one parameterized table. New values only require adding a row to the array.

## Rule Compliance Check

| Rule | Status | Notes |
| --- | --- | --- |
| max-lines-per-file | Pass | `src/payloads.ts` (~136 lines), `src/dtos/shell-payload-dtos.ts` (~50 lines), `test/validate-payload.spec.ts` (~100 lines). All under 200. |
| max-lines-per-method | Pass | All methods/functions are short. |
| max-depth | Pass | No nesting beyond 2 levels. |
| max-args-per-method | Pass | No function exceeds 2 parameters. |
| prefer-private-members | N/A | Interfaces and DTO public decorators require public fields. |
| self-documenting-code | Pass | Names are descriptive; JSDoc is minimal. |
| no-commented-code | Pass | No commented-out code. |
| single-section-boolean-conditions | N/A | No complex boolean conditions. |

## Files with No Simplifications Needed

- `src/types.ts` — Clean, minimal additions; no duplication.
- `src/payloads.ts` — Clear field additions; no simplification opportunities.
- `docs/USAGE.md` — Documentation is complete and well-structured.
- `CHANGELOG.md` — Standard, clear changelog entry.

## Summary

Two minor simplifications were identified:

1. Import `ModuleDragState` / `ModulePreviewMode` types into `src/dtos/shell-payload-dtos.ts` to avoid repeating literal unions.
2. Convert drag/preview tests in `test/validate-payload.spec.ts` to parameterized `it.each` cases.

Additionally, the implementation deviates from the TODO by adding optional fields to `shell:module-state` instead of introducing a new `shell:module-drag-state` event and `ModuleDragStatePayload`. This should be reconciled before the task is considered complete.
