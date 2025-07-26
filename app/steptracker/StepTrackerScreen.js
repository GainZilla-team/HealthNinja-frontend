import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Pedometer } from 'expo-sensors';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import styles from './StepTrackerStyles';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;
const screenWidth = Dimensions.get('window').width;

// Progress Circle Component
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
          stroke="#007aff"
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
  const [currentSteps, setCurrentSteps] = useState(0);
  const [manualSteps, setManualSteps] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [todaySteps, setTodaySteps] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(10000);
  const [goalReached, setGoalReached] = useState(false);
  const [showLineChart, setShowLineChart] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. First define all helper functions
  const handleApiResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(text || 'Server returned non-JSON response');
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }
    return response.json();
  };

  const checkPedometerAvailability = async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Warning', 'Step tracking not available on this device');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Pedometer check failed:', error);
      return false;
    }
  };

  const loadUserSettings = async () => {
    try {
      const savedGoal = await AsyncStorage.getItem('dailyStepGoal');
      if (savedGoal) setDailyGoal(parseInt(savedGoal, 10));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // 2. Then define API-related functions
  const fetchTodaySteps = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${BASE_URL}/api/steps?startDate=${today}&endDate=${today}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await handleApiResponse(response);
      setTodaySteps(data.reduce((sum, entry) => sum + (entry.steps || 0), 0));
    } catch (error) {
      console.error('Fetch today steps error:', error);
      setTodaySteps(0);
    }
  }, [BASE_URL]);

  const fetchWeeklyData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);

      const response = await fetch(
        `${BASE_URL}/api/steps?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await handleApiResponse(response);

      const formattedData = Array(7).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          steps: data.find(item => 
            new Date(item.date).toDateString() === date.toDateString()
          )?.steps || 0
        };
      });

      setWeeklyData(formattedData);
    } catch (error) {
      console.error('Fetch weekly data error:', error);
      setWeeklyData([]);
    }
  }, [BASE_URL]);

  const saveSteps = useCallback(async (stepsToSave) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${BASE_URL}/api/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ steps: stepsToSave, date: new Date().toISOString() })
      });

      await handleApiResponse(response);
      await fetchTodaySteps();
      await fetchWeeklyData();
    } catch (error) {
      console.error('Save steps error:', error);
      throw error;
    }
  }, [BASE_URL, fetchTodaySteps, fetchWeeklyData]);

  // 3. Then define tracking functions
  const startStepTracking = async () => {
    try {
      const isAvailable = await checkPedometerAvailability();
      if (!isAvailable) return;

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

  // 4. Then define handlers
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

  const handleSaveManualSteps = async () => {
    try {
      const steps = parseInt(manualSteps, 10);
      if (isNaN(steps)) {
        Alert.alert('Invalid', 'Please enter a valid number');
        return;
      }
      await saveSteps(steps);
      setManualSteps('');
      Alert.alert('Success', 'Manual steps saved');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // 5. Finally, useEffect hooks
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        await loadUserSettings();
        await checkPedometerAvailability();
        await fetchTodaySteps();
        await fetchWeeklyData();
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

  // Render
  return (
    <View style={styles.container}>
      {isLoading && <Text>Loading...</Text>}
      <Text style={styles.header}>Step Tracker</Text>
      
      {/* Progress Section */}
      <View style={styles.progressCard}>
        <ProgressCircle progress={todaySteps} dailyGoal={dailyGoal} />
        <View style={styles.progressTextContainer}>
          <Text style={styles.stepCount}>{todaySteps.toLocaleString()}</Text>
          <Text style={styles.goalText}>of {dailyGoal.toLocaleString()} steps</Text>
          <Text style={goalReached ? styles.goalReached : styles.goalNotReached}>
            {goalReached ? 'Goal Achieved!' : 'Keep going!'}
          </Text>
        </View>
      </View>

      {/* Rest of your UI components */}
      {/* ... */}
    </View>
  );
}