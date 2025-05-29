import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Button, ScrollView, Text, TextInput, View } from 'react-native';
import styles from './NutritionStyles';

export default function NutritionScreen() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNutrition = () => {
    setLoading(true);
    setError(null);
    setResult(null);

    fetch(`https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
      headers: {
        'X-Api-Key': 'OevZb6IUwgrCKIScIgXLCQ==23OOJsYliUs2zcOj'
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch nutrition info');
        }
        return response.json();
      })
      .then((data) => {
        if (data.length === 0) {
          setError('No results found for your input.');
        } else { 
          setResult(data);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Unknown error occurred.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

    const router = useRouter();

  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter food (e.g., 2 eggs and toast)"
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Get Nutrition Info" onPress={fetchNutrition} />

      {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {result && result.length > 0 && (
        <View style={styles.resultContainer}>
          {result.map((item, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.title}>{item.name}</Text>
              <Text>Calories: {item.calories}</Text>
              <Text>Protein: {item.protein_g}g</Text>
              <Text>Carbs: {item.carbohydrates_total_g}g</Text>
              <Text>Fat: {item.fat_total_g}g</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
    <View style={styles.button}>
          <Button title="Go Back" onPress={() => router.back()} />
    </View>
  </View>
  );
}

/*const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  resultContainer: {
    marginTop: 20,
  },
  item: {
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
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
});*/