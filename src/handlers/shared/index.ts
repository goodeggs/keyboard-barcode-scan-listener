const MODIFIER_KEYS = new Set<string>(['Alt', 'Control', 'Meta', 'Shift']);

/**
 * Check if a KeyboardEvent is a modifier key (Alt|Ctrl|Meta|Shift).
 *
 * @returns true if the event is a modifier key, otherwise returns false.
 */
export const isModifierKey = (event: KeyboardEvent): boolean => MODIFIER_KEYS.has(event.key);
