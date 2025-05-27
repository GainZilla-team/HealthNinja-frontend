import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

export default function Post({ post }) {
  return (
    <View style={styles.postContainer}>
      <Text style={styles.postEmail}>{post.email}</Text>
      <Text style={styles.postContent}>{post.content}</Text>
      <View style={styles.commentsContainer}>
        {post.comments?.map((comment, index) => (
          <Text key={index} style={styles.comment}>
            {comment.email}: {comment.text}
          </Text>
        ))}
      </View>
    </View>
  );
}