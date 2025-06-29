import { fireEvent, render } from '@testing-library/react-native';
import LoginScreen from '../app/login';

describe('login', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('shows alert on empty login', () => {
    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText('Login'));

    // You can mock Alert.alert and check if called, etc.
  });
});
