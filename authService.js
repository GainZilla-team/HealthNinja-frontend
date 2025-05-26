import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const API_BASE_URL = 'http://172.20.10.3:3000';

export async function login(email, password) {
    if (!email || !password) {
    Alert.alert('Missing Fields', 'Please enter both email and password.');
    return;
  }
  try {
    const res = await axios.post(`${API_BASE_URL}/login`, { email, password });
    const token = res.data.token;
    await SecureStore.setItemAsync('jwt', token);
    return token;
  } catch (error) {
    if (error.response) {
      // Server responded with a status code outside 2xx
      throw new Error(error.response.data?.error || 'Server error');
    } else if (error.request) {
      // Request was made but no response
      throw new Error('No response from server. Check your connection or server status.');
    } else {
      // Something else
      throw new Error(error.message || 'Unknown error occurred');
    }
  }
}


export async function logout() {
  await SecureStore.deleteItemAsync('jwt');
}

export async function getToken() {
  return await SecureStore.getItemAsync('jwt');
}

export async function getProfile() {
  const token = await getToken();
  const res = await axios.get(`${API_BASE_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function register(email, password) {
    if (!email || !password) {
    Alert.alert('Missing Fields', 'Please enter both email and password.');
    return;
  }
  const res = await axios.post(`${API_BASE_URL}/register`, { email, password });
  const token = res.data.token;
  await SecureStore.setItemAsync('jwt', token);
  return token;
}

