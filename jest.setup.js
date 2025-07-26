// Basic setup for React Native testing
import '@testing-library/jest-native/extend-expect';

// Mock fetch globally
global.fetch = jest.fn();

// Mock common native modules
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-sensors');