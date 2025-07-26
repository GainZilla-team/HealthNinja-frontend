// WeatherScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from './WeatherScreenStyles';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const WeatherScreen = () => {
  const router = useRouter();
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

      // Schedule a local notification after 10 seconds
      setTimeout(() => {
        sendWeatherNotification(data);
      }, 10000);
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
      message += '\n🔥 It\'s hot! Prefer indoor workouts or use sun protection!.';
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weather</Text>
        <Text style={styles.headerSubtitle}>Check weather conditions for your workouts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Search Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={{ fontSize: 18 }}>🌤️</Text>
              </View>
              <Text style={styles.cardTitle}>Weather Search</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter location (e.g., Singapore)"
              placeholderTextColor="#94a3b8"
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
            />

            <TouchableOpacity
              onPress={fetchWeather}
              disabled={loading}
              style={[styles.button, { backgroundColor: loading ? '#94a3b8' : '#3b82f6' }]}
            >
              {loading ? (
                <ActivityIndicator color="white" style={{ marginRight: 8 }} />
              ) : (
                <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
              )}
              <Text style={styles.buttonText}>
                {loading ? 'Loading...' : 'Get Weather'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Weather Results */}
          {weather && (
            <View style={styles.weatherBox}>
              <Text style={styles.weatherTitle}>Current Weather</Text>
              <Text style={styles.weatherText}>📍 Location: {weather.locationName}</Text>
              <Text style={styles.weatherText}>🌦️ Condition: {weather.condition}</Text>
              <Text style={styles.weatherText}>🌡️ Temperature: {weather.temperature} °C</Text>
              {weather.condition.toLowerCase().includes('rain') && (
                <Text style={[styles.weatherText, { color: '#3b82f6', marginTop: 10 }]}>
                  💧 Avoid outdoor workouts today
                </Text>
              )}
              {weather.temperature > 32 && (
                <Text style={[styles.weatherText, { color: '#ef4444', marginTop: 10 }]}>
                  🔥 It's hot! Prefer morning or indoor workouts
                </Text>
              )}
              {!weather.condition.toLowerCase().includes('rain') && weather.temperature <= 32 && (
                <Text style={[styles.weatherText, { color: '#16a34a', marginTop: 10 }]}>
                  ✅ Good time for an outdoor run!
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>←</Text>
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WeatherScreen;