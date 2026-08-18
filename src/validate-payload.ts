/**
 * @file Internal payload validation pipeline.
 *
 * Validates `detail` against the DTO registered for `type` in the
 * `PAYLOAD_DTO_MAP`, enforces `schemaVersion === SCHEMA_VERSION`, and throws
 * {@link MfeEventValidationError} on any failure. **Not exported publicly** —
 * consumers call it indirectly via `createMfeEvent`, `dispatchMfeEvent`,
 * `assertMfePayload` (and their Shell counterparts).
 *
 * Requires the `reflect-metadata` polyfill loaded **before the first call**;
 * loading strategy is environment dependent. See `create-event.ts` module
 * JSDoc and `docs/USAGE.md` §2.5 for details.
 *
 * @see {@link file://./create-event.ts} for the public event creators.
 * @see {@link file://./dtos/payload-dto-registry.ts} for the DTO map.
 */

import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';
import { PAYLOAD_DTO_MAP, type PayloadDtoCtor } from './dtos/payload-dto-registry.js';
import { SCHEMA_VERSION } from './types.js';
import {
  MfeEventValidationError,
  type MfeValidationErrorEntry,
} from './validation-error.js';

/**
 * Validates `detail` against the DTO registered for `type` and throws
 * {@link MfeEventValidationError} on any failure. Internal — use
 * `createMfeEvent` / `dispatchMfeEvent` / `assertMfePayload` to call it.
 *
 * **Note:** this module relies on `class-validator` decorators which require
 * the `reflect-metadata` polyfill. The polyfill is NOT imported here and
 * must be loaded **before the first call**. Loading strategy is environment
 * dependent: Angular (esbuild / Vite / Native Federation) consumers add
 * `node_modules/reflect-metadata/Reflect.js` to the builder `scripts` array
 * in `angular.json` — do **not** `import 'reflect-metadata'` in `src/main.ts`
 * (CommonJS specifier fails under ESM shims). Node.js / Vitest / Jest
 * consumers `import 'reflect-metadata';` in the test setup file. See README
 * §Runtime Setup and `docs/USAGE.md` §2.5.
 */
export function validatePayload(type: string, detail: unknown): void {
  assertDetailIsObject(type, detail);
  const dtoCtor = PAYLOAD_DTO_MAP[type];
  assertKnownEventType(type, dtoCtor);
  assertSchemaVersion(type, detail);
  const instance = plainToInstance(dtoCtor, detail);
  const errors = validateSync(instance);
  assertNoErrors(type, errors);
}

function isNonNullObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

function assertDetailIsObject(type: string, detail: unknown): asserts detail is object {
  if (isNonNullObject(detail)) return;
  throw new MfeEventValidationError(
    `Event "${type}" detail must be a non-null object.`,
    { eventType: type },
  );
}

function assertKnownEventType(type: string, ctor: PayloadDtoCtor | undefined): asserts ctor is PayloadDtoCtor {
  if (!ctor) {
    throw new MfeEventValidationError(
      `Unknown event type "${type}": no payload DTO registered.`,
      { eventType: type },
    );
  }
}

function assertSchemaVersion(type: string, detail: object): void {
  const version = (detail as { schemaVersion?: unknown; }).schemaVersion;
  if (version === undefined) {
    throw new MfeEventValidationError(
      `Event "${type}" payload is missing the required "schemaVersion".`,
      { eventType: type },
    );
  }
  if (version !== SCHEMA_VERSION) {
    throw new MfeEventValidationError(
      `Event "${type}" payload schemaVersion ${String(version)} does not match required version ${SCHEMA_VERSION}.`,
      { eventType: type },
    );
  }
}

function assertNoErrors(type: string, errors: ValidationError[]): void {
  if (errors.length === 0) return;
  throw new MfeEventValidationError(
    `Validation failed for event "${type}".`,
    { eventType: type, errors: toErrorEntries(errors) },
  );
}

function toErrorEntries(errors: ValidationError[]): MfeValidationErrorEntry[] {
  return errors.map((error) => ({
    property: error.property,
    constraints: Object.values(error.constraints ?? {}),
  }));
}
