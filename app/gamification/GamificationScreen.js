import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View
} from 'react-native';
import styles from './GamificationStyles.js';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const GamificationScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userBadges, setUserBadges] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  // Badge definitions with realistic milestones
  const BADGES = {
    // Sleep Badges
    SLEEP_WARRIOR: {
      id: 'sleep_warrior',
      name: 'Sleep Warrior',
      description: 'Get 7+ hours of sleep',
      emoji: '😴',
      category: 'sleep',
      requirement: 'Sleep for 7 or more hours',
      color: '#6366f1'
    },
    SLEEP_STREAK: {
      id: 'sleep_streak',
      name: 'Sleep Streak',
      description: 'Sleep well for 3 days straight',
      emoji: '🌙',
      category: 'sleep',
      requirement: '3 consecutive days of 7+ hours sleep',
      color: '#4338ca'
    },
    
    // Nutrition Badges
    PROTEIN_POWER: {
      id: 'protein_power',
      name: 'Protein Power',
      description: 'Consume 50g+ protein in a day',
      emoji: '💪',
      category: 'nutrition',
      requirement: 'Eat 50g+ protein in one day',
      color: '#dc2626'
    },
    BALANCED_EATER: {
      id: 'balanced_eater',
      name: 'Balanced Eater',
      description: 'Log all 3 meals in a day',
      emoji: '🥗',
      category: 'nutrition',
      requirement: 'Log breakfast, lunch, and dinner',
      color: '#16a34a'
    },
    FIBER_FRIEND: {
      id: 'fiber_friend',
      name: 'Fiber Friend',
      description: 'Consume 25g+ fiber in a day',
      emoji: '🌾',
      category: 'nutrition',
      requirement: 'Eat 25g+ fiber in one day',
      color: '#ca8a04'
    },
    
    // Workout Badges
    WORKOUT_STARTER: {
      id: 'workout_starter',
      name: 'Workout Starter',
      description: 'Complete a 30+ minute workout',
      emoji: '🏃',
      category: 'workout',
      requirement: 'Exercise for 30+ minutes',
      color: '#ea580c'
    },
    CONSISTENCY_KING: {
      id: 'consistency_king',
      name: 'Consistency King',
      description: 'Workout 3 times in a week',
      emoji: '👑',
      category: 'workout',
      requirement: '3 workouts in one week',
      color: '#7c2d12'
    },
    
    // Overall Badges
    HEALTH_HERO: {
      id: 'health_hero',
      name: 'Health Hero',
      description: 'Complete daily goals for all categories',
      emoji: '🦸',
      category: 'overall',
      requirement: 'Sleep well, eat healthy, and workout in one day',
      color: '#7c3aed'
    },
    WEEK_WARRIOR: {
      id: 'week_warrior',
      name: 'Week Warrior',
      description: 'Complete 5 days of healthy living',
      emoji: '⚔️',
      category: 'overall',
      requirement: '5 days with sleep + nutrition + workout goals',
      color: '#1e40af'
    }
  };

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      const email = await AsyncStorage.getItem('userEmail');
      if (!email) {
        Alert.alert('Error', 'Please log in to access gamification');
        return;
      }
      setCurrentUser(email);
      await Promise.all([
        loadUserBadges(email),
        loadUserStats(email),
        loadLeaderboard()
      ]);
    } catch (error) {
      console.error('Error initializing gamification data:', error);
      Alert.alert('Error', 'Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserBadges = async (email) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/gamification/badges/${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserBadges(data.badges || []);
      }
    } catch (error) {
      console.error('Error loading user badges:', error);
      throw error;
    }
  };

  const loadUserStats = async (email) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/gamification/stats/${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
      throw error;
    }
  };

  const loadLeaderboard = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/gamification/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      throw error;
    }
  };

  const onRefresh = async () => {
    if (!currentUser) return;
    setRefreshing(true);
    try {
      await Promise.all([
        loadUserBadges(currentUser),
        loadUserStats(currentUser),
        loadLeaderboard()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const hasBadge = (badgeId) => {
    return userBadges.some(badge => badge.badgeId === badgeId);
  };

  const getCategoryBadges = (category) => {
    return Object.values(BADGES).filter(badge => badge.category === category);
  };

  const getBadgeProgress = (badge) => {
    // This would calculate progress towards badge requirements
    // For now, return mock progress
    if (hasBadge(badge.id)) return 100;
    
    switch (badge.id) {
      case 'sleep_warrior':
        return Math.min((userStats.avgSleepDuration || 0) / 7 * 100, 100);
      case 'protein_power':
        return Math.min((userStats.avgProtein || 0) / 50 * 100, 100);
      case 'workout_starter':
        return Math.min((userStats.totalWorkouts || 0) > 0 ? 50 : 0, 100);
      default:
        return Math.random() * 60; // Mock progress
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a28" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7c3aed"
            colors={['#7c3aed']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏆 Achievements</Text>
          <Text style={styles.headerSubtitle}>Track your health journey</Text>
        </View>

        {/* User Overview */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>Your Progress</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userBadges.length}</Text>
                <Text style={styles.statLabel}>Badges Earned</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{Object.values(BADGES).length}</Text>
                <Text style={styles.statLabel}>Total Badges</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Math.round((userBadges.length / Object.values(BADGES).length) * 100)}%
                </Text>
                <Text style={styles.statLabel}>Completion</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Badge Categories */}
        {['sleep', 'nutrition', 'workout', 'overall'].map(category => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {category === 'sleep' && '😴 Sleep Badges'}
              {category === 'nutrition' && '🥗 Nutrition Badges'}
              {category === 'workout' && '🏃 Workout Badges'}
              {category === 'overall' && '🏆 Overall Badges'}
            </Text>
            
            <View style={styles.badgesGrid}>
              {getCategoryBadges(category).map(badge => {
                const earned = hasBadge(badge.id);
                const progress = getBadgeProgress(badge);
                
                return (
                  <View key={badge.id} style={[
                    styles.badgeCard,
                    earned && styles.badgeCardEarned
                  ]}>
                    <View style={styles.badgeHeader}>
                      <Text style={[
                        styles.badgeEmoji,
                        !earned && styles.badgeEmojiGray
                      ]}>
                        {badge.emoji}
                      </Text>
                      {earned && (
                        <View style={styles.earnedIndicator}>
                          <Text style={styles.earnedText}>✓</Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={[
                      styles.badgeName,
                      !earned && styles.badgeNameGray
                    ]}>
                      {badge.name}
                    </Text>
                    
                    <Text style={styles.badgeDescription}>
                      {badge.description}
                    </Text>
                    
                    <Text style={styles.badgeRequirement}>
                      {badge.requirement}
                    </Text>
                    
                    {!earned && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View style={[
                            styles.progressFill,
                            { width: `${progress}%`, backgroundColor: badge.color }
                          ]} />
                        </View>
                        <Text style={styles.progressText}>
                          {Math.round(progress)}%
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>🏅 Community Leaderboard</Text>
          <Text style={styles.sectionSubtitle}>See how you rank among other users</Text>
          
          <View style={styles.leaderboardCard}>
            {leaderboard.length > 0 ? (
              leaderboard.slice(0, 10).map((user, index) => (
                <View key={user.email} style={[
                  styles.leaderboardItem,
                  user.email === currentUser && styles.currentUserItem
                ]}>
                  <View style={styles.rankContainer}>
                    <Text style={styles.rankNumber}>#{index + 1}</Text>
                    {index < 3 && (
                      <Text style={styles.medalEmoji}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.userInfo}>
                    <Text style={[
                      styles.userName,
                      user.email === currentUser && styles.currentUserName
                    ]}>
                      {user.email === currentUser ? 'You' : user.email.split('@')[0]}
                    </Text>
                    <Text style={styles.userBadgeCount}>
                      {user.badgeCount} badges
                    </Text>
                  </View>
                  
                  <View style={styles.userBadges}>
                    {user.recentBadges?.slice(0, 3).map((badge, badgeIndex) => (
                      <Text key={badgeIndex} style={styles.badgeEmojiSmall}>
                        {BADGES[badge.badgeId]?.emoji || '🏅'}
                      </Text>
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyLeaderboard}>
                No leaderboard data available yet
              </Text>
            )}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
        <Button title="Go Back to Home" onPress={() => router.push('/homepage/home')} />
      </ScrollView>
    </SafeAreaView>
  );
};


export default GamificationScreen;