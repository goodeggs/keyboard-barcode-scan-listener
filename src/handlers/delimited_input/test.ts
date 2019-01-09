import {isModifierKey} from '../shared';
import createDelimitedInputHandler, {DEFAULT_CAPTURE_PREFIX, DEFAULT_CAPTURE_SUFFIX} from '.';

beforeEach(jest.useFakeTimers);
jest.mock('../shared', () => ({isModifierKey: jest.fn(() => true)}));
afterEach(jest.clearAllMocks);

const scanBarcode = (handler: (event: KeyboardEvent) => void, barcode: string | string[]): void => {
  for (const key of barcode) {
    // Simulate delay character input
    jest.advanceTimersByTime(2);
    handler(new KeyboardEvent('keydown', {key}));
  }
  jest.runAllTimers();
};

describe('delimited input handler', () => {
  describe('capturePrefix', () => {
    it.each([
      // Default prefix
      [
        undefined,
        ['i', DEFAULT_CAPTURE_PREFIX, 'h', 'E', 'l', 'L', 'o', DEFAULT_CAPTURE_SUFFIX, 'o'],
        ['hElLo'],
      ],
      // Custom prefix
      ['`', ['i', '`', 'h', 'E', 'l', 'L', 'o', DEFAULT_CAPTURE_SUFFIX, 'o'], ['hElLo']],
    ])(
      `capturePrefix="%s", input="%j"`,
      (capturePrefix: string, inputs: string[], expectedScans: string[]) => {
        const onScan = jest.fn();
        const handler = createDelimitedInputHandler({capturePrefix})(onScan);

        scanBarcode(handler, inputs);

        expect(onScan).toHaveBeenCalledTimes(expectedScans.length);
        for (const expectedScan of expectedScans) {
          expect(onScan).toHaveBeenCalledWith(expectedScan);
        }
      },
    );
  });

  describe('captureSuffix', () => {
    it.each([
      // Default suffix
      [
        undefined,
        ['i', DEFAULT_CAPTURE_PREFIX, 'h', 'E', 'l', 'L', 'o', DEFAULT_CAPTURE_SUFFIX, 'o'],
        ['hElLo'],
      ],
      // Custom suffix
      ['`', ['i', DEFAULT_CAPTURE_PREFIX, 'h', 'E', 'l', 'L', 'o', '`', 'o'], ['hElLo']],
    ])(
      `captureSuffix="%s", input="%j"`,
      (captureSuffix: string, inputs: string[], expectedScans: string[]) => {
        const onScan = jest.fn();
        const handler = createDelimitedInputHandler({captureSuffix})(onScan);

        scanBarcode(handler, inputs);

        expect(onScan).toHaveBeenCalledTimes(expectedScans.length);
        for (const expectedScan of expectedScans) {
          expect(onScan).toHaveBeenCalledWith(expectedScan);
        }
      },
    );
  });

  describe('onScan', () => {
    it('calls onScan with all characters between capturePrefix and captureSuffix', () => {
      const onScan = jest.fn();
      const handler = createDelimitedInputHandler()(onScan);
      const inputs = [
        'i',
        'g',
        'n',
        '0',
        'r',
        'e',
        DEFAULT_CAPTURE_PREFIX,
        'h',
        'e',
        'l',
        'l',
        'o',
        DEFAULT_CAPTURE_SUFFIX,
        'J',
        DEFAULT_CAPTURE_PREFIX,
        'w',
        'o',
        DEFAULT_CAPTURE_SUFFIX,
        '8',
        'R',
        DEFAULT_CAPTURE_PREFIX,
        'r',
        'l',
        'd',
        DEFAULT_CAPTURE_SUFFIX,
        DEFAULT_CAPTURE_PREFIX,
        'n',
        'o',
        'p',
        'e',
      ];

      scanBarcode(handler, inputs);

      expect(onScan).toHaveBeenCalledTimes(3);
      expect(onScan).toHaveBeenNthCalledWith(1, 'hello');
      expect(onScan).toHaveBeenNthCalledWith(2, 'wo');
      expect(onScan).toHaveBeenNthCalledWith(3, 'rld');
    });
  });

  describe('onCapturedInput', () => {
    it('is called for any captured input', () => {
      const inputs: string[] = [
        DEFAULT_CAPTURE_PREFIX,
        'h',
        'E',
        'l',
        'L',
        'o',
        DEFAULT_CAPTURE_SUFFIX,
      ];
      const onCapturedInput = jest.fn();
      const handler = createDelimitedInputHandler({onCapturedInput})(() => {});

      for (const key of ['i', ...inputs, 'F']) {
        handler(new KeyboardEvent('keydown', {key}));
      }

      expect(onCapturedInput).toHaveBeenCalledTimes(inputs.length);
      for (const key of inputs) {
        expect(onCapturedInput).toHaveBeenCalledWith(new KeyboardEvent('keydown', {key}));
      }
    });

    it('by default, calls preventDefault on captured characters', () => {
      const inputs: [string, boolean][] = [
        ['i', false],
        [DEFAULT_CAPTURE_PREFIX, true],
        ['h', true],
        ['E', true],
        ['l', true],
        ['L', true],
        ['o', true],
        [DEFAULT_CAPTURE_SUFFIX, true],
        ['o', false],
      ];
      const handler = createDelimitedInputHandler()(() => {});

      for (const [key, shouldPreventDefault] of inputs) {
        const event = new KeyboardEvent('keydown', {key});
        event.preventDefault = jest.fn();
        handler(event);
        expect(event.preventDefault).toHaveBeenCalledTimes(shouldPreventDefault ? 1 : 0);
      }
    });
  });

  describe('filterInput', () => {
    it('calls filterInput on each event, ignoring control characters', () => {
      const filterInput = jest.fn();
      const handler = createDelimitedInputHandler({filterInput})(() => {});
      const inputs = ['h', 'e', 'l', 'l', 'o'];

      handler(new KeyboardEvent('keydown', {key: DEFAULT_CAPTURE_PREFIX}));
      expect(filterInput).toHaveBeenCalledTimes(0);

      for (const key of inputs) {
        const event = new KeyboardEvent('keydown', {key});
        handler(event);
        expect(filterInput).toHaveBeenLastCalledWith(event);
      }

      handler(new KeyboardEvent('keydown', {key: DEFAULT_CAPTURE_SUFFIX}));
      expect(filterInput).toHaveBeenCalledTimes(inputs.length);
    });

    it('does not call filterInput on uncaptured input', () => {
      const filterInput = jest.fn();
      const handler = createDelimitedInputHandler({filterInput})(() => {});
      const inputs = ['h', 'e', 'l', 'l', 'o'];

      scanBarcode(handler, ['y', DEFAULT_CAPTURE_PREFIX, ...inputs, DEFAULT_CAPTURE_SUFFIX, 'o']);

      expect(filterInput).toHaveBeenCalledTimes(inputs.length);
      for (const [index, key] of inputs.entries()) {
        expect(filterInput).toHaveBeenNthCalledWith(index + 1, new KeyboardEvent('keydown', {key}));
      }
    });

    it('uses `isModifierKey` by default', () => {
      const handler = createDelimitedInputHandler()(() => {});
      const inputs = ['h', 'e', 'l', 'l', 'o'];
      scanBarcode(handler, ['y', DEFAULT_CAPTURE_PREFIX, ...inputs, DEFAULT_CAPTURE_SUFFIX, 'o']);
      expect(isModifierKey).toHaveBeenCalledTimes(5); // once per captured character
    });
  });
});
