import type { MfeEventMap, ShellEventMap } from './types.js';
import { createMfeEvent, createShellEvent } from './create-event.js';

/**
 * Options for {@link dispatchMfeEvent} and {@link dispatchShellEvent}.
 *
 * @property target - Explicit `EventTarget` to dispatch on. When omitted the
 *   function falls back to `globalThis.window`. Pass an explicit target when
 *   running outside a browser (SSR, tests) or when dispatching on a scoped
 *   element rather than `window`.
 */
export interface DispatchOptions {
  readonly target?: EventTarget;
}

/**
 * Validates `detail` (via {@link createMfeEvent}) and dispatches the resulting
 * `CustomEvent` on `options.target` (defaults to `window` in browser-like
 * contexts).
 *
 * @param type - MFE event name constant from {@link MFE_EVENTS}.
 * @param detail - Payload matching `MfeEventMap[K]`. Must include `schemaVersion: SCHEMA_VERSION`.
 * @param options - Optional {@link DispatchOptions}. Defaults to dispatching on `window`.
 * @throws {MfeEventValidationError} if `detail` is invalid.
 * @throws {Error} if `target` is omitted and `window` is unavailable (non-browser).
 *
 * @example
 * dispatchMfeEvent(MFE_EVENTS.SHOW_NOTIFICATION, {
 *   schemaVersion: SCHEMA_VERSION, type: 'success', message: 'Saved',
 * });
 */
export function dispatchMfeEvent<K extends keyof MfeEventMap>(
  type: K,
  detail: MfeEventMap[K],
  options?: DispatchOptions,
): void {
  resolveEventTarget(options?.target).dispatchEvent(createMfeEvent(type, detail));
}

/**
 * Shell-side counterpart of {@link dispatchMfeEvent}. Validates `detail`
 * (via {@link createShellEvent}) and dispatches on `options.target`.
 *
 * @param type - Shell event name constant from {@link SHELL_EVENTS}.
 * @param detail - Payload matching `ShellEventMap[K]`. Must include `schemaVersion: SCHEMA_VERSION`.
 * @param options - Optional {@link DispatchOptions}. Defaults to dispatching on `window`.
 * @throws {MfeEventValidationError} if `detail` is invalid.
 * @throws {Error} if `target` is omitted and `window` is unavailable (non-browser).
 *
 * @example
 * dispatchShellEvent(SHELL_EVENTS.THEME_CHANGED, {
 *   schemaVersion: SCHEMA_VERSION, theme: 'gray-intermediate',
 * });
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
