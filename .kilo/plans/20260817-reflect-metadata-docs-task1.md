# Plan — Task 1: Improve `reflect-metadata` Consumer Documentation

- **TODO:** `.agent/todos/20260817/20260817-todo-0.md` (Task 1 + Task 2 peer-dep)
- **Plan file:** `.kilo/plans/20260817-reflect-metadata-docs-task1.md`
- **Scope:** Documentation + `package.json` peer-dep declaration. **No library source-code behavior change.** No changelog edit (handled in Step 3).
- **Branch:** already on `feat/*` from Step 2 of the Critical Workflow. Implementer must `git status`/commit between sub-steps.
- **Not front-end** task: no 4.1a/4.5a.

## Pre-Analysis & Technical Decisions

### Current State (verified)

| Item | State |
| --- | --- |
| `README.md` | TOC lines 5–15; `## Quick Usage` at line 41; no "Runtime Setup" section. |
| `docs/USAGE.md` | TOC lines 8–18; `### 2.5 Helpers` at line 132; `reflect-metadata` bullet at lines 139–145 (recommends `import 'reflect-metadata'` unconditionally). |
| `src/create-event.ts` | File-level JSDoc lines 1–17 recommends `import 'reflect-metadata';` at app entry (ESM-unsafe). `createMfeEvent` JSDoc lines 27–43; `createShellEvent` JSDoc lines 51–65 — neither mentions `reflect-metadata`. |
| `package.json` | `version: 0.5.0`; `reflect-metadata: 0.2.2` listed in `dependencies` (line 30); **no** `peerDependencies` / `peerDependenciesMeta`. |
| `docs/examples/` | **Does not exist** — must be created. |
| `docs/` contents | `anti-patterns.md`, `how-to-set-up-git.md`, `how-to-write-todo-files.md`, `USAGE.md`. |

### Decisions

1. **Troubleshooting location:** New file `docs/troubleshooting.md` (keeps README focused; linked from README `## Documentation` and USAGE `## See also`). Acceptance criteria only requires the three-error table to exist — placing it in `docs/` satisfies it and is consistent with the docs-heavy library style.
2. **`reflect-metadata` dependency placement:** Move `reflect-metadata` **out of `dependencies`** and into `peerDependencies` + `peerDependenciesMeta` (required, not optional). Rationale:
   - The library never imports `reflect-metadata` itself (`sideEffects: false`, consumer loads it).
   - Declaring it as both a hard `dependency` AND a required `peerDependencies` entry is contradictory and breaks dedupe / install-time peer warnings.
   - The TODO Task 2 explicitly asks for `peerDependencies` with `optional: false`.
   - Keep `class-transformer` and `class-validator` in `dependencies` (the library imports them).
3. **`src/create-event.ts` vs `.d.ts`:** TODO mentions `create-event.d.ts`; that is the `tsc`-generated output. The JSDoc source of truth is `src/create-event.ts`. Edit the `.ts` file; the `.d.ts` regenerates on `npm run build`. Plan does **not** hand-edit `.d.ts`.
4. **README "Runtime Setup" placement:** Insert as a new `## Runtime Setup` section **between** `## Installation` (ends line 39) and `## Quick Usage` (line 41), and add a TOC entry between `Installation` and `Quick Usage`.
5. **USAGE.md §2.5:** Keep the `### 2.5 Helpers` heading and the helper bullets. Replace only the `reflect-metadata` bullet (lines 139–145) with an expanded dual-path block (Angular `angular.json` scripts vs Node/test `import`). No TOC change needed (§2.5 already listed).
6. **New example files:** Self-contained markdown files with copy-paste snippets + a "Why this works" note + cross-link back to USAGE §2.5 / README Runtime Setup.
7. **Wording source of truth:** The TODO file's proposed wording (lines 75–103, 121–131, 137–141) is the canonical text. Reproduce it verbatim where given; only adjust heading levels / anchors for the target file.
8. **No code (`.ts`) behavior change in `src/create-event.ts`:** Only JSDoc comment text changes — no runtime logic touched, so existing Vitest tests remain valid; no test rewrite needed (4.5 verification still runs `npm run typecheck` + `npm test` to confirm no regression).

## High-Level Approach

