import createPrefixedInputHandler from '.';
import {isModifierKey} from '../shared';

beforeEach(jest.useFakeTimers);
jest.mock('../shared', () => ({isModifierKey: jest.fn(() => false)}));
afterEach(jest.clearAllMocks);

const scanBarcode = (handler: (event: KeyboardEvent) => void, barcode: string | string[]): void => {
  for (const key of barcode) {
    // Simulate delay character input
    jest.advanceTimersByTime(2);
    handler(new KeyboardEvent('keydown', {key}));
  }
};

describe('prefixed input handler', () => {
  it('throws an error when called with an empty prefix array', () => {
    expect(() => createPrefixedInputHandler({prefix: []})).toThrowError(
      'prefix array cannot be empty',
    );
  });

  describe('onScan', () => {
    it('calls onScan with the result', () => {
      const onScan = jest.fn();
      const handler = createPrefixedInputHandler()(onScan);

      scanBarcode(handler, 'L%123abc');

      expect(onScan).toHaveBeenCalledTimes(0);
      jest.runAllTimers();
      expect(onScan).toHaveBeenCalledTimes(1);
      expect(onScan).toHaveBeenCalledWith('L%123abc');
    });
  });

  describe('includePrefixInOutput', () => {
    it('includes the prefix in the final barcode when true', () => {
      const onScan = jest.fn();
      const handler = createPrefixedInputHandler({includePrefixInOutput: true, prefix: ['L', '%']})(
        onScan,
      );

      scanBarcode(handler, 'L%123abc');

      jest.runAllTimers();
      expect(onScan).toHaveBeenCalledWith('L%123abc');
    });

    it('does not include the prefix in the final barcode when false', () => {
      const onScan = jest.fn();
      const handler = createPrefixedInputHandler({
        includePrefixInOutput: false,
        prefix: ['L', '%'],
      })(onScan);

      scanBarcode(handler, 'L%123abc');

      jest.runAllTimers();
      expect(onScan).toHaveBeenCalledWith('123abc');
    });

    it('defaults to false', () => {
      const onScan = jest.fn();
      const handler = createPrefixedInputHandler({
        includePrefixInOutput: false,
        prefix: ['L', '%'],
      })(onScan);

      scanBarcode(handler, 'L%123abc');

      jest.runAllTimers();
      expect(onScan).toHaveBeenCalledWith('123abc');
    });
  });

  describe('prefix', () => {
    it('calls onScan after the timeout period if the barcode matches the prefix', () => {
      const onScan = jest.fn();
      const handler = createPrefixedInputHandler({prefix: ['L', '%']})(onScan);

      scanBarcode(handler, 'L%123abc');

      expect(onScan).toHaveBeenCalledTimes(0);
      jest.runAllTimers();
      expect(onScan).toHaveBeenCalledTimes(1);
    });

    it('excludes the prefix from the final ', () => {
      const onScan = jest.fn();
      const handler = createPrefixedInputHandler({prefix: ['L', '%']})(onScan);

      scanBarcode(handler, 'L%123abc');

      jest.runAllTimers();
      expect(onScan).toHaveBeenCalledWith('123abc');
    });

    it('does not call onScan if the barcode does not match the prefix', () => {
      const onScan = jest.fn();
      const handler = createPrefixedInputHandler({prefix: ['L', '%']})(onScan);

      scanBarcode(handler, 'l%123abc');

      jest.runAllTimers();
      expect(onScan).toHaveBeenCalledTimes(0);
    });

    it('does not call onScan if the prefix matches but the timeout period elapses without subsequent input', () => {
      const onScan = jest.fn();
      const handler = createPrefixedInputHandler({prefix: ['L', '%']})(onScan);

      scanBarcode(handler, 'L%');

      jest.runAllTimers();
      expect(onScan).toHaveBeenCalledTimes(0);
    });

    it('calls onScan after the timeout period if the user does not provide a prefix', () => {
      const onScan = jest.fn();
      const handler = createPrefixedInputHandler()(onScan);

      scanBarcode(handler, 'L%123abc');

      expect(onScan).toHaveBeenCalledTimes(0);
      jest.runAllTimers();
      expect(onScan).toHaveBeenCalledTimes(1);
    });
  });

  describe('filterInput', () => {
    it('calls filterInput on each event', () => {
      const filterInput = jest.fn();
      const handler = createPrefixedInputHandler({filterInput})(() => {});

      scanBarcode(handler, 'L%123abc');

      jest.runAllTimers();
      expect(filterInput).toHaveBeenCalledTimes(8);
    });

    it('excludes keystrokes from the resulting barcode when it returns false', () => {
      const onScan = jest.fn();
      const filterInput = jest.fn((event: KeyboardEvent) => event.key !== 'a');
      const handler = createPrefixedInputHandler({filterInput})(onScan);

      scanBarcode(handler, '123abc');

      jest.runAllTimers();
      expect(onScan).toHaveBeenCalledTimes(1);
      expect(onScan).toHaveBeenCalledWith('123bc');
    });

    it("works on prefix characters (users shouldn't do this, though)", () => {
      const onScan = jest.fn();
      const filterInput = jest.fn((event: KeyboardEvent) => event.key !== 'L');
      const handler = createPrefixedInputHandler({filterInput, prefix: ['L', '%']})(onScan);

      scanBarcode(handler, 'L%123abc');

      jest.runAllTimers();
      expect(onScan).toHaveBeenCalledTimes(0);
    });

    it('uses `isModifierKey` by default', () => {
      const onScan = jest.fn();
      const handler = createPrefixedInputHandler()(onScan);
      scanBarcode(handler, ['L', '%', '1', '2', '3', 'Shift', 'a', 'b', 'c']);
      jest.runAllTimers();
      expect(isModifierKey).toHaveBeenCalledTimes(9); // once per character
    });
  });

  describe('scanIsComplete', () => {
    it('calls onScan immediately if scanIsComplete returns true', () => {
      const onScan = jest.fn();
      const handler = createPrefixedInputHandler({
        prefix: ['L', '%'],
        scanIsComplete: (value: string) => /^123abc$/.test(value),
        scanTimeout: 100,
      })(onScan);

      scanBarcode(handler, 'L%123abc');

      expect(onScan).toHaveBeenCalledTimes(0);
      jest.advanceTimersByTime(0);
      expect(onScan).toHaveBeenCalledTimes(1);
      expect(onScan).toHaveBeenCalledWith('123abc');
    });
  });

  describe('scanTimeout', () => {
    it('calls onScan after scanTimeout', () => {
      const onScan = jest.fn();
      const handler = createPrefixedInputHandler({scanTimeout: 200})(onScan);

      scanBarcode(handler, 'L%123abc');

      expect(onScan).toHaveBeenCalledTimes(0);
      jest.advanceTimersByTime(100);
      expect(onScan).toHaveBeenCalledTimes(0);
      jest.advanceTimersByTime(100);
      expect(onScan).toHaveBeenCalledTimes(1);
      expect(onScan).toHaveBeenCalledWith('L%123abc');
    });

    it('defaults scanTimeout to 200ms', () => {
      const onScan = jest.fn();
      const handler = createPrefixedInputHandler()(onScan);

      scanBarcode(handler, 'L%123abc');

      expect(onScan).toHaveBeenCalledTimes(0);
      jest.advanceTimersByTime(200);
      expect(onScan).toHaveBeenCalledTimes(1);
      expect(onScan).toHaveBeenCalledWith('L%123abc');
    });
  });
});
