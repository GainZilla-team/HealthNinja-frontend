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

export const saveManualSteps = async (steps, date) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/steps/manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        steps: Number(steps),
        date: date || new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to save manual steps');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Save manual steps error:', error);
    throw error;
  }
};

export const fetchStepsData = async (endpoint) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // First check - Network errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Second check - Valid JSON
    let result;
    try {
      result = await response.json();
    } catch (e) {
      throw new Error('Invalid JSON response');
    }

    // Third check - API success flag
    if (!result?.success) {
      throw new Error(result?.message || 'API request failed');
    }

    // Fourth check - Data structure
    const data = result.data;
    if (!data) {
      console.warn('API Warning: Response missing data field', result);
      return []; // Return safe default
    }

    // Convert single object to array if needed
    return Array.isArray(data) ? data : [data];
    
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error; // Re-throw for UI handling
  }
};

// Specific methods
export const fetchTodaySteps = async () => {
  const data = await fetchStepsData('/api/steps/today');
  return data.reduce((sum, item) => sum + (item.steps || 0), 0);
};

export const fetchWeeklyData = async () => {
  return await fetchStepsData('/api/steps/weekly');
};

async function logSteps(steps) {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/steps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        steps: steps,
        date: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      // Refresh the data
      fetchTodaySteps();
      fetchWeeklyData();
    } else {
      throw new Error('Failed to log steps');
    }
  } catch (error) {
    console.error('Error logging steps:', error);
    Alert.alert('Error', 'Failed to log steps');
  }
};