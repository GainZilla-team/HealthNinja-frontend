import * as Calendar from 'expo-calendar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        
        {/* Header */}
        <View style={{ 
          backgroundColor: '#3b82f6', 
          paddingTop: 60, 
          paddingBottom: 30, 
          paddingHorizontal: 20,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8
        }}>
          <Text style={{ 
            fontSize: 32, 
            fontWeight: '700', 
            color: 'white', 
            textAlign: 'center',
            marginBottom: 8
          }}>Schedule</Text>
          <Text style={{ 
            fontSize: 16, 
            color: 'rgba(255,255,255,0.8)', 
            textAlign: 'center',
            fontWeight: '300'
          }}>AI-powered workout planning</Text>
        </View>

        {/* Content */}
        <View style={{ padding: 20, marginTop: -15 }}>
          
          {/* Calendar Section */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: '#eff6ff', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginRight: 12
              }}>
                <Text style={{ fontSize: 18 }}>📅</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#1e293b' }}>Calendar Integration</Text>
            </View>
            
            <TouchableOpacity
              onPress={getEvents}
              style={{
                backgroundColor: '#ec4899',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 16
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Load Calendar Schedule
              </Text>
            </TouchableOpacity>

            {error && (
              <View style={{
                backgroundColor: '#fef2f2',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#ef4444'
              }}>
                <Text style={{ color: '#dc2626', fontSize: 14, fontWeight: '500' }}>{error}</Text>
              </View>
            )}

            {calendarEvents.length > 0 ? (
              <View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 12 }}>
                  Events Found ({calendarEvents.length}):
                </Text>
                <ScrollView style={{ maxHeight: 150 }} showsVerticalScrollIndicator={false}>
                  {calendarEvents.map((event, index) => (
                    <View key={index} style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: '#f59e0b'
                    }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 4 }}>
                        {event.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#64748b' }}>
                        {new Date(event.startDate).toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <Text style={{ color: '#64748b', textAlign: 'center', fontStyle: 'italic' }}>
                No calendar events loaded yet
              </Text>
            )}
          </View>

          {/* Goal Input Section */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: '#fffbeb', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginRight: 12
              }}>
                <Text style={{ fontSize: 18 }}>🎯</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#1e293b' }}>Fitness Goal</Text>
            </View>
            
            <TextInput
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                color: '#334155',
                minHeight: 100,
                textAlignVertical: 'top'
              }}
              placeholder="Describe your fitness goal and time preferences...&#10;&#10;Example: I want to build muscle and have 30 minutes in the evening. I prefer strength training over cardio."
              placeholderTextColor="#94a3b8"
              multiline
              value={userGoal}
              onChangeText={setUserGoal}
            />
            
            <TouchableOpacity
              onPress={generateWorkout}
              disabled={loading || !userGoal.trim()}
              style={{
                backgroundColor: loading || !userGoal.trim() ? '#94a3b8' : '#f59e0b',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center'
              }}
            >
              {loading && (
                <ActivityIndicator color="white" style={{ marginRight: 8 }} />
              )}
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                {loading ? 'Generating Plan...' : 'Generate Workout Plan'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Generated Plan Section */}
          {generated && (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 20,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: '#f0fdf4', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 18 }}>✅</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: '600', color: '#1e293b' }}>Workout Plan Ready!</Text>
              </View>
              
              <View style={{
                backgroundColor: '#f0fdf4',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#22c55e'
              }}>
                <Text style={{ color: '#166534', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
                  Plan Generated Successfully
                </Text>
                <Text style={{ color: '#15803d', fontSize: 12 }}>
                  Your personalized workout schedule has been added to your calendar
                </Text>
              </View>
              
              <ScrollView style={{ maxHeight: 200, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
                <Text style={{
                  fontSize: 14,
                  color: '#374151',
                  lineHeight: 20,
                  backgroundColor: '#f8fafc',
                  padding: 16,
                  borderRadius: 12
                }}>
                  {workoutPlanText}
                </Text>
              </ScrollView>
              
              <TouchableOpacity
                onPress={checkCreatedEvents}
                style={{
                  backgroundColor: '#3b82f6',
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                  Check Calendar Events
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={{
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: '#64748b',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center'
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>←</Text>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}