/**
 * Jest configuration for running for unit tests.
 */

module.exports = {
  testURL: 'http://localhost',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  testMatch: ['**/?(*.)test.!(*.){js,jsx,ts,tsx}'],
  testPathIgnorePatterns: ['<rootDir>/.coverage/', '<rootDir>/lib/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  coverageDirectory: './.coverage/',
  collectCoverageFrom: ['**/*.{ts,tsx,js,jsx}'],
  coveragePathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/jest.config.js'],
};
