import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styles from './CommunityStyles';

export default function Post({ post }) {
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