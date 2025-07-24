import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  button: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  workoutDetailContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  workoutDate: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  workoutDistance: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  workoutDuration: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  workoutPace: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  workoutCalories: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
});

export default styles;