import { describe, expect, it } from 'vitest';
import { MFE_EVENTS, SHELL_EVENTS } from '../src/events.js';
import { isMfeEvent, isShellEvent } from '../src/guards.js';

describe('isMfeEvent', () => {
  it('returns true for a matching CustomEvent (G-1)', () => {
    expect(isMfeEvent(new CustomEvent(MFE_EVENTS.UPDATE_HEADER), MFE_EVENTS.UPDATE_HEADER)).toBe(true);
  });

  it('returns false for a different event type (G-2)', () => {
    expect(isMfeEvent(new CustomEvent(MFE_EVENTS.MODULE_READY), MFE_EVENTS.UPDATE_HEADER)).toBe(false);
  });

  it('returns false for a plain Event (G-3)', () => {
    expect(isMfeEvent(new Event(MFE_EVENTS.UPDATE_HEADER), MFE_EVENTS.UPDATE_HEADER)).toBe(false);
  });
});

describe('isShellEvent', () => {
  it('returns true for a matching Shell CustomEvent (G-4)', () => {
    expect(isShellEvent(new CustomEvent(SHELL_EVENTS.THEME_CHANGED), SHELL_EVENTS.THEME_CHANGED)).toBe(true);
  });

  it('returns false for a different Shell event type (G-5)', () => {
    expect(isShellEvent(new CustomEvent(SHELL_EVENTS.MODULE_STATE), SHELL_EVENTS.THEME_CHANGED)).toBe(false);
  });
});
