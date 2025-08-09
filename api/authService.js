import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export const register = async (email, password) => {
  try {
    const res = await axios.post(`${BASE_URL}/api/auth/signup`, { email, password });
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Signup failed');
    }
    throw new Error(error.message || 'Signup failed');
  }
};

export const login = async (email, password) => {
  try {
    // No push token request or sending

    const res = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password,
    });

    if (res.data.token) {
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('userEmail', email);
      return res.data;
    } else {
      throw new Error('No token returned from login');
    }
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Login failed');
  }
};

export const getProfile = async () => {
  const token = await AsyncStorage.getItem('token');
  const email = await AsyncStorage.getItem('userEmail');

  if (!token || !email) throw new Error('Not logged in');
  return { email, token };
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('userEmail');
};