import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { fetchLatestWeather, syncWeather } from './weather';

const WeatherSyncScreen = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);

  const handleSync = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const result = await syncWeather(location, token);
      setWeather(result.weather);
      Alert.alert('Success', result.message);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const loadLatestWeather = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!location) {
        Alert.alert('Please enter a location to load weather');
        return;
      }
      const result = await fetchLatestWeather(location, token);
      setWeather(result);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Enter Location:</Text>
      <TextInput
        value={location}
        onChangeText={setLocation}
        placeholder="e.g., Singapore"
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
          borderRadius: 5
        }}
      />
      <Button title="Sync Weather" onPress={handleSync} />
      <Button title="Load Latest" onPress={loadLatestWeather} color="gray" />

      {weather && (
      <View style={{ marginTop: 20 }}>
        <Text>Location: {weather.locationName}</Text>        {/* Use locationName */}
        <Text>Condition: {weather.condition}</Text>
        <Text>Temperature: {weather.temperature}°C</Text>
        <Text>Suggestion: {weather.suggestion}</Text>
      </View>
    )}
    </View>
  );
};

export default WeatherSyncScreen;
