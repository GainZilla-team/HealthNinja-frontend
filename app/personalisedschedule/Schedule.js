import * as Calendar from 'expo-calendar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, Text, TextInput, View } from 'react-native';
import styles from './ScheduleStyles';

export default function Schedule() {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [userGoal, setUserGoal] = useState('');
  const [workoutPlanText, setWorkoutPlanText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generated, setGenerated] = useState(false);
  const [createdEventIds, setCreatedEventIds] = useState([]);

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

      if (!events || events.length === 0) {
        setCalendarEvents([]);
        Alert.alert('No events found', 'You have no calendar events in the next 7 days.');
      } else {
        const formattedEvents = events.map(event => ({
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate,
          durationMinutes: (new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / 60000,
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

    setLoading(true);
    setGenerated(false);
    setError(null);
    setWorkoutPlanText('');
    setCreatedEventIds([]);

    try {
      const response = await fetch('https://backend-8gzc.onrender.com/api/schedule/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarEvents, userGoal }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error(errorText || 'Failed to generate workout plan');
      }

      const data = await response.json();
      const plan = data.plan;
      console.log('Raw plan:', plan);
      setWorkoutPlanText(plan);
      setGenerated(true);

      // Parse workout plan text to extract day, time, title
      // Example line: "Monday 6:00 PM - Cardio Blast: 30 minutes running"
      const regex = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2}:\d{2})\s*(AM|PM)?\s*[-–—]\s*([^\n:]+):?\s*([^\n]*)/gi;
      const dayToIndex = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6
      };

      const now = new Date();
      const eventsToInsert = [];

      let match;
      while ((match = regex.exec(plan)) !== null) {
        const [_, day, time, ampm, title, description] = match;
        const targetDate = new Date(now);
        const targetDay = dayToIndex[day.toLowerCase()];
        const currentDay = now.getDay();
        let daysDiff = (targetDay + 7 - currentDay) % 7;
        if (daysDiff === 0) daysDiff = 7; // Schedule for next week if same day

        targetDate.setDate(now.getDate() + daysDiff);

        // Parse time with AM/PM
        let [hours, minutes] = time.split(':').map(Number);
        if (ampm?.toUpperCase() === 'PM' && hours < 12) {
          hours += 12;
        } else if (ampm?.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
        targetDate.setHours(hours, minutes, 0, 0);

        // Set end time 30 minutes after start
        const endDate = new Date(targetDate.getTime() + 30 * 60000);

        eventsToInsert.push({
          title: title.trim(),
          startDate: new Date(targetDate),
          endDate,
          notes: description.trim() || 'AI generated workout session',
        });
      }

      const calendars = await Calendar.getCalendarsAsync();
      const modifiableCal = calendars.find(cal => cal.allowsModifications);
      if (!modifiableCal) {
        Alert.alert('No modifiable calendar found');
        return;
      }

      const createdIds = [];
      for (const workout of eventsToInsert) {
        const eventId = await Calendar.createEventAsync(modifiableCal.id, {
          title: workout.title,
          startDate: workout.startDate,
          endDate: workout.endDate,
          notes: workout.notes,
          timeZone: 'Asia/Singapore',
        });
        createdIds.push(eventId);
      }
      setCreatedEventIds(createdIds);

      Alert.alert('Workout plan scheduled!', `${createdIds.length} events added to your calendar.`);

    } catch (error) {
      console.error(error);
      setError('Error generating or scheduling workouts.');
    } finally {
      setLoading(false);
    }
  };

  // New function to check created events by ID
  const checkCreatedEvents = async () => {
    if (createdEventIds.length === 0) {
      Alert.alert('No workout events created yet');
      return;
    }

    try {
      const calendars = await Calendar.getCalendarsAsync();
      const modifiableCal = calendars.find(cal => cal.allowsModifications);
      if (!modifiableCal) {
        Alert.alert('No modifiable calendar found');
        return;
      }

      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(now.getMonth() + 1);

      const events = await Calendar.getEventsAsync([modifiableCal.id], now, nextMonth);
      const matchedEvents = events.filter(e => createdEventIds.includes(e.id));

      if (matchedEvents.length === 0) {
        Alert.alert('No workout events found in calendar');
      } else {
        Alert.alert(
          'Workout Events Found',
          matchedEvents.map(ev => `${ev.title} on ${new Date(ev.startDate).toLocaleString()}`).join('\n')
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error fetching events', e.message);
    }
  };

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
          placeholderTextColor="gray"
          multiline
          value={userGoal}
          onChangeText={setUserGoal}
        />

        <Button title="2. Generate Personalized Workout Plan" onPress={generateWorkout} />

        {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

        {generated && !loading && (
          <>
            <Text style={{ color: 'green', marginTop: 20, fontWeight: 'bold' }}>✅ Workout Plan Scheduled!</Text>
            <Text style={styles.workoutPlanTitle}>🏋️ Your Workout Plan:</Text>
            <Text style={styles.workoutPlanText}>{workoutPlanText}</Text>

            <Button
              title="Check Uploaded Workouts in Calendar"
              onPress={checkCreatedEvents}
              style={{ marginTop: 20 }}
            />
          </>
        )}
      </ScrollView>

      <View style={styles.button}>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    </View>
  );
}
