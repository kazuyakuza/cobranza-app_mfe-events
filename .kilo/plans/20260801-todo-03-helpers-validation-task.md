# Task Plan — TODO 03: Helpers & Runtime Validation (4.1b)

- **TODO file:** `.agent/todos/20260801/20260801-todo-0.md`
- **Global plan:** `.kilo/plans/20260801-todo-03-helpers-validation.md`
- **Branch:** `feat/todo-03-helpers-validation`
- **Date:** 2026-08-01
- **Scope owner for this plan:** Architector (this file). Execution delegated to Implementer in step 4.2.
- **This plan is PLAN-ONLY** — no source/dependency/config files were modified to produce it.

---

## 1. Researched Dependency Versions (npm registry latest tags)

| Package | Resolved version | Notes |
|---|---|---|
| `class-validator` | `0.15.1` | Has `validator`, `@types/validator`, `libphonenumber-js` as transitive deps. No `exports` field; `typings: ./types/index.d.ts`. Resolves fine under `moduleResolution: NodeNext` via `types` field. Decorators register in class-validator's own storage (`registerDecorator`) — works with `experimentalDecorators: true` and **without** `emitDecoratorMetadata`. |
| `class-transformer` | `0.5.1` | No `exports` field; `module: ./esm5/index.js`, `main: ./cjs/index.js`, `typings: ./types/index.d.ts`. Used only for `plainToInstance`. No nested DTOs are required by our payloads → `@Type` / `@ValidateNested` are **not** used. |
| `reflect-metadata` | `0.2.2` | CJS polyfill. **Added per global pre-analysis decision**. Library entry does NOT import it (avoids a forced global side effect in the package entry). Consumers must `import 'reflect-metadata'` once at app entry before importing `@cobranza-apps/mfe-events`. |
| `vitest` | `4.1.10` | ESM-native. `engines: node ^20 || ^22 || >=24` (satisfies `>=22.22.3`). Requires a `vite` peer (transitive). Adds `test` script. |

**ESM/TS compatibility note for the implementer:** `class-validator` and `class-transformer` are CJS packages without an `exports` map. Under `module: NodeNext` / `moduleResolution: NodeNext` + `esModuleInterop: true`, `import { validateSync, IsString, ... } from 'class-validator'` and `import { plainToInstance } from 'class-transformer'` resolve through Node's CJS named-export interop (cjs-module-lexer on Node 22). TypeScript resolves their bundled `.d.ts` via the `typings` field. No extra config is required.

**Decision reaffirmed (from global plan):** `experimentalDecorators: true` only. `emitDecoratorMetadata` stays **off** — every decorator is explicit (`@IsString`, `@IsOptional`, `@IsIn(...)`, `@IsNumber`, `@IsBoolean`, `@IsObject`) and no `@ValidateNested` is used (all payloads are flat; `initialData` is validated as a plain object only).

---

## 2. Target File Layout

Replaces the empty `src/helpers.ts` with multiple focused modules so each file stays under the 200-line rule and every method body under 50 lines. DTOs are internal and **never** exported via `public-api.ts`.

### New / modified files

| Path | Action | Public? | Purpose |
|---|---|---|---|
| `tsconfig.json` | MODIFY | — | Add `"experimentalDecorators": true`. |
| `package.json` | MODIFY | — | Add 3 runtime deps + `vitest` devDep; add `test`/`test:watch` scripts. |
| `vitest.config.ts` | CREATE (repo root) | — | Minimal Vitest config (node env, `test/**/*.spec.ts`, setup file). |
| `vitest.setup.ts` | CREATE (repo root) | — | `import 'reflect-metadata';` so DTO decorators resolve under tests. |
| `src/validation-error.ts` | CREATE | **public** | `MfeEventValidationError` + `MfeValidationErrorEntry` + context interface. |
| `src/dtos/module-identity-dto.ts` | CREATE | internal | `SchemaVersionDto` base + `ModuleIdentityDto` base. |
| `src/dtos/mfe-payload-dtos.ts` | CREATE | internal | 7 MFE DTOs. |
| `src/dtos/shell-payload-dtos.ts` | CREATE | internal | 3 Shell DTOs. |
| `src/dtos/payload-dto-registry.ts` | CREATE | internal | `PayloadDtoCtor`, `MFE_PAYLOAD_DTOS`, `SHELL_PAYLOAD_DTOS`, `PAYLOAD_DTO_MAP`. |
| `src/validate-payload.ts` | CREATE | internal | `validatePayload(type, detail)` + tiny private helpers. |
| `src/create-event.ts` | CREATE | **public** | `createMfeEvent`, `createShellEvent`. |
| `src/guards.ts` | CREATE | **public** | `isMfeEvent`, `isShellEvent`. |
| `src/dispatch.ts` | CREATE | **public** | `dispatchMfeEvent`, `dispatchShellEvent`. |
| `src/assert.ts` | CREATE | **public** | `assertMfePayload`, `assertShellPayload`. |
| `src/helpers.ts` | DELETE | — | Replaced by the split modules above. |
| `src/index.ts` | MODIFY | — | Remove `./helpers.js` re-export; add re-exports for `validation-error`, `create-event`, `guards`, `dispatch`, `assert`. |
| `src/public-api.ts` | NO CHANGE | — | Already re-exports `./index.js`; new public symbols flow through automatically. |
| `test/create-event.spec.ts` | CREATE | — | Unit tests for `createMfeEvent` / `createShellEvent`. |
| `test/guards.spec.ts` | CREATE | — | Unit tests for `isMfeEvent` / `isShellEvent`. |
| `test/dispatch.spec.ts` | CREATE | — | Unit tests for `dispatchMfeEvent` / `dispatchShellEvent`. |
| `test/validate-payload.spec.ts` | CREATE | — | Edge-case tests for `validatePayload` behavior reachable via `assert*`. |
| `test/assert.spec.ts` | CREATE | — | Tests for `assertMfePayload` / `assertShellPayload`. |
| `.agent/project-structure.md` | MODIFY | — | Add `src/dtos/` and `test/` entries. |
| `.gitignore` | VERIFY/UPDATE | — | Ensure `node_modules/` and `dist/` are ignored; add `coverage/` if a coverage script is added. |

