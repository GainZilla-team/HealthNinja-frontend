/**
 * @jest-environment jsdom
 */
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import HomeScreen from '../app/homepage/home'; // adjust path as needed

// Mock authService functions
jest.mock('../api/authService.js', () => ({
  getProfile: jest.fn(),
  logout: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

// Mock expo-router
const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

// Mock Dimensions to fix width used in styles
import { Dimensions } from 'react-native';
Dimensions.get = jest.fn().mockReturnValue({ width: 360 });

describe('HomeScreen', () => {
  const { getProfile, logout } = require('../api/authService.js');
  const AsyncStorage = require('@react-native-async-storage/async-storage');

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks:
    getProfile.mockResolvedValue({ email: 'testuser@example.com' });
    logout.mockResolvedValue();
    AsyncStorage.getItem.mockResolvedValue('fake-token');

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              date: new Date().toISOString(),
              calories: 100,
              protein: 10,
              carbs: 20,
              fat: 5,
            },
            {
              date: new Date().toISOString(),
              calories: 50,
              protein: 5,
              carbs: 10,
              fat: 2,
            },
          ]),
      })
    );
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('renders loading state and then profile greeting', async () => {
    const { getByText, queryByText } = render(<HomeScreen />);

    // Loading indicator shown initially
    expect(getByText("Today's Nutrition")).toBeTruthy();
    expect(queryByText('Loading...')).toBeNull(); // you don't have a "Loading..." text but ActivityIndicator instead

    // The "Welcome back" text should update after profile loads
    await waitFor(() =>
      expect(getByText(/Welcome back, testuser/i)).toBeTruthy()
    );
  });

  it('fetches and displays nutrition stats for today', async () => {
    const { getByText, queryByText } = render(<HomeScreen />);

    // Initially loadingStats true, ActivityIndicator shown
    expect(queryByText('Calories')).toBeNull(); // stats not shown while loading

    await waitFor(() => {
      // After fetchTodayStats finishes, numbers show
      expect(getByText('150')).toBeTruthy(); // calories 100 + 50
      expect(getByText('15g')).toBeTruthy(); // protein 10 + 5
      expect(getByText('30g')).toBeTruthy(); // carbs 20 + 10
      expect(getByText('7g')).toBeTruthy();  // fat 5 + 2
    });
  });

  it('calls logout and navigates to login on logout button press', async () => {
    const { getByText } = render(<HomeScreen />);

    // Wait for profile load to finish to ensure button renders
    await waitFor(() => getByText('Sign Out'));

    fireEvent.press(getByText('Sign Out'));

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('navigates to Recent Workouts when Quick Actions button pressed', async () => {
    const { getByText } = render(<HomeScreen />);

    const button = getByText('View Recent Workouts');

    fireEvent.press(button);

    expect(mockPush).toHaveBeenCalledWith('../workout/RecentWorkouts');
  });
});
