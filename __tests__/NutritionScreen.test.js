import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import NutritionScreen from '../app/nutrition/NutritionScreen'; // Adjust path as needed

// Mock all dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    back: jest.fn(),
  })),
}));

jest.mock('../api/logMealService', () => ({
  deleteMeal: jest.fn(() => Promise.resolve()),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('NutritionScreen', () => {
  const mockMeal = {
    _id: '1',
    name: 'Test Meal',
    brand: 'Test Brand',
    calories: 300,
    protein: 20,
    carbs: 30,
    fat: 10,
    mealType: 'lunch',
    servingSize: '1 cup',
    date: new Date().toISOString(),
    food_description: 'Per 100g: 200 calories, 15g protein, 20g carbs, 10g fat'
  };

  const mockSearchResult = {
    food_id: '1',
    food_name: 'Test Food',
    brand_name: 'Test Brand',
    food_description: 'Per 100g: 200 calories, 15g protein, 20g carbs, 10g fat',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('test-token');
    
    // Default mock implementations
    fetch.mockImplementation((url) => {
      if (url.includes('/api/meals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockMeal]),
        });
      }
      
      if (url.includes('/fatsecret/search')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            foods: {
              food: [mockSearchResult]
            }
          }),
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderScreen = () => {
    return render(<NutritionScreen />);
  };

  it('renders correctly', async () => {
    renderScreen();
    
    expect(screen.getByText('Nutrition')).toBeTruthy();
    expect(screen.getByText('Track your daily nutrition goals')).toBeTruthy();
    expect(screen.getByText('Find Food')).toBeTruthy();
    expect(screen.getByPlaceholderText('Search for food (e.g., chicken breast)')).toBeTruthy();
    expect(screen.getByText('Serving Size')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g., 100g, 1 cup')).toBeTruthy();
    expect(screen.getByText('Meal Type')).toBeTruthy();
    expect(screen.getByText('Lunch')).toBeTruthy();
    expect(screen.getByText('Search Nutrition')).toBeTruthy();
  });

  it('searches for nutrition data when Search Nutrition is pressed', async () => {
    renderScreen();
    
    const searchInput = screen.getByPlaceholderText('Search for food (e.g., chicken breast)');
    fireEvent.changeText(searchInput, 'chicken');
    
    const searchButton = screen.getByText('Search Nutrition');
    await act(async () => {
      fireEvent.press(searchButton);
    });
    
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/fatsecret/search?query=chicken%201%20cup'));
    
    await waitFor(() => {
      expect(screen.getByText('Nutrition Results')).toBeTruthy();
      expect(screen.getByText('Test Food')).toBeTruthy();
    });
  });

  it('shows error when search fails', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      })
    );
    
    renderScreen();
    
    const searchInput = screen.getByPlaceholderText('Search for food (e.g., chicken breast)');
    fireEvent.changeText(searchInput, 'invalid food');
    
    const searchButton = screen.getByText('Search Nutrition');
    await act(async () => {
      fireEvent.press(searchButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch nutrition data/i)).toBeTruthy();
    });
  });



  it('changes meal type when different option is selected', async () => {
    renderScreen();
    
    expect(screen.getByText('Lunch')).toBeTruthy();
    
    const breakfastButton = screen.getByText('Breakfast');
    await act(async () => {
      fireEvent.press(breakfastButton);
    });
    
    expect(screen.getByText('Breakfast')).toBeTruthy();
  });

  it('updates serving size when quick buttons are pressed', async () => {
    renderScreen();
    
    const servingInput = screen.getByPlaceholderText('e.g., 100g, 1 cup');
    expect(servingInput.props.value).toBe('1 cup');
    
    const quickButton = screen.getByText('100g');
    await act(async () => {
      fireEvent.press(quickButton);
    });
    
    expect(servingInput.props.value).toBe('100g');
  });

  it('displays daily summary with correct calculations', async () => {
    renderScreen();
    
    await waitFor(() => {
      expect(screen.getByText('Daily Summary')).toBeTruthy();
      expect(screen.getByText('300')).toBeTruthy(); // Calories
      expect(screen.getByText('20g')).toBeTruthy(); // Protein
      expect(screen.getByText('30g')).toBeTruthy(); // Carbs
      expect(screen.getByText('10g')).toBeTruthy(); // Fat
    });
  });
});