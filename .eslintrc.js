module.exports = {
  root: true,
  plugins: ['goodeggs', 'jest'],
  extends: ['plugin:goodeggs/goodeggs', 'prettier', 'plugin:prettier/recommended'],
  overrides: [
    // Source files
    {
      files: ['src/**/*.{js,jsx,ts,tsx}'],
      env: {
        browser: true,
      },
    },
    // Unit tests and mocks
    {
      files: ['**/{*.,}test.{js,jsx,ts,tsx}', '**/__mocks__/*.{js,jsx,ts,tsx}'],
      env: {
        jest: true,
      },
    },
    // Project configuration files
    {
      files: ['*.config{.babel,}.js', '.*rc.js'],
      env: {
        node: true,
      },
      rules: {
        'goodeggs/import-no-commonjs': 'off',
      },
    },
  ],
};
