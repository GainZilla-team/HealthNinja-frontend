import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { login } from '../api/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      await AsyncStorage.setItem('userEmail', email);
      router.replace('../homepage/home');
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Please check your credentials and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
    >
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        
        {/* Header Section */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5
          }}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={{ width: 80, height: 80, borderRadius: 40 }}
            />
          </View>
          
          <Text style={{
            fontSize: 32,
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: 8
          }}>
            Welcome Back
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: '#64748b',
            textAlign: 'center'
          }}>
            Sign in to continue your health journey
          </Text>
        </View>

        {/* Form Section */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
          marginBottom: 24
        }}>
          <TextInput
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#e2e8f0',
              color: '#1e293b'
            }}
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: '#e2e8f0',
              color: '#1e293b'
            }}
            placeholderTextColor="#94a3b8"
            secureTextEntry
            editable={!loading}
          />
          
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#94a3b8' : '#ec4899',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center'
            }}
          >
            {loading && (
              <ActivityIndicator color="white" style={{ marginRight: 8 }} />
            )}
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600'
            }}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#64748b', marginBottom: 8 }}>
            Don't have an account?
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/signup')}
            disabled={loading}
          >
            <Text style={{
              color: '#ec4899',
              fontSize: 16,
              fontWeight: '600'
            }}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
