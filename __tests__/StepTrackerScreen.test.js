import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pedometer } from 'expo-sensors';
import StepTrackerScreen from '../app/steptracker/StepTrackerScreen';

// Mock all the required modules
jest.mock('expo-sensors', () => ({
  Pedometer: {
    isAvailableAsync: jest.fn(),
    watchStepCount: jest.fn(),
  }
}));

jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

// Mock API responses
const mockTodayStepsResponse = {
  success: true,
  data: [
    { _id: '1', steps: 5000, date: new Date().toISOString() },
    { _id: '2', steps: 3000, date: new Date().toISOString() }
  ]
};

const mockSaveStepsResponse = {
  success: true,
  data: { _id: '3', steps: 1000, date: new Date().toISOString() }
};

// Mock fetch implementation
global.fetch = jest.fn((url) => {
  if (url.includes('/api/steps?startDate')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockTodayStepsResponse),
    });
  }
  if (url.includes('/api/steps')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockSaveStepsResponse),
    });
  }
  return Promise.reject(new Error('Unexpected URL'));
});

describe('StepTrackerScreen', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock AsyncStorage token
    AsyncStorage.getItem.mockResolvedValue('mock-token');
    
    // Mock Pedometer availability
    Pedometer.isAvailableAsync.mockResolvedValue(true);
  });

  it('renders correctly with initial state', async () => {
    const { getByText, findByText } = render(<StepTrackerScreen />);
    
    // Check header
    expect(getByText('Step Tracker')).toBeTruthy();
    expect(getByText('Track your daily steps and activity')).toBeTruthy();
    
    // Check loading state
    expect(getByText('Loading...')).toBeTruthy();
    
    // Wait for data to load
    await findByText('Today\'s Steps');
    expect(getByText('8,000')).toBeTruthy(); // 5000 + 3000 from mock
    expect(getByText('of 10,000 steps')).toBeTruthy();
  });

  it('handles manual step entry correctly', async () => {
    const { getByText, getByPlaceholderText, findByText } = render(<StepTrackerScreen />);
    
    // Wait for initial load
    await findByText('Today\'s Steps');
    
    // Enter manual steps
    const input = getByPlaceholderText('Enter steps count');
    fireEvent.changeText(input, '1500');
    
    // Save manual steps
    const saveButton = getByText('Save Manual Steps');
    await act(async () => {
      fireEvent.press(saveButton);
    });
    
    // Verify API was called
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/steps'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        }
      })
    );
    
    // Verify state update
    await waitFor(() => {
      expect(getByText('9,500')).toBeTruthy(); // 8000 + 1500
    });
  });

  it('starts and stops step tracking', async () => {
    const mockSubscription = { remove: jest.fn() };
    Pedometer.watchStepCount.mockImplementation((callback) => {
      // Simulate step updates
      setTimeout(() => callback({ steps: 100 }), 100);
      return mockSubscription;
    });
    
    const { getByText, findByText } = render(<StepTrackerScreen />);
    await findByText('Today\'s Steps');
    
    // Start tracking
    const startButton = getByText('Start Tracking');
    await act(async () => {
      fireEvent.press(startButton);
    });
    
    expect(Pedometer.watchStepCount).toHaveBeenCalled();
    expect(getByText('Stop Tracking')).toBeTruthy();
    
    // Simulate steps coming in
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    
    expect(getByText('Current Session: 100 steps')).toBeTruthy();
    
    // Stop tracking
    const stopButton = getByText('Stop Tracking');
    await act(async () => {
      fireEvent.press(stopButton);
    });
    
    expect(mockSubscription.remove).toHaveBeenCalled();
  });

  it('shows error when device lacks pedometer', async () => {
    Pedometer.isAvailableAsync.mockResolvedValue(false);
    
    const { getByText, findByText } = render(<StepTrackerScreen />);
    await findByText('Today\'s Steps');
    
    const startButton = getByText('Start Tracking');
    await act(async () => {
      fireEvent.press(startButton);
    });
    
    expect(getByText('Step tracking not available on this device')).toBeTruthy();
  });

  it('handles API errors gracefully', async () => {
    // Override fetch mock for this test
    fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    const { findByText } = render(<StepTrackerScreen />);
    
    const errorMessage = await findByText(/Failed to fetch today steps/i);
    expect(errorMessage).toBeTruthy();
  });

  it('celebrates when reaching daily goal', async () => {
    // Mock a response that reaches the goal
    fetch.mockImplementationOnce((url) => {
      if (url.includes('/api/steps?startDate')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [{ steps: 10000, date: new Date().toISOString() }]
          }),
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
    
    const { findByText } = render(<StepTrackerScreen />);
    
    const celebration = await findByText('Goal Achieved!');
    expect(celebration).toBeTruthy();
  });
});