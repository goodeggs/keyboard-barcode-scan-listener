const path = require('path');

module.exports = {
  root: true,
  parserOptions: {
    project: path.join(__dirname, 'tsconfig.json'),
  },
  extends: [
    require.resolve('@goodeggs/toolkit/config/eslint'),
    require.resolve('@goodeggs/toolkit/config/eslint/jest'),
    require.resolve('@goodeggs/toolkit/config/eslint/ops'),
  ],
  overrides: [
    // Source files
    {
      files: ['src/**/*.{js,jsx,ts,tsx}'],
      env: {
        browser: true,
      },
    },
    // Unit tests and mocks
    // {
    //   files: ['**/{*.,}test.{js,jsx,ts,tsx}', '**/__mocks__/*.{js,jsx,ts,tsx}'],
    //   env: {
    //     jest: true,
    //   },
    // },
    // Project configuration files
    // {
    //   files: ['*.config{.babel,}.js', '.*rc.js'],
    //   env: {
    //     node: true,
    //   },
    //   rules: {
    //     'goodeggs/import-no-commonjs': 'off',
    //   },
    // },
  ],
};
