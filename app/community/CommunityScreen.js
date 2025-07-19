import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import { fetchPosts } from '../../api/postService';
import styles from './CommunityStyles';
import CreatePostForm from './CreatePostForm';
import Post from './post';


export default function CommunityScreen() {
  const [posts, setPosts] = useState([]);

  const fetchAndSetPosts = async () => {
  const postsFromServer = await fetchPosts();
  setPosts(postsFromServer);
};

useEffect(() => {
  fetchAndSetPosts();
}, []);

  const router = useRouter();

  return (

    <View style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Community Sharing</Text>
          <CreatePostForm onPostCreated={fetchAndSetPosts} />
          {posts.map((post) => (
  <Post
    key={post._id}
    post={post}
    onDelete={(id) => {
      setPosts((prev) => prev.filter((p) => p._id !== id));
    }}
  />
))}
        </View>
      </ScrollView>

      <View style={styles.button}>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>

    </View>
  );
}