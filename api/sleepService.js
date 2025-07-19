import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

class SleepApiService {

  // Get user's sleep data
  static async getSleepData(userId) {
    try {
      const response = await fetch(`${BASE_URL}/sleep/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sleep data');
      }

      const data = await response.json();
      return data.sleepRecords || [];
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      throw error;
    }
  }

  // Add new sleep entry
  static async addSleepEntry(userId, sleepData) {
  try {
    console.log('Attempting to save sleep data:', { userId, sleepData });
    
    const authToken = await this.getAuthToken();
    console.log('Auth token obtained:', authToken ? 'Yes' : 'No');
    
    const requestBody = {
      userId,
      ...sleepData,
    };
    console.log('Request body:', requestBody);
    
    const response = await fetch(`${BASE_URL}/sleep`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    if (!response.ok) {
      // Get the error response body for more details
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      // Try to parse JSON error response
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        // If not JSON, use the raw text
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(`Failed to save sleep data: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log('Success response:', data);
    return data.sleepRecord;
    
  } catch (error) {
    console.error('Error saving sleep data:', error);
    
    // Log additional context for network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - check BASE_URL:', BASE_URL);
    }
    
    throw error;
  }
}

  // Update sleep entry
  static async updateSleepEntry(sleepId, sleepData) {
    try {
      const response = await fetch(`${BASE_URL}/sleep/${sleepId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(sleepData),
      });

      if (!response.ok) {
        throw new Error('Failed to update sleep data');
      }

      const data = await response.json();
      return data.sleepRecord;
    } catch (error) {
      console.error('Error updating sleep data:', error);
      throw error;
    }
  }

  // Delete sleep entry
  static async deleteSleepEntry(sleepId) {
    try {
      const response = await fetch(`${BASE_URL}/sleep/${sleepId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete sleep data');
      }

      return true;
    } catch (error) {
      console.error('Error deleting sleep data:', error);
      throw error;
    }
  }

  // Get authentication token 
  static async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Get current user ID (implement based on your auth system)
  static async getCurrentUserId() {
    try {
      const userId = await AsyncStorage.getItem('userId');
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

    static async getProfile() {
        try {
            //const token = await AsyncStorage.getItem('token');
            const email = await AsyncStorage.getItem('userEmail');
            return email;
        } catch (error) {
            console.error('Error getting user email:', error);
            return null;
          }
    };
}

export default SleepApiService;


