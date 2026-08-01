import type { MfeEventMap, ShellEventMap } from './types.js';

/**
 * Cheap runtime guard: `true` when `event` is a `CustomEvent` whose `type`
 * equals `type`. Does NOT re-validate the payload — safe to use in hot listeners.
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
 * Shell-side counterpart of {@link isMfeEvent}.
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
