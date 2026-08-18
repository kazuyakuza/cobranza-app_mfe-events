# Global Plan — 20260817-todo-0.md

## Pre-analysis

**Task type:** Documentation + `package.json` update. Not front-end related.
**Scope:** No source code logic changes; only docs, examples, JSDoc, and `peerDependencies`.
**Key files to touch:**
- `README.md` — add "Runtime Setup" section before "Quick Usage"
- `docs/USAGE.md` — rewrite §2.5 `reflect-metadata` guidance with dual-path (Angular scripts vs Node import)
- `docs/examples/angular-setup.md` — NEW
- `docs/examples/vitest-setup.md` — NEW
- `docs/examples/jest-setup.md` — NEW
- `src/create-event.ts` — update file-level and function-level JSDoc to stop recommending `import 'reflect-metadata'` for ESM consumers
- `package.json` — add `peerDependencies` + `peerDependenciesMeta` for `reflect-metadata`

**Project context:**
- Version `0.4.0`, plain `tsc` build, Vitest tests.
- `reflect-metadata` is currently in `dependencies` (bundled). Moving to `peerDependencies` is a semver minor change (consumer-visible requirement change, not breaking if they already load it).
- Shell project (`cobranza-shell`) already uses `angular.json` scripts array for browser and Vitest `setupFiles` for tests — verified working.

---

## Task 1: Consumer Documentation for reflect-metadata

### 4.1b Analysis & Planning
- Review current README/USAGE.md/create-event.ts for exact insertion points.
- Decide on `docs/examples/` folder structure (new folder under `docs/`).
- Confirm `reflect-metadata` peer dep semver range (`^0.1.12 || ^0.2.0`).
- Plan troubleshooting table content.

### 4.2 Implementation
- Insert "Runtime Setup" into README.md before "Quick Usage".
- Rewrite USAGE.md §2.5 with ESM-safe + Node-safe dual paths.
- Create three example files with copy-paste snippets.
- Update `src/create-event.ts` JSDoc (file header + both function docs).
- Add `peerDependencies` block to `package.json`.
- Ensure `docs/examples/` is referenced from README/USAGE.md.

### 4.3 Code Review & Simplification
- Review docs for clarity, accuracy, and consistency with Shell project setup.
- Simplify where possible (avoid duplication between README and USAGE).

### 4.4 Documentation
- JSDoc updates in `create-event.ts` are part of 4.2.
- Ensure new example files have front-matter / headers consistent with existing docs style.

### 4.5b Overall Plan Adherence
- Verify all acceptance criteria from TODO are met.
- Check that no `import 'reflect-metadata'` is recommended for ESM/Angular consumers.

### 4.6 Task Completion
- Mark Task 1 as `[DONE]` in TODO file.

---

## Task 2: Peer Dependency Declaration

This is extremely short and related to Task 1. It will be merged into Task 1's implementation step (updating `package.json`) rather than having a separate 4.x cycle.

---

## Step 2: Git Feature Branch Setup
- Create `feat/reflect-metadata-docs` from `main`.

## Step 3: Version Update
- Bump `0.4.0` → `0.5.0` (minor: new consumer-facing docs + peer dependency declaration is a feature-level improvement).

## Step 5: TODO File Completion
- Rename `20260817-todo-0.md` → `20260817-todo-0-DONE.md`.
- Merge branch, push to `origin`.
