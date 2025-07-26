import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getProfile, logout } from '../../api/authService.js';

const { width } = Dimensions.get('window');
const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export default function HomeScreen() {
  const [profile, setProfile] = useState(null);
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => router.replace('/login'));
      
    fetchTodayStats();
  }, []);

  const fetchTodayStats = async () => {
    try {
      setLoadingStats(true);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/meals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const meals = await res.json();
        const today = new Date().toLocaleDateString();
        
        // Filter meals for today
        const todayMeals = meals.filter(meal => 
          new Date(meal.date).toLocaleDateString() === today
        );
        
        // Calculate totals
        const stats = todayMeals.reduce((totals, meal) => ({
          calories: totals.calories + (meal.calories || 0),
          protein: totals.protein + (meal.protein || 0),
          carbs: totals.carbs + (meal.carbs || 0),
          fat: totals.fat + (meal.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        
        setTodayStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch today stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };


  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const healthModules = [
    {
      title: 'Nutrition',
      subtitle: 'Track your meals',
      icon: 'apple-alt',
      iconType: FontAwesome5,
      color: '#ec4899',
      bgColor: '#fdf2f8',
      route: '../nutrition/NutritionScreen'
    },
    {
      title: 'Workouts',
      subtitle: 'Stay active',
      icon: 'fitness-center',
      iconType: MaterialIcons,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      route: '../workout/RunningScreen'
    },
    {
      title: 'Sleep',
      subtitle: 'Rest well',
      icon: 'moon',
      iconType: Ionicons,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      route: '../sleep/SleepScreen'
    },
    {
      title: 'Schedule',
      subtitle: 'Plan your day',
      icon: 'calendar',
      iconType: Ionicons,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      route: '../personalisedschedule/Schedule'
    },
    {
      title: 'Community',
      subtitle: 'Connect & share',
      icon: 'people',
      iconType: Ionicons,
      color: '#ec4899',
      bgColor: '#fdf2f8',
      route: '../community/CommunityScreen'
    },
    {
      title: 'Achievements',
      subtitle: 'Badges & rewards',
      icon: 'trophy',
      iconType: Ionicons,
      color: '#7c3aed',
      bgColor: '#f3f4f6',
      route: '../gamification/GamificationScreen'
    }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        
        {/* Header with gradient */}
        <View style={{
          backgroundColor: '#3b82f6',
          paddingTop: 60,
          paddingBottom: 40,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8
        }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image 
              source={require('../../assets/images/HealthNinja_logo.png')} 
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: 12,
                marginBottom: 16
              }} 
            />
            <Text style={{ 
              fontSize: 28, 
              fontWeight: '700', 
              color: 'white',
              textAlign: 'center',
              marginBottom: 8
            }}>
              HealthNinja
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              fontWeight: '300'
            }}>
              Welcome back{profile?.email ? `, ${profile.email.split('@')[0]}` : ''}!
            </Text>
          </View>
          
          <Text style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            fontWeight: '400'
          }}>
            Your health journey starts here
          </Text>
        </View>

        {/* Content */}
        <View style={{ padding: 20, marginTop: -15 }}>
          
          {/* Quick Stats Card */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b' }}>
                Today's Nutrition
              </Text>
              <TouchableOpacity onPress={fetchTodayStats}>
                <Text style={{ fontSize: 12, color: '#ec4899', fontWeight: '500' }}>Refresh</Text>
              </TouchableOpacity>
            </View>
            
            {loadingStats ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator color="#ec4899" />
                <Text style={{ color: '#64748b', marginTop: 8, fontSize: 12 }}>Loading today's stats...</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#ec4899' }}>
                    {Math.round(todayStats.calories)}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>Calories</Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#f59e0b' }}>
                    {Math.round(todayStats.protein * 10) / 10}g
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>Protein</Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#3b82f6' }}>
                    {Math.round(todayStats.carbs * 10) / 10}g
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>Carbs</Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#16a34a' }}>
                    {Math.round(todayStats.fat * 10) / 10}g
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>Fat</Text>
                </View>
              </View>
            )}
          </View>
          
          {/* View Recent Workouts Button */}
          <TouchableOpacity
            onPress={() => router.push('/workout/RecentWorkouts')}
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2
            }}          
            >
         <Text style={{ fontSize: 20, color: '#ec4899', fontWeight: '600' }}>
          View recent workouts
        </Text>
        </TouchableOpacity>
            
          {/* Health Modules Grid */}
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#1e293b', marginBottom: 16 }}>
            Health Modules
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between',
            marginBottom: 24
          }}>
            {healthModules.map((module, index) => {
              const IconComponent = module.iconType;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push(module.route)}
                  style={{
                    width: (width - 60) / 2,
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2
                  }}
                >
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: module.bgColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 12
                  }}>
                    <IconComponent name={module.icon} size={24} color={module.color} />
                  </View>
                  
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: '#1e293b',
                    marginBottom: 4
                  }}>
                    {module.title}
                  </Text>
                  
                  <Text style={{ 
                    fontSize: 12, 
                    color: '#64748b'
                  }}>
                    {module.subtitle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={{
        backgroundColor: 'white',
        paddingVertical: 16,
        paddingHorizontal: 20,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
      }}>
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#64748b',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center'
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
