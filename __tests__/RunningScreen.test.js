import AsyncStorage from '@react-native-async-storage/async-storage';
import { render } from '@testing-library/react-native';
import * as Location from 'expo-location';
import RunningScreen from './../app/workout/RunningScreen';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: {
    Highest: 1
  }
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    back: jest.fn(),
  })),
}));

global.fetch = jest.fn();

describe('RunningScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('test-token');
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted'
    });
  });

  test('renders initial loading state', () => {
    const { getByText } = render(<RunningScreen />);
    expect(getByText('Acquiring GPS signal...')).toBeTruthy();
  });
});