### Dependency stats estimate (sanity, ≤200 lines each)
- `src/validation-error.ts`: ~30 lines.
- `src/dtos/module-identity-dto.ts`: ~20 lines.
- `src/dtos/mfe-payload-dtos.ts`: ~90 lines (7 DTOs, each ≤ ~10 lines).
- `src/dtos/shell-payload-dtos.ts`: ~50 lines.
- `src/dtos/payload-dto-registry.ts`: ~45 lines.
- `src/validate-payload.ts`: ~70 lines (body of `validatePayload` ≤ ~15 lines).
- `src/create-event.ts`: ~70 lines (2 funcs + JSDoc).
- `src/guards.ts`: ~50 lines.
- `src/dispatch.ts`: ~70 lines.
- `src/assert.ts`: ~40 lines.

---

## 3. DTO Field-by-Field Decorator Map

All DTO classes mirror the `src/payloads.ts` interfaces exactly (required vs optional). `schemaVersion` equality to `SCHEMA_VERSION` is enforced **early** in `validatePayload` (fast-fail with a dedicated message); the DTOs additionally annotate `schemaVersion` with `@IsNumber()` as a defensive type check.

### 3.1 `src/dtos/module-identity-dto.ts`
```ts
import { IsNumber, IsString } from 'class-validator';

/** Base carrying the required schema version shared by every payload DTO. */
export abstract class SchemaVersionDto {
  @IsNumber()
  schemaVersion!: number;
}

/** Base for payloads that include module identity. */
export abstract class ModuleIdentityDto extends SchemaVersionDto {
  @IsString()
  moduleType!: string;

  @IsString()
  instanceId!: string;
}
```
Both are `abstract` (never instantiated directly).

### 3.2 `src/dtos/mfe-payload-dtos.ts`
Decorators per payload (fields shown as `interfaceField` → decorators):

| DTO class | Field | Decorators |
|---|---|---|
| `RequestAddModuleDto extends SchemaVersionDto` | `moduleType: string` | `@IsString()` |
| | `title?: string` | `@IsOptional()`, `@IsString()` |
| | `initialData?: Record<string, unknown>` | `@IsOptional()`, `@IsObject()` |
| | `schemaVersion: number` | inherited `@IsNumber()` |
| `RequestFullscreenDto extends ModuleIdentityDto` | (inherits `moduleType`, `instanceId`, `schemaVersion`) | — |
| `RequestRemoveDto extends ModuleIdentityDto` | (inherits) | — |
| `UpdateHeaderDto extends ModuleIdentityDto` | `title?: string` | `@IsOptional()`, `@IsString()` |
| | `status?: ModuleStatus` | `@IsOptional()`, `@IsIn([...STATUS_VALUES])` |
| `ShowNotificationDto extends SchemaVersionDto` | `type: 'success' \| 'warning' \| 'error' \| 'info'` | `@IsIn([...NOTIFICATION_TYPES])` |
| | `message: string` | `@IsString()` |
| | `title?: string` | `@IsOptional()`, `@IsString()` |
| | `duration?: number` | `@IsOptional()`, `@IsNumber()` |
| `ModuleReadyDto extends ModuleIdentityDto` | (inherits) | — |
| `ModuleErrorDto extends ModuleIdentityDto` | `message: string` | `@IsString()` |
| | `code?: string` | `@IsOptional()`, `@IsString()` |

Constants to declare at the top of the file (avoid magic strings, per `avoid-magic-numbers`/self-documenting rule):
```ts
const NOTIFICATION_TYPES = ['success', 'warning', 'error', 'info'] as const;
const STATUS_VALUES = ['loading', 'loaded', 'success', 'warning', 'error', 'dirty'] as const;
```
Notes:
- `@IsOptional()` in class-validator skips validation when the value is `null` **or** `undefined`. Therefore `status?: ModuleStatus` (where `ModuleStatus` includes `null`) passes for `null` and validates the string set via `@IsIn(STATUS_VALUES)` for non-null values — exactly matching the interface.
- `initialData` is validated only as "plain object when present" per TODO ("don't over-validate `initialData`"). `@IsObject()` rejects arrays? `@IsObject()` accepts arrays as objects — acceptable; if stricter exclusion is desired the implementer may use a tiny inline `@ValidateIf`-style check, but `@IsObject()` satisfies the TODO requirement. Keep `@IsObject()`.

### 3.3 `src/dtos/shell-payload-dtos.ts`
| DTO class | Field | Decorators |
|---|---|---|
| `ModuleStateDto extends ModuleIdentityDto` | `size: ModuleSize` | `@IsIn(['50%','100%'])` |
| | `width: number` | `@IsNumber()` |
| | `height: number` | `@IsNumber()` |
| | `isCollapsed: boolean` | `@IsBoolean()` |
| | `isFullscreen: boolean` | `@IsBoolean()` |
| `ThemeChangedDto extends SchemaVersionDto` | `theme: 'gray-intermediate' \| string` | `@IsString()` |
| `VisibilityChangedDto extends ModuleIdentityDto` | `visible: boolean` | `@IsBoolean()` |
| | `reason?: string` | `@IsOptional()`, `@IsString()` |

Constants:
```ts
const MODULE_SIZES = ['50%', '100%'] as const;
```

### 3.4 `src/dtos/payload-dto-registry.ts`
```ts
import type { MfeEventName, ShellEventName } from '../events.js';
import { MFE_EVENTS, SHELL_EVENTS } from '../events.js';
import { RequestAddModuleDto, RequestFullscreenDto, RequestRemoveDto,
         UpdateHeaderDto, ShowNotificationDto, ModuleReadyDto, ModuleErrorDto }
  from './mfe-payload-dtos.js';
import { ModuleStateDto, ThemeChangedDto, VisibilityChangedDto } from './shell-payload-dtos.js';

/** Constructor of a concrete payload DTO. */
export type PayloadDtoCtor = new () => object;

export const MFE_PAYLOAD_DTOS = {
  [MFE_EVENTS.REQUEST_ADD_MODULE]: RequestAddModuleDto,
  [MFE_EVENTS.REQUEST_FULLSCREEN]: RequestFullscreenDto,
  [MFE_EVENTS.REQUEST_REMOVE]: RequestRemoveDto,
  [MFE_EVENTS.UPDATE_HEADER]: UpdateHeaderDto,
  [MFE_EVENTS.SHOW_NOTIFICATION]: ShowNotificationDto,
  [MFE_EVENTS.MODULE_READY]: ModuleReadyDto,
  [MFE_EVENTS.MODULE_ERROR]: ModuleErrorDto,
} satisfies Record<MfeEventName, PayloadDtoCtor>;

export const SHELL_PAYLOAD_DTOS = {
  [SHELL_EVENTS.MODULE_STATE]: ModuleStateDto,
  [SHELL_EVENTS.THEME_CHANGED]: ThemeChangedDto,
  [SHELL_EVENTS.VISIBILITY_CHANGED]: VisibilityChangedDto,
} satisfies Record<ShellEventName, PayloadDtoCtor>;

/** Event-name → DTO constructor lookup used by the internal validator. */
export const PAYLOAD_DTO_MAP: Record<string, PayloadDtoCtor> = {
  ...MFE_PAYLOAD_DTOS,
  ...SHELL_PAYLOAD_DTOS,
};
```
If `satisfies` causes friction with computed literal keys under strict mode, the implementer may drop `satisfies` and annotate the map literals explicitly as `Record<MfeEventName, PayloadDtoCtor>` — preserve the constraint that every event name is mapped.

