/**
 * A single failed-constraint entry attached to {@link MfeEventValidationError}.
 *
 * @property property - The DTO property name that failed validation (e.g. `'schemaVersion'`, `'message'`).
 * @property constraints - Human-readable constraint messages produced by `class-validator` for the property.
 */
export interface MfeValidationErrorEntry {
  readonly property: string;
  readonly constraints: readonly string[];
}

/**
 * Optional structured context accepted by the {@link MfeEventValidationError} constructor.
 *
 * @property errors - Per-field validation failures. Defaults to an empty array.
 * @property eventType - The event name string (e.g. `'mfe:update-header'`) that triggered the error, when known.
 */
export interface MfeValidationErrorContext {
  readonly errors?: readonly MfeValidationErrorEntry[];
  readonly eventType?: string;
}

/**
 * Thrown when an MFE/Shell event payload fails runtime validation
 * (missing/invalid `schemaVersion`, wrong shape, or unknown event type).
 *
 * Callers should treat this as a programming error: fix the payload shape,
 * keep `schemaVersion` equal to `SCHEMA_VERSION`, then re-dispatch.
 *
 * @example
 * try {
 *   dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, payload);
 * } catch (error) {
 *   if (error instanceof MfeEventValidationError) {
 *     console.error(error.errors); // per-field messages
 *   }
 * }
 */
export class MfeEventValidationError extends Error {
  /** Per-field validation failures. Empty when the error is structural (e.g. unknown event type). */
  readonly errors: readonly MfeValidationErrorEntry[];
  /** The event name that triggered the error, when known. */
  readonly eventType: string | undefined;

  /**
   * @param message - Human-readable summary of the validation failure.
   * @param context - Optional structured context (field errors, event type).
   */
  constructor(message: string, context: MfeValidationErrorContext = {}) {
    super(message);
    this.name = 'MfeEventValidationError';
    this.errors = context.errors ?? [];
    this.eventType = context.eventType;
    Object.setPrototypeOf(this, MfeEventValidationError.prototype);
  }
}
