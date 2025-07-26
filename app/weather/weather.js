import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export const syncWeather = async (location, token) => {
  const response = await fetch(`${BASE_URL}/api/weather/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ location })
  });

  if (!response.ok) throw new Error('Failed to sync weather');
  return await response.json();
};

export const fetchLatestWeather = async (location, token) => {
  const response = await fetch(`${BASE_URL}/api/weather/latest?location=${encodeURIComponent(location)}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) throw new Error('Failed to fetch latest weather');
  return await response.json();
};
