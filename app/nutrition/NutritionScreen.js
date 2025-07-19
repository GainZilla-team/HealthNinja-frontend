import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker'; // install via expo install @react-native-picker/picker
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from './NutritionStyles';
import PrimaryButton from '../../components/ui/PrimaryButton';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export default function NutritionScreen() {
  const router = useRouter();

  const [query, setQuery] = useState('');
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
      const res = await fetch(`${BASE_URL}/api/fatsecret/search?query=${encodeURIComponent(query)}`);
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
      const mealData = {
        name: meal.food_name,
        calories: parseFloat(meal.servings.serving.calories),
        protein: parseFloat(meal.servings.serving.protein),
        carbs: parseFloat(meal.servings.serving.carbohydrate),
        fat: parseFloat(meal.servings.serving.fat),
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
    <View style={styles.container}>
<<<<<<< HEAD
      <ScrollView contentContainerStyle={styles.container}>
=======
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter food (e.g., 2 eggs and toast)"
        value={query}
        onChangeText={setQuery}
      />
      <PrimaryButton title="Get Nutrition Info" onPress={fetchNutrition} />
>>>>>>> 1891cbf84e2b0a23bac12f9b124f6dcccf4e3de7

        {/* Search Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter food (e.g., chicken breast)"
          value={query}
          onChangeText={setQuery}
        />
        <Button title="Get Nutrition Info" onPress={fetchNutrition} />

        {/* Picker for meal type */}
        <Text style={{ marginTop: 20 }}>Select meal type:</Text>
        <Picker
          selectedValue={mealType}
          onValueChange={(itemValue) => setMealType(itemValue)}
          style={{ width: '100%', marginVertical: 10 }}
        >
          <Picker.Item label="Breakfast" value="breakfast" />
          <Picker.Item label="Lunch" value="lunch" />
          <Picker.Item label="Dinner" value="dinner" />
          <Picker.Item label="Snack" value="snack" />
        </Picker>

        {/* Loading and Error for Search */}
        {loadingSearch && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />}
        {searchError && <Text style={styles.error}>{searchError}</Text>}

        {/* Search Results */}
        {searchResults && searchResults.length > 0 && (
          <View style={styles.resultContainer}>
            {searchResults.map((item, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.title}>{item.food_name}</Text>
                {item.servings?.serving && (
                  <>
                    <Text>Calories: {item.servings.serving.calories}</Text>
                    <Text>Protein: {item.servings.serving.protein}g</Text>
                    <Text>Carbs: {item.servings.serving.carbohydrate}g</Text>
                    <Text>Fat: {item.servings.serving.fat}g</Text>
                    <TouchableOpacity
                      onPress={() => logMeal(item)}
                      disabled={loggingMeal}
                      style={{ marginTop: 5, backgroundColor: '#007AFF', padding: 5, borderRadius: 4 }}
                    >
                      <Text style={{ color: 'white' }}>{loggingMeal ? 'Logging...' : 'Log this meal'}</Text>
                    </TouchableOpacity>
                    {logError && <Text style={styles.error}>{logError}</Text>}
                  </>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Logged Meals Section */}
        <Text style={[styles.title, { marginTop: 20 }]}>Your Logged Meals</Text>
        {loadingMeals && <ActivityIndicator size="small" color="#555" />}
        {mealsError && <Text style={styles.error}>{mealsError}</Text>}
        {loggedMeals.length === 0 && !loadingMeals && <Text>No meals logged yet.</Text>}
        {loggedMeals.map((meal) => (
          <View key={meal._id} style={styles.item}>
            <Text style={styles.title}>{meal.name}</Text>
            <Text>Calories: {meal.calories}</Text>
            <Text>Protein: {meal.protein}g</Text>
            <Text>Carbs: {meal.carbs}g</Text>
            <Text>Fat: {meal.fat}g</Text>
            <Text>Meal Type: {meal.mealType}</Text>
            <Text>Date: {new Date(meal.date).toLocaleString()}</Text>
          </View>
        ))}
        <ScrollView>
    {Object.entries(groupedMeals).map(([date, mealsByType]) => {
      // Flatten all meals for daily summary
      const allMealsForDay = Object.values(mealsByType).flat();
      const summary = calculateDailySummary(allMealsForDay);

      return (
        <View key={date} style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{date}</Text>

          <Text>🔸 Daily Summary:</Text>
          <Text>Calories: {summary.calories}</Text>
          <Text>Protein: {summary.protein}g</Text>
          <Text>Carbs: {summary.carbs}g</Text>
          <Text>Fat: {summary.fat}g</Text>

          {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
            mealsByType[mealType] && (
              <View key={mealType} style={{ marginTop: 10 }}>
                <Text style={{ fontWeight: '600' }}>{mealType.toUpperCase()}</Text>
                {mealsByType[mealType].map(meal => (
                  <View key={meal._id} style={{ paddingLeft: 10 }}>
                    <Text>{meal.name} - {meal.calories} kcal</Text>
                    <Text>Protein: {meal.protein}g | Carbs: {meal.carbs}g | Fat: {meal.fat}g</Text>
                  </View>
                ))}
              </View>
            )
          ))}
        </View>
<<<<<<< HEAD
      );
    })}
  </ScrollView>
      </ScrollView>

      <View style={styles.button}>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
=======
      )}
    </ScrollView>
    <View style={styles.button}>
          <PrimaryButton title="Go Back" onPress={() => router.back()} />
>>>>>>> 1891cbf84e2b0a23bac12f9b124f6dcccf4e3de7
    </View>
  );
}
