import type { MfeEventMap, ShellEventMap } from './types.js';
import { validatePayload } from './validate-payload.js';

/**
 * Validates an MFE payload without constructing/dispatching a `CustomEvent`.
 * Throws {@link MfeEventValidationError} on failure. Useful for Shell/MFE
 * pre-checks (e.g. before proxying an inbound event).
 *
 * @throws {MfeEventValidationError} if `detail` is invalid.
 */
export function assertMfePayload<K extends keyof MfeEventMap>(
  type: K,
  detail: MfeEventMap[K],
): void {
  validatePayload(type, detail);
}

/**
 * Shell-side counterpart of {@link assertMfePayload}.
 *
 * @throws {MfeEventValidationError} if `detail` is invalid.
 */
export function assertShellPayload<K extends keyof ShellEventMap>(
  type: K,
  detail: ShellEventMap[K],
): void {
  validatePayload(type, detail);
}
