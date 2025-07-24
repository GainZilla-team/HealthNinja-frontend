import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import styles from '../workout/WorkoutDetailStyles';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const WorkoutDetail = ({ route }) => {
  const navigation = useNavigation();
  const [workout, setWorkout] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkoutDetail = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/workouts/${route.params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch workout detail');
      }
      const data = await response.json();
      setWorkout(data.workout);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutDetail();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleGoBack}>
        <Text style={styles.goBackText}>Go Back</Text>
      </TouchableOpacity>
      <View style={styles.workoutDetailContainer}>
        <Text style={styles.workoutTitle}>{workout.type}</Text>
        <Text style={styles.workoutDate}>Date: {new Date(workout.startTime).toLocaleString()}</Text>
        <Text style={styles.workoutDistance}>Distance: {workout.distance} km</Text>
        <Text style={styles.workoutDuration}>Duration: {workout.duration}</Text>
        <Text style={styles.workoutPace}>Pace: {workout.pace ? `${workout.pace} min/km` : 'N/A'}</Text>
        <Text style={styles.workoutCalories}>Calories: {workout.calories}</Text>
      </View>
    </View>
  );
};
