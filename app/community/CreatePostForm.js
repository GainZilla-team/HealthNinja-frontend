import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';
import { createPost } from '../../api/postService';

export default function CreatePostForm({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [email, setEmail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('userEmail');
        setEmail(userEmail);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Post content cannot be empty');
      return;
    }

    console.log('Starting post creation...');
    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token ? 'Token found' : 'No token found');

      if (!token) {
      Alert.alert('Error', 'You must be logged in to post');
      return;
    }

      console.log('Calling createPost with content:', content.substring(0, 50) + '...')
      const newPost = await createPost(content, token);
      console.log('Post created successfully:', newPost);

      onPostCreated(); 
      setContent('');
      Alert.alert('Success', 'Post created successfully!');

    } catch (error) {
      console.error('Post creation failed:', error);
      console.error('Error details:', {
      message: error.message,
      status: error.status,
      response: error.response
    });
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        value={content}
        onChangeText={setContent}
        placeholder="Share your thoughts..."
        placeholderTextColor="#888"
        multiline
        numberOfLines={3}
      />
      <Button
        title={isSubmitting ? "Posting..." : "Post"}
        onPress={handleSubmit}
        disabled={isSubmitting || !content.trim()}
        color="#FF4081"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});