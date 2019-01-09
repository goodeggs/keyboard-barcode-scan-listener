module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['last 1 version', 'last 2 iOS versions'],
        },
      },
    ],
    '@babel/typescript',
  ],
};
