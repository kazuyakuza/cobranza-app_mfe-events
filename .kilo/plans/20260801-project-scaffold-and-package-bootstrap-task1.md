# Plan — Task 1: Project Scaffold & Package Bootstrap

**TODO file:** `.agent/todos/20260631/20260631-todo-1.md`
**Global plan:** `.kilo/plans/20260801-project-scaffold-and-package-bootstrap.md`
**Branch:** `feat/project-scaffold-package-bootstrap`
**Date:** 2026-08-01
**Sub-agent for implementation:** `implementer` (step 4.2)

---

## 1. Pre-Analysis Summary

**Goal:** Turn the repo into a clean, buildable, ESM-first TypeScript library package
with correct identity, minimal source layout, build scripts, and a single public
entry. No real domain event implementation yet.

**Confirmed technical decisions (finalized in this plan):**

| Decision | Choice | Rationale |
| --- | --- | --- |
| Build tool | plain `tsc` | Simplest; emits ESM + `.d.ts` + `.d.ts.map` without bundler complexity. Matches "prefer a simple build". |
| Package manager | `npm` | Universal; no lockfile present; align later with siblings if needed. |
| Module system | ESM-first (`"type": "module"`) | Publishable ESM library. |
| `tsconfig` module/resolution | `"module": "NodeNext"` + `"moduleResolution": "NodeNext"` | Correct for an ESM-publishable lib with `"type": "module"`; produces Node-runnable + bundler-resolvable output. Requires `.js` extensions in relative barrel re-exports (tsc enforces under NodeNext). |
| TypeScript target | `ES2022` | Modern browsers + Angular 22 consumers. |
| `lib` | `["ES2022", "DOM"]` | Future helpers use `CustomEvent`/`Event`/`EventTarget` (DOM types). Harmless for empty scaffold; forward-compatible. |
| Strictness | `strict: true` plus extra strict flags | Brief demands strict typing; flags are inactive on empty placeholders; prepared for later tasks. |
| Public surface | single entry `src/public-api.ts` | Secondary subpath entries (`./events`, etc.) deferred to v2 per brief §4/§6. |
| Placeholders | **truly empty `.ts` files** | `tsc` with `strict: true` compiles empty modules with no error; no `SCHEMA_VERSION` placeholder needed (TODO §3 prefers empty over fake API). |
| `license` / `author` / `repository` | **omitted** | TODO §1: only set if already present in sibling packages; none found. |
| `node_modules/` in `.gitignore` | **must be added** (currently missing) | See §9 below. |
| TypeScript version | `^5.8.0` | TS 5.x (Angular 22 ecosystem); empty modules compile on any 5.x. |
| `rimraf` for `clean` script | added as devDependency | Cross-platform `clean`; standard lib tool. |

**Empty-module verification (research):** TypeScript accepts a completely empty
`.ts` file (zero bytes / no statements) under `strict: true`; it emits an empty
`.js` and (with `declaration: true`) an empty `.d.ts` with no error. Re-exporting
an empty module with `export * from './x.js'` is also valid. Therefore all
placeholders stay truly empty (no fake exports).

---

## 2. Target Repository Layout (after implementation)

```text
mfe-events/
├── src/
│   ├── .gitkeep            # preserved (harmless; do NOT remove)
│   ├── events.ts           # placeholder (empty)
│   ├── payloads.ts         # placeholder (empty)
│   ├── types.ts            # placeholder (empty)
│   ├── helpers.ts           # placeholder (empty)
│   ├── index.ts            # internal barrel (re-exports)
│   └── public-api.ts       # single public entry (re-exports index)
├── package.json            # NEW
├── tsconfig.json           # NEW
├── .gitignore              # UPDATED (add node_modules/ + coverage)
├── README.md               # unchanged
├── .nvmrc                  # unchanged (22.22.3)
└── (existing .agent/, .kilo/, docs/)
```

`dist/` is gitignored (already covered) and produced by `npm run build`.

---

## 3. Exact File Contents

### 3.1 `package.json` (NEW — create at repo root)

