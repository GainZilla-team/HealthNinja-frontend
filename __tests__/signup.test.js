
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as authService from '../api/authService';
import SignupScreen from '../app/signup'; // adjust path as needed

// Mock Alert API
jest.spyOn(Alert, 'alert');

// Mock expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email, password, confirm password inputs and create account button', () => {
    const { getByPlaceholderText, getByText } = render(<SignupScreen />);
    expect(getByPlaceholderText('Email address')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm password')).toBeTruthy();
    expect(getByText('Create Account')).toBeTruthy();
  });

  it('shows alert if any field is empty', () => {
    const { getByText } = render(<SignupScreen />);
    fireEvent.press(getByText('Create Account'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Missing Information',
      'Please fill in all fields'
    );
  });

  it('shows alert if passwords do not match', () => {
    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText('Email address'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password1');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'password2');

    fireEvent.press(getByText('Create Account'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Password Mismatch',
      'Passwords do not match'
    );
  });

  it('shows alert if password is less than 6 characters', () => {
    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText('Email address'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), '12345');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), '12345');

    fireEvent.press(getByText('Create Account'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Weak Password',
      'Password must be at least 6 characters long'
    );
  });

  it('calls register and navigates on successful signup', async () => {
    jest.spyOn(authService, 'register').mockResolvedValue();

    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText('Email address'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'password123');

    fireEvent.press(getByText('Create Account'));

    expect(getByText('Creating Account...')).toBeTruthy();

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockReplace).toHaveBeenCalledWith('../homepage/home');
    });
  });

  it('shows alert on registration failure with error message', async () => {
    jest.spyOn(authService, 'register').mockRejectedValue({
      response: { data: { error: 'Email already exists' } }
    });

    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText('Email address'), 'fail@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'password123');

    fireEvent.press(getByText('Create Account'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Registration Failed',
        'Email already exists'
      );
    });
  });

  it('shows alert on registration failure with generic error message', async () => {
    jest.spyOn(authService, 'register').mockRejectedValue(new Error('Network error'));

    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText('Email address'), 'fail2@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'password123');

    fireEvent.press(getByText('Create Account'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Registration Failed',
        'Network error'
      );
    });
  });

  it('disables inputs and shows ActivityIndicator while loading', async () => {
    jest.spyOn(authService, 'register').mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText('Email address'), 'user@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm password'), 'password123');

    fireEvent.press(getByText('Create Account'));

    expect(getByPlaceholderText('Email address').props.editable).toBe(false);
    expect(getByPlaceholderText('Password').props.editable).toBe(false);
    expect(getByPlaceholderText('Confirm password').props.editable).toBe(false);

    expect(getByText('Creating Account...')).toBeTruthy();

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
    });
  });

  it('navigates to login screen when Sign In pressed', () => {
    const { getByText } = render(<SignupScreen />);
    fireEvent.press(getByText('Sign In'));
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
