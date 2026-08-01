/**
 * @file Thin helper functions around the browser `CustomEvent` / `window` APIs.
 *
 * This module will export runtime helpers: `createMfeEvent`, `createShellEvent`
 * (constructors that wrap `new CustomEvent` with the correct type and detail),
 * and `isMfeEvent`, `isShellEvent` (type guards that narrow `Event` to the
 * expected `CustomEvent<Payload>` shape).
 *
 * @see {@link file://./events.ts} for event name constants.
 * @see {@link file://./payloads.ts} for payload interfaces.
 */
