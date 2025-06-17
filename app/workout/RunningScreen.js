// Features: GPS tracking, distance calculation, pace calculatiom, time elapsed, route visualization
//to do : 
// add store adn save  workout 
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { getDistance } from 'geolib';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import styles from '../workout/RunningStyles';

export default function RunningScreen() {
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(0);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const mapRef = useRef(null);
  const watcherRef = useRef(null);
  const prevLocRef = useRef(null);
  const routeRef = useRef([]);
  const isMountedRef = useRef(true);
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
            
            // Only add to route if workout is running
            if (isRunning) {
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
                setDistance((total) => total + d);
              }
              
              prevLocRef.current = newLoc;
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
    if (!hasStarted) {
      // First time starting
      startTimeRef.current = Date.now();
      setHasStarted(true);
    } else {
      // Resuming from pause - add the pause duration to total paused time
      if (lastPauseStartRef.current) {
        const pauseDuration = Date.now() - lastPauseStartRef.current;
        totalPausedTimeRef.current += pauseDuration;
        lastPauseStartRef.current = null;
      }
    }
    setIsRunning(true);
  };

  const pauseWorkout = () => {
    setIsRunning(false);
    lastPauseStartRef.current = Date.now(); // Record when pause started
  };

  const finishWorkout = () => {
    setIsRunning(false);
    //add save workout logic
    Alert.alert(
      'Workout Complete!',
      `Distance: ${(distance / 1000).toFixed(2)} km\nTime: ${formatTime(duration)}\nPace: ${formatPace(currentPace)} min/km`,
      [
        { text: 'Save & Exit', onPress: () => router.back() },
        { text: 'Continue', style: 'cancel' }
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
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.text}>Acquiring GPS signal...</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
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





/*
  
 /* const currentPace = duration > 0 ? (duration / 60) / (distance / 1000) : 0; //Calculate pace: min/km
  const saveRoute = async () => {
  const routeData = {
    route,
    distance,
    duration,
    date: new Date().toISOString()
  };
  // Save to AsyncStorage or database
};




  useEffect(() => {
    let watcher;
    let prevLoc = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission denied');
        return;
      }

      watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 3000,
          distanceInterval: 1,
        },
        (loc) => {
          const newLoc = loc.coords;
          setLocation(newLoc);
          //setRoute((prev) => [...prev, newLoc]);
          routeRef.current = [...routeRef.current, newLoc];
          if (routeRef.current.length % 5 === 0) {
            setRoute([...routeRef.current]);
          }

          if (prevLoc) {
            const d = getDistance(
              { latitude: prevLoc.latitude, longitude: prevLoc.longitude },
              { latitude: newLoc.latitude, longitude: newLoc.longitude }
            );
            setDistance((total) => total + d);
          }

          prevLoc = newLoc;
        },
        (error) => console.log('Location error:', error)
      );
    })();

    return () => watcher?.remove();
  }, []);
   

  const router = useRouter();

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
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Polyline
          coordinates={route}
          strokeColor="blue"
          strokeWidth={5}
        />
      </MapView>
      <View style={styles.overlay}>
        <Text style={styles.text}>Distance: {(distance / 1000).toFixed(2)} km</Text>
      </View>
          <View style={styles.button}>
          <Button title="Go Back" onPress={() => router.back()} />
    </View>
    </View>
  );
}

//add finish button -> reset dist to 0s


*/