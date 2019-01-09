const stringToBoolean = (val) => {
  if (val == null) {
    return false;
  }

  if (typeof val !== 'string') {
    throw new Error(`Cannot parse value "${val}" (expected a string but received a ${typeof val})`);
  }

  switch (val.trim().toLowerCase()) {
    case '1':
    case 'true':
      return true;
    case '0':
    case 'false':
      return false;
  }

  throw new Error(`Could not parse unexpected value "${val}" as a boolean`);
};

/**
 * Jest configuration for unit tests.
 *
 * Coverage reporting is automatically enabled in CI environments; enable it locally by setting
 * `COVERAGE=true`.
 */
module.exports = {
  collectCoverage: stringToBoolean(process.env.CI) || stringToBoolean(process.env.COVERAGE),
  collectCoverageFrom: ['**/*.{ts,tsx,js,jsx}'],
  coverageDirectory: './.coverage/',
  coveragePathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/jest.config.js'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  testMatch: ['**/?(*.)test.!(*.){js,jsx,ts,tsx}'],
  testPathIgnorePatterns: ['<rootDir>/.coverage/', '<rootDir>/lib/', '<rootDir>/node_modules/'],
  testURL: 'http://localhost',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};
