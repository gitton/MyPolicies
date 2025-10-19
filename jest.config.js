// jest.config.js
module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
    transformIgnorePatterns: [
      'node_modules/(?!((jest-)?react-native'
        + '|@react-native'
        + '|@react-native-segmented-control'
        + '|react-clone-referenced-element'
        + '|@react-navigation'
        + '|@react-native(-community)?'
        + '|expo(nent)?'
        + '|expo-.*'
        + '|expo-modules-core'
        + '|@expo(nent)?/.*'
        + '|@unimodules/.*'
        + '|unimodules-.*'
        + '|sentry-expo'
        + '|react-native-svg'
        + '|react-native-reanimated'
        + '|@reduxjs/toolkit'
        + '|react-redux'
        + '|immer'
        + '|redux'
        + '|@react-native-firebase'
      + ')(/|$))',
    ],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      // If you prefer the mock for faster tests, uncomment:
      // 'react-native-reanimated': 'react-native-reanimated/mock',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testEnvironment: 'node',
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    // Optimize file watching to prevent EMFILE errors
    watchman: false,
    watchPathIgnorePatterns: [
      '<rootDir>/node_modules/',
      '<rootDir>/.git/',
      '<rootDir>/coverage/',
      '<rootDir>/dist/',
      '<rootDir>/build/',
    ],
    // Reduce the number of files Jest watches
    testPathIgnorePatterns: [
      '<rootDir>/node_modules/',
      '<rootDir>/.git/',
      '<rootDir>/coverage/',
      '<rootDir>/dist/',
      '<rootDir>/build/',
    ],
  };