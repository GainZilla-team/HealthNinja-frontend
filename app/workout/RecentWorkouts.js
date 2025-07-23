import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Text, View } from 'react-native';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export default function RecentWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/api/workouts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch workouts');
        }
        const data = await response.json();
        setWorkouts(data.workouts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
        <Button title="Retry" onPress={() => setError(null)} />
      </View>
    );
  }

  if (!workouts.length) {
    return (
      <View>
        <Text>No workouts found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={workouts}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.type.toUpperCase()}</Text>
            <Text>Date: {new Date(item.startTime).toLocaleString()}</Text>
            <Text>Distance: {item.distance} km</Text>
            <Text>Duration: {item.duration}</Text>
            <Text>Pace: {item.pace ? `${item.pace} min/km` : 'N/A'}</Text>
            <Text>Calories: {item.calories}</Text>
            <Button title="View Details" onPress={() => router.push(`/workout/WorkoutDetail?id=${item._id}`)} />
          </View>
        )}
      />
    </View>
  );
}