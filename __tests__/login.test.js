/**
 * @jest-environment jsdom
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as authService from '../api/authService';
import LoginScreen from '../app/login'; // adjust path as needed

// Mock Alert API
import { Alert } from 'react-native';
jest.spyOn(Alert, 'alert');

// Mock expo-router
const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email, password inputs and sign in button', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    expect(getByPlaceholderText('Email address')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('shows alert if email or password is empty on submit', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Sign In'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Missing Information',
      'Please fill in all fields'
    );
  });

  it('calls login, stores email, and navigates on successful login', async () => {
    jest.spyOn(authService, 'login').mockResolvedValue();
    jest.spyOn(AsyncStorage, 'setItem').mockResolvedValue();

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email address'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'mypassword');

    fireEvent.press(getByText('Sign In'));

    // Loading state disables button (text changes)
    expect(getByText('Signing In...')).toBeTruthy();

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'mypassword');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
      expect(mockReplace).toHaveBeenCalledWith('../homepage/home');
    });
  });

  it('shows alert on login failure', async () => {
    jest.spyOn(authService, 'login').mockRejectedValue(new Error('Invalid credentials'));

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email address'), 'fail@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpass');

    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Failed',
        'Invalid credentials'
      );
    });

    // Loading should be false again, so button text is normal
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('navigates to signup screen when Create Account pressed', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Create Account'));
    expect(mockPush).toHaveBeenCalledWith('/signup');
  });

  it('disables inputs and shows ActivityIndicator while loading', async () => {
    jest.spyOn(authService, 'login').mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const { getByText, getByPlaceholderText, queryByTestId } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email address'), 'user@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');

    fireEvent.press(getByText('Sign In'));

    // Inputs should be disabled while loading
    expect(getByPlaceholderText('Email address').props.editable).toBe(false);
    expect(getByPlaceholderText('Password').props.editable).toBe(false);

    // ActivityIndicator should be present (by testing text indicator showing, or you can add testID for ActivityIndicator)
    expect(getByText('Signing In...')).toBeTruthy();

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled();
    });
  });
});