---

## 4. Validation Error Type — `src/validation-error.ts`

```ts
/** A single failed-constraint entry attached to {@link MfeEventValidationError}. */
export interface MfeValidationErrorEntry {
  readonly property: string;
  readonly constraints: readonly string[];
}

/** Optional structured context for {@link MfeEventValidationError}. */
export interface MfeValidationErrorContext {
  readonly errors?: readonly MfeValidationErrorEntry[];
  readonly eventType?: string;
}

/**
 * Thrown when an MFE/Shell event payload fails runtime validation
 * (missing/invalid `schemaVersion`, wrong shape, or unknown event type).
 *
 * Callers should treat this as a programming error: fix the payload shape,
 * keep `schemaVersion` equal to `SCHEMA_VERSION`, then re-dispatch.
 */
export class MfeEventValidationError extends Error {
  readonly errors: readonly MfeValidationErrorEntry[];
  readonly eventType?: string;

  constructor(message: string, context: MfeValidationErrorContext = {}) {
    super(message);
    this.name = 'MfeEventValidationError';
    this.errors = context.errors ?? [];
    this.eventType = context.eventType;
    Object.setPrototypeOf(this, MfeEventValidationError.prototype);
  }
}
```
- Constructor uses 2 params (`message`, `context` object) → complies with `max-arguments-per-method` rule (≤2 params; the optional context object is encapsulated and its type defined here).
- `Object.setPrototypeOf` restores prototype chain so `instanceof MfeEventValidationError` works after ES5 downleveling and under bundlers.

---

## 5. Internal Validator — `src/validate-payload.ts`

Exported only internally (NOT re-exported from `src/index.ts`). Public surface for pre-checks is `assert*` (see 7).

```ts
import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';
import { SCHEMA_VERSION } from './types.js';
import { PAYLOAD_DTO_MAP } from './dtos/payload-dto-registry.js';
import {
  MfeEventValidationError,
  type MfeValidationErrorEntry,
} from './validation-error.js';

/**
 * Validates `detail` against the DTO registered for `type` and throws
 * {@link MfeEventValidationError} on any failure. Internal — use
 * `createMfeEvent` / `dispatchMfeEvent` / `assertMfePayload` to call it.
 */
export function validatePayload(type: string, detail: unknown): void {
  assertDetailIsObject(type, detail);
  const dtoCtor = PAYLOAD_DTO_MAP[type];
  assertKnownEventType(type, dtoCtor);
  assertSchemaVersion(type, detail);
  const instance = plainToInstance(dtoCtor, detail);
  const errors = validateSync(instance);
  assertNoErrors(type, errors);
}

function assertDetailIsObject(type: string, detail: unknown): void {
  if (detail === null || typeof detail !== 'object') {
    throw new MfeEventValidationError(
      `Event "${type}" detail must be a non-null object.`,
      { eventType: type },
    );
  }
}

function assertKnownEventType(type: string, ctor: unknown): void {
  if (!ctor) {
    throw new MfeEventValidationError(
      `Unknown event type "${type}": no payload DTO registered.`,
      { eventType: type },
    );
  }
}

function assertSchemaVersion(type: string, detail: object): void {
  const version = (detail as { schemaVersion?: unknown }).schemaVersion;
  if (version === undefined) {
    throw new MfeEventValidationError(
      `Event "${type}" payload is missing the required "schemaVersion".`,
      { eventType: type },
    );
  }
  if (version !== SCHEMA_VERSION) {
    throw new MfeEventValidationError(
      `Event "${type}" payload schemaVersion ${String(version)} does not match required version ${SCHEMA_VERSION}.`,
      { eventType: type },
    );
  }
}

function assertNoErrors(type: string, errors: ValidationError[]): void {
  if (errors.length === 0) return;
  throw new MfeEventValidationError(
    `Validation failed for event "${type}".`,
    { eventType: type, errors: toErrorEntries(errors) },
  );
}

function toErrorEntries(errors: ValidationError[]): MfeValidationErrorEntry[] {
  return errors.map((error) => ({
    property: error.property,
    constraints: Object.values(error.constraints ?? {}),
  }));
}
```
- `validatePayload` body: ~7 statements (well under 50 lines).
- Every helper has ≤2 params.
- `assert*` helpers are private to the module (`private-by-default`). They are plain module functions (not exported), which is private at the module scope — acceptable.
- `@IsNumber()` on DTO `schemaVersion` is a defensive last line; the explicit `assertSchemaVersion` produces the user-facing messages.

---

## 6. Core Creators — `src/create-event.ts`

```ts
import type { MfeEventMap, ShellEventMap } from './types.js';
import { validatePayload } from './validate-payload.js';

/**
 * Creates a validated `CustomEvent<MfeEventMap[K]>` for an MFE → Shell event.
 * Validates `detail` (including `schemaVersion === SCHEMA_VERSION`) before
 * constructing the event. `bubbles: true` so the Shell can listen on
 * `window` or a parent container if needed.
 *
 * @throws {MfeEventValidationError} if `detail` is invalid.
 */
export function createMfeEvent<K extends keyof MfeEventMap>(
  type: K,
  detail: MfeEventMap[K],
): CustomEvent<MfeEventMap[K]> {
  validatePayload(type, detail);
  return new CustomEvent<MfeEventMap[K]>(type, { detail, bubbles: true });
}

/**
 * Creates a validated `CustomEvent<ShellEventMap[K]>` for a Shell → MFE event.
 * Same validation/bubbling rules as {@link createMfeEvent}.
 *
 * @throws {MfeEventValidationError} if `detail` is invalid.
 */
export function createShellEvent<K extends keyof ShellEventMap>(
  type: K,
  detail: ShellEventMap[K],
): CustomEvent<ShellEventMap[K]> {
  validatePayload(type, detail);
  return new CustomEvent<ShellEventMap[K]>(type, { detail, bubbles: true });
}
```
- 2 params per function. Body ≤5 lines. Note `bubbles: true` documented in JSDoc per TODO.

