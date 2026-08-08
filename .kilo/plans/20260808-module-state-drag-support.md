# Global Plan — Add drag-state to `shell:module-state` event

**Date**: 2026-08-08  
**Source**: `.agent/todos/20260808/20260808-todo-0.md`  
**Branch**: `feat/module-state-drag-support`

## Decision

Instead of creating a separate `shell:module-drag-state` event as proposed in the TODO, we will **expand the existing `shell:module-state` event** to carry drag-and-drop state. Rationale:

- Drag state is fundamentally a module-state concern (the module's current condition in the workbench).
- Keeps the event surface smaller — MFEs listen to one event instead of two.
- Avoids race conditions between separate `module-state` and `module-drag-state` broadcasts.
- New fields will be **optional** (`dragState?`, `previewMode?`) to preserve backward compatibility with existing Shell/MFE implementations.

## Pre-analysis

- **Project**: `@cobranza-apps/mfe-events` — a shared event-contract library between Shell and MFEs.
- **Current version**: `0.3.3` (patch bump not sufficient; this is a backward-compatible feature addition → **minor bump to 0.4.0**).
- **Front-end related**: Yes — this is a front-end event contract library.
- **Testing**: Vitest test suite exists; new DTO fields need validator tests.
- **Documentation**: `docs/USAGE.md` must be updated; no `CHANGELOG.md` exists yet — will create one.

## Files to touch

| File | Change |
|------|--------|
| `src/payloads.ts` | Add `dragState?: 'drag-start' \| 'drag-end' \| 'dropped'` and `previewMode?: 'collapsed'` to `ModuleStatePayload` interface |
| `src/dtos/shell-payload-dtos.ts` | Add `@IsOptional() @IsIn(...)` decorators for `dragState` and `previewMode` on `ModuleStateDto` |
| `src/types.ts` | Export `ModuleDragState` and `ModulePreviewMode` literal unions (reused by payload interface and DTO) |
| `src/dtos/payload-dto-registry.ts` | No change needed — `ModuleStateDto` is already registered under `SHELL_EVENTS.MODULE_STATE` |
| `docs/USAGE.md` | Update §2.3 event catalog description, §2.4 `ModuleStatePayload` reference, and §2.6 copy-paste snippet F |
| `CHANGELOG.md` | Create with v0.4.0 entry describing the new fields |
| `package.json` | Bump version to `0.4.0` |

## Critical Workflow Steps

### Step 2 — Git Feature Branch Setup
- Commit any unstaged work on current branch.
- Switch to `main`, create branch `feat/module-state-drag-support`.

### Step 3 — Version Update
- Bump `package.json` version to `0.4.0`.
- Commit: `chore: bump version to 0.4.0`.

### Step 4 — Task Execution (single task from TODO)

#### 4.1a — Front-end Technical Specification
- **Sub-agent**: `frontend-specialist`
- Produce `docs/module-state-drag-spec.md` describing the new fields, their semantics, and consumer patterns.

#### 4.1b — Analysis & Planning
- **Sub-agent**: `architector`
- Read front-end spec from 4.1a.
- Produce detailed per-file plan `.kilo/plans/20260808-module-state-drag-support.md`.

#### 4.2 — Implementation
- **Sub-agent**: `implementer`
- Follow the architector plan; modify `src/types.ts`, `src/payloads.ts`, `src/dtos/shell-payload-dtos.ts`, `docs/USAGE.md`, create `CHANGELOG.md`, bump version.
- Commit incrementally with meaningful messages.

#### 4.3 — Code Review & Simplification
- **Sub-agents**: `code-reviewer` + `code-simplifier`
- Review for correctness, backward compatibility, and code simplicity.
- Save findings/fix plan; implementer applies fixes.

#### 4.4 — Documentation
- **Sub-agent**: `docs-specialist`
- Verify `docs/USAGE.md` and `CHANGELOG.md` are accurate and complete.
- Add JSDoc to new types and fields.

#### 4.5a — Front-end Verification
- **Sub-agent**: `frontend-specialist`
- Verify spec adherence; confirm no breaking changes to existing consumers.

#### 4.5b — Overall Plan Adherence
- **Sub-agent**: `architector`
- Check implementation matches plan; flag deviations.

#### 4.6 — Task Completion
- **Sub-agent**: `implementer`
- Mark `[DONE]` in TODO file, commit.

### Step 5 — TODO File Completion
- Rename TODO to `20260808-todo-0-DONE.md`.
- Merge `feat/module-state-drag-support` into `main`.
- Push `main` to `origin` (if remote configured).

## Tradeoffs Considered

| Approach | Pros | Cons |
|----------|------|------|
| **A. Expand `module-state`** (chosen) | Single event, simpler listeners, backward compatible via optional fields | Payload grows slightly; consumers receive drag updates even if they only care about size |
| **B. New `module-drag-state` event** | Clean separation, consumers can subscribe only to drag changes | More events to manage; potential ordering issues with `module-state` |

The optional-field approach on `module-state` is the pragmatic choice for a library that values a minimal, stable contract surface.
