import { describe, expect, it } from 'vitest';
import { createMfeEvent, createShellEvent } from '../src/create-event.js';
import { MFE_EVENTS, SHELL_EVENTS } from '../src/events.js';
import { SCHEMA_VERSION } from '../src/types.js';
import { captureError, expectErrorProperty, validModuleState, validUpdateHeader } from './helpers.js';

describe('createMfeEvent', () => {
  it('creates a bubbling CustomEvent with the validated detail (CE-1)', () => {
    const detail = validUpdateHeader();
    const event = createMfeEvent(MFE_EVENTS.UPDATE_HEADER, detail);
    expect(event.type).toBe(MFE_EVENTS.UPDATE_HEADER);
    expect(event.bubbles).toBe(true);
    expect(event.detail).toEqual(detail);
  });

  it('throws when schemaVersion is missing (CE-2)', () => {
    const detail = {
      moduleType: 'clients',
      instanceId: 'abc-123',
      title: 'Clientes',
      status: 'loaded',
    };
    const error = captureError(() => createMfeEvent(MFE_EVENTS.UPDATE_HEADER, detail as never));
    expect(error.eventType).toBe(MFE_EVENTS.UPDATE_HEADER);
  });

  it('throws when schemaVersion is 0 (CE-3)', () => {
    const error = captureError(() =>
      createMfeEvent(MFE_EVENTS.UPDATE_HEADER, { ...validUpdateHeader(), schemaVersion: 0 }),
    );
    expect(error.message).toMatch(/does not match required version/);
  });

  it('throws when schemaVersion is 999 (CE-4)', () => {
    const error = captureError(() =>
      createMfeEvent(MFE_EVENTS.UPDATE_HEADER, { ...validUpdateHeader(), schemaVersion: 999 }),
    );
    expect(error.message).toMatch(/does not match required version/);
  });

  it('throws with property "message" when message is missing (CE-5)', () => {
    const detail = {
      schemaVersion: SCHEMA_VERSION,
      moduleType: 'clients',
      instanceId: 'abc-123',
    };
    const error = captureError(() => createMfeEvent(MFE_EVENTS.MODULE_ERROR, detail as never));
    expectErrorProperty(error, 'message');
  });

  it('throws with property "instanceId" when instanceId is missing (CE-6)', () => {
    const detail = {
      schemaVersion: SCHEMA_VERSION,
      moduleType: 'clients',
    };
    const error = captureError(() => createMfeEvent(MFE_EVENTS.REQUEST_FULLSCREEN, detail as never));
    expectErrorProperty(error, 'instanceId');
  });

  it('throws for a null detail (CE-7)', () => {
    const error = captureError(() => createMfeEvent(MFE_EVENTS.UPDATE_HEADER, null as never));
    expect(error.message).toMatch(/non-null object/);
  });

  it('throws for a non-object detail (CE-8)', () => {
    const error = captureError(() => createMfeEvent(MFE_EVENTS.UPDATE_HEADER, 'oops' as never));
    expect(error.message).toMatch(/non-null object/);
  });
});

describe('createShellEvent', () => {
  it('creates a bubbling CustomEvent for a valid ModuleState (CE-9)', () => {
    const detail = validModuleState();
    const event = createShellEvent(SHELL_EVENTS.MODULE_STATE, detail);
    expect(event.type).toBe(SHELL_EVENTS.MODULE_STATE);
    expect(event.bubbles).toBe(true);
    expect(event.detail).toEqual(detail);
  });

  it('throws with property "theme" when theme is missing (CE-10)', () => {
    const detail = { schemaVersion: SCHEMA_VERSION };
    const error = captureError(() => createShellEvent(SHELL_EVENTS.THEME_CHANGED, detail as never));
    expectErrorProperty(error, 'theme');
  });

  it('throws with property "size" for an unsupported size (CE-11)', () => {
    const error = captureError(() =>
      createShellEvent(SHELL_EVENTS.MODULE_STATE, { ...validModuleState(), size: '25%' } as never),
    );
    expectErrorProperty(error, 'size');
  });
});