1. Update `README.md`: TOC + new `## Runtime Setup` section + link to troubleshooting in `## Documentation`.
2. Update `docs/USAGE.md`: rewrite the `reflect-metadata` bullet in §2.5 with dual-path setup; add troubleshooting link to `## See also`.
3. Create `docs/examples/` folder + `angular-setup.md`, `vitest-setup.md`, `jest-setup.md`.
4. Create `docs/troubleshooting.md` with the three-error table.
5. Update `src/create-event.ts` JSDoc (file-level + `createMfeEvent` + `createShellEvent`).
6. Update `package.json`: move `reflect-metadata` from `dependencies` → `peerDependencies` + `peerDependenciesMeta`.
7. Update `.agent/project-structure.md` to register `docs/examples/`.
8. Verify: `npm run typecheck`, `npm run build` (regenerates `.d.ts` with new JSDoc), `npm test`.
9. Commit each logical change with a meaningful message on the feature branch. No push (Step 5 of Critical Workflow handles merge/push).

---

## Detailed Steps

### Step 1 — `README.md`: TOC + Runtime Setup section + Documentation link

**1.1 — Insert TOC entry.** In `README.md`, replace the TOC block (lines 7–9):

```
- [Purpose](#purpose)
- [Installation](#installation)
- [Quick Usage](#quick-usage)
```

with:

```
- [Purpose](#purpose)
- [Installation](#installation)
- [Runtime Setup](#runtime-setup)
- [Quick Usage](#quick-usage)
```

Use `vscode-mcp-server_replace_lines_code` with `startLine=7`, `endLine=9`, `originalCode` = the three original bullets, `content` = the four new bullets.

**1.2 — Insert `## Runtime Setup` section.** Insert between the end of `## Installation` (line 39, the line `No Angular peer dependency is required...`) and `## Quick Usage` (line 41). Use `vscode-mcp-server_replace_lines_code` on lines 39–41 to splice in the new section while preserving the `## Quick Usage` header.

`originalCode` (lines 39–41):

```
No Angular peer dependency is required. TypeScript 5.x and a modern browser `CustomEvent`/`window` API are the only runtime expectations.

## Quick Usage
```

`content`:

```
No Angular peer dependency is required. TypeScript 5.x and a modern browser `CustomEvent`/`window` API are the only runtime expectations.

## Runtime Setup

`@cobranza-apps/mfe-events` uses `class-validator` decorators internally. The library **does not bundle `reflect-metadata`** — you must load it in your application entry. The correct loading strategy depends on your environment.

### Angular Projects (with esbuild / Vite / Native Federation)

Add `reflect-metadata` as a global script in `angular.json` (or equivalent builder config):

```json
{
  "projects": {
    "shell": {
      "architect": {
        "build": {
          "options": {
            "scripts": [
              "node_modules/reflect-metadata/Reflect.js"
            ]
          }
        }
      }
    }
  }
}
```

Do **not** use `import 'reflect-metadata';` in `src/main.ts` — it will fail in ESM environments because `reflect-metadata` is CommonJS-only and ESM module shims cannot resolve the specifier.

### Node.js / Test Environments

Import the polyfill directly in your test setup file:

```ts
// test-setup.ts
import 'reflect-metadata';
```

Or configure your test runner (Vitest, Jest) to load it before specs — see [docs/examples/vitest-setup.md](docs/examples/vitest-setup.md) and [docs/examples/jest-setup.md](docs/examples/jest-setup.md).

### Why Two Different Ways?

`reflect-metadata` is a CommonJS package. ESM module shims (used by Native Federation, Vite dev server) cannot resolve CommonJS specifiers. The Angular application builder's `scripts` array loads it as a traditional global script before bootstrap, which works in all browser environments. In Node/test runners the CommonJS package resolves natively, so a direct `import` is fine.

> Concrete copy-paste examples: [docs/examples/angular-setup.md](docs/examples/angular-setup.md).
> Common errors and fixes: [docs/troubleshooting.md](docs/troubleshooting.md).

## Quick Usage
```

**1.3 — Add troubleshooting link in `## Documentation`.** Replace the bullet block (lines 146–150):

```
- [Quick Usage](#quick-usage) (above) — minimal dispatch + listen.
- Copy-paste examples (broadcast, filtering, multi-instance): [docs/USAGE.md](docs/USAGE.md).
- [Anti-patterns](docs/anti-patterns.md) — what NOT to do and why.
- JSDoc on every public export (event constants, payload interfaces, type maps, helpers).
- Project knowledge base: [`.agent/project-info/`](.agent/project-info/).
```

