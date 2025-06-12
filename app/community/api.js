import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://auth-backend-ziu3.onrender.com'; 

export const fetchPosts = async () => {
  const res = await axios.get(`${BASE_URL}/api/posts`);
  return res.data;
};

export const createPost = async (content, token) => {
    const response = await fetch('https://auth-backend-ziu3.onrender.com/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
      },
      body: JSON.stringify({ content }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to create post');
    }
  
    return await response.json();
  };