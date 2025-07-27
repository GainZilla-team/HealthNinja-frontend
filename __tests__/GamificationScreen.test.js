import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, waitFor } from '@testing-library/react-native';
import GamificationScreen from '../path/to/GamificationScreen'; // adjust path

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      BASE_URL: 'https://mockapi.com',
    },
  },
}));

// Global fetch mock
global.fetch = jest.fn();

describe('GamificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading indicator initially', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('test@example.com');
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ badges: [], stats: {}, leaderboard: [] }),
    });

    const { getByText } = render(<GamificationScreen />);
    expect(getByText('Loading achievements...')).toBeTruthy();
  });

  it('fetches and displays user data on mount', async () => {
    AsyncStorage.getItem
      .mockResolvedValueOnce('test@example.com') // userEmail
      .mockResolvedValue('mockToken'); // token for all fetches

    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ badges: [{ badgeId: 'sleep_warrior' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: { avgSleepDuration: 6.5 } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ leaderboard: [] }) });

    const { getByText, queryByText } = render(<GamificationScreen />);
    
    await waitFor(() => {
      expect(queryByText('Loading achievements...')).toBeNull();
      expect(getByText('Your Progress')).toBeTruthy();
      expect(getByText('Badges Earned')).toBeTruthy();
    });
  });

  it('handles missing user email by showing alert', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null); // no email

    const alertMock = jest.spyOn(global, 'Alert').mockImplementation(() => {});
    render(<GamificationScreen />);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error', 'Please log in to access gamification');
    });

    alertMock.mockRestore();
  });

  it('displays leaderboard if data is returned', async () => {
    AsyncStorage.getItem
      .mockResolvedValueOnce('user@example.com') // email
      .mockResolvedValue('mockToken'); // token

    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ badges: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: {} }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          leaderboard: [
            { email: 'user@example.com', badgeCount: 5, recentBadges: [{ badgeId: 'sleep_warrior' }] }
          ]
        })
      });

    const { getByText } = render(<GamificationScreen />);

    await waitFor(() => {
      expect(getByText('🏅 Community Leaderboard')).toBeTruthy();
      expect(getByText('You')).toBeTruthy();
      expect(getByText('5 badges')).toBeTruthy();
    });
  });
});
