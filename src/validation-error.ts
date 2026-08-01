/** A single failed-constraint entry attached to {@link MfeEventValidationError}. */
export interface MfeValidationErrorEntry {
  readonly property: string;
  readonly constraints: readonly string[];
}

/** Optional structured context for {@link MfeEventValidationError}. */
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
 */
export class MfeEventValidationError extends Error {
  readonly errors: readonly MfeValidationErrorEntry[];
  readonly eventType: string | undefined;

  constructor(message: string, context: MfeValidationErrorContext = {}) {
    super(message);
    this.name = 'MfeEventValidationError';
    this.errors = context.errors ?? [];
    this.eventType = context.eventType;
    Object.setPrototypeOf(this, MfeEventValidationError.prototype);
  }
}
