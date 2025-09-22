import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import { SafeAreaView, AppState, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import AppNavigator from './AppNavigator';
import LoginPage from './Screens/LoginPage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTO_LOGOUT_TIME = 40 * 60 * 1000; // 40 minutes

const App = () => { 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const logoutTimer = useRef(null);
  const appState = useRef(AppState.currentState);

  // // Function to handle logout
  // const handleLogout = useCallback(() => {
  //   //console.log('User logged out due to inactivity.');
  //   setIsLoggedIn(false);
  //   setUserType(null);
  // }, []);

  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.clear(); // Clears all data from AsyncStorage
      //console.log('AsyncStorage cleared. User logged out.');  
      setIsLoggedIn(false);
      setUserType(null); 
  
    } catch (error) {
      //console.error('Error during logout:', error);
      Alert.alert('Logout Failed', 'Something went wrong while logging out.');
    }
  }, []);

  // Function to reset logout timer
  const resetTimer = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    logoutTimer.current = setTimeout(handleLogout, AUTO_LOGOUT_TIME);
    //console.log('Timer reset'); // Debugging log
  }, [handleLogout]);

  // Function to handle login
  const handleLogin = useCallback((type) => {
    setUserType(type);
    setIsLoggedIn(true);
    resetTimer(); // Reset the logout timer on login
  }, [resetTimer]);

  // Detect app going to background & logout
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/active/) && nextAppState === 'background') {
        //console.log('App went to background.');
        logoutTimer.current = setTimeout(() => {
          if (AppState.currentState === 'background') {
            //console.log('Logging out due to background state.');
            handleLogout();
          }
        }, 60000); // 60 seconds delay before logout
      } else if (nextAppState === 'active') {
        //console.log('App came back to foreground. Resetting timer.');
        if (logoutTimer.current) clearTimeout(logoutTimer.current);
        resetTimer();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
    };
  }, [handleLogout, resetTimer]);

  return (
    <SafeAreaProvider>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss(); // Hide keyboard when tapping outside
          resetTimer(); // Reset inactivity timer
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {!isLoggedIn ? (
            <LoginPage onLogin={handleLogin} />
          ) : (
            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={resetTimer}>
              <AppNavigator onLogout={handleLogout} userType={userType} />
            </TouchableOpacity>
          )}
          {/* <StatusBar style="auto" /> */}
          {/* 👇 Status bar settings for edge-to-edge */}
          <StatusBar
              translucent
              backgroundColor="transparent"
              style={Platform.OS === 'android' ? 'dark' : 'auto'}
            />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
};

export default App;
