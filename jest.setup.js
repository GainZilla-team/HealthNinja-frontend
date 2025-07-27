// Basic setup for React Native testing
import '@testing-library/jest-native/extend-expect';

// Mock fetch globally
global.fetch = jest.fn();
global.clearImmediate = global.clearImmediate || ((id) => clearTimeout(id));
global.setImmediate = global.setImmediate || ((fn) => setTimeout(fn, 0));

// Mock common native modules
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-sensors');