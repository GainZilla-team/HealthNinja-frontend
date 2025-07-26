import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  progressContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    marginRight: 20
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -10 }],
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007aff'
  },
  progressTextContainer: {
    flex: 1
  },
  stepCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  goalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10
  },
  goalReached: {
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  goalNotReached: {
    color: '#FF9800',
    fontWeight: 'bold'
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  chartToggle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10
  }
});