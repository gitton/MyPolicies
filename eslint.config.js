// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['dist/*'],

    settings: {
      'import/resolver': {
        typescript: {
          // auto-detect tsconfig.json in the project
          project: true,
        },
      },
    },
  },
]);