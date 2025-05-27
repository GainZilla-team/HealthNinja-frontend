import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { createPost } from './api';
import styles from './CommunityStyles';

export default function CreatePostForm({ onPostCreated }) {
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (content.trim()) {
      const newPost = await createPost(content);
      onPostCreated(newPost);
      setContent('');
    }
  };

  return (
    <View style={styles.formContainer}>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Share something..."
        style={styles.input}
      />
      <Button title="Post" onPress={handleSubmit} />
    </View>
  );
}
