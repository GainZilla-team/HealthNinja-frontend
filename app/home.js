import React, { useEffect, useState } from 'react';
import { View, Text, Button, Image } from 'react-native';
import { getProfile, logout } from '../authService';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => router.replace('/login'));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'pink', justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require('../assets/images/logo.png')} style={{ width: 100, height: 100, marginBottom: 20 }} />
      {profile ? <Text>Welcome, {profile.name}</Text> : <Text>Loading...</Text>}
      <Button
        title="Logout"
        onPress={async () => {
          await logout();
          router.replace('/login');
        }}
      />
    </View>
  );
}

