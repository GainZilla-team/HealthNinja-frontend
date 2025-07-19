import { fireEvent, render } from '@testing-library/react-native';
import Schedule from '../app/personalisedschedule/Schedule';

// Mock react-native router
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));


jest.mock('expo-calendar', () => ({
  requestCalendarPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestRemindersPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCalendarsAsync: jest.fn(() =>
    Promise.resolve([{ id: '1', allowsModifications: true }])
  ),
  getEventsAsync: jest.fn(() =>
    Promise.resolve([
      {
        title: 'Yoga Class',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3600000).toISOString(),
      },
    ])
  ),
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ plan: 'Sample workout plan based on calendar and goal.' }),
  })
);

describe('Schedule component', () => {
  it('loads calendar events and displays them', async () => {
    const { getByText, findByText } = render(<Schedule />);

    fireEvent.press(getByText('1. Load Calendar Schedule'));

    const event = await findByText(/Yoga Class/);
    expect(event).toBeTruthy();
  });

  it('submits user goal and shows workout plan', async () => {
    const { getByText, getByPlaceholderText, findByText } = render(<Schedule />);

    fireEvent.changeText(
      getByPlaceholderText(/E.g., I want to build muscle and have 30 minutes in the evening./i),
      'Gain strength in the evening'
    );
    fireEvent.press(getByText('2. Generate Personalized Workout Plan'));

    const result = await findByText(/Sample workout plan/i);
    expect(result).toBeTruthy();
  });
});
