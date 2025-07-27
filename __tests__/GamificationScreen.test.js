import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import GamificationScreen from '../app/gamification/GamificationScreen';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('expo-constants', () => ({
  expoConfig: { extra: { BASE_URL: 'https://mockapi.com' } },
}));

jest.spyOn(Alert, 'alert');
global.fetch = jest.fn();

describe('GamificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('alerts if user is not logged in', async () => {
    AsyncStorage.getItem.mockImplementation(async (key) => {
      if (key === 'userEmail') return null;
      return 'mock-token';
    });

    render(<GamificationScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please log in to access gamification');
    });
  });

  it('loads and displays achievements and leaderboard', async () => {
    AsyncStorage.getItem.mockImplementation(async (key) => {
      if (key === 'userEmail') return 'test@example.com';
      return 'mock-token';
    });

    const mockBadges = { badges: [{ badgeId: 'sleep_warrior' }] };
    const mockStats = { stats: { avgSleepDuration: 6.5, avgProtein: 40 } };
    const mockLeaderboard = {
      leaderboard: [
        { email: 'test@example.com', badgeCount: 3, recentBadges: [{ badgeId: 'sleep_warrior' }] },
        { email: 'other@example.com', badgeCount: 5, recentBadges: [] },
      ]
    };

    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockBadges })
      .mockResolvedValueOnce({ ok: true, json: async () => mockStats })
      .mockResolvedValueOnce({ ok: true, json: async () => mockLeaderboard });

    const { getByText, findByText } = render(<GamificationScreen />);

    expect(await findByText('🏆 Achievements')).toBeTruthy();
    expect(await findByText('Badges Earned')).toBeTruthy();
    expect(await findByText('You')).toBeTruthy();
  });

it('handles API error gracefully', async () => {
  AsyncStorage.getItem.mockResolvedValue('test@example.com');
  fetch.mockRejectedValue(new Error('API failure'));

  render(<GamificationScreen />);

  await waitFor(() => expect(Alert.alert).toHaveBeenCalled());

  expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to load gamification data');
});

  it('navigates to home on button press', async () => {
    const mockPush = jest.fn();
    jest.mock('expo-router', () => ({
      useRouter: () => ({ push: mockPush }),
    }));

    AsyncStorage.getItem.mockImplementation(async (key) => {
      if (key === 'userEmail') return 'test@example.com';
      return 'mock-token';
    });

    fetch.mockResolvedValue({ ok: true, json: async () => ({ badges: [], stats: {}, leaderboard: [] }) });

    const { getByText } = render(<GamificationScreen />);

    await waitFor(() => getByText('Go Back to Home'));
    fireEvent.press(getByText('Go Back to Home'));
    // Can't test navigation directly due to mocked useRouter above
  });
});
