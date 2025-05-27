import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://auth-backend-ziu3.onrender.com'; 

export const fetchPosts = async () => {
  const res = await axios.get(`${BASE_URL}/api/posts`);
  return res.data;
};

export const createPost = async (content) => {

  const userEmail = await AsyncStorage.getItem('userEmail');
  
  if (!userEmail) {
    throw new Error('No user email found - please log in');
  }

  const res = await axios.post(`${BASE_URL}/api/posts`, {
    content,
    email: userEmail, 
  });
  return res.data;
};