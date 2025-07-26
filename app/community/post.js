import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { addComment, deleteComment } from '../../api/commentService'; // Only from commentService now
import { deletePost } from '../../api/postService'; // Only deletePost from postService
import styles from './CommunityStyles';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export default function Post({ post, onDelete, onCommentAdded, onCommentDeleted }) {
  const [userEmail, setUserEmail] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const email = await AsyncStorage.getItem('userEmail');
      setUserEmail(email);
    };
    loadUserData();
  }, []);

  useEffect(() => {
    setComments(post.comments || []);
  }, [post.comments]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to comment');
        setIsSubmitting(false);
        return;
      }

      const newComment = await addComment(post._id, commentText, token);

      const updatedComments = [...comments, {
        ...newComment,
        email: userEmail || 'Anonymous',
        createdAt: newComment.createdAt || new Date(),
      }];

      setComments(updatedComments);
      setCommentText('');

      if (onCommentAdded) onCommentAdded(post._id, updatedComments);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to delete comments');
        return;
      }

      await deleteComment(post._id, commentId, token);

      const updated = comments.filter(c => c._id !== commentId);
      setComments(updated);

      if (onCommentDeleted) onCommentDeleted(post._id, updated);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to delete comment');
    }
  };

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
      <View style={styles.postHeader}>
        <Text style={styles.postEmail}>{post.email || "Anonymous"}</Text>
        <Text style={styles.postDate}>
          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'} at{' '}
          {post.createdAt ? new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown time'}
        </Text>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      {userEmail === post.email && (
        <View style={styles.deleteButton}>
          <Button title="Delete Post" color="red" onPress={handleDelete} />
        </View>
      )}

      <View style={styles.commentsContainer}>
        <Text style={styles.commentsTitle}>Comments ({comments.length}):</Text>
        {comments.map((comment) => (
          <View key={comment._id || comment.createdAt} style={styles.commentContainer}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentEmail}>{comment.email || "Anonymous"}</Text>
              <Text style={styles.commentDate}>
                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Unknown date'} at{' '}
                {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown time'}
              </Text>
            </View>
            <Text style={styles.commentText}>{comment.content}</Text>

            {comment.email === userEmail && (
              <View style={{ marginTop: 4 }}>
                <Button
                  title="Delete Comment"
                  color="red"
                  onPress={() => handleDeleteComment(comment._id)}
                />
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={commentText}
          onChangeText={setCommentText}
          multiline
          placeholderTextColor="#94a3b8"
        />
        <Button
          title={isSubmitting ? "Posting..." : "Post Comment"}
          onPress={handleAddComment}
          disabled={!commentText.trim() || isSubmitting}
        />
      </View>
    </View>
  );
}
