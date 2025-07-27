import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import SleepApiService from '../../api/sleepService';
import styles from './SleepStyles.js';

const { width: screenWidth } = Dimensions.get('window');

const SleepTracker = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStartTime, setTrackingStartTime] = useState(null);
  const [sleepData, setSleepData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [summary, setSummary] = useState({
    averageDuration: 0,
    averageQuality: 0,
    totalRecords: 0
  });
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      
      // Get user ID from storage (implement based on your auth system)
      const currentUserEmail = await SleepApiService.getCurrentUserEmail();
      if (!currentUserEmail) {
        Alert.alert('Error', 'Please log in to access sleep tracking');
        return;
      }
      
      setUserId(currentUserEmail);
      await loadSleepData(currentUserEmail);
      
      // Check if there's an ongoing sleep session
      const savedTrackingState = await AsyncStorage.getItem('sleepTracking');
      if (savedTrackingState) {
        const trackingData = JSON.parse(savedTrackingState);
        setIsTracking(true);
        setTrackingStartTime(new Date(trackingData.startTime));
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      Alert.alert('Error', 'Failed to load sleep data');
    } finally {
      setLoading(false);
    }
  };

  const loadSleepData = async (currentUserId) => {
    try {
      console.log('Loading sleep data for user:', currentUserId);
      const response = await SleepApiService.getSleepData(currentUserId);
      console.log('Sleep API response:', response);
      
      // Transform data for the component
      const transformedData = response.sleepRecords?.map(record => ({
        id: record._id,
        date: new Date(record.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
        duration: record.duration,
        quality: record.quality,
        bedtime: record.bedtime,
        wakeupTime: record.wakeupTime,
        notes: record.notes
      })) || [];

      console.log('Transformed sleep data:', transformedData);
      setSleepData(transformedData);
      setSummary(response.summary || { averageDuration: 0, averageQuality: 0, totalRecords: 0 });
    } catch (error) {
      console.error('Error loading sleep data:', error);
      // Use fallback empty state
      setSleepData([]);
      setSummary({ averageDuration: 0, averageQuality: 0, totalRecords: 0 });
    }
  };

  const onRefresh = async () => {
    if (!userId) return;
    
    setRefreshing(true);
    try {
      await loadSleepData(userId);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getAverageSleep = () => {
    return summary.averageDuration.toFixed(1);
  };

  const getAverageQuality = () => {
    return summary.averageQuality.toFixed(1);
  };

  const handleSleepToggle = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please log in to track sleep');
      return;
    }

    if (!isTracking) {
      // Start tracking
      const startTime = new Date();
      setIsTracking(true);
      setTrackingStartTime(startTime);
      
      // Save tracking state to persist across app restarts
      await AsyncStorage.setItem('sleepTracking', JSON.stringify({
        startTime: startTime.toISOString(),
        userId
      }));
      
      Alert.alert('Sleep Tracking Started', 'Good night! Tap again when you wake up.');
    } else {
      // End tracking
      const endTime = new Date();
      const durationMs = endTime - trackingStartTime;
      const totalMinutes = Math.max(Math.floor(durationMs / (1000 * 60)), 0);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const duration = hours + (minutes / 60); // Convert to decimal hours
      
      Alert.alert(
        'Sleep Session Complete',
        `You slept for ${duration.toFixed(1)} hours`,
        [
          {
            text: 'Rate Quality',
            onPress: () => showQualityRating(duration, trackingStartTime, endTime)
          }
        ]
      );
      
      setIsTracking(false);
      setTrackingStartTime(null);
      
      // Clear tracking state
      await AsyncStorage.removeItem('sleepTracking');
    }
  };

  const showQualityRating = (duration, startTime, endTime) => {
    Alert.alert(
      'Rate Your Sleep Quality',
      'How well did you sleep?',
      [
        { text: '⭐ Poor', onPress: () => saveSleepEntry(duration, 1, startTime, endTime) },
        { text: '⭐⭐ Fair', onPress: () => saveSleepEntry(duration, 2, startTime, endTime) },
        { text: '⭐⭐⭐ Good', onPress: () => saveSleepEntry(duration, 3, startTime, endTime) },
        { text: '⭐⭐⭐⭐ Great', onPress: () => saveSleepEntry(duration, 4, startTime, endTime) },
        { text: '⭐⭐⭐⭐⭐ Excellent', onPress: () => saveSleepEntry(duration, 5, startTime, endTime) },
      ]
    );
  };

  const saveSleepEntry = async (duration, quality, startTime, endTime) => {
    try {
      setLoading(true);
      
      const sleepData = {
        bedtime: formatTime(startTime),
        wakeupTime: formatTime(endTime),
        duration: parseFloat(duration.toFixed(2)),
        quality,
        date: startTime.toISOString(),
        notes: ''
      };

      await SleepApiService.addSleepEntry(userId, sleepData);
      
      // Reload data to update UI
      await loadSleepData(userId);
      
      Alert.alert('Success', 'Sleep data saved successfully!');
    } catch (error) {
      console.error('Error saving sleep data:', error);
      
      let errorMessage = 'Failed to save sleep data. Please try again.';
      let errorTitle = 'Error';
      
      // Check for specific error messages
      if (error.message.includes('Sleep record already exists for this date')) {
        errorTitle = 'Already Tracked Today';
        errorMessage = 'You\'ve already logged sleep for today. You can edit your existing entry or delete it to create a new one.';
      } else if (error.message.includes('Missing required fields')) {
        errorTitle = 'Invalid Data';
        errorMessage = 'Some required information is missing. Please try tracking your sleep again.';
      } else if (error.message.includes('Quality rating must be between 1 and 5')) {
        errorTitle = 'Invalid Rating';
        errorMessage = 'Please select a quality rating between 1 and 5 stars.';
      } else if (error.message.includes('User not found')) {
        errorTitle = 'Authentication Error';
        errorMessage = 'Please log out and log back in to continue.';
      }
      
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const editSleepEntry = (entry) => {
    Alert.alert(
      'Edit Sleep Quality',
      `Current quality: ${entry.quality}/5 stars`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '⭐ Poor (1)', onPress: () => updateSleepQuality(entry.id, 1) },
        { text: '⭐⭐ Fair (2)', onPress: () => updateSleepQuality(entry.id, 2) },
        { text: '⭐⭐⭐ Good (3)', onPress: () => updateSleepQuality(entry.id, 3) },
        { text: '⭐⭐⭐⭐ Great (4)', onPress: () => updateSleepQuality(entry.id, 4) },
        { text: '⭐⭐⭐⭐⭐ Excellent (5)', onPress: () => updateSleepQuality(entry.id, 5) },
      ]
    );
  };

  const updateSleepQuality = async (entryId, newQuality) => {
    try {
      setLoading(true);
      
      await SleepApiService.updateSleepEntry(entryId, { quality: newQuality });
      
      // Reload data to update UI
      await loadSleepData(userId);
      
      Alert.alert('Success', 'Sleep quality updated successfully!');
    } catch (error) {
      console.error('Error updating sleep quality:', error);
      Alert.alert('Error', 'Failed to update sleep quality. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteSleepEntry = async (entryId) => {
    Alert.alert(
      'Delete Sleep Entry',
      'Are you sure you want to delete this sleep record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await SleepApiService.deleteSleepEntry(entryId);
              await loadSleepData(userId);
              Alert.alert('Success', 'Sleep record deleted successfully');
            } catch (error) {
              console.error('Error deleting sleep entry:', error);
              Alert.alert('Error', 'Failed to delete sleep record');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Prepare chart data
  const chartData = sleepData.length > 0 ? {
    labels: sleepData.slice().reverse().slice(-7).map(d => d.date), // Last 7 days
    datasets: [
      {
        data: sleepData.slice().reverse().slice(-7).map(d => d.duration),
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  } : {
    labels: ['No Data'],
    datasets: [{ data: [0] }],
  };

  const chartConfig = {
    backgroundGradientFrom: '#1e1e2e',
    backgroundGradientTo: '#2a2a3e',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  if (loading && sleepData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading sleep data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a28" />
      <ScrollView 
        testID="sleep-scrollview"
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
            colors={['#6366f1']}
          />
        }
      >
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sleep Tracker</Text>
          <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
        </View>

        {/* Main Sleep Button */}
        <View style={styles.mainSection}>
          <TouchableOpacity
            style={[styles.sleepButton, isTracking && styles.sleepButtonActive]}
            onPress={handleSleepToggle}
            activeOpacity={0.8}
            disabled={loading}
          >
            <View style={styles.sleepButtonContent}>
              {isTracking ? (
                <>
                  <Text style={styles.sleepButtonIcon}>☀️</Text>
                  <Text style={styles.sleepButtonText}>Wake Up</Text>
                  <Text style={styles.sleepButtonSubtext}>
                    Sleeping since {trackingStartTime ? formatTime(trackingStartTime) : ''}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.sleepButtonIcon}>🌙</Text>
                  <Text style={styles.sleepButtonText}>Start Sleep</Text>
                  <Text style={styles.sleepButtonSubtext}>Tap to begin tracking</Text>
                </>
              )}
            </View>
            {loading && (
              <ActivityIndicator 
                size="small" 
                color="#ffffff" 
                style={styles.buttonLoader}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏰</Text>
            <Text style={styles.statValue}>{getAverageSleep()}h</Text>
            <Text style={styles.statLabel}>Avg Sleep</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{getAverageQuality()}/5</Text>
            <Text style={styles.statLabel}>Avg Quality</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statValue}>{summary.totalRecords}</Text>
            <Text style={styles.statLabel}>Days Tracked</Text>
          </View>
        </View>

        {/* Sleep Chart */}
        {sleepData.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Sleep Duration Trend</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={true}
              withShadow={false}
              withInnerLines={false}
              withOuterLines={false}
            />
          </View>
        )}

        {/* Recent Sleep History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Sleep</Text>
          {sleepData.length > 0 ? (
            sleepData.slice(0, 5).map((entry) => (
              <View key={entry.id} style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Text style={styles.historyDateText}>{entry.date}</Text>
                  <Text style={styles.historyTimeText}>
                    {entry.bedtime} - {entry.wakeupTime}
                  </Text>
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyDuration}>{entry.duration}h</Text>
                  <View style={styles.qualityStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text key={star} style={[
                        styles.star, 
                        star <= entry.quality && styles.starFilled
                      ]}>
                        ⭐
                      </Text>
                    ))}
                  </View>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => editSleepEntry(entry)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.editButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteSleepEntry(entry.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.historyItem}>
              <Text style={styles.historyDateText}>No sleep data yet</Text>
              <Text style={styles.historyTimeText}>Start tracking your sleep to see history here</Text>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
         <Button title="Go Back" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SleepTracker;