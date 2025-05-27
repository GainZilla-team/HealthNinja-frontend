import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { fetchPosts } from './api';
import CreatePostForm from './CreatePostForm';
import Post from './post';
import styles from './CommunityStyles';
import { Button } from 'react-native';
import { useRouter } from 'expo-router';


export default function CommunityScreen() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);

  const router = useRouter();

  return (

    <View style={styles.container}>

      
    
      <ScrollView style={styles.container}>
        
        <View style={styles.content}>
          <Text style={styles.title}>Community Sharing</Text>
          <CreatePostForm onPostCreated={(newPost) => setPosts([newPost, ...posts])} />
          {posts.map((post) => (
            <Post key={post._id} post={post} />
        ))}
        </View>
      </ScrollView>

      <View style={styles.button}>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>

    </View>
  );
}