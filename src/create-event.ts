/**
 * Core event creators with runtime payload validation.
 *
 * **Consumer requirement:** this library relies on `class-validator` decorators.
 * Before importing `@cobranza-apps/mfe-events` in the app entry, import the
 * `reflect-metadata` polyfill once: `import 'reflect-metadata';`. The library
 * does **not** import it itself to avoid forcing a global side effect on every
 * consumer.
 *
 * @see {@link file://./validate-payload.ts} for the internal validation pipeline.
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
 * @throws {MfeEventValidationError} if `detail` is invalid.
 */
export function createMfeEvent<K extends keyof MfeEventMap>(
  type: K,
  detail: MfeEventMap[K],
): CustomEvent<MfeEventMap[K]> {
  return createEvent(type, detail);
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
  return createEvent(type, detail);
}
