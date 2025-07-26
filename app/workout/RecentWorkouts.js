import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Button, FlatList, Text, View, TouchableOpacity } from 'react-native';
import styles from './RecentWorkoutsStyles';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

// Define COLORS for component logic
const COLORS = {
  yellow: '#FFD600',
  pink: '#FF4081',
  blue: '#2979FF',
  cardBg: '#fff',
  cardShadow: '#E0E0E0',
};

export default function RecentWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/api/workouts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch workouts`);
      }

      const data = await response.json();
      setWorkouts(data.workouts || []);
    } catch (err) {
      console.error('Fetch workouts error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const handleGoBack = () => {
    router.back();
  };

  const renderWorkoutItem = useCallback(({ item, index }) => {
    const colorIndex = index % 3;
    const accentColor = [COLORS.yellow, COLORS.pink, COLORS.blue][colorIndex];

    return (
      <View style={[styles.card, { borderLeftColor: accentColor }]}>
        <Text style={[styles.type, { color: accentColor }]}>
          {item.type?.toUpperCase() || 'WORKOUT'}
        </Text>
        <Text style={styles.detail}>
          Date: <Text style={styles.value}>
            {item.startTime ? new Date(item.startTime).toLocaleString() : 'N/A'}
          </Text>
        </Text>
        <Text style={styles.detail}>
          Distance: <Text style={styles.value}>{item.distance || 0} km</Text>
        </Text>
        <Text style={styles.detail}>
          Duration: <Text style={styles.value}>{item.duration || 'N/A'}</Text>
        </Text>
        <Text style={styles.detail}>
          Pace: <Text style={styles.value}>
            {item.pace ? `${item.pace} min/km` : 'N/A'}
          </Text>
        </Text>
        <Text style={styles.detail}>
          Calories: <Text style={styles.value}>{item.calories || 0}</Text>
        </Text>
      </View>
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Loading workouts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button 
            title="Retry" 
            color={COLORS.pink} 
            onPress={fetchWorkouts}
          />
        </View>
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
            <Text style={styles.goBackText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!workouts.length) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.noWorkoutsText}>No workouts found.</Text>
          <Button 
            title="Refresh" 
            color={COLORS.blue} 
            onPress={fetchWorkouts}
          />
        </View>
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
            <Text style={styles.goBackText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Recent Workouts</Text>
        <FlatList
          data={workouts}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={renderWorkoutItem}
          showsVerticalScrollIndicator={true}
          refreshing={loading}
          onRefresh={fetchWorkouts}
          bounces={true}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={5}
          getItemLayout={(data, index) => ({
            length: 200, // Approximate height of each item
            offset: 200 * index,
            index,
          })}
        />
      </View>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
          <Text style={styles.goBackText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}