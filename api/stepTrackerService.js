// services/StepTrackerService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export const saveSteps = async (steps) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/steps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ steps }),
    });
    
    if (!response.ok) throw new Error('Failed to save steps');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchTodaySteps = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${BASE_URL}/api/steps?startDate=${today}&endDate=${today}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) throw new Error('Failed to fetch steps');
    const data = await response.json();
    return data.reduce((sum, entry) => sum + entry.steps, 0);
  } catch (error) {
    throw error;
  }
};

export const fetchWeeklyData = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // Last 7 days
    
    const response = await fetch(
      `${BASE_URL}/api/steps?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (!response.ok) throw new Error('Failed to fetch weekly data');
    const data = await response.json();
    
    return Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayData = data.find(item => 
        new Date(item.date).toDateString() === date.toDateString()
      );
      return {
        date: dateStr,
        steps: dayData ? dayData.steps : 0,
      };
    });
  } catch (error) {
    throw error;
  }
};