import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Calendar from 'expo-calendar';
import Schedule from '../app/personalisedschedule/Schedule'; // Adjust the import path as needed

// Mock dependencies
jest.mock('expo-calendar', () => ({
  requestCalendarPermissionsAsync: jest.fn(),
  requestRemindersPermissionsAsync: jest.fn(),
  getCalendarsAsync: jest.fn(),
  getEventsAsync: jest.fn(),
  createEventAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    back: jest.fn(),
  })),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('Schedule Component', () => {
  const mockCalendars = [
    { id: '1', title: 'Work', allowsModifications: true },
    { id: '2', title: 'Personal', allowsModifications: true },
  ];

  const mockEvents = [
    {
      id: 'event1',
      title: 'Meeting',
      startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      endDate: new Date(Date.now() + 86400000 + 3600000).toISOString(), // 1 hour later
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    Calendar.requestCalendarPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Calendar.requestRemindersPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Calendar.getCalendarsAsync.mockResolvedValue(mockCalendars);
    Calendar.getEventsAsync.mockResolvedValue(mockEvents);
    Calendar.createEventAsync.mockResolvedValue('new-event-id');
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        plan: "Monday 6:00 PM - Cardio Blast: 30 minutes running\nTuesday 7:00 AM - Strength Training: Upper body"
      }),
    });
  });

  const renderComponent = () => {
    return render(<Schedule />);
  };

  test('renders initial state correctly', () => {
    const { getByText, getByPlaceholderText } = renderComponent();
    
    expect(getByText('Schedule')).toBeTruthy();
    expect(getByText('AI-powered workout planning')).toBeTruthy();
    expect(getByText('Load Calendar Schedule')).toBeTruthy();
    expect(getByPlaceholderText(/Describe your fitness goal/)).toBeTruthy();
    expect(getByText('Generate Workout Plan')).toBeTruthy();
  });

  test('loads calendar events successfully', async () => {
    const { getByText, queryByText } = renderComponent();
    
    await act(async () => {
      fireEvent.press(getByText('Load Calendar Schedule'));
    });
    
    await waitFor(() => {
      expect(getByText('Events Found (1):')).toBeTruthy();
      expect(getByText('Meeting')).toBeTruthy();
      expect(queryByText('No calendar events loaded yet')).toBeNull();
    });
  });

  test('shows error when no modifiable calendar found', async () => {
    Calendar.getCalendarsAsync.mockResolvedValueOnce([{ allowsModifications: false }]);
    
    const { getByText } = renderComponent();
    
    await act(async () => {
      fireEvent.press(getByText('Load Calendar Schedule'));
    });
    
    await waitFor(() => {
      expect(getByText('No modifiable calendar found.')).toBeTruthy();
    });
  });

  test('handles workout generation failure', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API error'));
    
    const { getByText, getByPlaceholderText } = renderComponent();
    
    // Enter goal
    const goalInput = getByPlaceholderText(/Describe your fitness goal/);
    fireEvent.changeText(goalInput, 'I want to build muscle');
    
    // Generate plan
    await act(async () => {
      fireEvent.press(getByText('Generate Workout Plan'));
    });
    
    await waitFor(() => {
      expect(getByText('Error generating or scheduling workouts.')).toBeTruthy();
    });
  });
});