import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const WeatherScreen = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!location.trim()) {
      Alert.alert('Please enter a location');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('You must be logged in to fetch weather');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/weather/latest?location=${encodeURIComponent(location)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Failed to fetch weather: ${response.status} ${text}`);
      }

      const data = JSON.parse(text);
      setWeather(data);

      // Schedule a local notification after 5 seconds
      setTimeout(() => {
        sendWeatherNotification(data);
      }, 5000);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendWeatherNotification = async (data) => {
    let message = `Weather Alert: ${data.condition}, ${data.temperature}°C`;

    if (data.condition.toLowerCase().includes('rain')) {
      message += '\n💧 Avoid outdoor workouts today.';
    } else if (data.temperature > 32) {
      message += '\n🔥 It’s hot! Prefer morning or indoor workouts.';
    } else {
      message += '\n✅ Good time for an outdoor run!';
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏃 Workout Suggestion',
        body: message,
        sound: true,
      },
      trigger: { seconds: 1 },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Location:</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Singapore"
        value={location}
        onChangeText={setLocation}
        autoCapitalize="words"
      />
      <Button title={loading ? 'Loading...' : 'Get Weather'} onPress={fetchWeather} disabled={loading} />

      {weather && (
        <View style={styles.weatherBox}>
          <Text style={styles.weatherText}>Location: {weather.locationName}</Text>
          <Text style={styles.weatherText}>Condition: {weather.condition}</Text>
          <Text style={styles.weatherText}>Temperature: {weather.temperature} °C</Text>
        </View>
      )}
    </View>
  );
};

export default WeatherScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    borderRadius: 5,
    marginBottom: 12,
  },
  weatherBox: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    backgroundColor: '#eef',
  },
  weatherText: {
    fontSize: 16,
    marginBottom: 4,
  },
});
