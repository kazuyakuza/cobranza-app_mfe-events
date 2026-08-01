# Global Plan — Project Scaffold & Package Bootstrap

**TODO file:** `.agent/todos/20260631/20260631-todo-1.md`  
**Date:** 2026-08-01  
**Branch:** `feat/project-scaffold-package-bootstrap`

---

## Global Pre-Analysis

**Project state:**
- `src/` contains only `.gitkeep`.
- No `package.json`, `tsconfig.json`, or lockfile exists.
- `.gitignore` already covers `node_modules/`, `dist/`, env files, IDE files.
- `.nvmrc` pins Node `22.22.3`.
- `README.md` already authored with project overview.
- Repo is on `main`, up to date with `origin/main`.

**Technical decisions:**
- **Build tool:** plain `tsc` (simplest, meets "prefer a simple build" constraint; emits ESM + `.d.ts` without extra bundler complexity).
- **Module system:** ESM-first (`"type": "module"`).
- **Package manager:** `npm` (universal; no lockfile present yet; can switch later if sibling packages use pnpm).
- **TypeScript target:** `ES2022` (modern browsers + Angular 22 consumers).
- **Strictness:** `strict: true`, `declaration: true`, `declarationMap: true`.
- **Public surface:** single entry `src/public-api.ts` (secondary subpath entries deferred to v2).
- **Placeholder policy:** empty modules that compile cleanly; no fake API surface. A harmless `SCHEMA_VERSION = 1` constant is acceptable only if `tsc` rejects completely empty modules. If `tsc` accepts empty modules, keep them truly empty.

**Constraints in force:**
- No Angular, no RxJS, no event-bus class, no services.
- No domain event implementation yet (`MFE_EVENTS`, payloads, helpers deferred to next TODO).
- `tsc --noEmit` must succeed on minimal sources.
- `npm run build` must produce `dist/` with `.js` + `.d.ts` for the public entry.

---

## Task 1 — Project Scaffold & Package Bootstrap

### Pre-Analysis

This is the foundational setup task. It establishes the package identity, TypeScript configuration, minimal source layout, build scripts, and entry points so that subsequent TODOs can add real event constants, payloads, and helpers onto a working, buildable base.

**Is front-end related?** No — this is a TypeScript library package with no UI runtime.

**Risk:**
- If `tsc` emits to the wrong directory or omits `.d.ts`, consumers cannot import types.
- If `package.json` `exports` / `types` fields are misaligned, bundlers/IDEs resolve the package incorrectly.

**Mitigation:**
- Verify `npm run build` output: `dist/public-api.js` and `dist/public-api.d.ts` must exist.
- Verify `npm run typecheck` exits 0.
- Verify `node -e "import('./dist/public-api.js')"` loads without error.

---

### Steps

#### Step 2 — Git Feature Branch Setup
**Sub-agent:** `implementer`
- Commit the untracked TODO file with message `chore: add TODO-01 project scaffold`.
- Create and switch to branch `feat/project-scaffold-package-bootstrap`.

#### Step 3 — Version Update
**Sub-agent:** `implementer`
- No existing version to bump; initial version will be set to `0.1.0` in `package.json` during implementation.
- No separate version-bump commit needed (it will be part of the initial `package.json` creation).

#### Task 1: 4.1b — Analysis & Planning
**Sub-agent:** `architector`
- Research the exact `tsc` compiler options needed for an ESM library with declaration maps.
- Confirm empty modules compile under `strict: true` (if not, plan for a minimal placeholder export).
- Produce implementation plan with exact file contents and directory structure.
- Save per-task plan to `.kilo/plans/20260801-project-scaffold-and-package-bootstrap-task1.md`.
- Return plan path.

*(No 4.1a because this is not a front-end task.)*

#### Task 1: 4.2 — Implementation
**Sub-agent:** `implementer`
- Follow the per-task plan from 4.1b exactly.
- Create/modify files in this order:
  1. `package.json` — identity, scripts, exports, engine fields.
  2. `tsconfig.json` — library compiler options.
  3. `src/events.ts` — placeholder (empty or minimal).
  4. `src/payloads.ts` — placeholder.
  5. `src/types.ts` — placeholder.
  6. `src/helpers.ts` — placeholder.
  7. `src/index.ts` — internal barrel re-exporting public symbols.
  8. `src/public-api.ts` — single public entry.
  9. `.gitignore` — verify `node_modules/`, `dist/`, coverage, editor files are covered; add any missing patterns.
  10. Run `npm install` (or `npm ci` if lockfile exists after package.json creation).
  11. Run `npm run typecheck` — must pass.
  12. Run `npm run build` — must produce `dist/public-api.js` + `dist/public-api.d.ts`.
- Commit after each logical file group with meaningful messages.

#### Task 1: 4.3 — Code Review & Simplification
**Sub-agents:** `code-reviewer` + `code-simplifier` (concurrent)
- Review for:
  - Correctness of `package.json` fields (`name`, `exports`, `types`, `sideEffects`).
  - `tsconfig.json` does not include Angular compiler options.
  - No commented-out code.
  - Self-documenting code / clear naming.
  - No more than 2 args per method, max depth 2 (even in placeholders).
  - Max 200 lines per file, max 50 lines per method body.
- Generate fix/simplification plan; save to `.kilo/plans/20260801-project-scaffold-and-package-bootstrap-task1-review.md`.

**4.3-fix:**
**Sub-agent:** `implementer`
- Apply fix/simplification plan.
- Commit changes.

#### Task 1: 4.4 — Documentation
**Sub-agent:** `docs-specialist`
- Add JSDoc comments to any placeholder exports (if non-empty).
- Update `README.md` build/test instructions if needed.
- Ensure `docs/` has no stale placeholders.

#### Task 1: 4.5b — Overall Plan Adherence
**Sub-agent:** `architector`
- Check that implementation matches the per-task plan.
- Verify:
  - `npm run typecheck` passes.
  - `npm run build` produces `dist/` with `.js` + `.d.ts`.
  - `package.json` name is exactly `@cobranza-apps/mfe-events`.
  - `tsconfig.json` targets ES2022, `strict: true`, no Angular options.
  - `.gitignore` covers `dist/` and `node_modules/`.
- Report any deviation; if unacceptable, propose fix TODO.

#### Task 1: 4.6 — Task Completion
**Sub-agent:** `implementer`
- Add `[DONE]` to Task 1 title in TODO file.
- Mark all sub-items `[x]`.
- Commit with message `chore: mark TODO-01 project scaffold as done`.

#### Step 5 — TODO File Completion
**Sub-agent:** `implementer`
- Rename TODO file to `20260631-todo-1-DONE.md`.
- Ensure all files are committed in feature branch.
- Switch to `main`, merge `feat/project-scaffold-package-bootstrap`.
- On success: delete feature branch.
- Push `main` to `origin` ONLY.

#### Step 6 — Continuation
- Signal user to proceed with next TODO if any exist.

---

## Approval

Present this global plan to the user for approval. After approval, delegate each step via the `task` tool.
