import {InputHandler, OnScan} from '../../';
import {isModifierKey} from '../shared';

export const defaultFilterInput = (event: KeyboardEvent): boolean => !isModifierKey(event);

export interface CreatePrefixedInputHandlerConfig {
  /**
   * An optional filter that is called with every KeyboardEvent passed to the handler. When it
   * returns true, the keystroke is added to the barcode buffer; when false, it discards the
   * keystroke. Useful if your scanner inputs control characters that you want to omit from the
   * final barcode.
   *
   * By default, this is set to a function that returns false for Shift|Alt|Meta|Ctrl key events.
   */
  filterInput?: (event: KeyboardEvent) => boolean;
  includePrefixInOutput?: boolean;
  /**
   * A list of keys (defined as `KeyboardEvent.key`) that, when entered, will start a scan.
   */
  prefix?: string[];
  /**
   * A test run on the current barcode buffer to check if the scan is already finished. Note that
   * this is not a validation function; if the value in the barcode buffer does not pass this test,
   * `onScan` will still be invoked with the current buffer after `scanTimeout` elapses.
   */
  scanIsComplete?: (barcode: string) => boolean;
  /**
   * A timeout (in milliseconds) after which `onScan` will be called once a scan has begun.
   * If your scan has a predictable format, you can terminate a scan early by providing a
   * `scanIsComplete` test function.
   */
  scanTimeout?: number;
}

/**
 * Create an keydown handler that waits for a barcode prefix sequence and begins a scan sequence,
 * buffering all subsequent keyboard input (excluding the prefix sequence) until:
 *
 * - A configurable timeout period (defaults to 200ms) has elapsed
 * - An optional value test returns true for the buffered value
 *
 * It then calls a specified function (onScan) with the final barcode.
 *
 * This handler cannot not prevent DOM bubbling on keyboard events because it's designed to be used
 * with a multi-character prefix (so it cannot reliably capture all input) and leans on an
 * asynchronous timeout to distinguish between scanner and normal keyboard input (but preventDefault
 * must be called synchronously). If preventing user input from bubbling through the DOM is a
 * requirement, check out the delimited input handler.
 */
const createPrefixedInputHandler = ({
  filterInput = defaultFilterInput,
  includePrefixInOutput = false,
  prefix,
  scanIsComplete,
  scanTimeout = 200,
}: CreatePrefixedInputHandlerConfig = {}): InputHandler => {
  if (prefix != null && prefix.length === 0) {
    throw new Error('prefix array cannot be empty');
  }

  let buffer: string[] = [];
  let isCapturing = false;
  let prefixBuffer: string[] = [];
  let timeoutId: number | null = null;

  const resetState = (): void => {
    buffer = [];
    prefixBuffer = [];
    if (timeoutId != null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const completeScan = (onScan: OnScan): void => {
    const barcode = `${includePrefixInOutput ? prefixBuffer.join('') : ''}${buffer.join('')}`;
    resetState();
    // Always call `onScan` in the next call stack to prevent releasing Zalgo.
    setTimeout(() => onScan(barcode), 0);
  };

  return (onScan: OnScan) => (event: KeyboardEvent): void => {
    if (!filterInput(event)) {
      return;
    }

    if (!timeoutId) {
      timeoutId = window.setTimeout(() => {
        if (buffer.length) {
          completeScan(onScan);
        }
      }, scanTimeout);
    }

    if (isCapturing) {
      buffer.push(event.key);
      if (scanIsComplete != null && scanIsComplete(buffer.join(''))) {
        completeScan(onScan);
      }
      return;
    }

    // No user prefix specified, immediately start storing characters into the buffer.
    if (prefix == null) {
      buffer.push(event.key);
      if (scanIsComplete != null && scanIsComplete(buffer.join(''))) {
        completeScan(onScan);
      }
      return;
    }

    // User prefix specified, start looking for prefix characters.
    if (event.key === prefix[prefixBuffer.length]) {
      prefixBuffer.push(event.key);
      if (prefixBuffer.length === prefix.length) {
        isCapturing = true;
      }
    }

    // Normal user input (not part of a prefix sequence), ignore
  };
};

export default createPrefixedInputHandler;
