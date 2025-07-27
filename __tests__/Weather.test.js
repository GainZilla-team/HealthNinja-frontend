import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import WeatherScreen from '../path-to-your-component/WeatherScreen';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('expo-constants', () => ({
  expoConfig: { extra: { BASE_URL: 'https://mockapi.com' } },
}));

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

global.fetch = jest.fn();

describe('WeatherScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header and search button', () => {
    const { getByText, getByPlaceholderText } = render(<WeatherScreen />);
    expect(getByText('Weather')).toBeTruthy();
    expect(getByPlaceholderText(/Enter location/i)).toBeTruthy();
    expect(getByText('Get Weather')).toBeTruthy();
  });

  it('shows alert if no location is entered', async () => {
    const { getByText } = render(<WeatherScreen />);
    fireEvent.press(getByText('Get Weather'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Please enter a location');
    });
  });

  it('shows alert if token is missing', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const { getByText, getByPlaceholderText } = render(<WeatherScreen />);
    fireEvent.changeText(getByPlaceholderText(/Enter location/i), 'Singapore');
    fireEvent.press(getByText('Get Weather'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('You must be logged in to fetch weather');
    });
  });

  it('fetches and displays weather data and schedules notification', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
    const mockWeather = {
      locationName: 'Singapore',
      condition: 'Sunny',
      temperature: 28,
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockWeather),
    });

    const { getByText, getByPlaceholderText, findByText } = render(<WeatherScreen />);
    fireEvent.changeText(getByPlaceholderText(/Enter location/i), 'Singapore');
    fireEvent.press(getByText('Get Weather'));

    expect(await findByText('📍 Location: Singapore')).toBeTruthy();
    expect(await findByText('🌦️ Condition: Sunny')).toBeTruthy();
    expect(await findByText('🌡️ Temperature: 28 °C')).toBeTruthy();
    expect(await findByText(/Good time for an outdoor run/)).toBeTruthy();

    await waitFor(() => {
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });
  });

  it('handles error response from API', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Server error',
    });

    const { getByText, getByPlaceholderText } = render(<WeatherScreen />);
    fireEvent.changeText(getByPlaceholderText(/Enter location/i), 'InvalidCity');
    fireEvent.press(getByText('Get Weather'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', expect.stringContaining('500'));
    });
  });
});
