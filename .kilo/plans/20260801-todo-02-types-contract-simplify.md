# Simplification Plan — TODO-02 Types Contract

**Files reviewed:** `src/events.ts`, `src/payloads.ts`, `src/types.ts`

## Simplifications suggested

### 1. Extract a shared `SchemaVersion` base interface

**File:** `src/types.ts`

Add a small base interface that owns the `schemaVersion` property and its JSDoc once:

```ts
/**
 * Required on every payload. Must equal `SCHEMA_VERSION` for this library major.
 */
export interface SchemaVersion {
  schemaVersion: number;
}
```

**Rationale:** `schemaVersion` appears in every payload with the same JSDoc text repeated 10 times. Extracting it removes duplication and makes the contract easier to maintain when the major version changes.

### 2. Extend payloads from `SchemaVersion` (and `ModuleIdentity` where needed)

**File:** `src/payloads.ts`

Replace every payload's own `schemaVersion: number` property with `extends SchemaVersion`:

- `RequestAddModulePayload extends SchemaVersion`
- `RequestFullscreenPayload extends ModuleIdentity, SchemaVersion`
- `RequestRemovePayload extends ModuleIdentity, SchemaVersion`
- `UpdateHeaderPayload extends ModuleIdentity, SchemaVersion`
- `ShowNotificationPayload extends SchemaVersion`
- `ModuleReadyPayload extends ModuleIdentity, SchemaVersion`
- `ModuleErrorPayload extends ModuleIdentity, SchemaVersion`
- `ModuleStatePayload extends ModuleIdentity, SchemaVersion`
- `ThemeChangedPayload extends SchemaVersion`
- `VisibilityChangedPayload extends ModuleIdentity, SchemaVersion`

Remove the repeated `schemaVersion` JSDoc blocks inside each payload.

**Rationale:** Keeps the same public type shape while eliminating duplication. The event-specific JSDoc remains intact (who emits, who listens, purpose).

### 3. Inline `MfeEventName` / `ShellEventName` type definitions

**File:** `src/events.ts`

Change the two-line declarations to single-line ones:

```ts
export type MfeEventName = (typeof MFE_EVENTS)[keyof typeof MFE_EVENTS];
export type ShellEventName = (typeof SHELL_EVENTS)[keyof typeof SHELL_EVENTS];
```

**Rationale:** The current two-line formatting is unnecessarily verbose for simple type aliases. A single line is still readable and slightly reduces file noise.

## What is NOT being changed

- `SCHEMA_VERSION` stays as `1 as const` — the literal type is intentional.
- `ModuleStatus`, `ModuleSize`, `ModuleIdentity`, and `InstanceId` remain as defined.
- Event map structures (`MfeEventMap`, `ShellEventMap`) remain unchanged.
- Public API exports (`index.ts`, `public-api.ts`) remain unchanged.
- Per-payload event-specific JSDoc is preserved; only the duplicated `schemaVersion` JSDoc is removed.
- No new dependencies or runtime helpers are added.

## Compliance check

| Rule | Status |
|------|--------|
| Max lines per file (≤200) | Pass: `events.ts` 58, `payloads.ts` 145, `types.ts` 82 |
| Max lines per method | Pass: no methods in these files |
| Max depth (≤2) | Pass: no nested blocks |
| Self-documenting code | Pass: names are explicit |
| No commented-out code | Pass: none found |
| Single-section boolean conditions | N/A: no conditionals |

## Outcome

After applying these changes, the type contract remains identical at the public API level, but the code is shorter and easier to maintain. The duplication of the `schemaVersion` property and JSDoc is removed.