---

## 7. Type Guards — `src/guards.ts`

```ts
import type { Event } from './types.js'; // if no DOM Event type re-export, import from 'unknown' — see note
import type { MfeEventMap, ShellEventMap } from './types.js';

/**
 * Cheap runtime guard: `true` when `event` is a `CustomEvent` whose `type`
 * equals `type`. Does NOT re-validate the payload — safe to use in hot listeners.
 */
export function isMfeEvent<K extends keyof MfeEventMap>(
  event: Event,
  type: K,
): event is CustomEvent<MfeEventMap[K]> {
  return event instanceof CustomEvent && event.type === type;
}

/**
 * Shell-side counterpart of {@link isMfeEvent}.
 */
export function isShellEvent<K extends keyof ShellEventMap>(
  event: Event,
  type: K,
): event is CustomEvent<ShellEventMap[K]> {
  return event instanceof CustomEvent && event.type === type;
}
```
- `Event` type: comes from the `lib: DOM` declaration in `tsconfig.json` (a global `Event`). The implementer should NOT add a local `import type { Event }` — `Event` is a global DOM lib type. The comment line above is a hint, not a literal import; the implementer drops the spurious `import type { Event }` and relies on the global.
- 2 params each; body 1 line each. Shallow `detail` object check intentionally omitted per TODO ("keep guards cheap"). Documented.

---

## 8. Dispatch Helpers — `src/dispatch.ts`

```ts
import type { MfeEventMap, ShellEventMap } from './types.js';
import { createMfeEvent } from './create-event.js';
import { createShellEvent } from './create-event.js';

/**
 * Validates `detail` (via {@link createMfeEvent}) and dispatches the resulting
 * `CustomEvent` on `target` (defaults to `window` in browser-like contexts).
 *
 * @throws {MfeEventValidationError} if `detail` is invalid.
 * @throws {Error} if `target` is omitted and `window` is unavailable (non-browser).
 */
export function dispatchMfeEvent<K extends keyof MfeEventMap>(
  type: K,
  detail: MfeEventMap[K],
  target?: EventTarget,
): void {
  resolveEventTarget(target).dispatchEvent(createMfeEvent(type, detail));
}

/**
 * Shell-side counterpart of {@link dispatchMfeEvent}.
 */
export function dispatchShellEvent<K extends keyof ShellEventMap>(
  type: K,
  detail: ShellEventMap[K],
  target?: EventTarget,
): void {
  resolveEventTarget(target).dispatchEvent(createShellEvent(type, detail));
}

function resolveEventTarget(target?: EventTarget): EventTarget {
  if (target) return target;
  const wnd = (globalThis as { window?: EventTarget }).window;
  if (wnd) return wnd;
  throw new Error(
    'mfe-events: dispatch target omitted and `window` is undefined in this environment; pass an explicit EventTarget.',
  );
}
```
- 3 params on dispatch fns would violate the 2-params rule. **Resolved** by reducing to 2 params on the public dispatch functions? No — the TODO signature explicitly lists `target?` as a third param. To comply with `max-arguments-per-method` while preserving the requested API, the implementer MAY encapsulate into an options object:

  **Compliant alternative (recommended):**
  ```ts
  export interface DispatchOptions { readonly target?: EventTarget; }

  export function dispatchMfeEvent<K extends keyof MfeEventMap>(
    type: K,
    detail: MfeEventMap[K],
    options?: DispatchOptions,
  ): void {
    resolveEventTarget(options?.target).dispatchEvent(createMfeEvent(type, detail));
  }
  ```
  However the TODO text shows a plain 3rd `target?` param. **Decision for the implementer:** prefer the 3-arg plain form is non-compliant; per `max-arguments-per-method` the implementer MUST use the `options`-object form (2 params) and re-export `DispatchOptions`. Update the public API wiring list in §10 accordingly. The plan therefore uses the options-object form. Document the divergence-from-TODO in the JSDoc so reviewers see why.

  > Reviewer note: this is the only intentional deviation from the literal TODO signatures and is mandated by the `max-arguments-per-method` rule. The behavior is identical.

- `resolveEventTarget` private (not exported), ≤2 params, ≤10 lines.
- Validation happens inside `create*` (per TODO), so dispatch delegates correctly.

---

## 9. Standalone Asserts — `src/assert.ts`

Throwing assert style (chosen over result-object) to match `create*`/`dispatch*` behavior and centralize validation in `validatePayload`.

```ts
import type { MfeEventMap, ShellEventMap } from './types.js';
import { validatePayload } from './validate-payload.js';

/**
 * Validates an MFE payload without constructing/dispatching a `CustomEvent`.
 * Throws {@link MfeEventValidationError} on failure. Useful for Shell/MFE
 * pre-checks (e.g. before proxying an inbound event).
 */
export function assertMfePayload<K extends keyof MfeEventMap>(
  type: K,
  detail: MfeEventMap[K],
): void {
  validatePayload(type, detail);
}

/**
 * Shell-side counterpart of {@link assertMfePayload}.
 */
export function assertShellPayload<K extends keyof ShellEventMap>(
  type: K,
  detail: ShellEventMap[K],
): void {
  validatePayload(type, detail);
}
```
- `validatePayload` stays internal (not re-exported). `assert*` are the public pre-check surface.
- 2 params each; body 1 line each.

---

## 10. Public API Wiring — `src/index.ts` (MODIFY)

Replace the existing `export * from './helpers.js';` with:
```ts
export * from './validation-error.js';
export * from './create-event.js';
export * from './guards.js';
export * from './dispatch.js';   // also exports `DispatchOptions`
export * from './assert.js';
```
Keep:
```ts
export * from './events.js';
export * from './payloads.js';
export * from './types.js';
```
Do **NOT** add: `export * from './validate-payload.js';`, nor `export * from './dtos/*';` (DTOs stay internal). `src/public-api.ts` is unchanged (re-exports `./index.js`).

