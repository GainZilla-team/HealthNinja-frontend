import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import RecentWorkouts from '../app/workout/RecentWorkouts';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    back: jest.fn(),
  })),
}));

global.fetch = jest.fn();

describe('RecentWorkouts Component', () => {
  const mockWorkouts = [
    {
      _id: '1',
      type: 'running',
      startTime: '2023-05-15T10:00:00Z',
      distance: 5.2,
      duration: '30:00',
      pace: '5:45',
      calories: 312
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('test-token');
  });

  test('renders loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    const { getByText } = render(<RecentWorkouts />);
    expect(getByText('Loading workouts...')).toBeTruthy();
  });

  test('displays workouts after successful fetch', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workouts: mockWorkouts }),
    });

    const { getByText } = render(<RecentWorkouts />);
    
    await waitFor(() => {
      expect(getByText('Recent Workouts')).toBeTruthy();
      expect(getByText('RUNNING')).toBeTruthy();
    });
  });

  test('handles fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    const { getByText } = render(<RecentWorkouts />);
    
    await waitFor(() => {
      expect(getByText('Error: Network error')).toBeTruthy();
    });
  });

  test('retry button works', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ workouts: mockWorkouts }),
    });

    const { getByText } = render(<RecentWorkouts />);
    
    await waitFor(() => {
      fireEvent.press(getByText('Retry'));
    });
    
    await waitFor(() => {
      expect(getByText('RUNNING')).toBeTruthy();
    });
  });
});