/**
 * @file Internal barrel that re-exports all public symbols.
 *
 * Aggregates and re-exports every public symbol from the library's sub-modules.
 * Consumed by `public-api.ts` (the single entry point declared in `package.json`).
 *
 * Public surface re-exported here:
 * - `events.js` — `MFE_EVENTS`, `SHELL_EVENTS`, event name types.
 * - `payloads.js` — payload interfaces for every event.
 * - `types.js` — `SCHEMA_VERSION`, `MfeEventMap`, `ShellEventMap`, shared aliases.
 * - `validation-error.js` — {@link MfeEventValidationError} and related types.
 * - `create-event.js` — {@link createMfeEvent}, {@link createShellEvent}.
 * - `guards.js` — {@link isMfeEvent}, {@link isShellEvent}.
 * - `dispatch.js` — {@link dispatchMfeEvent}, {@link dispatchShellEvent}, {@link DispatchOptions}.
 * - `assert.js` — {@link assertMfePayload}, {@link assertShellPayload}.
 *
 * Internal modules (DTOs, `validate-payload`) are **not** re-exported.
 *
 * @see {@link file://./public-api.ts} for the package's public entry point.
 */
export * from './events.js';
export * from './payloads.js';
export * from './types.js';
export * from './validation-error.js';
export * from './create-event.js';
export * from './guards.js';
export * from './dispatch.js';
export * from './assert.js';
