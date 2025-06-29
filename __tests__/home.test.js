import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as authService from '../api/authService.js';
import HomeScreen from '../app/homepage/home.js';

// Mock useRouter from expo-router
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock react-native-vector-icons to avoid errors in tests
jest.mock('@expo/vector-icons', () => ({
  FontAwesome5: 'FontAwesome5',
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and shows profile email when getProfile resolves', async () => {
    const profileData = { email: 'test@example.com' };
    jest.spyOn(authService, 'getProfile').mockResolvedValue(profileData);

    const { getByText } = render(<HomeScreen />);

    // Wait for profile to be set and text to appear
    await waitFor(() => {
      expect(getByText(/Welcome to HealthNinja, test@example.com/i)).toBeTruthy();
    });
  });

  it('redirects to /login if getProfile rejects', async () => {
    jest.spyOn(authService, 'getProfile').mockRejectedValue(new Error('fail'));

    render(<HomeScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('navigates to Community screen when Community icon pressed', async () => {
    jest.spyOn(authService, 'getProfile').mockResolvedValue({});

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Community'));
      expect(mockPush).toHaveBeenCalledWith('../community/CommunityScreen');
    });
  });

  it('navigates to Nutrition screen when Nutrition icon pressed', async () => {
    jest.spyOn(authService, 'getProfile').mockResolvedValue({});

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Nutrition'));
      expect(mockPush).toHaveBeenCalledWith('../nutrition/NutritionScreen');
    });
  });

  it('navigates to Workouts screen when Workouts icon pressed', async () => {
    jest.spyOn(authService, 'getProfile').mockResolvedValue({});

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Workouts'));
      expect(mockPush).toHaveBeenCalledWith('../workout/RunningScreen');
    });
  });

  it('navigates to Schedule screen when Schedule icon pressed', async () => {
    jest.spyOn(authService, 'getProfile').mockResolvedValue({});

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Schedule'));
      expect(mockPush).toHaveBeenCalledWith('../personalisedschedule/Schedule');
    });
  });

  it('calls logout and redirects to /login on logout button press', async () => {
    jest.spyOn(authService, 'getProfile').mockResolvedValue({});
    const logoutMock = jest.spyOn(authService, 'logout').mockResolvedValue();

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('Logout'));
    });

    expect(logoutMock).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