---

## 11. Config Changes

### 11.1 `tsconfig.json`
Add inside `compilerOptions`:
```jsonc
"experimentalDecorators": true
```
No other changes. `emitDecoratorMetadata` stays absent.

### 11.2 `package.json`
- `dependencies` (new block, keep existing devDeps):
  ```json
  "dependencies": {
    "class-transformer": "0.5.1",
    "class-validator": "0.15.1",
    "reflect-metadata": "0.2.2"
  },
  ```
- `devDependencies` add:
  ```json
  "vitest": "4.1.10"
  ```
  (Keep existing `typescript` `^5.8.0`, `rimraf` `^6.0.1`.)
- `scripts` add:
  ```json
  "test": "vitest run",
  "test:watch": "vitest"
  ```
  Keep existing `build`, `typecheck`, `clean`.
- Leave `"sideEffects": false` (library entry has no global side effect; reflect-metadata is a consumer responsibility) — documented in next TODO's USAGE.md and in a short inline code note in `src/validate-payload.ts` or `src/create-event.ts` JSDoc.

### 11.3 `vitest.config.ts` (repo root)
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

### 11.4 `vitest.setup.ts` (repo root)
```ts
// Ensures `reflect-metadata` polyfill is loaded before any DTO decorator
// runs during tests. The library itself does NOT import this polyfill.
import 'reflect-metadata';
```

### 11.5 `.gitignore`
Verify `node_modules` and `dist` are ignored. Add `coverage/` (defensive; no coverage script added now). Use exact entries; do not match tracked files.

### 11.6 `.agent/project-structure.md`
Under `# Folders in src/` add:
```md
- src/dtos/ - internal class-validator DTOs mirroring payload interfaces (not exported from public-api)
```
Under `# Other folders` add:
```md
- test/ - Vitest unit tests (not part of the published package)
```

---

## 12. `reflect-metadata` Documentation Note (TODO task 1)

Add a short JSDoc block at the top of `src/create-event.ts` (and reference in `src/validate-payload.ts`) conveying:

> **Consumer requirement:** this library relies on `class-validator` decorators. Before importing `@cobranza-apps/mfe-events` in the app entry, import the `reflect-metadata` polyfill once: `import 'reflect-metadata';`. The library does **not** import it itself to avoid forcing a global side effect on every consumer.

Do not create a separate USAGE.md in this TODO (out of scope for TODO 03).

---

## 13. Unit Test Cases

Tests live in `test/` (outside `src/`) so `tsc` build (`include: src/**/*.ts`) never compiles specs. Vitest transforms `test/**/*.spec.ts` + the imported `src/**` with `experimentalDecorators` honored via `tsconfig.json`.

Node 22 provides global `Event`, `CustomEvent`, and `EventTarget` — **no jsdom/happy-dom polyfill required**.

### 13.1 `test/create-event.spec.ts`
Import `createMfeEvent`, `createShellEvent`, `MfeEventValidationError`, `MFE_EVENTS`, `SHELL_EVENTS`, `SCHEMA_VERSION`.

| # | Case | Expected |
|---|---|---|
| CE-1 | `createMfeEvent(MFE_EVENTS.UPDATE_HEADER, valid UpdateHeader incl `schemaVersion: SCHEMA_VERSION`) | returns `CustomEvent` with `event.type === MFE_EVENTS.UPDATE_HEADER`, `event.bubbles === true`, `event.detail` deep-equal to input. |
| CE-2 | `createMfeEvent(MFE_EVENTS.UPDATE_HEADER, { ...valid without schemaVersion })` | throws `MfeEventValidationError` whose `eventType === MFE_EVENTS.UPDATE_HEADER`. |
| CE-3 | `createMfeEvent(MFE_EVENTS.UPDATE_HEADER, { ...valid, schemaVersion: 0 })` | throws `MfeEventValidationError` (message mentions mismatch). |
| CE-4 | `createMfeEvent(MFE_EVENTS.UPDATE_HEADER, { ...valid, schemaVersion: 999 })` | throws `MfeEventValidationError`. |
| CE-5 | `createMfeEvent(MFE_EVENTS.MODULE_ERROR, { ...valid but omit `message` })` | throws `MfeEventValidationError` with an `errors` entry whose `property === 'message'`. |
| CE-6 | `createMfeEvent(MFE_EVENTS.REQUEST_FULLSCREEN, { ...valid but omit `instanceId` })` | throws `MfeEventValidationError` with `property === 'instanceId'`. |
| CE-7 | `createMfeEvent(MFE_EVENTS.UPDATE_HEADER, null)` | throws `MfeEventValidationError` ("non-null object"). |
| CE-8 | `createMfeEvent(MFE_EVENTS.UPDATE_HEADER, 'oops')` | throws `MfeEventValidationError` ("non-null object"). |
| CE-9 | `createShellEvent(SHELL_EVENTS.MODULE_STATE, full valid ModuleState incl all six fields) | returns `CustomEvent` with `type === SHELL_EVENTS.MODULE_STATE`, `bubbles === true`. |
| CE-10 | `createShellEvent(SHELL_EVENTS.THEME_CHANGED, { schemaVersion: SCHEMA_VERSION })` (missing `theme`) | throws `MfeEventValidationError` with `property === 'theme'`. |
| CE-11 | `createShellEvent(SHELL_EVENTS.MODULE_STATE, { ...valid, size: '25%' })` | throws with `property === 'size'`. |

Helper factory `validUpdateHeader()` etc. per spec to avoid repeating literals (self-documenting, DRY). Keep each spec file under ~120 lines.

### 13.2 `test/guards.spec.ts`
| # | Case | Expected |
|---|---|---|
| G-1 | `isMfeEvent(new CustomEvent(MFE_EVENTS.UPDATE_HEADER), MFE_EVENTS.UPDATE_HEADER)` | `true`; narrowed type usable. |
| G-2 | `isMfeEvent(new CustomEvent(MFE_EVENTS.MODULE_READY), MFE_EVENTS.UPDATE_HEADER)` | `false`. |
| G-3 | `isMfeEvent(new Event(MFE_EVENTS.UPDATE_HEADER), MFE_EVENTS.UPDATE_HEADER)` (plain `Event`) | `false` (not a `CustomEvent`). |
| G-4 | `isShellEvent(new CustomEvent(SHELL_EVENTS.THEME_CHANGED), SHELL_EVENTS.THEME_CHANGED)` | `true`. |
| G-5 | `isShellEvent(new CustomEvent(SHELL_EVENTS.MODULE_STATE), SHELL_EVENTS.THEME_CHANGED)` | `false`. |