with:

```
- [Quick Usage](#quick-usage) (above) — minimal dispatch + listen.
- [Runtime Setup](#runtime-setup) (above) — loading `reflect-metadata` per environment.
- Copy-paste examples (broadcast, filtering, multi-instance): [docs/USAGE.md](docs/USAGE.md).
- Consumer setup examples (Angular / Vitest / Jest): [docs/examples/](docs/examples/).
- [Anti-patterns](docs/anti-patterns.md) — what NOT to do and why.
- [Troubleshooting](docs/troubleshooting.md) — `reflect-metadata` errors and fixes.
- JSDoc on every public export (event constants, payload interfaces, type maps, helpers).
- Project knowledge base: [`.agent/project-info/`](.agent/project-info/).
```

Commit: `docs(readme): add Runtime Setup section and troubleshooting links`.

---

### Step 2 — `docs/USAGE.md`: rewrite §2.5 reflect-metadata bullet

**2.1 — Replace the reflect-metadata bullet.** Replace lines 139–145:

```
- **`reflect-metadata` requirement** — import it **once at the app entry** before the first import of the package:

```ts
import 'reflect-metadata';
```

The library does not import it itself (avoids forcing a global side effect on every consumer); required because runtime validators use `class-validator` decorators on internal DTOs.
```

with the dual-path block:

```
- **`reflect-metadata` requirement (environment-dependent)** — the library uses `class-validator` decorators on internal DTOs and does **not** import the polyfill itself (avoids forcing a global side effect on every consumer). Load it **before the first call** to `createMfeEvent` / `createShellEvent` / `dispatch*` / `assert*`, using the strategy that matches your environment:

  - **Angular (esbuild / Vite / Native Federation):** add `reflect-metadata` to the builder `scripts` array in `angular.json` — do **not** `import 'reflect-metadata'` in `src/main.ts` (CommonJS specifier fails under ESM shims):

    ```json
    "scripts": ["node_modules/reflect-metadata/Reflect.js"]
    ```

  - **Node.js / Vitest / Jest:** import it directly in a test setup file:

    ```ts
    // test-setup.ts
    import 'reflect-metadata';
    ```

  See [docs/examples/angular-setup.md](examples/angular-setup.md), [docs/examples/vitest-setup.md](examples/vitest-setup.md), [docs/examples/jest-setup.md](examples/jest-setup.md). Common errors: [docs/troubleshooting.md](troubleshooting.md).
```

Note: relative links are `examples/...` and `troubleshooting.md` because USAGE.md lives in `docs/`.

**2.2 — Add troubleshooting link to `## See also`.** In `docs/USAGE.md`, replace lines 384–387:

```
- [`README.md`](../README.md) — overview, install, event catalog summary.
- [Anti-patterns](anti-patterns.md) — what NOT to do and why.
- [`.agent/project-info/brief.md`](../.agent/project-info/brief.md) — authoritative source of truth.
```

with:

```
- [`README.md`](../README.md) — overview, install, event catalog summary, Runtime Setup.
- [Consumer setup examples](examples/) — Angular / Vitest / Jest `reflect-metadata` loading.
- [Troubleshooting](troubleshooting.md) — `reflect-metadata` errors and fixes.
- [Anti-patterns](anti-patterns.md) — what NOT to do and why.
- [`.agent/project-info/brief.md`](../.agent/project-info/brief.md) — authoritative source of truth.
```

Commit: `docs(usage): rewrite §2.5 reflect-metadata bullet with dual-path setup`.

---

### Step 3 — Create `docs/examples/` folder + three example files

Create the folder implicitly by creating the first file (the `create_file_code` / `write` tool creates parent dirs).

**3.1 — `docs/examples/angular-setup.md`:**

```markdown
# Angular Setup — `reflect-metadata` for `@cobranza-apps/mfe-events`

`@cobranza-apps/mfe-events` relies on `class-validator` decorators, which require the `reflect-metadata` polyfill. In Angular projects using `@angular/build:application` (esbuild) or Native Federation with `es-module-shims`, `import 'reflect-metadata'` in `src/main.ts` fails with `Unable to resolve specifier 'reflect-metadata'` because the package is CommonJS-only.

## Solution — load as a global script

Add `reflect-metadata` to the `scripts` array of every relevant target in `angular.json`:

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "projects": {
    "shell": {
      "architect": {
        "build": {
          "options": {
            "scripts": [
              "node_modules/reflect-metadata/Reflect.js"
            ]
          }
        },
        "test": {
          "options": {
            "scripts": [
              "node_modules/reflect-metadata/Reflect.js"
            ]
          }
        }
      }
    }
  }
}
```

