import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import RunningScreen from '../app/workout/RunningScreen';

import * as Location from 'expo-location';

// Mock useRouter and provide a mockBack function to test navigation
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

// Mock Location.watchPositionAsync to simulate location updates
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: {
    Highest: 'highest',
  },
}));

describe('RunningScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });

    // We'll mock watchPositionAsync to never call the callback immediately
    Location.watchPositionAsync.mockImplementation(() => Promise.resolve({
      remove: jest.fn(),
    }));

    const { getByText } = render(<RunningScreen />);
    
    expect(getByText('Acquiring GPS signal...')).toBeTruthy();
  });

  it('handles location updates and button presses', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });

    // We'll call the position callback manually from the mock
    let positionCallback;
    Location.watchPositionAsync.mockImplementation(async (options, callback) => {
      positionCallback = callback;
      return {
        remove: jest.fn(),
      };
    });

    const { getByText } = render(<RunningScreen />);

    // Wait for permission and watcher setup
    await waitFor(() => expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled());

    // Simulate location update wrapped in act()
    await act(async () => {
      positionCallback({
        coords: {
          latitude: 1.35,
          longitude: 103.8,
        },
      });
    });

    // Now the loading text should disappear, distance/time/pace should show
    await waitFor(() => {
      expect(getByText(/Distance:/)).toBeTruthy();
      expect(getByText(/Time:/)).toBeTruthy();
      expect(getByText(/Pace:/)).toBeTruthy();
    });

    // Start workout button appears before started
    expect(getByText('Start Workout')).toBeTruthy();

    // Start workout
    await act(async () => {
      fireEvent.press(getByText('Start Workout'));
    });

    // Pause workout button should appear
    expect(getByText('Pause')).toBeTruthy();

    // Pause workout
    await act(async () => {
      fireEvent.press(getByText('Pause'));
    });

    // Resume workout button should appear
    expect(getByText('Resume')).toBeTruthy();

    // Finish workout button is always there after start
    expect(getByText('Finish Workout')).toBeTruthy();

    // Mock Alert to avoid actual alert during test
    jest.spyOn(global, 'alert').mockImplementation(() => {});

    // Finish workout
    await act(async () => {
      fireEvent.press(getByText('Finish Workout'));
    });

    // Test Go Back button calls router.back
    await act(async () => {
      fireEvent.press(getByText('Go Back'));
    });

    expect(mockBack).toHaveBeenCalled();
  });

  it('shows error when location permission denied', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const { getByText } = render(<RunningScreen />);

    await waitFor(() => {
      expect(getByText('Error: Location permission denied')).toBeTruthy();
    });

    // Test Go Back button calls router.back
    fireEvent.press(getByText('Go Back'));
    expect(mockBack).toHaveBeenCalled();
  });
});
