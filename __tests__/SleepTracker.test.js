import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as SleepApiService from '../../api/sleepService';
import SleepTracker from '../SleepTracker';

// Mock all the required modules
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../api/sleepService');
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

// Mock sleep data
const mockSleepData = {
  sleepRecords: [
    {
      _id: '1',
      date: '2023-06-01T08:00:00Z',
      duration: 7.5,
      quality: 4,
      bedtime: '22:30',
      wakeupTime: '06:00'
    }
  ],
  summary: {
    averageDuration: 7.2,
    averageQuality: 3.8,
    totalRecords: 5
  }
};

describe('SleepTracker', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock API responses
    SleepApiService.getCurrentUserEmail.mockResolvedValue('test@example.com');
    SleepApiService.getSleepData.mockResolvedValue(mockSleepData);
    SleepApiService.addSleepEntry.mockResolvedValue({ success: true });
  });

  it('renders loading state initially', async () => {
    const { getByText } = render(<SleepTracker />);
    expect(getByText('Loading sleep data...')).toBeTruthy();
  });

  it('displays sleep data after loading', async () => {
    const { findByText } = render(<SleepTracker />);
    
    // Check that summary data is displayed
    expect(await findByText('7.2h')).toBeTruthy();
    expect(await findByText('3.8/5')).toBeTruthy();
    expect(await findByText('5')).toBeTruthy();
  });

  it('starts and stops sleep tracking', async () => {
    const { findByText, getByText } = render(<SleepTracker />);
    await findByText('Start Sleep');
    
    // Start tracking
    fireEvent.press(getByText('Start Sleep'));
    
    // Verify tracking started
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    expect(getByText('Wake Up')).toBeTruthy();
    
    // Stop tracking
    fireEvent.press(getByText('Wake Up'));
    
    // Verify quality rating prompt appears
    await waitFor(() => {
      expect(getByText('Rate Your Sleep Quality')).toBeTruthy();
    });
  });

  it('handles sleep quality rating', async () => {
    const { findByText, getByText } = render(<SleepTracker />);
    await findByText('Start Sleep');
    
    // Start and stop tracking to trigger quality rating
    fireEvent.press(getByText('Start Sleep'));
    fireEvent.press(getByText('Wake Up'));
    
    // Select a quality rating
    fireEvent.press(getByText('⭐⭐⭐ Good'));
    
    // Verify API was called
    await waitFor(() => {
      expect(SleepApiService.addSleepEntry).toHaveBeenCalled();
    });
  });

  it('refreshes sleep data', async () => {
    const { findByText, getByTestId } = render(<SleepTracker />);
    await findByText('7.2h');
    
    // Trigger refresh
    const refreshControl = getByTestId('refresh-control');
    refreshControl.props.onRefresh();
    
    // Verify data was reloaded
    await waitFor(() => {
      expect(SleepApiService.getSleepData).toHaveBeenCalledTimes(2);
    });
  });

  it('handles errors when loading data', async () => {
    SleepApiService.getSleepData.mockRejectedValue(new Error('Network error'));
    
    const { findByText } = render(<SleepTracker />);
    const errorMessage = await findByText(/No sleep data yet/i);
    expect(errorMessage).toBeTruthy();
  });
});