## Why this works

The Angular application builder loads entries in `scripts` as traditional global scripts before the application bootstrap. This bypasses the ESM module-shim resolver, so the CommonJS `Reflect.js` file is evaluated and `Reflect.defineMetadata` / `Reflect.getMetadata` are available on `globalThis` before any `@cobranza-apps/mfe-events` import runs.

## What NOT to do

```ts
// src/main.ts — DO NOT do this in Angular esbuild / Native Federation builds
import 'reflect-metadata'; // ❌ Unable to resolve specifier 'reflect-metadata'
import '@cobranza-apps/mfe-events';
```

## Verified example

The Shell project (`cobranza-shell`) uses this exact `angular.json` `scripts` entry and loads `@cobranza-apps/mfe-events` successfully in dev, build, and production.

## See also

- [README §Runtime Setup](../../README.md#runtime-setup)
- [USAGE.md §2.5 Helpers](../USAGE.md#25-helpers)
- [Troubleshooting](../troubleshooting.md)
```

**3.2 — `docs/examples/vitest-setup.md`:**

```markdown
# Vitest Setup — `reflect-metadata` for `@cobranza-apps/mfe-events`

In Node-based test runners (Vitest), `reflect-metadata` resolves natively as a CommonJS package, so a direct `import` is the correct strategy.

## 1. Install the polyfill (peer dependency)

```bash
npm install reflect-metadata
# or
pnpm add reflect-metadata
```

## 2. Create a setup file

```ts
// src/test/reflect-metadata-setup.ts
import 'reflect-metadata';
```

## 3. Reference it from `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['src/test/reflect-metadata-setup.ts'],
  },
});
```

## Why this works

Vitest's Node environment resolves the CommonJS `node_modules/reflect-metadata` package natively. The setup file runs once before any spec file imports `@cobranza-apps/mfe-events`.

## See also

- [README §Runtime Setup](../../README.md#runtime-setup)
- [USAGE.md §2.5 Helpers](../USAGE.md#25-helpers)
- [Troubleshooting](../troubleshooting.md)
```

**3.3 — `docs/examples/jest-setup.md`:**

```markdown
# Jest Setup — `reflect-metadata` for `@cobranza-apps/mfe-events`

In Jest (Node environment), `reflect-metadata` resolves natively as a CommonJS package, so a direct `import` (or `require`) in the setup file is the correct strategy.

## 1. Install the polyfill (peer dependency)

```bash
npm install reflect-metadata
# or
pnpm add reflect-metadata
```

## 2. Create a setup file

```ts
// test/setup-reflect-metadata.ts
import 'reflect-metadata';
```

For CommonJS Jest configs:

```js
// test/setup-reflect-metadata.js
require('reflect-metadata');
```

## 3. Reference it from `jest.config.js`

```js
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/test/setup-reflect-metadata.js'],
};
```

Or, with `ts-jest` / `@swc/jest`, point to the `.ts` variant:

```js
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/test/setup-reflect-metadata.ts'],
};
```

## Why this works

Jest's Node environment resolves the CommonJS `node_modules/reflect-metadata` package natively. `setupFiles` run once before any test file imports `@cobranza-apps/mfe-events`.

## See also

- [README §Runtime Setup](../../README.md#runtime-setup)
- [USAGE.md §2.5 Helpers](../USAGE.md#25-helpers)
- [Troubleshooting](../troubleshooting.md)
```

Commit: `docs(examples): add Angular, Vitest, Jest reflect-metadata setup guides`.

---

### Step 4 — Create `docs/troubleshooting.md`

