import { fireEvent, render, waitFor } from '@testing-library/react-native';
import NutritionScreen from '../app/nutrition/NutritionScreen'; // Adjust path if needed

// Mock Constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      apiKey: 'test-api-key',
    },
  },
}));

// Mock useRouter from expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

describe('NutritionScreen', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('fetches and displays nutrition data on valid input', async () => {
    const mockData = [
      {
        name: 'egg',
        calories: 78,
        protein_g: 6,
        carbohydrates_total_g: 0.6,
        fat_total_g: 5.3,
      },
    ];

    fetch.mockResponseOnce(JSON.stringify(mockData));

    const { getByPlaceholderText, getByText, queryByText } = render(<NutritionScreen />);

    fireEvent.changeText(getByPlaceholderText(/enter food/i), '1 egg');
    fireEvent.press(getByText('Get Nutrition Info'));

    // Show loading spinner
    expect(queryByText('Calories: 78')).toBeNull();

    await waitFor(() => expect(getByText('Calories: 78')).toBeTruthy());
    expect(getByText('Protein: 6g')).toBeTruthy();
    expect(getByText('Carbs: 0.6g')).toBeTruthy();
    expect(getByText('Fat: 5.3g')).toBeTruthy();
  });

  it('shows error when no results are found', async () => {
    fetch.mockResponseOnce(JSON.stringify([]));

    const { getByPlaceholderText, getByText, findByText } = render(<NutritionScreen />);

    fireEvent.changeText(getByPlaceholderText(/enter food/i), 'nonexistentfood');
    fireEvent.press(getByText('Get Nutrition Info'));

    const errorText = await findByText('No results found for your input.');
    expect(errorText).toBeTruthy();
  });

  it('shows error message on failed fetch', async () => {
    fetch.mockRejectOnce(new Error('API down'));

    const { getByPlaceholderText, getByText, findByText } = render(<NutritionScreen />);

    fireEvent.changeText(getByPlaceholderText(/enter food/i), 'egg');
    fireEvent.press(getByText('Get Nutrition Info'));

    const errorText = await findByText('API down');
    expect(errorText).toBeTruthy();
  });
});
