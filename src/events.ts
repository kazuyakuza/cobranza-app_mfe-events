/**
 * @file Event name constants for Shell–MFE communication.
 *
 * This module will export `MFE_EVENTS` and `SHELL_EVENTS` — frozen objects
 * mapping logical names to their string event identifiers (e.g. `mfe:update-header`,
 * `shell:module-state`). All event name strings are defined here so that
 * consumers never hard-code raw strings.
 *
 * @see {@link file://./payloads.ts} for the payload interfaces that accompany each event.
 * @see {@link file://./helpers.ts} for `createMfeEvent` / `createShellEvent` helpers.
 */

/**
 * Event name constants for MFE → Shell communication.
 *
 * Direction: MFE → Shell. Only the Shell listens to these events; MFEs never
 * listen to each other. Values are stable string literals; never change a
 * value for a given meaning (evolve via new fields + package semver instead).
 */
export const MFE_EVENTS = {
  /** Ask the Shell to add a new module instance to the workbench. */
  REQUEST_ADD_MODULE: 'mfe:request-add-module',
  /** Ask the Shell to switch this instance to fullscreen. */
  REQUEST_FULLSCREEN: 'mfe:request-fullscreen',
  /** Ask the Shell to remove this instance from the workbench. */
  REQUEST_REMOVE: 'mfe:request-remove',
  /** MFE updates its own header chrome data (title, status). */
  UPDATE_HEADER: 'mfe:update-header',
  /** Ask the Shell to show a global toast/notification. */
  SHOW_NOTIFICATION: 'mfe:show-notification',
  /** MFE finished mounting and is ready. */
  MODULE_READY: 'mfe:module-ready',
  /** Unrecoverable load/init error for this instance. */
  MODULE_ERROR: 'mfe:module-error',
} as const;

/**
 * Event name constants for Shell → MFE communication.
 *
 * Direction: Shell → MFE. Dispatched on `window`; each MFE instance filters by
 * `instanceId` (and usually `moduleType`). Values are stable string literals.
 */
export const SHELL_EVENTS = {
  /** Notify size / collapse / fullscreen / pixel dimensions for this instance. */
  MODULE_STATE: 'shell:module-state',
  /** Theme token set changed. */
  THEME_CHANGED: 'shell:theme-changed',
  /** Instance became visible or hidden. */
  VISIBILITY_CHANGED: 'shell:visibility-changed',
} as const;

/** Union of all MFE → Shell event name string literals. */
export type MfeEventName = (typeof MFE_EVENTS)[keyof typeof MFE_EVENTS];

/** Union of all Shell → MFE event name string literals. */
export type ShellEventName = (typeof SHELL_EVENTS)[keyof typeof SHELL_EVENTS];