```markdown
# Troubleshooting — `@cobranza-apps/mfe-events` / `reflect-metadata`

`@cobranza-apps/mfe-events` uses `class-validator` decorators on internal DTOs. `class-validator` needs the `reflect-metadata` polyfill loaded **before** the first call to any creator / dispatcher / assert helper. `reflect-metadata` is a CommonJS-only package, so the loading strategy differs by environment. See [README §Runtime Setup](../README.md#runtime-setup) and [USAGE.md §2.5](../USAGE.md#25-helpers).

## Common errors

| Error | Cause | Fix |
| --- | --- | --- |
| `Unable to resolve specifier 'reflect-metadata'` | `import 'reflect-metadata'` used in an ESM entry (`src/main.ts`, Native Federation, Vite dev server). `es-module-shims` cannot resolve the CommonJS specifier. | Remove the `import 'reflect-metadata'` line from `src/main.ts`. Load the polyfill as a global script via the builder `scripts` array: `"scripts": ["node_modules/reflect-metadata/Reflect.js"]` in `angular.json`. See [examples/angular-setup.md](examples/angular-setup.md). |
| `Reflect is not defined` (or `Reflect.getMetadata is not a function`) | The polyfill was not loaded before the first `@cobranza-apps/mfe-events` import, or the `scripts` entry was added to the wrong target. | Ensure the `scripts` entry is on the active build/test target and runs before app bootstrap. Verify `node_modules/reflect-metadata/Reflect.js` exists after `npm install`. |
| `class-validator` / `class-transformer` errors in unit tests (`Validation failed`, `isClassValidator` not a decorator`, empty `errors[]`) | `reflect-metadata` not loaded in the test environment. | Add `reflect-metadata` to the test runner's `setupFiles`. See [examples/vitest-setup.md](examples/vitest-setup.md) / [examples/jest-setup.md](examples/jest-setup.md). |

## Checklist

1. `reflect-metadata` is installed at the consumer (the library declares it as a required peer dependency).
2. In Angular: `angular.json` `scripts` includes `node_modules/reflect-metadata/Reflect.js` on every target that loads the app.
3. In tests: the test runner `setupFiles` imports `reflect-metadata` before any spec imports `@cobranza-apps/mfe-events`.
4. No `import 'reflect-metadata'` in any ESM entry consumed by `es-module-shims` / Native Federation.

## See also

