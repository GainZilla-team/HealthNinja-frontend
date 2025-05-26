import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import styles from '../styles/homeStyles';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to HealthNinja</Text>

      <View style={styles.content}>
        <Image source={require('../assets/HealthNinja_logo.png')} style={styles.logo} />
        <Text style={styles.message}>No more juggling apps. Just results.</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="people" size={24} color="#333" />
          <Text style={styles.iconLabel}>Community</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="fitness-center" size={24} color="#333" />
          <Text style={styles.iconLabel}>Workouts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome5 name="apple-alt" size={24} color="#333" />
          <Text style={styles.iconLabel}>Nutrition</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
