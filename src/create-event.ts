/**
 * @file Core event creators with runtime payload validation.
 *
 * Exports {@link createMfeEvent} and {@link createShellEvent} — validate
 * `detail` (including `schemaVersion === SCHEMA_VERSION`) then return a
 * `CustomEvent` with `bubbles: true`. Throw {@link MfeEventValidationError}
 * on invalid payloads.
 *
 * **Consumer requirement:** this library relies on `class-validator` decorators.
 * Before importing `@cobranza-apps/mfe-events` in the app entry, import the
 * `reflect-metadata` polyfill once: `import 'reflect-metadata';`. The library
 * does **not** import it itself to avoid forcing a global side effect on every
 * consumer.
 *
 * @see {@link file://./validate-payload.ts} for the internal validation pipeline.
 * @see {@link file://./dispatch.ts} for validate-and-dispatch helpers.
 */

import type { MfeEventMap, ShellEventMap } from './types.js';
import { validatePayload } from './validate-payload.js';

function createEvent<T>(type: string, detail: T): CustomEvent<T> {
  validatePayload(type, detail);
  return new CustomEvent<T>(type, { detail, bubbles: true });
}

/**
 * Creates a validated `CustomEvent<MfeEventMap[K]>` for an MFE → Shell event.
 * Validates `detail` (including `schemaVersion === SCHEMA_VERSION`) before
 * constructing the event. `bubbles: true` so the Shell can listen on
 * `window` or a parent container if needed.
 *
 * @param type - MFE event name constant from {@link MFE_EVENTS}.
 * @param detail - Payload matching `MfeEventMap[K]`. Must include `schemaVersion: SCHEMA_VERSION`.
 * @returns A `CustomEvent` ready to be dispatched via `EventTarget.dispatchEvent`.
 * @throws {MfeEventValidationError} if `detail` is invalid (missing `schemaVersion`, wrong shape, or unknown event type).
 *
 * @example
 * const event = createMfeEvent(MFE_EVENTS.UPDATE_HEADER, {
 *   schemaVersion: SCHEMA_VERSION, moduleType: 'clients', instanceId: 'abc', title: 'Clientes',
 * });
 * window.dispatchEvent(event);
 */
export function createMfeEvent<K extends keyof MfeEventMap>(
  type: K,
  detail: MfeEventMap[K],
): CustomEvent<MfeEventMap[K]> {
  return createEvent(type, detail);
}

/**
 * Creates a validated `CustomEvent<ShellEventMap[K]>` for a Shell → MFE event.
 * Same validation and bubbling rules as {@link createMfeEvent}.
 *
 * @param type - Shell event name constant from {@link SHELL_EVENTS}.
 * @param detail - Payload matching `ShellEventMap[K]`. Must include `schemaVersion: SCHEMA_VERSION`.
 * @returns A `CustomEvent` ready to be dispatched via `EventTarget.dispatchEvent`.
 * @throws {MfeEventValidationError} if `detail` is invalid.
 *
 * @example
 * const event = createShellEvent(SHELL_EVENTS.THEME_CHANGED, {
 *   schemaVersion: SCHEMA_VERSION, theme: 'gray-intermediate',
 * });
 * window.dispatchEvent(event);
 */
export function createShellEvent<K extends keyof ShellEventMap>(
  type: K,
  detail: ShellEventMap[K],
): CustomEvent<ShellEventMap[K]> {
  return createEvent(type, detail);
}
