# Global Plan — TODO 03: Helpers & Runtime Validation

**TODO file:** `.agent/todos/20260801/20260801-todo-0.md`  
**Plan file:** `.kilo/plans/20260801-todo-03-helpers-validation.md`  
**Date:** 2026-08-01

---

## 0. Pre-Analysis & Technical Decisions

**Current project state:**
- `src/payloads.ts`, `src/types.ts`, `src/events.ts` exist with full interfaces/constants.
- `src/helpers.ts` is empty (JSDoc header only).
- No test infrastructure exists (no test runner, no spec files).
- `package.json` has no `class-validator` / `class-transformer`.
- `tsconfig.json` does not have `experimentalDecorators` enabled.

**Architecture decisions:**
- **Public interfaces stay interfaces.** DTO classes are internal validation-only artifacts. This keeps the public API surface clean and JSON-serializable contract explicit.
- **Validation path:** `plainToInstance(DtoClass, detail)` → `validateSync(instance)` → throw `MfeEventValidationError` on failure.
- **Schema version check:** done before class-validator, as a fast-fail guard.
- **Type guards (`isMfeEvent` / `isShellEvent`):** cheap runtime checks only (`instanceof CustomEvent` + `type ===`), no payload re-validation.
- **Dispatch helpers:** delegate to `create*` + `target.dispatchEvent`; default target is `window` with guard for non-browser contexts.
- **Standalone assert exports:** `assertMfePayload` / `assertShellPayload` (throwing) to allow Shell/MFE pre-checks without constructing a `CustomEvent`.

**Test runner decision:**
- **Vitest** — ESM-native, minimal config, aligns with project's `"type": "module"` and Node 22 target. Single `vitest.config.ts` file.

**Dependency decisions:**
- `class-validator` + `class-transformer` + `reflect-metadata` as **dependencies** (not peerDependencies) so validation works out of the box.
- `reflect-metadata` documented as consumer responsibility to import once at app entry; library entry does NOT import it to avoid global side effects.
- `vitest` as devDependency.

**tsconfig changes:**
- Add `"experimentalDecorators": true` (required for `class-validator` decorators).
- `emitDecoratorMetadata` is **not** required because we use explicit decorators (`@IsString`, `@IsOptional`, etc.) rather than implicit type metadata.

**Max lines / depth constraints:**
- DTOs: one file per payload family or a single `dtos.ts` file. If `dtos.ts` exceeds 200 lines, split into `dtos/mfe-payloads.ts` and `dtos/shell-payloads.ts`.
- Helpers: `src/helpers.ts` may exceed 200 lines with all functions + JSDoc; if so, split into `src/helpers/create.ts`, `src/helpers/guards.ts`, `src/helpers/dispatch.ts`.
- Error class: own file `src/validation-error.ts`.
- Each function body must stay under 50 lines.

---

## Global Plan Steps

### Step 2: Git Feature Branch Setup
**Agent:** implementer  
**Scope:**
1. Commit the unstaged TODO file change (`20260801-todo-0.md`) with message like `docs: add TODO 03 helpers & runtime validation`.
2. Switch to `main`, create branch `feat/todo-03-helpers-validation`.
3. Switch to new branch.

### Step 3: Version Update
**Agent:** implementer  
**Scope:**
- Increment `package.json` version from `0.2.0` → `0.3.0` (minor bump: new features/helpers added).
- Commit: `chore: bump version to 0.3.0`.

### Task: 4.1b Analysis & Planning
**Agent:** architector  
**Scope:**
- Research exact versions of `class-validator`, `class-transformer`, `reflect-metadata` compatible with TypeScript 5.8 + ESM.
- Decide file split strategy for DTOs/helpers based on line-count constraints.
- Produce detailed per-file implementation plan with exact paths, function signatures, validation rules per DTO, and test cases.
- Save plan to `.kilo/plans/20260801-todo-03-helpers-validation-task.md`.
- Return plan path.