```json
{
  "name": "@cobranza-apps/mfe-events",
  "version": "0.1.0",
  "description": "Typed event contracts and helpers for communication between the Cobranza Company Back-office Shell and its micro-frontends.",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/public-api.js",
  "module": "./dist/public-api.js",
  "types": "./dist/public-api.d.ts",
  "exports": {
    ".": {
      "types": "./dist/public-api.d.ts",
      "import": "./dist/public-api.js",
      "default": "./dist/public-api.js"
    },
    "./package.json": "./package.json"
  },
  "files": [
    "dist",
    "README.md"
  ],
  "engines": {
    "node": ">=22.22.3"
  },
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "clean": "rimraf dist"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "rimraf": "^6.0.1"
  }
}
```

Field-by-field justification:
- `name`: exact value required by TODO §1.
- `version`: `0.1.0` initial (TODO §1 allows existing; none exists).
- `description`: exact example string from TODO §1.
- `type: "module"`: ESM-first (TODO §1 prefers ESM-first when starting clean).
- `sideEffects: false`: required by TODO §1.
- `main`/`module`: point to single ESM output from `public-api` entry.
- `types` + `exports["."].types`: declare the `.d.ts` for the public entry.
- `exports["."].import`/`default`: single ESM condition (no CJS; ESM-only lib).
- `exports["./package.json"]`: allows tooling to read package metadata.
- `files`: only `dist` + `README.md` shipped on publish (publishable lib hygiene).
- `engines.node`: matches `.nvmrc` pin (22.22.3).
- `scripts.build`: `tsc` (uses `tsconfig.json` → emits `dist/`).
- `scripts.typecheck`: `tsc --noEmit` (TODO §2 requirement).
- `scripts.clean`: `rimraf dist` cross-platform removal (optional per TODO §5).
- `devDependencies`: `typescript` for build; `rimraf` for `clean`.

**Notes for implementer:**
- Do NOT add `license`, `author`, `repository`, `homepage`, `bugs` (none present in repo; TODO §1 forbids inventing private org details).
- Do NOT add Angular, RxJS, or runtime dependencies.
- Do NOT add `peerDependencies` (no Angular peer dep required by this lib).
- Decision on secondary entries (`./events`, `./payloads`, `./types`, `./helpers`): **skipped in v1** per brief/arch (single public entry). No `package.json` subpath exports. (Optional `package.json` comment is not meaningful since JSON has no comments; decision is documented here, in README, and in this plan instead.)

### 3.2 `tsconfig.json` (NEW — create at repo root)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM"],
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "strict": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
```

Option-by-option rationale:
- `target: ES2022`: TODO §2 (modern browsers + Angular 22).
- `module: NodeNext` + `moduleResolution: NodeNext`: ESM-publishable lib with `"type": "module"`; canonical choice per TS guidance. Barrel re-exports **must** use `.js` extensions.
- `lib: ["ES2022", "DOM"]`: ES2022 runtime + DOM globals for future `CustomEvent`/`Event`/`EventTarget` helpers.
- `rootDir: "src"`, `outDir: "dist"`: TODO §2 (`src` → `dist`).
- `declaration` + `declarationMap`: required by TODO §2; emits `.d.ts` + `.d.ts.map`.
- `sourceMap`: emits `.js.map` for debug (harmless; supports later source-mapped tooling).
- `removeComments: false`: keeps JSDoc in emitted `.d.ts` for consumers/agents (architecture §6 doc pattern: JSDoc on every export).
- `strict: true` + secondary strict flags: brief demands strict typing; inactive on empty scaffold; ready for later tasks.
- `esModuleInterop`: default-safe interop (harmless here).
- `skipLibCheck`: avoids friction from dependency `.d.ts` files.
- `isolatedModules`: compatible with single-file transpile (bundler-safe) and with `export *` re-exports.
- `include`: compile all `src/**/*.ts`. Matches intended layout.
- `exclude`: `node_modules`, `dist`, and future test files.

**NOT included (intentional):** any Angular compiler options (`angularCompilerOptions`,
`experimentalDecorators` for Angular, `emitDecoratorMetadata`). No `composite`/`tsBuildInfoFile`
(not a project-references build). No `allowImportingTsExtensions` (we use `.js`
extensions in relative specifiers, the NodeNext-supported form).

### 3.3 `src/events.ts` (NEW — placeholder, truly empty)

```ts
```

Empty file. No exports. (TODO §3: empty modules that compile preferred over fake
API surface.)

### 3.4 `src/payloads.ts` (NEW — placeholder, truly empty)

```ts
```

### 3.5 `src/types.ts` (NEW — placeholder, truly empty)

```ts
```

### 3.6 `src/helpers.ts` (NEW — placeholder, truly empty)

```ts
```

### 3.7 `src/index.ts` (NEW — internal barrel)

```ts
export * from './events.js';
export * from './payloads.js';
export * from './types.js';
export * from './helpers.js';
```

`.js` extensions are **required** under `module: NodeNext` (tsc enforces).
Re-exporting empty modules is valid; contributes nothing until content is added
in later TODOs.

### 3.8 `src/public-api.ts` (NEW — single public entry)

```ts
export * from './index.js';
```

This is the entry referenced by `package.json` `main`/`module`/`types`/`exports`.

### 3.9 `.gitignore` (UPDATE — add missing entries)

Current `.gitignore` already covers: `dist/` (line 31), `.env*` env files, `.vscode/`/`.idea/` IDE, temp files, logs, tokens.

**Missing (must add):**
- `node_modules/` — **not present** in current `.gitignore` (critical gap).
- Coverage outputs — not present; add for future test tasks.

**Append the following sections** (preserve existing content; only append):

```gitignore

