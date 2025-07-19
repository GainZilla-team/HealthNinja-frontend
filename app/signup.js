import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { register } from '../api/authService';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    try {
      await register(email, password);
      router.replace('../homepage/home');
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.error || err.message || 'Please try again');
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
            Join HealthNinja
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: '#64748b',
            textAlign: 'center'
          }}>
            Start your fitness journey today
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
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#e2e8f0',
              color: '#1e293b'
            }}
            placeholderTextColor="#94a3b8"
            secureTextEntry
            editable={!loading}
          />
          
          <TextInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
            onPress={handleSignup}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#64748b', marginBottom: 8 }}>
            Already have an account?
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/login')}
            disabled={loading}
          >
            <Text style={{
              color: '#ec4899',
              fontSize: 16,
              fontWeight: '600'
            }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

