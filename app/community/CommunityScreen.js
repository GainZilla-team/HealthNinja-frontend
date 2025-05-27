import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { fetchPosts } from './api';
import CreatePostForm from './CreatePostForm';
import Post from './post';
import styles from './styles';

export default function CommunityScreen() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Community Sharing</Text>
      <CreatePostForm onPostCreated={(newPost) => setPosts([newPost, ...posts])} />
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </ScrollView>
  );
}
