import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    flex: 1,
    backgroundColor: '#FFB6C1'
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  eventText: {
    fontSize: 14,
    marginLeft: 10,
  },
  input: {
    borderColor: 'white',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 6,
    textAlignVertical: 'top',
    minHeight: 60,
    backgroundColor: 'white',
  },
  workoutPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  workoutPlanText: {
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  button: {
    color: '#000080'
  }
});
