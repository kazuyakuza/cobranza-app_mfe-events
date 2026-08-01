/**
 * @file Internal barrel that re-exports all public symbols.
 *
 * This module aggregates and re-exports every public symbol from the library's
 * sub-modules. It is consumed by `public-api.ts` (the single entry point
 * declared in `package.json`).
 *
 * @see {@link file://./public-api.ts} for the package's public entry point.
 */
export * from './events.js';
export * from './payloads.js';
export * from './types.js';
export * from './helpers.js';
