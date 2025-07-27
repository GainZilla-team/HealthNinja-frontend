import { render, waitFor } from '@testing-library/react-native';
import StepTrackerScreen from '../app/steptracker/StepTrackerScreen';

// Mock fetch globally for all tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      data: [{ steps: 8000 }],
    }),
  })
);

// Mock expo-sensors Pedometer
jest.mock('expo-sensors', () => ({
  Pedometer: {
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    watchStepCount: jest.fn(() => ({
      remove: jest.fn(),
    })),
    getStepCountAsync: jest.fn(() => Promise.resolve(8000)),
  },
}));

describe('StepTrackerScreen', () => {
  it('loads today steps correctly', async () => {
    const { getByText } = render(<StepTrackerScreen />);
    await waitFor(() => {
      expect(getByText('8,000')).toBeTruthy();
    });
  });
});
