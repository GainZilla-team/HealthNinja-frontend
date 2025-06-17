import { Dimensions, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
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
});

export default styles;

