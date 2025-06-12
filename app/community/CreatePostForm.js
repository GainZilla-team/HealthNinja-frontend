import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { createPost } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const newPost = await createPost(content, token);
      onPostCreated(newPost);
      setContent('');
    } catch (error) {
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