// Features: GPS tracking, distance calculation, pace calculatiom, time elapsed, route visualization
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { getDistance } from 'geolib';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import styles from '../workout/RunningStyles';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export default function RunningScreen() {
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(0);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const mapRef = useRef(null);
  const watcherRef = useRef(null);
  const prevLocRef = useRef(null);
  const routeRef = useRef([]);
  const isMountedRef = useRef(true);
  const isRunningRef = useRef(false); // Track running state in ref
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const totalPausedTimeRef = useRef(0);
  const lastPauseStartRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    
    const setupLocationTracking = async () => {
      try {
        // Request permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          setIsLoading(false);
          Alert.alert(
            'Permission Required',
            'This app needs location access to track your run.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Start watching position
        watcherRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 3000,
            distanceInterval: 1,
          },
          (loc) => {
            // Prevent state updates after component unmount
            if (!isMountedRef.current) return;
            
            const newLoc = loc.coords;
            
            // Update current location (for map centering)
            setLocation(newLoc);
            
            console.log('GPS Update:', {
              isRunning: isRunningRef.current,
              latitude: newLoc.latitude,
              longitude: newLoc.longitude,
              accuracy: newLoc.accuracy,
              timestamp: new Date().toLocaleTimeString()
            });
            
            // Only add to route if workout is running
            if (isRunningRef.current) {
              console.log('Workout is running, processing location...');
              // Store all points in ref for accuracy
              routeRef.current = [...routeRef.current, newLoc];

              // Update visual route less frequently (every 5 points)
              if (routeRef.current.length <= 3 || routeRef.current.length % 5 === 0) {
                setRoute([...routeRef.current]);
              }

              // Calculate distance from all points
              if (prevLocRef.current) {
                const d = getDistance(
                  { 
                    latitude: prevLocRef.current.latitude, 
                    longitude: prevLocRef.current.longitude 
                  },
                  { 
                    latitude: newLoc.latitude, 
                    longitude: newLoc.longitude 
                  }
                );
                console.log('Distance calculated:', d, 'meters');
                console.log('Previous location:', prevLocRef.current);
                console.log('Current location:', newLoc);
                setDistance((total) => {
                  const newTotal = total + d;
                  console.log('Total distance updated:', newTotal, 'meters');
                  return newTotal;
                });
              }
              
              prevLocRef.current = newLoc;
            } else {
              console.log('Workout not running, skipping distance calculation');
            }
            
            setIsLoading(false);
          },
          (error) => {
            console.error('Location error:', error);
            if (isMountedRef.current) {
              setError('Failed to get location');
              setIsLoading(false);
            }
          }
        );
      } catch (err) {
        console.error('Setup error:', err);
        if (isMountedRef.current) {
          setError('Failed to initialize GPS');
          setIsLoading(false);
        }
      }
    };

    setupLocationTracking();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (watcherRef.current) {
        watcherRef.current.remove();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []); // Empty dependency - only run once on mount

  // Timer effect for duration tracking
  useEffect(() => {
    if (isRunning && startTimeRef.current) {
      timerRef.current = setInterval(() => {
        if (isMountedRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000);
          setDuration(elapsed);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const router = useRouter();

  // Workout control functions
  const startWorkout = () => {
    console.log('START WORKOUT BUTTON PRESSED');
    console.log('Current state:', { hasStarted, isRunning });
    
    if (!hasStarted) {
      // First time starting
      startTimeRef.current = Date.now();
      setHasStarted(true);
      console.log('First time starting workout');
    } else {
      // Resuming from pause - add the pause duration to total paused time
      if (lastPauseStartRef.current) {
        const pauseDuration = Date.now() - lastPauseStartRef.current;
        totalPausedTimeRef.current += pauseDuration;
        lastPauseStartRef.current = null;
      }
      console.log('Resuming workout from pause');
    }
    setIsRunning(true);
    isRunningRef.current = true; // Also update the ref
    console.log('isRunning set to true');
  };

  const pauseWorkout = () => {
    setIsRunning(false);
    isRunningRef.current = false; // Also update the ref
    lastPauseStartRef.current = Date.now(); // Record when pause started
  };

  const saveWorkout = async () => {
    try {
      setIsSaving(true);
      const token = await AsyncStorage.getItem('token');
      
      const workoutData = {
        type: 'running',
        duration: formatTime(duration), // in MM:SS
        distance: Number((distance / 1000).toFixed(2)), // in km, as a number
        pace: Number(currentPace.toFixed(2)), // min/km as a number
        startTime: new Date(startTimeRef.current).toISOString(),
        endTime: new Date().toISOString(),
        calories: Math.round((distance / 1000) * 60), // Rough estimate: 60 calories per km
      };

      console.log('Saving workout:', workoutData);

      const response = await fetch(`${BASE_URL}/api/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(workoutData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save workout: ${errorText}`);
      }

      const savedWorkout = await response.json();
      console.log('Workout saved successfully:', savedWorkout);
      
      Alert.alert(
        'Success!', 
        'Your workout has been saved successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert(
        'Save Failed',
        `Failed to save workout: ${error.message}`,
        [
          { text: 'Try Again', onPress: saveWorkout },
          { text: 'Exit Without Saving', onPress: () => router.back() }
        ]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const finishWorkout = () => {
    setIsRunning(false);
    isRunningRef.current = false; // Also update the ref
    
    if (distance === 0 || duration === 0) {
      Alert.alert(
        'No Workout Data',
        'No distance or time recorded. Are you sure you want to finish?',
        [
          { text: 'Continue Workout', style: 'cancel' },
          { text: 'Exit Without Saving', onPress: () => router.back() }
        ]
      );
      return;
    }
    
    Alert.alert(
      'Workout Complete!',
      `Distance: ${(distance / 1000).toFixed(2)} km\nTime: ${formatTime(duration)}\nPace: ${formatPace(currentPace)} min/km\n\nWould you like to save this workout?`,
      [
        { text: 'Save & Exit', onPress: saveWorkout },
        { text: 'Exit Without Saving', onPress: () => router.back() },
        { text: 'Continue Workout', style: 'cancel' }
      ]
    );
  };

  // Calculate derived metrics
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPace = duration > 0 && distance > 0 ? 
    (duration / 60) / (distance / 1000) : 0;

  const formatPace = (pace) => {
    if (pace === 0 || !isFinite(pace)) return '0:00';
    const mins = Math.floor(pace);
    const secs = Math.floor((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.text}>Acquiring GPS signal...</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.text}>Error: {error}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        ref={mapRef}
        showsUserLocation
        followsUserLocation
        initialRegion={{
          latitude: location?.latitude || 1.3521,
          longitude: location?.longitude || 103.8198,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }}
      >
        <Polyline
          coordinates={route}
          strokeColor="blue"
          strokeWidth={5}
        />
      </MapView>
      
      <View style={styles.overlay}>
        <Text style={styles.text}>
          Distance: {(distance / 1000).toFixed(2)} km
        </Text>
        <Text style={styles.text}>
          Time: {formatTime(duration)}
        </Text>
        <Text style={styles.text}>
          Pace: {formatPace(currentPace)} min/km
        </Text>
      </View>
      
      <View style={styles.button}>
        {!hasStarted ? (
          <Button title="Start Workout" onPress={startWorkout} />
        ) : (
          <>
            {isRunning ? (
              <Button title="Pause" onPress={pauseWorkout} />
            ) : (
              <Button title="Resume" onPress={startWorkout} />
            )}
            <Button title="Finish Workout" onPress={finishWorkout} />
          </>
        )}
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    </View>
  );
}