### 13.3 `test/dispatch.spec.ts`
Use a real `EventTarget` and `vi.spyOn(target, 'dispatchEvent')` (Vitest's `vi`). Provide/explicit `window` via `globalThis` only where needed.

| # | Case | Expected |
|---|---|---|
| D-1 | `dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, valid, { target })` | `dispatchEvent` called once with a `CustomEvent` of the right type. |
| D-2 | `dispatchShellEvent(SHELL_EVENTS.MODULE_STATE, valid, { target })` | event passed to `dispatchEvent` has `type === SHELL_EVENTS.MODULE_STATE`. |
| D-3 | `dispatchMfeEvent(...invalid detail..., { target })` | throws `MfeEventValidationError` **before** `dispatchEvent` is called (assert spy call count 0). |
| D-4 | `dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, valid)` with `globalThis.window` defined (assign a stub `EventTarget` as `globalThis.window` in the test, restore after) | spy on that stub is called. |
| D-5 | `dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, valid)` with `globalThis.window` deleted/`undefined` and no `target` option | throws plain `Error` mentioning "dispatch target". |

### 13.4 `test/validate-payload.spec.ts` (covered via `assertMfePayload`/`assertShellPayload`)
| # | Case | Expected |
|---|---|---|
| V-1 | `assertMfePayload` with unknown event type `'mfe:bogus'` | throws `MfeEventValidationError` ("no payload DTO registered"). |
| V-2 | `assertMfePayload(MFE_EVENTS.REQUEST_ADD_MODULE, valid with `initialData: { q: 'a' }`) | does not throw (plain object allowed). |
| V-3 | `assertMfePayload(MFE_EVENTS.REQUEST_ADD_MODULE, valid with `initialData: 'str'`) | throws with `property === 'initialData'`. |
| V-4 | Extra unknown field on a valid payload | does **not** throw (practical — no `forbidNonWhitelisted`). |
| V-5 | `UpdateHeader` with `status: null` | does not throw. |
| V-6 | `UpdateHeader` with `status: 'bogus'` | throws with `property === 'status'`. |
| V-7 | `assertMfePayload(MFE_EVENTS.SHOW_NOTIFICATION, { ...valid, type: 'bogus' })` | throws with `property === 'type'`. |
| V-8 | `assertShellPayload(SHELL_EVENTS.VISIBILITY_CHANGED, { ...valid, reason: 7 })` | throws with `property === 'reason'`. |

### 13.5 `test/assert.spec.ts`
| # | Case | Expected |
|---|---|---|
| A-1 | `assertMfePayload(MFE_EVENTS.UPDATE_HEADER, valid)` | does not throw (returns `undefined`). |
| A-2 | `assertMfePayload(MFE_EVENTS.MODULE_ERROR, { ...valid, message: undefined })` | throws `MfeEventValidationError` with `errors` entry `property === 'message'` and `eventType` set. |
| A-3 | `assertShellPayload(SHELL_EVENTS.THEME_CHANGED, valid)` | does not throw. |
| A-4 | thrown error is `instanceof MfeEventValidationError` and `instanceof Error` | both true. |

---

## 14. Step-by-Step Implementation Order (for Implementer in 4.2)

1. **Pre-check git state:** `git status` (on `feat/todo-03-helpers-validation`). Confirm no stray tracked `.gitignore`-matching files staged (per `gitignore-compliance` rule).
2. **Update `package.json`** (§11.2) — add 3 deps + `vitest` devDep + `test`/`test:watch` scripts.
3. **Install:** `npm install` (allowed bash pattern `npm install`). Verify `node_modules/` not staged afterward.
4. **Update `tsconfig.json`** (§11.1) — add `experimentalDecorators`.
5. **Create `vitest.config.ts` + `vitest.setup.ts`** (§11.3, §11.4).
6. **Verify `.gitignore`** (§11.5).
7. **Create DTO files** in order: `module-identity-dto.ts` → `mfe-payload-dtos.ts` → `shell-payload-dtos.ts` → `payload-dto-registry.ts` (§3).
8. **Create `src/validation-error.ts`** (§4).
9. **Create `src/validate-payload.ts`** (§5).
10. **Create `src/create-event.ts`** (§6) including the `reflect-metadata` consumer-note JSDoc (§12).
11. **Create `src/guards.ts`** (§7). Remove the spurious `import type { Event }` hint before saving.
12. **Create `src/dispatch.ts`** (§8) using the `DispatchOptions` object form (2-param public API).
13. **Create `src/assert.ts`** (§9).
14. **Delete `src/helpers.ts`**. Use `vscode-mcp-server`/`bash` `git rm` — keep workspace clean.
15. **Modify `src/index.ts`** (§10).
16. **Update `.agent/project-structure.md`** (§11.6).
17. **Create tests** (§13.1–§13.5). Each spec must `import '../../vitest.setup'`? No — Vitest `setupFiles` loads it globally; specs just import from `../src/...` (use `.js` specifiers per `module: NodeNext`? TypeScript source test files importing compiled-via-vitest src use the same `.js` extension convention as TS NodeNext requires; Vitest's resolver accepts `.js` → `.ts` resolution since it mirrors the bundler/TS path). Use `.js` import specifiers to match the rest of the codebase.
18. **Run typecheck:** `npm run typecheck` — must pass (`experimentalDecorators` honored; DTOs compile).
19. **Run build:** `npm run build` — must emit `dist/` with the new modules and NOT the `test/` specs.
20. **Run tests:** `npm run test` — all cases in §13 pass.
21. **Commit in logical chunks** (implementer chooses messages; no force-add of ignored files). Suggested commits:
    - `chore: add class-validator/class-transformer/reflect-metadata + vitest devDep`
    - `feat(validation): add MfeEventValidationError and internal DTOs`
    - `feat(helpers): add create/guard/dispatch/assert helpers with payload validation`
    - `test: add Vitest suite for helpers & validation`
    - `docs: update project-structure + reflect-metadata consumer note`
22. Verify no `node_modules/` / `dist/` staged before each commit (gitignore-compliance).

---

## 15. Build / Test / Verification Gates (Implementer must hit before 4.3)

| Gate | Command | Required result |
|---|---|---|
| Typecheck | `npm run typecheck` | exit 0 |
| Build | `npm run build` | exit 0; `dist/` populated; no `test/` artifacts in `dist/` |
| Tests | `npm run test` | all §13 cases pass |
| Gitignore | `git status` before commits | no `node_modules/` / `dist/` staged |

---

## 16. Compliance Checklist (against `.kilo/rules/`)

- [x] max-lines-per-file: DTOs split (mfe/shell), helpers split into 4 modules; each file projected <200 lines.
- [x] max-lines-per-method: every function body ≤ ~15 lines; far under 50.
- [x] max-depth: no nesting beyond 2 levels; `validatePayload` body is flat sequence of helper calls.
- [x] max-arguments-per-method: all public/internal functions ≤2 params; `MfeEventValidationError` constructor uses `context` object; dispatch uses `DispatchOptions`.
- [x] single-section-boolean-conditions: no compound `&&` conditions in `if`s except the single `instanceof && ===` inside guards (two simple sections in a guard — acceptable as a single readable predicate; if reviewer flags, extract to `isMatchingCustomEvent(event, type)` helper). **Pre-emptive:** implementer extracts the guard predicate into `isMatchingCustomEvent(event, type)` to conform strictly.
- [x] prefer-private-members: module-only helpers not exported; DTO registry internal.
- [x] self-documenting-code: descriptive names; constants replace magic strings; JSDoc on public APIs.
- [x] new- newline-prevention: plan content uses real newlines; implementer must write files with literal newlines.
- [x] no-commented-code: no dead code.
- [x] gitignore-compliance: enforced before each commit step.
- [x] git-remote-safety: no push in this step.
- [x] project-structure: `src/dtos/` and `test/` added to `.agent/project-structure.md`.
- [x] Workflow adherence: this is step 4.1b only; 4.2+ not executed here.

---

## 17. Constraints Honored by This Plan

- No source/dependency/config files were modified to produce this plan.
- No dependencies installed.
- Public payload **interfaces** (TODO 02) remain interfaces; DTOs are internal validation-only classes (§3), NOT exported from `public-api.ts` (§10).
- `reflect-metadata` is NOT imported in the library entry; only in `vitest.setup.ts` (tests) — matching the global pre-analysis decision.
- `experimentalDecorators: true` added; `emitDecoratorMetadata` remains off.
- `bubbles: true` used (documented) for `create*`.
- Guards are cheap (no payload re-validation).
- `assert*` throwing style chosen; `validatePayload` kept internal.
- All TODO task 8 tests are covered in §13 plus named edge cases.

---

## 18. Known Risks / Notes for the Implementer & Reviewer

1. **class-validator CJS named-export interop under NodeNext ESM:** If `npm run typecheck` reports "Module 'class-validator' has no exported member 'IsString'" (a type-resolution edge case on some TS versions), fall back to `import validator from 'class-validator'; const { IsString } = validator;` using `esModuleInterop`. This is a fallback only — the primary path (named imports) is expected to work because the package ships bundled `.d.ts` with explicit named exports.
2. **`satisfies` with computed literal keys in strict mode:** If TS rejects `satisfies Record<MfeEventName, PayloadDtoCtor>` on the DTO maps, annotate them explicitly (`const MFE_PAYLOAD_DTOS: Record<MfeEventName, PayloadDtoCtor> = { ... }`) — same behavioral guarantee.
3. **Guard predicate two-section condition:** §16 flagged the `instanceof && ===` form; implementer MUST extract `isMatchingCustomEvent(event, type)` private helper to strictly satisfy the single-section rule. Both `isMfeEvent`/`isShellEvent` call it.
4. **`CustomEvent` generic in Node lib:** `new CustomEvent<MfeEventMap[K]>(...)` requires lib DOM present (`tsconfig.json` already has `"lib": ["ES2022","DOM"]`).
5. **`exactOptionalPropertyTypes`:** DTO optional fields decorated with `@IsOptional()` are typed `field?: T`. `@IsOptional()` makes `undefined` and `null` both pass — matching the `ModuleStatus | null` interface.
6. **Tests import `.js` specifiers:** Vitest resolves `.js` to `.ts` via its TS/Vite pipeline; no `.ts`-specifier imports. Consistent with the existing codebase convention.

---

**Plan file path returned to caller:** `.kilo/plans/20260801-todo-03-helpers-validation-task.md`

# Code Review Fix Plan

Generated by code-reviewer sub-agent during step 4.3.

## Issues Summary

| # | Severity | File | Issue |
|---|---|---|---|
| 1 | low | `src/validate-payload.ts` | `assertDetailIsObject` uses a compound `if` condition (`detail === null` combined with `typeof detail !== 'object'`), violating the `single-section-boolean-conditions` rule. |

## Fix Details

### 1. Extract non-null-object predicate in `src/validate-payload.ts`

**Location:** `src/validate-payload.ts`, lines 25–32 (function `assertDetailIsObject`).

**Current code:**
```ts
function assertDetailIsObject(type: string, detail: unknown): asserts detail is object {
  if (detail === null || typeof detail !== 'object') {
    throw new MfeEventValidationError(
      `Event "${type}" detail must be a non-null object.`,
      { eventType: type },
    );
  }
}
```

**Required change:**
Add a tiny private predicate `isNonNullObject` and replace the compound `if` with a single-section early-return:

```ts
function isNonNullObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

function assertDetailIsObject(type: string, detail: unknown): asserts detail is object {
  if (isNonNullObject(detail)) return;
  throw new MfeEventValidationError(
    `Event "${type}" detail must be a non-null object.`,
    { eventType: type },
  );
}
```

**Rationale:** Keeps the runtime behavior identical (rejects `null`, primitives, and `undefined`) while satisfying the `single-section-boolean-conditions` rule and the `max-arguments-per-method` / `max-lines-per-method` constraints. The new helper is private to the module, has one parameter, and a one-line body.

## Notes / Not Flagged

- `MfeEventValidationError.eventType` is declared as `string | undefined` instead of the plan's `eventType?: string`. This is a deliberate, correct adjustment: with `exactOptionalPropertyTypes: true`, assigning `context.eventType` (which may be `undefined`) to an optional property would require an explicit guard. The current public type is equivalent for consumers and compiles cleanly.
- `DispatchOptions` / options-object dispatch signature replaces the TODO's 3rd positional `target?` parameter as required by the `max-arguments-per-method` rule; behavior is unchanged.
- The `isMatchingCustomEvent` predicate used by the guards is already extracted into a private helper per the plan's pre-emptive note; its return expression is a predicate inside a private helper, not a control-flow statement.
- All other plan items, test cases, DTO/interface parity, `reflect-metadata` isolation, and public API boundaries were verified and found compliant.


# Simplification Plan

This plan was generated in step 4.3 (Code Simplification). It identifies concrete simplification opportunities in the implementation produced by step 4.2 while preserving every public API signature and runtime behavior.

## 1. Shared test fixtures and error helper (highest impact)

Several test files independently define the same fixture factories and the same `captureError` utility. This is the largest source of duplication in the codebase.

### 1.1 Create `test/helpers.ts`

Create a new `test/helpers.ts` module with the shared factories and helper:

```ts
import { expect } from 'vitest';
import type { ModuleStatePayload, UpdateHeaderPayload } from '../src/payloads.js';
import { SCHEMA_VERSION } from '../src/types.js';
import { MfeEventValidationError } from '../src/validation-error.js';

export function validUpdateHeader(): UpdateHeaderPayload {
  return {
    schemaVersion: SCHEMA_VERSION,
    moduleType: 'clients',
    instanceId: 'abc-123',
    title: 'Clientes',
    status: 'loaded',
  };
}

export function validModuleState(): ModuleStatePayload {
  return {
    schemaVersion: SCHEMA_VERSION,
    moduleType: 'clients',
    instanceId: 'abc-123',
    size: '100%',
    width: 800,
    height: 600,
    isCollapsed: false,
    isFullscreen: false,
  };
}

export function validThemeChanged() {
  return { schemaVersion: SCHEMA_VERSION, theme: 'gray-intermediate' };
}

export function validRequestAddModule() {
  return { schemaVersion: SCHEMA_VERSION, moduleType: 'clients' };
}

export function validVisibilityChanged() {
  return {
    schemaVersion: SCHEMA_VERSION,
    moduleType: 'clients',
    instanceId: 'abc-123',
    visible: true,
  };
}

export function captureError(action: () => void): MfeEventValidationError {
  try {
    action();
    throw new Error('Expected action to throw MfeEventValidationError');
  } catch (error) {
    expect(error).toBeInstanceOf(MfeEventValidationError);
    return error as MfeEventValidationError;
  }
}

export function expectErrorProperty(error: MfeEventValidationError, property: string): void {
  expect(error.errors.map((entry) => entry.property)).toContain(property);
}
```

### 1.2 Update test files to import helpers

Replace local definitions with imports from `./helpers.js` in:
- `test/create-event.spec.ts`
- `test/dispatch.spec.ts`
- `test/validate-payload.spec.ts`
- `test/assert.spec.ts`

Expected line reductions:
- `test/create-event.spec.ts`: ~126 → ~85 lines
- `test/dispatch.spec.ts`: ~84 → ~55 lines
- `test/validate-payload.spec.ts`: ~99 → ~70 lines
- `test/assert.spec.ts`: ~67 → ~45 lines

### 1.3 Replace repeated `expect(error.errors.map(...)).toContain(...)` with `expectErrorProperty`

After the shared helper is available, replace the repeated `map`/`toContain` assertions in the four test files with `expectErrorProperty(error, 'property')`.

## 2. Generic internal event creator in `src/create-event.ts`

`createMfeEvent` and `createShellEvent` share the same body: `validatePayload(type, detail); return new CustomEvent(..., { detail, bubbles: true });`. Extract a single private generic helper so the public functions are thin adapters.

```ts
function createEvent<T>(type: string, detail: T): CustomEvent<T> {
  validatePayload(type, detail);
  return new CustomEvent<T>(type, { detail, bubbles: true });
}

export function createMfeEvent<K extends keyof MfeEventMap>(
  type: K,
  detail: MfeEventMap[K],
): CustomEvent<MfeEventMap[K]> {
  return createEvent(type, detail);
}

export function createShellEvent<K extends keyof ShellEventMap>(
  type: K,
  detail: ShellEventMap[K],
): CustomEvent<ShellEventMap[K]> {
  return createEvent(type, detail);
}
```

This preserves the public signatures, keeps the JSDoc on the public functions, and removes the duplicated body.

## 3. Generic internal assert helper in `src/assert.ts` (optional)

`assertMfePayload` and `assertShellPayload` are identical single-line wrappers. Extracting a private `assertPayload` helper reduces duplication slightly, although the win is smaller than the test helpers.

```ts
function assertPayload<T>(type: string, detail: T): void {
  validatePayload(type, detail);
}

export function assertMfePayload<K extends keyof MfeEventMap>(
  type: K,
  detail: MfeEventMap[K],
): void {
  assertPayload(type, detail);
}

export function assertShellPayload<K extends keyof ShellEventMap>(
  type: K,
  detail: ShellEventMap[K],
): void {
  assertPayload(type, detail);
}
```

Note: The two public functions are already so small that this is optional. If the implementer prefers explicitness over DRY, skip this change.

## 4. What was intentionally NOT simplified

The following items were reviewed and kept as-is:

- **`src/validate-payload.ts` helper chain**: The sequence of `assertDetailIsObject`, `assertKnownEventType`, `assertSchemaVersion`, `assertNoErrors` is intentionally readable and each helper has a single responsibility. The `asserts` type predicates are the cleanest way to narrow types for the next step.
- **DTO split into `mfe-payload-dtos.ts` / `shell-payload-dtos.ts`**: A combined file would be ~123 lines, still within the rule, but the MFE/Shell separation mirrors the `payloads.ts` and `events.ts` split and keeps imports focused.
- **Empty DTO classes (`RequestFullscreenDto`, `RequestRemoveDto`, `ModuleReadyDto`)**: They keep the registry uniform and provide extension points for future payload fields without changing the registry.
- **Dispatch function duplication**: `dispatchMfeEvent` and `dispatchShellEvent` are only 5 lines each; a generic helper would require either a 4-argument function (violating `max-arguments-per-method`) or a context object (adding more abstraction than value). The current duplication is acceptable.
- **JSDoc on `src/create-event.ts`**: The consumer requirement note is intentionally verbose because it documents a critical setup step.

## 5. Compliance note

All proposed changes keep every source file under the 200-line limit. The new `test/helpers.ts` is expected to be ~70 lines, and all refactored test files will shrink.