# Dependencies
node_modules/

# Test coverage
coverage/
.nyc_output/
*.lcov
```

Append at the end of the existing file. Do NOT remove or reorder existing lines.

---

## 4. Execution Order (for implementer, step 4.2)

Each numbered item ends with a commit when logical. Commit messages follow
Conventional Commits (`feat:`/`chore:`). Run `git status` before each commit to
ensure only intended files are staged (Gitignore Compliance Rule). Do NOT stage
`node_modules/` or `dist/`.

1. **Create `package.json`** with exact content from §3.1.
   - Commit: `chore: add package.json identity for @cobranza-apps/mfe-events`
2. **Create `tsconfig.json`** with exact content from §3.2.
   - Commit: `chore: add library tsconfig (ESM, NodeNext, strict)`
3. **Create source placeholders** in `src/`:
   - `src/events.ts` (empty)
   - `src/payloads.ts` (empty)
   - `src/types.ts` (empty)
   - `src/helpers.ts` (empty)
   - `src/index.ts` (barrel, §3.7)
   - `src/public-api.ts` (entry, §3.8)
   - Commit: `feat: scaffold src layout with empty public-api entry`
4. **Update `.gitignore`** per §3.9 (append missing sections).
   - Commit: `chore: gitignore node_modules and coverage`
5. **Install dependencies:**
   - Run: `npm install`
   - This creates `package-lock.json` and `node_modules/`.
   - Verify `node_modules/` is NOT staged (`git status` should show it ignored; `package-lock.json` should be untracked).
   - Stage `package-lock.json` (tracked, not gitignored).
   - Commit: `chore: lock initial dev dependencies`
6. **Typecheck:**
   - Run: `npm run typecheck`
   - Expected: exits 0 (empty modules + barrel compile clean under NodeNext).
7. **Build:**
   - Run: `npm run build`
   - Expected: creates `dist/` containing at least:
     - `dist/public-api.js`
     - `dist/public-api.d.ts`
     - `dist/public-api.d.ts.map`
     - `dist/index.js`, `dist/index.d.ts`, etc. (for non-empty barrels)
     - `dist/events.js`, `dist/events.d.ts`, `dist/payloads.js`, ... (empty `.d.ts` files for empty modules)
   - Verify with: list `dist/` contents; confirm `public-api.js` + `public-api.d.ts` exist.
8. **Runtime import sanity check (optional but recommended):**
   - Run: `node --input-type=module -e "import('@cobranza-apps/mfe-events').then(m=>console.log(Object.keys(m))).catch(e=>{console.error(e);process.exit(1)})"`
   - Note: this resolves via the package name only if installed in a consumer
     context; in the repo root it may not resolve by name. Use the file path form
     instead:
     `node --input-type=module -e "import('./dist/public-api.js').then(m=>console.log(Object.keys(m)))"`
   - Expected: prints `[]` (empty public surface) and exits 0.
9. **No final commit needed beyond above** — all changes already committed per step.

**Branch note:** The branch `feat/project-scaffold-package-bootstrap` already
exists (created in step 2 of the global workflow). Stay on it; do not switch to
`main`. Merging happens in global step 5 (TODO File Completion), NOT in this task.

---

## 5. Verification (matches TODO checklist — for 4.5b adherence)

- [ ] `package.json` name is exactly `@cobranza-apps/mfe-events`. (§3.1)
- [ ] `version` is `0.1.0`. (§3.1)
- [ ] `description` set. (§3.1)
- [ ] `"type": "module"` set. (§3.1)
- [ ] `"sideEffects": false` set. (§3.1)
- [ ] No Angular/RxJS/runtime dependencies. (§3.1)
- [ ] `tsconfig.json` target `ES2022`. (§3.2)
- [ ] `declaration: true`, `declarationMap: true`. (§3.2)
- [ ] `strict: true`. (§3.2)
- [ ] `rootDir: src`, `outDir: dist`. (§3.2)
- [ ] No Angular compiler options in `tsconfig.json`. (§3.2)
- [ ] `npm run typecheck` exits 0. (step 6)
- [ ] `npm run build` produces `dist/public-api.js` + `dist/public-api.d.ts`. (step 7)
- [ ] `.gitignore` covers `dist/` (already) and `node_modules/` (added). (§3.9)
- [ ] `npm install` does not stage `node_modules/`. (step 5)
- [ ] No secrets / env files committed. (n/a — none present)

---

## 6. Constraints Honored

- **No Angular.** No `@angular/*` deps; no `angularCompilerOptions`.
- **No RxJS / no event bus / no services.** None added.
- **No domain event implementation.** Placeholders are truly empty; no
  `MFE_EVENTS`, no payloads, no helpers. (Deferred to next TODO.)
- **Simple build.** Plain `tsc` only (no tsup/unbuild/api-extractor).
- **Single public entry.** `src/public-api.ts`; secondary subpaths skipped (v2).
- **No fake API surface.** Empty modules compile (confirmed); no `SCHEMA_VERSION`.
- **Read-only step (this plan).** No repo files modified while producing this plan.

---

## 7. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| `module: NodeNext` rejects extensionless relative imports | Barrel files use explicit `.js` extensions (§3.7, §3.8). |
| Empty `.d.ts` for empty modules confuses consumers | Acceptable for scaffold stage; the public entry still emits `public-api.js`/`.d.ts`. Real exports come in next TODO. |
| `npm install` fails or pulls unexpected versions | Pin `typescript ^5.8.0` and `rimraf ^6.0.1`; review `package-lock.json` after install. |
| `node -e` import sanity fails on Windows PowerShell quoting | Use the file-path `import('./dist/public-api.js')` form; treat as optional. |
| `.gitignore` accidentally stages `node_modules/` | Verify with `git status` after `npm install`; ensure `node_modules/` line added before install (step 4 precedes step 5). |
| `exports` misalignment breaks bundler resolution | `exports["."].types` + `import` both point to `dist/public-api.*`; `typesVersions` not needed (modern bundlers use `exports.types`). |

---

## 8. Out of Scope (handled by later TODOs)

- Real `MFE_EVENTS` / `SHELL_EVENTS` constants (`src/events.ts`).
- Payload interfaces (`src/payloads.ts`).
- Shared types + `MfeEventMap`/`ShellEventMap` (`src/types.ts`).
- Helpers `createMfeEvent`/`createShellEvent`/`isMfeEvent`/`isShellEvent` (`src/helpers.ts`).
- `docs/USAGE.md` content.
- Unit test setup (Vitest/Jest) — not required to keep build green.
- Secondary subpath exports.

---

## 9. Note on `.gitignore` Gap (important)

The global plan's pre-analysis stated `.gitignore` already covers
`node_modules/`. Verification of the actual file shows **`node_modules/` is
NOT present** (only OS files, temp, logs, env, IDE, `build/`, `dist/`, tokens,
kilo agent-manager). This plan corrects that by adding `node_modules/` and
coverage patterns in step 4 (§3.9), executed **before** `npm install` (step 5)
so `node_modules/` is correctly ignored from the start. This satisfies
Gitignore Compliance Rule.

---

**End of plan.** Ready for implementation in step 4.2 by the `implementer`
sub-agent following the execution order in §4 and the exact file contents in §3.