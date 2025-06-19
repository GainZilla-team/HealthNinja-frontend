import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';
import { register } from '../api/authService';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    try {
      await register(email, password);
      router.replace('../homepage/home');
    } catch (err) {
      Alert.alert('Signup failed', err.response?.data?.error || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Sign Up" onPress={handleSignup} />
      <Button title="Back to Login" onPress={() => router.replace('/login')} />
   </View> 
   );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'pink',
  },
  logoContainer: {
    alignItems: 'center',     
    marginBottom: 30,
  },
  image: {width: 100, height: 100, marginBottom: 20, borderRadius: 50},
  input: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: 'black',
    color: 'white',
  },
});