### Task: 4.2 Implementation
**Agent:** implementer  
**Scope:**
Follow the plan from 4.1b. Key deliverables:
1. **Dependencies:** add `class-validator`, `class-transformer`, `reflect-metadata` to `dependencies`; add `vitest` to `devDependencies`.
2. **tsconfig:** add `experimentalDecorators: true`.
3. **Test config:** create `vitest.config.ts` (or `.js`) with minimal ESM setup.
4. **Scripts:** add `test` script to `package.json`.
5. **Validation error:** create `src/validation-error.ts` with `MfeEventValidationError`.
6. **DTOs:** create internal DTO classes (e.g., `src/dtos.ts` or split) mirroring every payload interface with `class-validator` decorators.
7. **Core validator:** create internal `validatePayload` function that checks schema version + runs `class-validator`.
8. **Helpers:** implement `createMfeEvent`, `createShellEvent`, `isMfeEvent`, `isShellEvent`, `dispatchMfeEvent`, `dispatchShellEvent` in `src/helpers.ts` (or split files).
9. **Assert exports:** implement `assertMfePayload` / `assertShellPayload` (or `validateMfePayload` result-object style — pick one).
10. **Public API wiring:** re-export new symbols from `src/index.ts` and `src/public-api.ts`.
11. **Unit tests:** create `src/helpers.spec.ts` covering all test cases from TODO task 8.
12. **Build/typecheck/test:** run `npm run typecheck`, `npm run build`, `npm run test` — all must pass.
13. **Commit:** meaningful commits per logical chunk.

### Task: 4.3 Code Review & Simplification
**Agents:** code-reviewer + code-simplifier (concurrent)  
**Scope:**
- Review implementation against the plan from 4.1b.
- Check for: validation correctness, error messages, type safety, test coverage, rule compliance (max lines, max depth, max args).
- Generate fix plan and simplification plan; save to `.kilo/plans/20260801-todo-03-helpers-validation-task.md` (append or new file).

**Agent:** implementer (4.3-fix)  
**Scope:**
- Apply fixes and simplifications from review.
- Re-run `npm run typecheck`, `npm run build`, `npm run test`.
- Commit.

### Task: 4.4 Documentation
**Agent:** docs-specialist  
**Scope:**
- Add JSDoc to every new public export (`createMfeEvent`, `createShellEvent`, `isMfeEvent`, `isShellEvent`, `dispatchMfeEvent`, `dispatchShellEvent`, `MfeEventValidationError`, assert/validate helpers).
- Include `@throws` tags, `@param` descriptions, minimal copy-paste examples.
- Add inline comment about `reflect-metadata` consumer requirement.
- Update `src/index.ts` barrel JSDoc if needed.

### Task: 4.5b Overall Plan Adherence
**Agent:** architector  
**Scope:**
- Verify implementation matches the 4.1b plan.
- Check that public interfaces were NOT converted to classes.
- Check that DTOs are NOT exported from `public-api.ts`.
- Check that `reflect-metadata` is NOT imported in library entry.
- Check that all TODO task 8 tests exist and pass.
- Report any deviations; if unacceptable, propose fixes.

### Task: 4.6 Task Completion
**Agent:** implementer  
**Scope:**
1. Mark all TODO tasks with `[DONE]` (append to each `### Heading` or checkboxes as appropriate).
2. Preserve original file content; only add marks.
3. Commit: `chore: mark TODO 03 tasks as done`.

### Step 5: TODO File Completion
**Agent:** implementer  
**Scope:**
1. Ensure all files are committed in `feat/todo-03-helpers-validation`.
2. Switch to `main`.
3. Merge `feat/todo-03-helpers-validation`.
4. On success: delete feature branch.
5. Push `main` to `origin` only.
6. Rename TODO file to `.agent/todos/20260801/20260801-todo-0-DONE.md`.

---

## Notes

- This task is **not front-end related** (pure TypeScript library helpers). Skip 4.1a and 4.5a.
- The TODO file does NOT contain "Don't request me to approve plans". User approval required before executing 4.1b onward.
- Max review cycles for 4.3: 3. Escalate to user if unresolved after 3 cycles.
