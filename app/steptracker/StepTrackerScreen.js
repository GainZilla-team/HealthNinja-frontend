import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import styles from './StepTrackerStyles';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const ProgressCircle = ({ progress, dailyGoal }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = dailyGoal > 0 
    ? circumference - (Math.min(progress, dailyGoal) / dailyGoal) * circumference
    : circumference;
  
  return (
    <View style={styles.progressContainer}>
      <Svg height="120" width="120" viewBox="0 0 120 120">
        <Circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#e0e0e0"
          strokeWidth="10"
          fill="transparent"
        />
        <Circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#3b82f6"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin="60, 60"
        />
      </Svg>
      <Text style={styles.progressText}>
        {dailyGoal > 0 ? `${Math.min(Math.round((progress / dailyGoal) * 100), 100)}%` : '0%'}
      </Text>
    </View>
  );
};

export default function StepTrackerScreen() {
  const router = useRouter();
  const [currentSteps, setCurrentSteps] = useState(0);
  const [todaySteps, setTodaySteps] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(10000);
  const [goalReached, setGoalReached] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manualSteps, setManualSteps] = useState('');

  const handleApiResponse = async (response) => {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
  };

  const saveSteps = useCallback(async (stepsToSave) => {
    try {
        console.log('[DEBUG] Starting to save steps:', stepsToSave); // ADD THIS
        
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/api/steps`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            steps: stepsToSave, 
            date: new Date().toISOString() 
        })
        });

        const result = await handleApiResponse(response);
        console.log('[DEBUG] API Response:', result); // ADD THIS
        
        setTodaySteps(prev => {
        const newTotal = prev + stepsToSave;
        console.log('[DEBUG] Updating todaySteps from', prev, 'to', newTotal); // ADD THIS
        return newTotal;
        });
        
        return result;
    } catch (error) {
        console.error('[ERROR] Failed to save steps:', error); // ADD THIS
        throw error;
    }
    }, [BASE_URL]);

  const startStepTracking = async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Warning', 'Step tracking not available on this device');
        return;
      }

      const newSubscription = Pedometer.watchStepCount(result => {
        setCurrentSteps(result.steps);
      });

      setSubscription(newSubscription);
      setIsTracking(true);
    } catch (error) {
      console.error('Start tracking error:', error);
      Alert.alert('Error', 'Failed to start step tracking');
    }
  };

  const stopStepTracking = () => {
    subscription?.remove();
    setSubscription(null);
    setIsTracking(false);
  };

  const handleSaveSteps = async () => {
    try {
      if (currentSteps <= 0) {
        Alert.alert('Invalid', 'No steps to save');
        return;
      }
      await saveSteps(currentSteps);
      Alert.alert('Success', 'Steps saved successfully');
      setCurrentSteps(0);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const fetchTodaySteps = useCallback(async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        
        const response = await fetch(`${BASE_URL}/api/steps/today`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await handleApiResponse(response);
        const totalSteps = result.data?.reduce((sum, entry) => sum + (entry.steps || 0), 0) || 0;
        setTodaySteps(totalSteps);
    } catch (error) {
        console.error('Fetch today steps error:', error);
        setTodaySteps(0);
    }
    }, [BASE_URL]);

  const handleSaveManualSteps = async () => {
    try {
        console.log('[DEBUG] Manual steps input:', manualSteps); // ADD THIS
        
        const steps = parseInt(manualSteps, 10);
        if (isNaN(steps) || steps <= 0) {
        console.log('[DEBUG] Invalid steps input'); // ADD THIS
        Alert.alert('Invalid', 'Please enter a valid number');
        return;
        }
        
        console.log('[DEBUG] Calling saveSteps with', steps); // ADD THIS
        await saveSteps(steps);
        
        setManualSteps('');
        console.log('[DEBUG] Manual steps saved, fetching latest data'); // ADD THIS
        await fetchTodaySteps();
        
        Alert.alert('Success', `${steps} steps added to today's total`);
    } catch (error) {
        console.error('[ERROR] Manual save failed:', error); // ADD THIS
        Alert.alert('Error', error.message);
    }
    };

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        const savedGoal = await AsyncStorage.getItem('dailyStepGoal');
        if (savedGoal) setDailyGoal(parseInt(savedGoal, 10));
        await fetchTodaySteps();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (todaySteps >= dailyGoal && dailyGoal > 0 && !goalReached) {
      setGoalReached(true);
      Alert.alert('Congratulations!', `You've reached your daily goal of ${dailyGoal} steps!`);
    } else if (todaySteps < dailyGoal && goalReached) {
      setGoalReached(false);
    }
  }, [todaySteps, dailyGoal]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Step Tracker</Text>
        <Text style={styles.headerSubtitle}>Track your daily steps and activity</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={{ fontSize: 18 }}>👟</Text>
              </View>
              <Text style={styles.cardTitle}>Today's Steps</Text>
            </View>

            <View style={styles.progressRow}>
              <ProgressCircle progress={todaySteps} dailyGoal={dailyGoal} />
              <View style={styles.progressTextContainer}>
                <Text style={styles.stepCount}>{todaySteps.toLocaleString()}</Text>
                <Text style={styles.goalText}>of {dailyGoal.toLocaleString()} steps</Text>
                <Text style={goalReached ? styles.goalReached : styles.goalNotReached}>
                  {goalReached ? 'Goal Achieved!' : 'Keep going!'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={{ fontSize: 18 }}>⏱️</Text>
              </View>
              <Text style={styles.cardTitle}>Live Tracking</Text>
            </View>

            <Text style={styles.label}>Current Session: {currentSteps.toLocaleString()} steps</Text>
            
            {isTracking ? (
              <TouchableOpacity
                onPress={stopStepTracking}
                style={[styles.button, styles.stopButton]}
              >
                <Text style={styles.buttonText}>Stop Tracking</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={startStepTracking}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Start Tracking</Text>
              </TouchableOpacity>
            )}

            {currentSteps > 0 && (
              <TouchableOpacity
                onPress={handleSaveSteps}
                style={[styles.button, styles.saveButton]}
              >
                <Text style={styles.buttonText}>Save Steps</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={{ fontSize: 18 }}>✏️</Text>
              </View>
              <Text style={styles.cardTitle}>Manual Entry</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter steps count"
              placeholderTextColor="#94a3b8"
              value={manualSteps}
              onChangeText={setManualSteps}
              keyboardType="numeric"
            />

            <TouchableOpacity
              onPress={handleSaveManualSteps}
              disabled={!manualSteps}
              style={[styles.button, { backgroundColor: !manualSteps ? '#94a3b8' : '#3b82f6' }]}
            >
              <Text style={styles.buttonText}>Save Manual Steps</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
}