import createDelimitedInputHandler, {
  CreateDelimitedInputHandlerConfig,
} from './handlers/delimited_input';
import createPrefixedInputHandler, {
  CreatePrefixedInputHandlerConfig,
} from './handlers/prefixed_input';
import {isModifierKey} from './handlers/shared';

export {CreateDelimitedInputHandlerConfig, CreatePrefixedInputHandlerConfig};

export type OnScan = (barcode: string) => unknown;

export type InputHandler = (onScan: OnScan) => (event: KeyboardEvent) => void;

export interface KeyboardBarcodeScanListenerOptions {
  // Called with each keydown event with the KeyboardEvent DOM event.
  createInputHandler?: InputHandler;
  // Called with the scanned barcode whenever a barcode has been scanned.
  onScan: (barcode: string) => unknown;
  // The target to attach the event listener to. Defaults to `window.document`.
  target?: EventTarget;
}

/**
 * Create a scan listener that intercepts all keydown events on an event target (by default,
 * `window.document`). When a barcode is scanned, a callback (`onScan`) is invoked with the barcode.
 *
 * Accepts an optional `createInputHandler` which is invoked with `onScan`. The function returned by
 * `createInputHandler` is invoked on every keydown event and can be used to customize the behavior
 * of the handler. By default, it installs a handler that only captures barcodes between control
 * characters (see `handlers/delimited_input.ts` for documentation on its behavior.)
 *
 * @returns A function that, when called, removes the event listener from target.
 */
const createKeyboardBarcodeScanListener = ({
  createInputHandler,
  onScan,
  target = window.document,
}: KeyboardBarcodeScanListenerOptions): (() => void) => {
  const handler =
    createInputHandler != null ? createInputHandler(onScan) : createDelimitedInputHandler()(onScan);

  // This is guaranteed to be a KeyboardEvent for this listener type; TS doesn't know that, though
  const listener = (event: Event): void => handler(event as KeyboardEvent);

  target.addEventListener(
    'keydown',
    listener,
    // Disable passive mode so the event listener can call `preventDefault` on keydown events.
    {passive: false},
  );

  return () => target.removeEventListener('keydown', listener);
};

export default createKeyboardBarcodeScanListener;

export {createDelimitedInputHandler, createPrefixedInputHandler, isModifierKey};
