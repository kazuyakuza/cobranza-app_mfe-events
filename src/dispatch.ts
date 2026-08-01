import type { MfeEventMap, ShellEventMap } from './types.js';
import { createMfeEvent, createShellEvent } from './create-event.js';

/**
 * Optional dispatch options. The `target`-as-options-object form (instead of a
 * bare third positional parameter) is intentional: it keeps the public
 * signature within two parameters per the project's `max-arguments-per-method`
 * rule while preserving the TODO's `target?` capability.
 */
export interface DispatchOptions {
  readonly target?: EventTarget;
}

/**
 * Validates `detail` (via {@link createMfeEvent}) and dispatches the resulting
 * `CustomEvent` on `options.target` (defaults to `window` in browser-like
 * contexts).
 *
 * @throws {MfeEventValidationError} if `detail` is invalid.
 * @throws {Error} if `target` is omitted and `window` is unavailable (non-browser).
 */
export function dispatchMfeEvent<K extends keyof MfeEventMap>(
  type: K,
  detail: MfeEventMap[K],
  options?: DispatchOptions,
): void {
  resolveEventTarget(options?.target).dispatchEvent(createMfeEvent(type, detail));
}

/**
 * Shell-side counterpart of {@link dispatchMfeEvent}.
 */
export function dispatchShellEvent<K extends keyof ShellEventMap>(
  type: K,
  detail: ShellEventMap[K],
  options?: DispatchOptions,
): void {
  resolveEventTarget(options?.target).dispatchEvent(createShellEvent(type, detail));
}

function resolveEventTarget(target?: EventTarget): EventTarget {
  if (target) return target;
  const wnd = (globalThis as { window?: EventTarget }).window;
  if (wnd) return wnd;
  throw new Error(
    'mfe-events: dispatch target omitted and `window` is undefined in this environment; pass an explicit EventTarget.',
  );
}
