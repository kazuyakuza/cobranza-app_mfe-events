import { describe, expect, it } from 'vitest';
import { assertMfePayload, assertShellPayload } from '../src/assert.js';
import { MFE_EVENTS, SHELL_EVENTS } from '../src/events.js';
import { SCHEMA_VERSION } from '../src/types.js';
import { captureError, expectErrorProperty, validUpdateHeader, validVisibilityChanged } from './helpers.js';

describe('validatePayload via assertMfePayload', () => {
  it('throws for an unknown event type (V-1)', () => {
    const error = captureError(() => assertMfePayload('mfe:bogus' as never, validUpdateHeader() as never));
    expect(error.message).toMatch(/no payload DTO registered/);
  });

  it('accepts initialData as a plain object (V-2)', () => {
    expect(() =>
      assertMfePayload(MFE_EVENTS.REQUEST_ADD_MODULE, {
        schemaVersion: SCHEMA_VERSION,
        moduleType: 'clients',
        initialData: { q: 'a' },
      }),
    ).not.toThrow();
  });

  it('rejects initialData that is not an object (V-3)', () => {
    const error = captureError(() =>
      assertMfePayload(MFE_EVENTS.REQUEST_ADD_MODULE, {
        schemaVersion: SCHEMA_VERSION,
        moduleType: 'clients',
        initialData: 'str',
      } as never),
    );
    expectErrorProperty(error, 'initialData');
  });

  it('ignores unknown extra fields (V-4)', () => {
    expect(() =>
      assertMfePayload(MFE_EVENTS.UPDATE_HEADER, { ...validUpdateHeader(), extraField: 'x' } as never),
    ).not.toThrow();
  });

  it('accepts a null status (V-5)', () => {
    expect(() =>
      assertMfePayload(MFE_EVENTS.UPDATE_HEADER, { ...validUpdateHeader(), status: null } as never),
    ).not.toThrow();
  });

  it('rejects an invalid status value (V-6)', () => {
    const error = captureError(() =>
      assertMfePayload(MFE_EVENTS.UPDATE_HEADER, { ...validUpdateHeader(), status: 'bogus' } as never),
    );
    expectErrorProperty(error, 'status');
  });

  it('rejects an invalid notification type (V-7)', () => {
    const error = captureError(() =>
      assertMfePayload(MFE_EVENTS.SHOW_NOTIFICATION, {
        schemaVersion: SCHEMA_VERSION,
        type: 'bogus',
        message: 'hi',
      } as never),
    );
    expectErrorProperty(error, 'type');
  });
});

describe('validatePayload via assertShellPayload', () => {
  it('rejects a non-string reason (V-8)', () => {
    const error = captureError(() =>
      assertShellPayload(SHELL_EVENTS.VISIBILITY_CHANGED, {
        ...validVisibilityChanged(),
        reason: 7,
      } as never),
    );
    expectErrorProperty(error, 'reason');
  });
});
