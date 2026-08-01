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
