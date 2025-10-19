// jest-setup.ts
// import "@testing-library/jest-native/extend-expect";

// Reanimated (current API)

// // Gesture Handler (optional but common)
// import "react-native-gesture-handler/jestSetup";
// setUpTests();

// // Some libs expect this to exist
// // @ts-ignore
// global.__reanimatedWorkletInit = () => {};

// Mock @react-native-firebase modules
jest.mock("@react-native-firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock("@react-native-firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));
