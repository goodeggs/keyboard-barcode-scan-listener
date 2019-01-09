import {InputHandler, OnScan} from '../../';
import {isModifierKey} from '../shared';

export type FilterInput = (event: KeyboardEvent) => boolean;

export const DEFAULT_CAPTURE_PREFIX = 'F18';

export const DEFAULT_CAPTURE_SUFFIX = 'F19';

export const defaultFilterInput = (event: KeyboardEvent): boolean => !isModifierKey(event);

export interface CreateDelimitedInputHandlerConfig {
  /**
   * A single character (as any valid `KeyboardEvent.key` value) used to trigger a barcode capture
   * sequence. Excluded from the final barcode.
   *
   * Defaults to F18.
   */
  capturePrefix?: string;
  /**
   * A single character (as any valid `KeyboardEvent.key` value) used to used to end the barcode
   * capture sequence. Excluded from the final barcode.
   *
   * Defaults to F19.
   */
  captureSuffix?: string;
  /**
   * An optional filter that is called with every KeyboardEvent passed to the handler. When it
   * returns true, the keystroke is added to the barcode buffer; when false, it discards the
   * keystroke. Useful if your scanner inputs control characters that you want to omit from the
   * final barcode.
   *
   * Defaults to a function that returns false for Shift|Alt|Meta|Ctrl key events.
   */
  filterInput?: FilterInput;
  /**
   * A function called on any keyboard event handled during the capture sequence.
   *
   * Defaults to a function that calls .preventDefault() on the event.
   */
  onCapturedInput?: null | ((event: KeyboardEvent) => unknown);
}

/**
 * Create an keydown handler that buffers all keyboard input between configurable start (prefix)
 * and end (suffix) delimiters and calls a specified function (onScan) with the final barcode.
 *
 * By default, calls `preventDefault` on any captured events (i.e. on the prefix event, suffix
 * event, and any events in between); this prevents scan input from being interpreted as normal user
 * input, which could result in e.g. inputting scan characters into an input field. To customize
 * this behavior, set `onCapturedInput` to `null` or to a function.
 */
const createDelimitedInputHandler = ({
  capturePrefix = DEFAULT_CAPTURE_PREFIX,
  captureSuffix = DEFAULT_CAPTURE_SUFFIX,
  filterInput = defaultFilterInput,
  onCapturedInput: _onCapturedInput = (event: KeyboardEvent): void => event.preventDefault(),
}: CreateDelimitedInputHandlerConfig = {}): InputHandler => {
  const onCapturedInput = _onCapturedInput != null ? _onCapturedInput : () => {};

  let buffer: string[] = [];
  let isCapturing = false;

  const reset = (): void => {
    buffer = [];
    isCapturing = false;
  };

  return (onScan: OnScan) => (event: KeyboardEvent): void => {
    if (event.key === capturePrefix) {
      onCapturedInput(event);
      isCapturing = true;
      return;
    }

    if (event.key === captureSuffix) {
      onCapturedInput(event);
      const barcode = buffer.join('');
      onScan(barcode);
      reset();
      return;
    }

    if (isCapturing) {
      onCapturedInput(event);
      if (!filterInput(event)) {
        buffer.push(event.key);
      }
      return;
    }

    // Normal user input, ignore it
  };
};

export default createDelimitedInputHandler;