- [README §Runtime Setup](../README.md#runtime-setup)
- [USAGE.md §2.5 Helpers](../USAGE.md#25-helpers)
- [Consumer setup examples](examples/)
```

Commit: `docs(troubleshooting): add reflect-metadata error/fix table`.

---

### Step 5 — `src/create-event.ts`: JSDoc updates (comments only, no logic change)

**5.1 — File-level JSDoc (lines 1–17).** Replace the `**Consumer requirement:**` paragraph (lines 9–13) with an environment-aware version. Replace lines 1–17 (`originalCode` = the full file-level JSDoc block) with:

```
/**
 * @file Core event creators with runtime payload validation.
 *
 * Exports {@link createMfeEvent} and {@link createShellEvent} — validate
 * `detail` (including `schemaVersion === SCHEMA_VERSION`) then return a
 * `CustomEvent` with `bubbles: true`. Throw {@link MfeEventValidationError}
 * on invalid payloads.
 *
 * **Consumer requirement:** this library relies on `class-validator`
 * decorators, which require the `reflect-metadata` polyfill to be loaded
 * **before the first call** to any creator / dispatcher / assert helper.
 * The library does **not** import `reflect-metadata` itself (avoids forcing
 * a global side effect on every consumer). Loading strategy is environment
 * dependent:
 * - Angular (esbuild / Vite / Native Federation): add
 *   `node_modules/reflect-metadata/Reflect.js` to the builder `scripts`
 *   array in `angular.json`. Do **not** `import 'reflect-metadata'` in
 *   `src/main.ts` (CommonJS specifier fails under ESM shims).
 * - Node.js / Vitest / Jest: `import 'reflect-metadata';` in the test
 *   setup file.
 *
 * @see {@link file://./validate-payload.ts} for the internal validation pipeline.
 * @see {@link file://./dispatch.ts} for validate-and-dispatch helpers.
 * @see `docs/USAGE.md` §2.5 Helpers, `docs/troubleshooting.md`.
 */
```

**5.2 — `createMfeEvent` JSDoc (lines 27–43).** Append a runtime-requirement note and `@see`. Replace lines 27–43 with:

```
/**
 * Creates a validated `CustomEvent<MfeEventMap[K]>` for an MFE → Shell event.
 * Validates `detail` (including `schemaVersion === SCHEMA_VERSION`) before
 * constructing the event. `bubbles: true` so the Shell can listen on
 * `window` or a parent container if needed.
 *
 * **Runtime requirement:** `reflect-metadata` must be loaded before the
 * first call to this function. In Angular / esbuild projects, load it via
 * the builder `scripts` array (`node_modules/reflect-metadata/Reflect.js`).
 * In Node / test environments, `import 'reflect-metadata'` in the test
 * setup. Do **not** rely on `import 'reflect-metadata'` inside an ESM
 * application entry.
 *
 * @param type - MFE event name constant from {@link MFE_EVENTS}.
 * @param detail - Payload matching `MfeEventMap[K]`. Must include `schemaVersion: SCHEMA_VERSION`.
 * @returns A `CustomEvent` ready to be dispatched via `EventTarget.dispatchEvent`.
 * @throws {MfeEventValidationError} if `detail` is invalid (missing `schemaVersion`, wrong shape, or unknown event type).
 * @see docs/USAGE.md §2.5 Helpers, docs/troubleshooting.md
 *
 * @example
 * const event = createMfeEvent(MFE_EVENTS.UPDATE_HEADER, {
 *   schemaVersion: SCHEMA_VERSION, moduleType: 'clients', instanceId: 'abc', title: 'Clientes',
 * });
 * window.dispatchEvent(event);
 */
```

**5.3 — `createShellEvent` JSDoc (lines 51–65).** Same runtime-requirement note. Replace lines 51–65 with:

```
/**
 * Creates a validated `CustomEvent<ShellEventMap[K]>` for a Shell → MFE event.
 * Same validation and bubbling rules as {@link createMfeEvent}.
 *
 * **Runtime requirement:** `reflect-metadata` must be loaded before the
 * first call to this function. In Angular / esbuild projects, load it via
 * the builder `scripts` array (`node_modules/reflect-metadata/Reflect.js`).
 * In Node / test environments, `import 'reflect-metadata'` in the test
 * setup. Do **not** rely on `import 'reflect-metadata'` inside an ESM
 * application entry.
 *
 * @param type - Shell event name constant from {@link SHELL_EVENTS}.
 * @param detail - Payload matching `ShellEventMap[K]`. Must include `schemaVersion: SCHEMA_VERSION`.
 * @returns A `CustomEvent` ready to be dispatched via `EventTarget.dispatchEvent`.
 * @throws {MfeEventValidationError} if `detail` is invalid.
 * @see docs/USAGE.md §2.5 Helpers, docs/troubleshooting.md
 *
 * @example
 * const event = createShellEvent(SHELL_EVENTS.THEME_CHANGED, {
 *   schemaVersion: SCHEMA_VERSION, theme: 'gray-intermediate',
 * });
 * window.dispatchEvent(event);
 */
```

Commit: `docs(jsdoc): replace ESM-unsafe reflect-metadata guidance in create-event.ts`.

---

### Step 6 — `package.json`: declare `reflect-metadata` as a required peer dependency

**6.1 — Remove `reflect-metadata` from `dependencies`.** Replace lines 27–31:

```json
  "dependencies": {
    "class-transformer": "0.5.1",
    "class-validator": "0.15.1",
    "reflect-metadata": "0.2.2"
  },
```

with:

```json
  "dependencies": {
    "class-transformer": "0.5.1",
    "class-validator": "0.15.1"
  },
```

**6.2 — Add `peerDependencies` + `peerDependenciesMeta`.** Insert after the `dependencies` block (after the closing `}` of `dependencies`, before `devDependencies`). Replace lines 27–36:

```json
  "dependencies": {
    "class-transformer": "0.5.1",
    "class-validator": "0.15.1"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "rimraf": "^6.0.1",
    "vitest": "4.1.10"
  }
```

with:

```json
  "dependencies": {
    "class-transformer": "0.5.1",
    "class-validator": "0.15.1"
  },
  "peerDependencies": {
    "reflect-metadata": "^0.1.12 || ^0.2.0"
  },
  "peerDependenciesMeta": {
    "reflect-metadata": {
      "optional": false
    }
  },
  "devDependencies": {
    "reflect-metadata": "0.2.2",
    "typescript": "^5.8.0",
    "rimraf": "^6.0.1",
    "vitest": "4.1.10"
  }
```

Rationale for also adding `reflect-metadata` to `devDependencies`: the library's own Vitest suite (and `npm run build` if it ever imports the polyfill) needs the package installed locally to satisfy the new required peer during local development; without it, `npm install` will warn/error on the unsatisfied peer in the library's own repo. Keeping the exact pinned `0.2.2` aligns with the previous `dependencies` entry.

Commit: `chore(pkg): declare reflect-metadata as required peerDependency`.

---

### Step 7 — Update `.agent/project-structure.md`

Add the new `docs/examples/` folder to the `# Other folders` section. Replace lines 9–11:

```
- .kilo/modes/ - built-in agent mode prompt overrides
- docs/: Documentation files
- test/ - Vitest unit tests (not part of the published package)
```

with:

```
- .kilo/modes/ - built-in agent mode prompt overrides
- docs/: Documentation files
- docs/examples/ - copy-paste consumer setup guides (Angular, Vitest, Jest reflect-metadata loading)
- test/ - Vitest unit tests (not part of the published package)
```

Commit: `docs(project-structure): register docs/examples/ folder`.

---

### Step 8 — Verification (implementer runs, no new files)

Run single commands (no chaining, per `tool-selection-priority.md`):

1. `npm install` — re-resolve deps after `package.json` change; confirm `reflect-metadata` installs as peer + dev dep, no peer warning for the library itself.
2. `npm run typecheck` — confirm `src/create-event.ts` JSDoc edits introduce no type errors.
3. `npm run build` — confirm `tsc` emits `dist/create-event.d.ts` with the **new** JSDoc text (this is the generated output the TODO referred to; verify by reading `dist/create-event.d.ts`).
4. `npm test` — confirm all 33 existing Vitest specs still pass (JSDoc-only change in source; package.json peer-dep change should not affect runtime tests since `reflect-metadata` remains installed via `devDependencies`).

If any step fails, stop and report to caller; do not proceed to 4.3.

---

### Step 9 — Code review preparation (input for 4.3)

The implementer's completion summary must list:
- Files created: `docs/examples/angular-setup.md`, `docs/examples/vitest-setup.md`, `docs/examples/jest-setup.md`, `docs/troubleshooting.md`.
- Files modified: `README.md`, `docs/USAGE.md`, `src/create-event.ts`, `package.json`, `.agent/project-structure.md`.
- Generated (do not commit if `dist/` is gitignored): `dist/create-event.d.ts` (regenerated by `npm run build`).
- Commits made (one per logical step above) on the feature branch.
- Verification command results (`typecheck` / `build` / `test`).

---

## Acceptance Criteria Mapping

| Criterion (TODO) | Step |
| --- | --- |
| `README.md` has clear "Runtime Setup" section with both Angular and Node paths | Step 1.2 |
| `docs/USAGE.md` §2.5 updated with ESM-safe loading instructions | Step 2.1 |
| At least one concrete example file exists (Angular + Vitest) | Step 3 (three files) |
| `create-event.d.ts` JSDoc no longer recommends `import 'reflect-metadata'` for ESM envs | Step 5 (source `.ts`) + Step 8.3 (regenerated `.d.ts`) |
| Troubleshooting section covers the three common errors | Step 4 |
| `peerDependencies` declared (recommended) | Step 6 |
| Shell team verifies — out of scope for this plan (manual verification by consumer team) | — |

## Out of Scope (handled elsewhere)

- Changelog / unreleased entry — already handled in Step 3 of the Critical Workflow.
- Git merge to `main` and push to `origin` — handled in Step 5 of the Critical Workflow.
- Front-end spec (4.1a) and front-end verification (4.5a) — this is not a front-end task.

## Risks / Notes

- **`peerDependencies` + library's own tests:** Adding `reflect-metadata` to `devDependencies` (Step 6.2) is required so `npm install` in the library repo satisfies the newly-declared required peer for local development. If omitted, `npm install` may emit `ERESOLVE` / peer warning. Implementer must run `npm install` (Step 8.1) and report any warnings.
- **Generated `.d.ts`:** Do not hand-edit `dist/create-event.d.ts`. It is regenerated by `tsc`. If `dist/` is gitignored (per `.gitignore` — implementer must verify in Step 4.2/gitignore-compliance before any commit), the regenerated `.d.ts` is a build artifact and is not committed; consumers receive it via `npm run build` / publish.
- **Max-lines rules:** New `.md` docs are not subject to `max-lines-per-file` (rule applies to `src/` only). `src/create-event.ts` after JSDoc edits stays well under 200 lines.
