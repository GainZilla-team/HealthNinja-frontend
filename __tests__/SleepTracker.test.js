import { fireEvent, render, waitFor } from '@testing-library/react-native';
import SleepTracker from '../app/sleep/SleepScreen';

// Mock all dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock sleepService
const mockSleepService = {
  getCurrentUserEmail: jest.fn(() => Promise.resolve('test@example.com')),
  getSleepData: jest.fn(() => Promise.resolve({
    sleepRecords: [{
      _id: '1',
      duration: 7.5,
      quality: 4,
      bedtime: '22:30',
      wakeupTime: '06:00'
    }],
    summary: {
      averageDuration: 7.2,
      averageQuality: 3.8,
      totalRecords: 5
    }
  })),
  addSleepEntry: jest.fn(() => Promise.resolve({ success: true }))
};
jest.mock('../api/sleepService', () => mockSleepService);

// Mock Alert with proper implementation
const mockAlert = jest.fn();
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: mockAlert
}));

describe('SleepTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mock implementations
    mockSleepService.getCurrentUserEmail.mockResolvedValue('test@example.com');
    mockSleepService.getSleepData.mockResolvedValue({
      sleepRecords: [{
        _id: '1',
        duration: 7.5,
        quality: 4,
        bedtime: '22:30',
        wakeupTime: '06:00'
      }],
      summary: {
        averageDuration: 7.2,
        averageQuality: 3.8,
        totalRecords: 5
      }
    });
    
    // Mock Alert to handle all cases
    mockAlert.mockImplementation((title) => {
      if (title === 'Error') return;
      if (title === 'Sleep Tracking Started') return;
    });
  });

  it('tracks sleep session', async () => {
    // Mock Alert for sleep session complete
    mockAlert.mockImplementationOnce((title, message, buttons) => {
      if (title === 'Sleep Session Complete') {
        buttons.find(b => b.text === 'Rate Quality').onPress();
      }
    });

    const { getByText } = render(<SleepTracker />);
    
    // Wait for initial load
    await waitFor(() => getByText('Start Sleep'));
    
    // Start tracking
    fireEvent.press(getByText('Start Sleep'));
    
    // Verify tracking started
    await waitFor(() => expect(getByText('Wake Up')).toBeTruthy());
    
    // Stop tracking
    fireEvent.press(getByText('Wake Up'));
    
    // Verify Alert was called
    expect(mockAlert).toHaveBeenCalledWith(
      'Sleep Session Complete',
      expect.stringContaining('You slept for'),
      expect.arrayContaining([
        expect.objectContaining({
          text: 'Rate Quality',
        }),
      ])
    );
  });

  it('saves sleep quality rating', async () => {
    // Mock Alert to handle the complete flow
    mockAlert.mockImplementationOnce((title) => {
      if (title === 'Sleep Tracking Started') return;
    }).mockImplementationOnce((title, message, buttons) => {
      if (title === 'Sleep Session Complete') {
        buttons.find(b => b.text === 'Rate Quality').onPress();
      }
    }).mockImplementationOnce((title, message, buttons) => {
      if (title === 'Rate Your Sleep Quality') {
        buttons.find(b => b.text.includes('⭐⭐⭐')).onPress();
      }
    });

    const { getByText } = render(<SleepTracker />);
    
    await waitFor(() => getByText('Start Sleep'));
    
    // Start tracking
    fireEvent.press(getByText('Start Sleep'));
    
    // Stop tracking
    fireEvent.press(getByText('Wake Up'));
    
    // Verify API was called
    await waitFor(() => {
      expect(mockSleepService.addSleepEntry).toHaveBeenCalled();
    });
  });

  it('refreshes data', async () => {
    const { getByTestId, getByText } = render(<SleepTracker />);
    
    await waitFor(() => getByText('Start Sleep'));
    
    // Find ScrollView and trigger refresh
    const scrollView = getByTestId('sleep-scrollview');
    scrollView.props.refreshControl.props.onRefresh();
    
    await waitFor(() => {
      expect(mockSleepService.getSleepData).toHaveBeenCalledTimes(2);
    });
  });
});