import type { MfeEventMap, ShellEventMap } from './types.js';

/**
 * Cheap runtime guard: `true` when `event` is a `CustomEvent` whose `type`
 * equals `type`. Does NOT re-validate the payload — safe to use in hot listeners.
 *
 * @param event - The DOM `Event` received in a listener callback.
 * @param type - The MFE event name constant to narrow against (from {@link MFE_EVENTS}).
 * @returns `true` when `event` is a `CustomEvent` with matching `type`; narrows the type guard.
 *
 * @example
 * window.addEventListener(MFE_EVENTS.UPDATE_HEADER, (event) => {
 *   if (isMfeEvent(event, MFE_EVENTS.UPDATE_HEADER)) {
 *     console.log(event.detail.title);
 *   }
 * });
 */
export function isMfeEvent<K extends keyof MfeEventMap>(
  event: Event,
  type: K,
): event is CustomEvent<MfeEventMap[K]> {
  return isMatchingCustomEvent(event, type);
}

/**
 * Shell-side counterpart of {@link isMfeEvent}. Cheap runtime guard that
 * narrows `event` to `CustomEvent<ShellEventMap[K]>` without re-validating
 * the payload.
 *
 * @param event - The DOM `Event` received in a listener callback.
 * @param type - The Shell event name constant to narrow against (from {@link SHELL_EVENTS}).
 * @returns `true` when `event` is a `CustomEvent` with matching `type`; narrows the type guard.
 *
 * @example
 * window.addEventListener(SHELL_EVENTS.THEME_CHANGED, (event) => {
 *   if (isShellEvent(event, SHELL_EVENTS.THEME_CHANGED)) {
 *     applyTheme(event.detail.theme);
 *   }
 * });
 */
export function isShellEvent<K extends keyof ShellEventMap>(
  event: Event,
  type: K,
): event is CustomEvent<ShellEventMap[K]> {
  return isMatchingCustomEvent(event, type);
}

function isMatchingCustomEvent(event: Event, type: string): boolean {
  return event instanceof CustomEvent && event.type === type;
}
