// apiService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getData = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');

    const response = await axios.get('https://192.168.91.220:7224/Auth/login', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch data', error);
    throw error; // rethrow the error so it can be handled in the calling code
  }
};
