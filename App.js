import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import AppNavigator from './AppNavigator';
import LoginPage from './Screens/LoginPage';


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {isLoggedIn ? (
        <AppNavigator /> // Render AppNavigator when logged in
      ) : (
        <LoginPage onLogin={handleLogin} /> // Pass handleLogin function to LoginPage
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

// Optional: You can define styles if you need them
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
