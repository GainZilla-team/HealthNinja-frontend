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
  console.log('🔵 Starting createPost request...');
  console.log('🔵 Content length:', content.length);
  console.log('🔵 Token exists:', !!token);
  console.log('🔵 Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
  
  // Create fetch with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const requestBody = JSON.stringify({ content });
    console.log('🔵 Request body:', requestBody);
    
    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: requestBody,
      signal: controller.signal // Add abort signal
    });

    clearTimeout(timeoutId); // Clear timeout if request succeeds

    console.log('🔵 Response status:', response.status);
    console.log('🔵 Response ok:', response.ok);
    console.log('🔵 Response headers:', response.headers);

    if (!response.ok) {
      // Get detailed error information
      let errorMessage;
      let errorDetails;
      
      try {
        errorDetails = await response.text();
        console.log('🔴 Server error details:', errorDetails);
      } catch (parseError) {
        console.log('🔴 Could not parse error details:', parseError);
        errorDetails = 'Unknown server error';
      }

      // Create detailed error message
      errorMessage = `Server responded with ${response.status}: ${errorDetails}`;
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }

    const result = await response.json();
    console.log('🟢 Post created successfully:', result);
    return result;
    
  } catch (error) {
    clearTimeout(timeoutId);

    console.log('🔴 Network or other error:', error.message);
    console.log('🔴 Error type:', error.name);
    console.log('🔴 Full error:', error);
    
    // Check if it's a network error
    if (error.message.includes('Network request failed') || 
        error.message.includes('fetch')) {
      throw new Error('Network error: Cannot reach server. Check your internet connection.');
    }
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - server may be sleeping. Please try again in a moment.');
    }

    // Re-throw with original message if it's already detailed
    throw error;
  }
};


export const deletePost = async (postId, token) => {
  try {
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
  } catch (err) {
    console.error("Delete post error:", err);
    throw err;
  }
};

export const addComment = async (postId, commentText, token) => {
  const response = await fetch(`${BASE_URL}/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content: commentText }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add comment: ${errorText}`);
  }

  return await response.json();
};

// Add to api.js
export const testBackend = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/posts`);
    console.log('Backend test - Status:', response.status);
    const data = await response.json();
    console.log('Backend test - Data:', data);
    return { success: true, data };
  } catch (error) {
    console.log('Backend test - Error:', error);
    return { success: false, error: error.message };
  }
};