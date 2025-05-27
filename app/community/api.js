import axios from 'axios';

const BASE_URL = 'https://auth-backend-ziu3.onrender.com';

export const fetchPosts = async () => {
  const res = await axios.get(`${BASE_URL}/posts`);
  return res.data;
};

export const createPost = async (content) => {
  const res = await axios.post(`${BASE_URL}/posts`, {
    content,
    email: 'user@example.com', // Replace with logged-in user email from AsyncStorage
  });
  return res.data;
};