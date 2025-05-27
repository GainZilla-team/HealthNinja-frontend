import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "https://auth-backend-ziu3.onrender.com";

export const register = async (email, password) => {
  const res = await axios.post(`${BASE_URL}/api/auth/signup`, { email, password });
  return res.data;
};

export const login = async (email, password) => {
  const res = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
  await AsyncStorage.setItem('user', JSON.stringify(res.data));
  return res.data;
};

export const getProfile = async () => {
  const user = await AsyncStorage.getItem('user');
  if (!user) throw new Error('Not logged in');
  return JSON.parse(user);
};

export const logout = async () => {
  await AsyncStorage.removeItem('user');
};
