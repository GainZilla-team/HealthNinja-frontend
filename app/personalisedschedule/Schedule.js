import React, { useState } from 'react';
import { View, Text, Button, ScrollView, ActivityIndicator, TextInput, Alert } from 'react-native';
import * as Calendar from 'expo-calendar';
import { useRouter } from 'expo-router';
import styles from './ScheduleStyles';

export default function Schedule() {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [userGoal, setUserGoal] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const getEvents = async () => {
    setError(null);
    try {
      const { status: calendarStatus } = await Calendar.requestCalendarPermissionsAsync();
      const { status: remindersStatus } = await Calendar.requestRemindersPermissionsAsync();

      if (calendarStatus !== 'granted' || remindersStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow calendar and reminders access to use this feature.');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync();
      const defaultCal = calendars.find(cal => cal.allowsModifications);
      if (!defaultCal) {
        setError('No modifiable calendar found.');
        return;
      }

      const now = new Date();
      const weekLater = new Date();
      weekLater.setDate(now.getDate() + 7);

      const events = await Calendar.getEventsAsync([defaultCal.id], now, weekLater);

      if (events.length === 0) {
        setError('No calendar events found for the next 7 days.');
      } else {
        const formattedEvents = events.map(event => ({
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate,
          durationMinutes:
            (new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / 60000,
        }));
        setCalendarEvents(formattedEvents);
      }
    } catch (e) {
      setError('Failed to load calendar events.');
      console.error(e);
    }
  };

  const generateWorkout = async () => {
    if (!userGoal.trim()) {
      Alert.alert('Missing Input', 'Please enter your fitness goal.');
      return;
    }

    console.log('Sending request with:', { calendarEvents, userGoal });

    setLoading(true);
    setError(null);
    setWorkoutPlan('');

    try {
    const response = await fetch('https://backend-8gzc.onrender.com/api/schedule/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarEvents, userGoal }),
    });

    if (!response.ok) {
        const errorText = await response.text(); // or response.json() if json error
        console.error('Response status:', response.status);
        console.error('Response text:', errorText);
        throw new Error('Failed to generate workout plan');
    }

    const data = await response.json();
    setWorkoutPlan(data.plan || 'No workout plan returned.');
    } catch (error) {
    console.error(error);
    setError('Error generating workout plan. Please try again later.');
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Personalized Workout Generator</Text>

        <Button title="1. Load Calendar Schedule" onPress={getEvents} />

        {error && <Text style={styles.error}>{error}</Text>}

        {calendarEvents.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Events Found:</Text>
            {calendarEvents.map((event, index) => (
              <Text key={index} style={styles.eventText}>
                • {event.title} - {new Date(event.startDate).toLocaleString()}
              </Text>
            ))}
          </>
        ) : (
          <Text style={{ marginVertical: 10 }}>No calendar events loaded yet.</Text>
        )}

        <Text style={styles.sectionTitle}>Enter your fitness goal:</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g., I want to build muscle and have 30 minutes in the evening."
          multiline
          value={userGoal}
          onChangeText={setUserGoal}
        />

        <Button title="2. Generate Personalized Workout Plan" onPress={generateWorkout} />

        {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

        {workoutPlan ? (
          <>
            <Text style={styles.workoutPlanTitle}>🏋️ Your Workout Plan:</Text>
            <Text style={styles.workoutPlanText}>{workoutPlan}</Text>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.button}>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    </View>
  );
}
