import Constants from 'expo-constants';
const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export const addComment = async (postId, content, token) => {
  const response = await fetch(`${BASE_URL}/api/comments/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to add comment');
  }

  return await response.json();
};

export const deleteComment = async (postId, commentId, token) => {
  const response = await fetch(`${BASE_URL}/api/comments/${postId}/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Delete comment failed: ${errorText}`);
  }

  return await response.json();
};
