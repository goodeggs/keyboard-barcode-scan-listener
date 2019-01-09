import createDelimitedInputHandler from './handlers/delimited_input';
import createKeyboardBarcodeScanListener from '.';

beforeEach(jest.useFakeTimers);
jest.mock('./handlers/delimited_input', () => jest.fn(() => jest.fn()));
afterEach(jest.clearAllMocks);

const scanBarcodeOnto = (target: EventTarget, barcode: string | string[]): void => {
  for (const key of barcode) {
    // Simulate delay character input
    jest.advanceTimersByTime(2);
    target.dispatchEvent(new KeyboardEvent('keydown', {key}));
  }
  jest.runAllTimers();
};

describe('createKeyboardBarcodeScanListener', () => {
  it('installs an event listener on `target`', () => {
    const target = document.createElement('p');
    const onScan = jest.fn();
    createKeyboardBarcodeScanListener({
      createInputHandler: (_onScan) => () => _onScan('hello world'),
      onScan,
      target,
    });

    scanBarcodeOnto(target, 'a');

    expect(onScan).toHaveBeenCalledTimes(1);
    expect(onScan).toHaveBeenCalledWith('hello world');
  });

  it('returns a function that, when called, removes the listener from `target`', () => {
    const target = document.createElement('p');
    const onScan = jest.fn();
    const cancel = createKeyboardBarcodeScanListener({
      createInputHandler: (_onScan) => () => _onScan('hello world'),
      onScan,
      target,
    });

    scanBarcodeOnto(target, 'a');
    expect(onScan).toHaveBeenCalledTimes(1);
    expect(onScan).toHaveBeenCalledWith('hello world');
    cancel();
    scanBarcodeOnto(target, 'a');

    expect(onScan).toHaveBeenCalledTimes(1);
  });

  it('installs a listener on `window.document` if `target` is not specified', () => {
    const onScan = jest.fn();
    const cancel = createKeyboardBarcodeScanListener({
      createInputHandler: (_onScan) => () => _onScan('hello world'),
      onScan,
    });

    scanBarcodeOnto(window.document, 'a');
    expect(onScan).toHaveBeenCalledTimes(1);
    expect(onScan).toHaveBeenCalledWith('hello world');
    cancel();
    scanBarcodeOnto(window.document, 'a');

    expect(onScan).toHaveBeenCalledTimes(1);
  });

  it('installs the listener on `keydown` events', () => {
    const target = document.createElement('p');
    target.addEventListener = jest.fn();
    createKeyboardBarcodeScanListener({onScan: () => {}, target});

    expect(target.addEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      expect.any(Object),
    );
  });

  it('installs the listener with passive mode on', () => {
    const target = document.createElement('p');
    target.addEventListener = jest.fn();
    createKeyboardBarcodeScanListener({onScan: () => {}, target});

    expect(target.addEventListener).toHaveBeenCalledWith(expect.any(String), expect.any(Function), {
      passive: false,
    });
  });

  it('installs a DelimitedInputHandler by default', () => {
    const onScan = (): void => {};
    createKeyboardBarcodeScanListener({onScan});

    expect(createDelimitedInputHandler).toHaveBeenCalledTimes(1);
    expect(createDelimitedInputHandler).toHaveBeenCalledWith();
    const returnedMock: jest.Mock = (createDelimitedInputHandler as jest.Mock).mock.results[0]
      .value;
    expect(returnedMock).toHaveBeenCalledWith(onScan);
  });
});
