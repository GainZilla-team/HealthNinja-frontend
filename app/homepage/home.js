import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Button } from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { getProfile, logout } from '../../authService.js';
import { useRouter } from 'expo-router';
import styles from './homeStyles.js'; 

export default function HomeScreen() {
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => router.replace('/login'));
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Welcome to HealthNinja{profile?.email ? `, ${profile.email}` : ''}
      </Text>

      <View style={styles.content}>
        <Image source={require('../../assets/images/HealthNinja_logo.png')} style={styles.logo} />
        <Text style={styles.message}>No more juggling apps. Just results.</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('../community/CommunityScreen')}>
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

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
