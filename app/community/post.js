import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Text, View } from 'react-native';
import { deletePost } from './api';
import styles from './CommunityStyles';

export default function Post({ post, onDelete }) {
  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to delete posts');
        return;
      }

      await deletePost(post._id, token);
      Alert.alert('Success', 'Post deleted successfully');
      if (onDelete) onDelete(post._id);

    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to delete post');
    }
  };
  return (
    <View style={styles.postContainer}>
      <Text style={styles.postEmail}>{post.email || "Anonymous"}</Text>
      <Text style={styles.postContent}>{post.content}</Text>
      
      {post.comments?.length > 0 && (
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>Comments:</Text>
          {post.comments.map((comment, index) => (
            <View key={index} style={styles.commentContainer}>
              <Text style={styles.commentEmail}>{comment.email}:</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}