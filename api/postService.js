import Constants from 'expo-constants';
const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export const fetchPosts = async () => {
  const response = await fetch(`${BASE_URL}/api/posts`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return await response.json();
};

export const createPost = async (content, token) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorDetails}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

export const deletePost = async (postId, token) => {
  const response = await fetch(`${BASE_URL}/api/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Delete failed: ${errorText}`);
  }

  return await response.json();
};

export const testBackend = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/posts`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
