import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor:'pink', flex: 1, },
  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  resultContainer: {
    marginTop: 100,
  },
  item: {
    marginBottom: 15,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  title: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  error: {
    color: 'red',
    marginTop: 15,
    fontWeight: '600',
  },
  button: {
    marginTop: 25,
  },
});
export default styles;