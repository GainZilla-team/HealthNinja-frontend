import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export default function NutritionScreen() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [servingSize, setServingSize] = useState('1 cup');
  const [searchResults, setSearchResults] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [loggedMeals, setLoggedMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [mealsError, setMealsError] = useState(null);

  const [loggingMeal, setLoggingMeal] = useState(false);
  const [logError, setLogError] = useState(null);

  const [mealType, setMealType] = useState('lunch'); // default value

  // Fetch user's logged meals on mount
  useEffect(() => {
    fetchLoggedMeals();
  }, []);

  async function fetchLoggedMeals() {
    setLoadingMeals(true);
    setMealsError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/meals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch logged meals');
      const data = await res.json();
      setLoggedMeals(data);
    } catch (error) {
      setMealsError(error.message);
    } finally {
      setLoadingMeals(false);
    }
  }

  async function fetchNutrition() {
    setLoadingSearch(true);
    setSearchError(null);
    setSearchResults(null);
    try {
      // Combine query with serving size for more specific results
      const searchQuery = `${query} ${servingSize}`;
      const res = await fetch(`${BASE_URL}/api/fatsecret/search?query=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Failed to fetch nutrition data');
      const data = await res.json();
      setSearchResults(data.foods?.food || []); // adjust based on API response shape
    } catch (error) {
      setSearchError(error.message);
    } finally {
      setLoadingSearch(false);
    }
  }

  async function logMeal(meal) {
    setLoggingMeal(true);
    setLogError(null);
    try {
      const token = await AsyncStorage.getItem('token');      
      
      // Parse nutrition data from food_description text
      function parseNutritionFromDescription(description) {
        if (!description) return { calories: 0, protein: 0, carbs: 0, fat: 0, baseServing: null };
        
        // Extract base serving size from description
        const baseServingMatch = description.match(/(?:per|\/)\s*(\d+(?:\.\d+)?)\s*(g|kg|oz|lb|cup|tbsp|tsp|piece|medium|large|small|slice)\b/i);
        
        // More comprehensive regex patterns to catch various formats
        const caloriesMatch = description.match(/(\d+(?:\.\d+)?)\s*(?:kcal|calories?|cal)\b/i);
        const proteinMatch = description.match(/(?:protein[:\s]*|prot[:\s]*)(\d+(?:\.\d+)?)g?\b/i);
        const carbsMatch = description.match(/(?:carb(?:ohydrate)?s?[:\s]*|carb[:\s]*)(\d+(?:\.\d+)?)g?\b/i);
        const fatMatch = description.match(/(?:fat[:\s]*|total fat[:\s]*)(\d+(?:\.\d+)?)g?\b/i);
        
        return {
          calories: caloriesMatch ? parseFloat(caloriesMatch[1]) : 0,
          protein: proteinMatch ? parseFloat(proteinMatch[1]) : 0,
          carbs: carbsMatch ? parseFloat(carbsMatch[1]) : 0,
          fat: fatMatch ? parseFloat(fatMatch[1]) : 0,
          baseServing: baseServingMatch ? `${baseServingMatch[1]} ${baseServingMatch[2]}` : null,
        };
      }

      // Calculate serving size multiplier
      function calculateServingMultiplier(userServing, baseServing) {
        if (!baseServing || !userServing) return 1;
        
        // Extract numbers and units from serving sizes
        const userMatch = userServing.match(/(\d+(?:\.\d+)?)\s*(\w+)/i);
        const baseMatch = baseServing.match(/(\d+(?:\.\d+)?)\s*(\w+)/i);
        
        if (!userMatch || !baseMatch) return 1;
        
        const userAmount = parseFloat(userMatch[1]);
        const userUnit = userMatch[2].toLowerCase();
        const baseAmount = parseFloat(baseMatch[1]);
        const baseUnit = baseMatch[2].toLowerCase();
        
        // Simple unit conversion (can be expanded)
        const unitConversions = {
          'g': 1, 'gram': 1, 'grams': 1,
          'kg': 1000, 'kilogram': 1000, 'kilograms': 1000,
          'oz': 28.35, 'ounce': 28.35, 'ounces': 28.35,
          'lb': 453.6, 'pound': 453.6, 'pounds': 453.6,
          'cup': 240, 'cups': 240,
          'tbsp': 15, 'tablespoon': 15, 'tablespoons': 15,
          'tsp': 5, 'teaspoon': 5, 'teaspoons': 5,
          'piece': 1, 'pieces': 1, 'medium': 1, 'large': 1.5, 'small': 0.5, 'slice': 1, 'slices': 1
        };
        
        const userGrams = userAmount * (unitConversions[userUnit] || 1);
        const baseGrams = baseAmount * (unitConversions[baseUnit] || 1);
        
        return userGrams / baseGrams;
      }
      
      // Extract nutrition from food_description or fallback to direct properties
      const nutrition = parseNutritionFromDescription(meal.food_description);
      
      // Calculate serving size multiplier
      const multiplier = calculateServingMultiplier(servingSize, nutrition.baseServing);
      
      // Apply serving size adjustment to nutrition values
      const baseCalories = nutrition.calories || meal.calories || 0;
      const baseProtein = nutrition.protein || meal.protein || 0;
      const baseCarbs = nutrition.carbs || meal.carbs || meal.carbohydrate || 0;
      const baseFat = nutrition.fat || meal.fat || 0;
      
      const calories = Math.round(baseCalories * multiplier);
      const protein = Math.round(baseProtein * multiplier * 10) / 10; // 1 decimal place
      const carbs = Math.round(baseCarbs * multiplier * 10) / 10;
      const fat = Math.round(baseFat * multiplier * 10) / 10;
      
      const mealData = {
        name: meal.food_name || meal.name || 'Unknown Food',
        brand: meal.brand_name || '',
        servingSize: servingSize,
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        mealType,
        photoUrl: '', // optional
      };

      const res = await fetch(`${BASE_URL}/api/meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(mealData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to log meal: ${errorText}`);
      }

      const savedMeal = await res.json();
      setLoggedMeals((prev) => [savedMeal, ...prev]);
      alert('Meal logged successfully!');
    } catch (error) {
      setLogError(error.message);
    } finally {
      setLoggingMeal(false);
    }
  }

  const groupMealsByDateAndType = (meals) => {
    const grouped = {};
  
    meals.forEach(meal => {
      const dateKey = new Date(meal.date).toLocaleDateString();
      if (!grouped[dateKey]) grouped[dateKey] = {};
  
      if (!grouped[dateKey][meal.mealType]) grouped[dateKey][meal.mealType] = [];
  
      grouped[dateKey][meal.mealType].push(meal);
    });
  
    return grouped;
  };
  
  const calculateDailySummary = (meals) => {
    return meals.reduce((totals, meal) => ({
      calories: totals.calories + (meal.calories || 0),
      protein: totals.protein + (meal.protein || 0),
      carbs: totals.carbs + (meal.carbs || 0),
      fat: totals.fat + (meal.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const groupedMeals = groupMealsByDateAndType(loggedMeals);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        
        {/* Header with gradient background */}
        <View style={{ 
          backgroundColor: '#3b82f6', 
          paddingTop: 60, 
          paddingBottom: 30, 
          paddingHorizontal: 20,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8
        }}>
          <Text style={{ 
            fontSize: 32, 
            fontWeight: '700', 
            color: 'white', 
            textAlign: 'center',
            marginBottom: 8
          }}>Nutrition</Text>
          <Text style={{ 
            fontSize: 16, 
            color: 'rgba(255,255,255,0.8)', 
            textAlign: 'center',
            fontWeight: '300'
          }}>Track your daily nutrition goals</Text>
        </View>

        {/* Content Container */}
        <View style={{ padding: 20, marginTop: -15 }}>
          
          {/* Search Card */}
          <View style={{ 
            backgroundColor: 'white', 
            borderRadius: 20, 
            padding: 20, 
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: '#f1f5f9', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginRight: 12
              }}>
                <Text style={{ fontSize: 18 }}>🔍</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#1e293b' }}>Find Food</Text>
            </View>
            
            <TextInput
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                color: '#334155'
              }}
              placeholder="Search for food (e.g., chicken breast)"
              placeholderTextColor="#94a3b8"
              value={query}
              onChangeText={setQuery}
            />
            
            {/* Serving Size Section */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#475569', marginBottom: 8 }}>Serving Size</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 16,
                    flex: 1,
                    marginRight: 12,
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    color: '#334155'
                  }}
                  placeholder="e.g., 100g, 1 cup"
                  placeholderTextColor="#94a3b8"
                  value={servingSize}
                  onChangeText={setServingSize}
                />
              </View>
              
              {/* Quick serving buttons */}
              <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                {['100g', '1 cup', '1 medium'].map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setServingSize(size)}
                    style={{
                      backgroundColor: servingSize === size ? '#f59e0b' : '#f1f5f9',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                    }}
                  >
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: servingSize === size ? 'white' : '#64748b'
                    }}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Meal Type Selector */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#475569', marginBottom: 12 }}>Meal Type</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { label: 'Breakfast', value: 'breakfast', emoji: '🌅' },
                  { label: 'Lunch', value: 'lunch', emoji: '☀️' },
                  { label: 'Dinner', value: 'dinner', emoji: '🌙' },
                  { label: 'Snack', value: 'snack', emoji: '🥨' }
                ].map((meal) => (
                  <TouchableOpacity
                    key={meal.value}
                    onPress={() => setMealType(meal.value)}
                    style={{
                      flex: 1,
                      backgroundColor: mealType === meal.value ? '#ec4899' : '#f8fafc',
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: mealType === meal.value ? '#ec4899' : '#e2e8f0',
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ fontSize: 16, marginBottom: 4 }}>{meal.emoji}</Text>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: mealType === meal.value ? 'white' : '#64748b',
                      textAlign: 'center'
                    }}>{meal.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity
              onPress={fetchNutrition}
              disabled={loadingSearch || !query.trim()}
              style={{
                backgroundColor: loadingSearch || !query.trim() ? '#94a3b8' : '#ec4899',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center'
              }}
            >
              {loadingSearch ? (
                <ActivityIndicator color="white" style={{ marginRight: 8 }} />
              ) : (
                <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
              )}
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                {loadingSearch ? 'Searching...' : 'Search Nutrition'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Messages */}
          {searchError && (
            <View style={{
              backgroundColor: '#fef2f2',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              borderLeftWidth: 4,
              borderLeftColor: '#ef4444'
            }}>
              <Text style={{ color: '#dc2626', fontSize: 14, fontWeight: '500' }}>{searchError}</Text>
            </View>
          )}

          {/* Search Results */}
          {searchResults && searchResults.length > 0 && (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 20,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: '#f0f9ff', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 18 }}>🥗</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: '600', color: '#1e293b' }}>Nutrition Results</Text>
              </View>
              
              <ScrollView 
                style={{ maxHeight: 300 }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              >
                {searchResults.map((item, index) => (
                  <View key={index} style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: '#f59e0b'
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 }}>
                      {item.food_name}
                    </Text>
                    
                    {item.brand_name && (
                      <Text style={{ fontSize: 12, fontWeight: '500', color: '#ec4899', marginBottom: 8 }}>
                        {item.brand_name}
                      </Text>
                    )}
                    
                    {item.food_description && (
                      <Text style={{ 
                        fontSize: 13, 
                        color: '#64748b', 
                        marginBottom: 12, 
                        lineHeight: 18
                      }}>
                        {item.food_description}
                      </Text>
                    )}
                    
                    <TouchableOpacity
                      onPress={() => logMeal(item)}
                      disabled={loggingMeal}
                      style={{
                        backgroundColor: loggingMeal ? '#94a3b8' : '#f59e0b',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 10,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center'
                      }}
                    >
                      {loggingMeal ? (
                        <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
                      ) : (
                        <Text style={{ fontSize: 14, marginRight: 8 }}>➕</Text>
                      )}
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                        {loggingMeal ? 'Adding...' : 'Add to Log'}
                      </Text>
                    </TouchableOpacity>
                    
                    {logError && (
                      <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                        {logError}
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Recent Meals */}
          {loggedMeals.length > 0 && (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 20,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: '#f0fdf4', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 18 }}>📝</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: '600', color: '#1e293b' }}>Recent Meals</Text>
              </View>
              
              {loadingMeals ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator color="#ec4899" />
                  <Text style={{ color: '#64748b', marginTop: 8 }}>Loading meals...</Text>
                </View>
              ) : (
                <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                  {loggedMeals.slice(0, 3).map((meal) => (
                    <View key={meal._id} style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: '#f59e0b'
                    }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 4 }}>
                        {meal.name}
                      </Text>
                      
                      {meal.brand && (
                        <Text style={{ fontSize: 11, color: '#ec4899', marginBottom: 6 }}>
                          {meal.brand}
                        </Text>
                      )}
                      
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                        <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                          <Text style={{ fontSize: 11, color: '#92400e', fontWeight: '500' }}>{meal.calories} cal</Text>
                        </View>
                        <View style={{ backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                          <Text style={{ fontSize: 11, color: '#991b1b', fontWeight: '500' }}>{meal.protein}g protein</Text>
                        </View>
                        <View style={{ backgroundColor: '#e0f2fe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                          <Text style={{ fontSize: 11, color: '#0c4a6e', fontWeight: '500' }}>{meal.carbs}g carbs</Text>
                        </View>
                        <View style={{ backgroundColor: '#f3e8ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                          <Text style={{ fontSize: 11, color: '#581c87', fontWeight: '500' }}>{meal.fat}g fat</Text>
                        </View>
                      </View>
                      
                      <Text style={{ fontSize: 11, color: '#64748b' }}>
                        {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                        {meal.servingSize && ` • ${meal.servingSize}`}
                        {` • ${new Date(meal.date).toLocaleDateString()}`}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
              
              {mealsError && (
                <Text style={{ color: '#ef4444', fontSize: 14, textAlign: 'center', padding: 16 }}>
                  {mealsError}
                </Text>
              )}
            </View>
          )}
          {/* Daily Summary */}
          {Object.keys(groupedMeals).length > 0 && (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 20,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: '#fef7ff', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 18 }}>📊</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: '600', color: '#1e293b' }}>Daily Summary</Text>
              </View>
              
              <ScrollView 
                style={{ maxHeight: 400 }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              >
                {Object.entries(groupedMeals).slice(0, 3).map(([date, mealsByType]) => {
                  const allMealsForDay = Object.values(mealsByType).flat();
                  const summary = calculateDailySummary(allMealsForDay);

                  return (
                    <View key={date} style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 16
                    }}>
                      <Text style={{ fontWeight: '600', fontSize: 16, color: '#1e293b', marginBottom: 12 }}>
                        {date}
                      </Text>

                      {/* Nutrition summary with better spacing */}
                      <View style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-around',
                        backgroundColor: 'white',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 16
                      }}>
                        <View style={{ alignItems: 'center', flex: 1 }}>
                          <Text style={{ fontSize: 20, fontWeight: '700', color: '#ec4899' }}>
                            {Math.round(summary.calories)}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Calories</Text>
                        </View>
                        <View style={{ alignItems: 'center', flex: 1 }}>
                          <Text style={{ fontSize: 20, fontWeight: '700', color: '#f59e0b' }}>
                            {Math.round(summary.protein * 10) / 10}g
                          </Text>
                          <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Protein</Text>
                        </View>
                        <View style={{ alignItems: 'center', flex: 1 }}>
                          <Text style={{ fontSize: 20, fontWeight: '700', color: '#3b82f6' }}>
                            {Math.round(summary.carbs * 10) / 10}g
                          </Text>
                          <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Carbs</Text>
                        </View>
                        <View style={{ alignItems: 'center', flex: 1 }}>
                          <Text style={{ fontSize: 20, fontWeight: '700', color: '#16a34a' }}>
                            {Math.round(summary.fat * 10) / 10}g
                          </Text>
                          <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Fat</Text>
                        </View>
                      </View>

                      {/* Detailed meal breakdown */}
                      {Object.entries(mealsByType).map(([mealType, meals]) => (
                        <View key={mealType} style={{ marginBottom: 12 }}>
                          <Text style={{ 
                            fontSize: 14, 
                            fontWeight: '600', 
                            color: '#475569', 
                            marginBottom: 8,
                            textTransform: 'capitalize'
                          }}>
                            {mealType === 'breakfast' ? '🌅' : mealType === 'lunch' ? '☀️' : mealType === 'dinner' ? '🌙' : '🥨'} {mealType} ({meals.length} items)
                          </Text>
                          
                          {meals.map((meal, index) => (
                            <View key={index} style={{
                              backgroundColor: 'white',
                              borderRadius: 12,
                              padding: 12,
                              marginBottom: 8,
                              borderLeftWidth: 3,
                              borderLeftColor: mealType === 'breakfast' ? '#f59e0b' : mealType === 'lunch' ? '#ec4899' : mealType === 'dinner' ? '#3b82f6' : '#16a34a'
                            }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View style={{ flex: 1, marginRight: 12 }}>
                                  <Text style={{ 
                                    fontSize: 14, 
                                    fontWeight: '600', 
                                    color: '#1e293b',
                                    marginBottom: 4
                                  }}>
                                    {meal.name}
                                  </Text>
                                  
                                  {meal.brand && (
                                    <Text style={{ 
                                      fontSize: 12, 
                                      color: '#ec4899', 
                                      marginBottom: 4,
                                      fontWeight: '500'
                                    }}>
                                      {meal.brand}
                                    </Text>
                                  )}
                                  
                                  {meal.servingSize && (
                                    <Text style={{ 
                                      fontSize: 11, 
                                      color: '#64748b',
                                      marginBottom: 6
                                    }}>
                                      Serving: {meal.servingSize}
                                    </Text>
                                  )}
                                  
                                  {/* Nutrition details in a row */}
                                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                    <View style={{ 
                                      backgroundColor: '#fef3c7', 
                                      paddingHorizontal: 8, 
                                      paddingVertical: 3, 
                                      borderRadius: 12,
                                      minWidth: 50
                                    }}>
                                      <Text style={{ 
                                        fontSize: 10, 
                                        color: '#92400e', 
                                        fontWeight: '600',
                                        textAlign: 'center'
                                      }}>
                                        {Math.round(meal.calories || 0)} cal
                                      </Text>
                                    </View>
                                    
                                    <View style={{ 
                                      backgroundColor: '#fee2e2', 
                                      paddingHorizontal: 8, 
                                      paddingVertical: 3, 
                                      borderRadius: 12,
                                      minWidth: 45
                                    }}>
                                      <Text style={{ 
                                        fontSize: 10, 
                                        color: '#991b1b', 
                                        fontWeight: '600',
                                        textAlign: 'center'
                                      }}>
                                        {Math.round((meal.protein || 0) * 10) / 10}g P
                                      </Text>
                                    </View>
                                    
                                    <View style={{ 
                                      backgroundColor: '#dbeafe', 
                                      paddingHorizontal: 8, 
                                      paddingVertical: 3, 
                                      borderRadius: 12,
                                      minWidth: 45
                                    }}>
                                      <Text style={{ 
                                        fontSize: 10, 
                                        color: '#1e40af', 
                                        fontWeight: '600',
                                        textAlign: 'center'
                                      }}>
                                        {Math.round((meal.carbs || 0) * 10) / 10}g C
                                      </Text>
                                    </View>
                                    
                                    <View style={{ 
                                      backgroundColor: '#f0fdf4', 
                                      paddingHorizontal: 8, 
                                      paddingVertical: 3, 
                                      borderRadius: 12,
                                      minWidth: 45
                                    }}>
                                      <Text style={{ 
                                        fontSize: 10, 
                                        color: '#166534', 
                                        fontWeight: '600',
                                        textAlign: 'center'
                                      }}>
                                        {Math.round((meal.fat || 0) * 10) / 10}g F
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                                
                                <View style={{ alignItems: 'flex-end' }}>
                                  <Text style={{ 
                                    fontSize: 11, 
                                    color: '#64748b',
                                    textAlign: 'right'
                                  }}>
                                    {new Date(meal.date).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      ))}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={{
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: '#64748b',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center'
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>←</Text>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
