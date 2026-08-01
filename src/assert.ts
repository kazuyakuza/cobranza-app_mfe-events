import type { MfeEventMap, ShellEventMap } from './types.js';
import { validatePayload } from './validate-payload.js';

function assertPayload<T>(type: string, detail: T): void {
  validatePayload(type, detail);
}

/**
 * Validates an MFE payload without constructing/dispatching a `CustomEvent`.
 * Throws {@link MfeEventValidationError} on failure. Useful for Shell/MFE
 * pre-checks (e.g. before proxying an inbound event).
 *
 * @param type - MFE event name constant from {@link MFE_EVENTS}.
 * @param detail - Payload matching `MfeEventMap[K]`. Must include `schemaVersion: SCHEMA_VERSION`.
 * @throws {MfeEventValidationError} if `detail` is invalid.
 *
 * @example
 * import { MFE_EVENTS, SCHEMA_VERSION, assertMfePayload } from '@cobranza-apps/mfe-events';
 *
 * assertMfePayload(MFE_EVENTS.UPDATE_HEADER, {
 *   schemaVersion: SCHEMA_VERSION,
 *   moduleType: 'clients',
 *   instanceId: 'inst-abc',
 *   status: 'dirty',
 *   title: 'Clientes — sin guardar',
 * });
 */
export function assertMfePayload<K extends keyof MfeEventMap>(
  type: K,
  detail: MfeEventMap[K],
): void {
  assertPayload(type, detail);
}

/**
 * Shell-side counterpart of {@link assertMfePayload}. Validates a Shell
 * payload without constructing/dispatching a `CustomEvent`.
 *
 * @param type - Shell event name constant from {@link SHELL_EVENTS}.
 * @param detail - Payload matching `ShellEventMap[K]`. Must include `schemaVersion: SCHEMA_VERSION`.
 * @throws {MfeEventValidationError} if `detail` is invalid.
 *
 * @example
 * import { SHELL_EVENTS, SCHEMA_VERSION, assertShellPayload } from '@cobranza-apps/mfe-events';
 *
 * assertShellPayload(SHELL_EVENTS.MODULE_STATE, {
 *   schemaVersion: SCHEMA_VERSION,
 *   moduleType: 'clients',
 *   instanceId: 'inst-abc',
 *   size: '50%',
 *   width: 640,
 *   height: 720,
 *   isCollapsed: false,
 *   isFullscreen: false,
 * });
 */
export function assertShellPayload<K extends keyof ShellEventMap>(
  type: K,
  detail: ShellEventMap[K],
): void {
  assertPayload(type, detail);
}
