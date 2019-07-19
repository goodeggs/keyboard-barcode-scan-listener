# keyboard-barcode-scan-listener

[![Build Status](https://travis-ci.com/goodeggs/keyboard-barcode-scan-listener.svg?branch=master)](https://travis-ci.com/goodeggs/keyboard-barcode-scan-listener)

Listen for barcode scan events from keyboard/HID devices in the browser.

## Installation

To install via npm:

```sh
npm install keyboard-barcode-scan-listener
```

To install via yarn:

```sh
yarn add keyboard-barcode-scan-listener
```

## Usage

To create a basic listener that uses the default input handler:

```js
import createKeyboardBarcodeScanListener from 'keyboard-barcode-scan-listener';

const removeScanListener = createKeyboardBarcodeScanListener({
  onScan: (barcode) => console.log(barcode),
});

// To remove the scan listener, call the function returned by createKeyboardBarcodeScanListener:
removeScanListener();
```

By default, the scan listener will be attached to `window.document` and listen on `keydown` events.

### Input Handlers

Most of the brains in `keyboard-barcode-scan-listener` is in input handlers, which are initialized with the `onScan` handler and receive `keydown` events as they are received by the `target`; they buffer a barcode until it's fully read, at which point they call `onScan`.

The library ships with two handlers:

- [**delimited input**](src/handlers/delimited_input/index.ts): The default handler. Listens for a start character and buffers all input until an end character (by default, `F18` and `F19`, respectively), when it calls `onScan` with the barcode. By default, it prevents barcode values from becoming input to the page.
- [**prefixed input**](src/handlers/prefixed_input/index.ts): Listens for a multi-character prefix (or, optionally, no prefix--not recommended!) and when the input passes a test or no input is detected for a certain amount of time, calls `onScan` with the barcode. Does not (and cannot) prevent barcode values from becoming input to the page.

Both are configurable and well-documented in the source. In general, you should prefer the delimited input handler (the default) if possible as it is more flexible and is capable of preventing scanner keyboard events from being interpreted as regular user keyboard to the page, which is generally undesirable.

## Contributing

This app uses the [Good Eggs toolkit](https://github.com/goodeggs/goodeggs-toolkit) to power many of
its development commands. See documentation there for details.
