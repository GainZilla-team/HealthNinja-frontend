import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { addComment, deletePost } from './api';
import styles from './CommunityStyles';

export default function Post({ post, onDelete }) {
  const [userEmail, setUserEmail] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  useEffect(() => {
    const loadEmail = async () => {
      const email = await AsyncStorage.getItem('userEmail');
      setUserEmail(email);
    };
    loadEmail();
  }, []);

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

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const newComment = await addComment(post._id, commentText, token);
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    }
  };

  return (
    <View style={styles.postContainer}>
      <Text style={styles.postEmail}>{post.email || "Anonymous"}</Text>
      <Text style={styles.postContent}>{post.content}</Text>

      {userEmail === post.email && (
        <Button title="Delete" color="red" onPress={handleDelete} />
      )}

      {/* Comments display */}
      {comments.length > 0 && (
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>Comments:</Text>
          {comments.map((comment, index) => (
            <View key={index} style={styles.commentContainer}>
              <Text style={styles.commentEmail}>{comment.email}:</Text>
              <Text style={styles.commentText}>{comment.content}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Add comment input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={commentText}
          onChangeText={setCommentText}
        />
        <Button title="Comment" onPress={handleAddComment} />
      </View>
    </View>
  );
}
