import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Header = () => {
  const [username, setUsername] = useState('');
  //const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        //const storedEmail = await AsyncStorage.getItem('email');

        if (storedUsername !== null) setUsername(storedUsername);
        //if (storedEmail !== null) setEmail(storedEmail);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.header}>
      <Text style={styles.username}>Hello, {username}!</Text>
      {/* <Text style={styles.email}>{email}</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    padding: 15,
    backgroundColor: '#4c669f',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  username: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#fff',
  },
});

export default Header;
