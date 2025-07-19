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
