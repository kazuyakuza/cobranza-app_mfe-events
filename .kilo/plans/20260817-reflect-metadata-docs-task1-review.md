# Code Review Report — Task 1: Improve `reflect-metadata` Consumer Documentation

**Review date:** 2026-08-17  
**Branch reviewed:** `feat/reflect-metadata-docs`  
**Scope:** README.md, docs/USAGE.md, docs/examples/*.md, docs/troubleshooting.md, src/create-event.ts, package.json, .agent/project-structure.md  
**Reference plan:** `.kilo/plans/20260817-reflect-metadata-docs-task1.md`  
**TODO source:** `.agent/todos/20260817/20260817-todo-0.md`

---

## Summary

Implementation closely follows the approved plan and TODO wording. All required sections, example files, JSDoc updates, and `package.json` peer-dependency changes are present and technically correct. Type-checking and the full Vitest suite pass.

One minor Markdown formatting defect was found in `docs/troubleshooting.md` that will corrupt the table row rendering. A fix plan is provided below.

---

## 1. Deviations from plan / TODO

No structural or wording deviations detected. All planned changes are present:

- `README.md` has the new `## Runtime Setup` section in the correct location (between Installation and Quick Usage), TOC entry added, and Documentation links updated.
- `docs/USAGE.md` §2.5 uses the dual-path (Angular scripts vs Node/test import) instructions and links to the example/troubleshooting files.
- `docs/examples/angular-setup.md`, `vitest-setup.md`, and `jest-setup.md` were created with the planned content and cross-links.
- `docs/troubleshooting.md` contains the three-error table, checklist, and see-also links.
- `src/create-event.ts` file-level and per-function JSDoc no longer recommends unconditional `import 'reflect-metadata'` for ESM consumers.
- `package.json` moved `reflect-metadata` from `dependencies` to `peerDependencies` + `peerDependenciesMeta` (`optional: false`) and added it to `devDependencies` for local development.
- `.agent/project-structure.md` registers `docs/examples/`.

## 2. Technical accuracy

- The documentation correctly distinguishes Angular/esbuild/global-script loading from Node/test direct-import loading.
- No remaining recommendation to use `import 'reflect-metadata';` in Angular `src/main.ts` or other ESM entries.
- Peer-dependency range `^0.1.12 || ^0.2.0` matches the TODO.

## 3. Links and cross-references

All relative links resolve correctly from their containing directories:

- From repo root (`README.md`): `docs/examples/`, `docs/troubleshooting.md`
- From `docs/` (`USAGE.md`, `troubleshooting.md`): `examples/`, `troubleshooting.md`, `../README.md#runtime-setup`, `../USAGE.md#25-helpers`
- From `docs/examples/*.md`: `../../README.md#runtime-setup`, `../USAGE.md#25-helpers`, `../troubleshooting.md`

## 4. `package.json` correctness

- `reflect-metadata` removed from `dependencies`.
- `peerDependencies` and `peerDependenciesMeta` correctly placed between `dependencies` and `devDependencies`.
- `reflect-metadata` added to `devDependencies` with the exact pinned version `0.2.2` to satisfy the required peer locally.
- `package-lock.json` is in sync (`reflect-metadata` marked `"dev": true`, peer metadata present).

## 5. Git status

`git status --short` shows only the untracked reference plan file:

```
?? .kilo/plans/20260817-reflect-metadata-docs-task1.md
```

All implementation changes are committed. No unintended staged files or `.gitignore` violations. `dist/` remains gitignored.

## 6. Verification results

- `npm run typecheck`: passed.
- `npm test`: 41 tests passed.

(`dist/create-event.d.ts` was regenerated with the updated JSDoc; it is gitignored and not staged.)

---

## Fix plan

**File:** `docs/troubleshooting.md`  
**Line:** 11 (inside the `class-validator` / `class-transformer` errors row)  
**Issue:** Stray backtick after `decorator` creates an unpaired code-span delimiter, which will break Markdown rendering of the table row.

**Current text:**

```markdown
| `class-validator` / `class-transformer` errors in unit tests (`Validation failed`, `isClassValidator` not a decorator`, empty `errors[]`) | `reflect-metadata` not loaded in the test environment. | Add `reflect-metadata` to the test runner's `setupFiles`. See [examples/vitest-setup.md](examples/vitest-setup.md) / [examples/jest-setup.md](examples/jest-setup.md). |
```

**Required change:** Remove the backtick immediately after `decorator`.

```markdown
| `class-validator` / `class-transformer` errors in unit tests (`Validation failed`, `isClassValidator` not a decorator, empty `errors[]`) | `reflect-metadata` not loaded in the test environment. | Add `reflect-metadata` to the test runner's `setupFiles`. See [examples/vitest-setup.md](examples/vitest-setup.md) / [examples/jest-setup.md](examples/jest-setup.md). |
```

This is a formatting-only fix; no semantic content changes.
