import {isModifierKey} from '.';

describe('isModifierKey', () => {
  it.each([
    new KeyboardEvent('keydown', {key: 'Alt', altKey: true}),
    new KeyboardEvent('keydown', {key: 'Control', ctrlKey: true}),
    new KeyboardEvent('keydown', {key: 'Meta', metaKey: true}),
    new KeyboardEvent('keydown', {key: 'Shift', shiftKey: true}),
  ])('returns false for %j', (event: KeyboardEvent) => {
    expect(isModifierKey(event)).toBe(true);
  });

  it('returns true for modified keystrokes', () => {
    expect(isModifierKey(new KeyboardEvent('keydown', {key: 'f', altKey: true}))).toBe(false);
    expect(isModifierKey(new KeyboardEvent('keydown', {key: '1', ctrlKey: true}))).toBe(false);
    expect(isModifierKey(new KeyboardEvent('keydown', {key: 'Z', shiftKey: true}))).toBe(false);
    expect(isModifierKey(new KeyboardEvent('keydown', {key: '%', metaKey: true}))).toBe(false);
  });

  it('returns true for other keystrokes', () => {
    expect(isModifierKey(new KeyboardEvent('keydown', {key: 'F'}))).toBe(false);
    expect(isModifierKey(new KeyboardEvent('keydown', {key: '1'}))).toBe(false);
    expect(isModifierKey(new KeyboardEvent('keydown', {key: 'z'}))).toBe(false);
  });
});
