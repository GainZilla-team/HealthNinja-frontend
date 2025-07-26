import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export const logMeal = async (mealData) => {
  const token = await AsyncStorage.getItem('token');

  const response = await fetch(`${BASE_URL}/api/meals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(mealData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to log meal: ${error}`);
  }

  return await response.json();
};

export const getMeals = async () => {
  const token = await AsyncStorage.getItem('token');

  const response = await fetch(`${BASE_URL}/api/meals`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch meals: ${error}`);
  }

  return await response.json();
};

export const deleteMeal = async (mealId) => {
  try {
    console.log('Deleting meal:', mealId);
    
    const token = await AsyncStorage.getItem('token');
    console.log('Auth token obtained:', token ? 'Yes' : 'No');

    const response = await fetch(`${BASE_URL}/api/meals/${mealId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Delete response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete error response:', errorText);
      
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(`Failed to delete meal: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('Delete success response:', data);
    return data;
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};
