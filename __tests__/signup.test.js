import { render } from '@testing-library/react-native';
import SignupScreen from '../app/signup';

test('renders signup inputs and buttons', () => {
  const { getByPlaceholderText, getByText } = render(<SignupScreen />);

  expect(getByPlaceholderText('Email')).toBeTruthy();
  expect(getByPlaceholderText('Password')).toBeTruthy();
  expect(getByText('Sign Up')).toBeTruthy();
  expect(getByText('Back to Login')).toBeTruthy();
});
