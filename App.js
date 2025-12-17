import { setStatusBarTranslucent, setStatusBarStyle } from 'expo-status-bar';
import 'react-native-gesture-handler';
import { AppState, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Platform, View, Text, StatusBar, Button, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import AppNavigator from './AppNavigator';
import LoginPage from './Screens/LoginPage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertWithIcon from './Component/AlertWithIcon';
import CkeckUpdate from './Component/CheckUpdate';
import ErrorBoundary from './Component/ErrorBoundary';

const AUTO_LOGOUT_TIME = 40 * 60 * 1000; // 40 minutes
const TOKEN_STORAGE_KEY = 'ExponentPushToken[p1hZtFJkkse7DWBFkO_9rI]';


// --- Safe native module imports ---
let NotificationsModule, DeviceModule;
try {
  NotificationsModule = require('expo-notifications');
  DeviceModule = require('expo-device');
} catch (e) {
  NotificationsModule = null;
  DeviceModule = null;
}

const App = () => { 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState(null);
  //const [expoPushToken, setExpoPushToken] = useState('ExponentPushToken[p1hZtFJkkse7DWBFkO_8rI]');// expo update notification token

  const logoutTimer = useRef(null);
  const appState = useRef(AppState.currentState);
    const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });


  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.clear(); // Clears all data from AsyncStorage
      //console.log('AsyncStorage cleared. User logged out.');  
      setIsLoggedIn(false);
      setUserType(null); 
  
    } catch (error) {
      //console.error('Error during logout:', error);
      //Alert.alert('Logout Failed', 'Something went wrong while logging out.');
    }
  }, []);

  // Function to reset logout timer
  const resetTimer = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    logoutTimer.current = setTimeout(handleLogout, AUTO_LOGOUT_TIME);
    //console.log('Timer reset'); // Debugging log
  }, [handleLogout]);

  // Function to handle login
  const handleLogin = useCallback(async (type) => {
     // Store logged-in username and user type
  const storedUsername = await AsyncStorage.getItem('username');
  if (!storedUsername) return; // Make sure username exists


    // if (expoPushToken) {
    //   saveTokenToBackend(expoPushToken);
    // }
    setUserType(type);
    setIsLoggedIn(true);
    resetTimer(); // Reset the logout timer on login

    // Save token only after login is confirmed
  if (expoPushToken) {
    await saveTokenToBackend(expoPushToken);
  }



  }, [expoPushToken, resetTimer]);

  
  useEffect(() => {
    if (Platform.OS === 'android') {
      setStatusBarTranslucent(true);
    }
    setStatusBarStyle('dark');
  }, []);

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

  

  // put this near the top of your file (only once)
// ensure NotificationsModule exists before calling this
if (NotificationsModule) {
  NotificationsModule.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

useEffect(() => {
  let notifListener = null;
  let responseListener = null;
  // guard to avoid scheduling -> receive -> schedule infinite loop
  const foregroundNotificationGuard = { showing: false };

  const registerPush = async () => {
    if (!NotificationsModule || !DeviceModule || !DeviceModule.isDevice) {
      //console.log('Push notifications skipped in Expo Go or simulator');
      return;
    }

    try {
      // ask permission
      const { status: existingStatus } = await NotificationsModule.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await NotificationsModule.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        //console.log('Push permission not granted');
        return;
      }

      // get token
      const token = (await NotificationsModule.getExpoPushTokenAsync()).data;
      //console.log('Expo Push Token:', token);
      setExpoPushToken(token);
      //await saveTokenToBackend(token);

      // Android channel
       if (Platform.OS === 'android') {
          Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            sound: 'default', // 👈 ensures sound plays
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

      // foreground: show a system notification (but avoid loop)
      notifListener = NotificationsModule.addNotificationReceivedListener(async (notif) => {
        try {
          //console.log('Received notification (foreground):', notif);

          // if we just scheduled a local notification, skip to avoid loop
          if (foregroundNotificationGuard.showing) {
            // reset the guard and skip
            foregroundNotificationGuard.showing = false;
            return;
          }

          // set guard so the immediate local notification we schedule does not re-enter this block
          foregroundNotificationGuard.showing = true;

          // schedule a local notification to present immediately (replacement for presentNotificationAsync)
          await NotificationsModule.scheduleNotificationAsync({
            content: {
              title: notif.request.content.title ?? 'Notification',
              body: notif.request.content.body ?? '',
              data: notif.request.content.data ?? {},
            },
            trigger: null, // present immediately
          });
        } catch (err) {
          //console.warn('Error while presenting foreground notification', err);
          // make sure guard is reset to avoid blocking future notifications
          foregroundNotificationGuard.showing = false;
        }
      });

      // tap on notification: handle navigation
     responseListener = NotificationsModule.addNotificationResponseReceivedListener((response) => {
        try {
          //console.log('User tapped notification:', response);

          const screen = response.notification.request.content.data?.screen;

          if (screen && AppNavigator.navigationRef?.current) {
            AppNavigator.navigationRef.current.navigate(screen);
          }
        } catch (navErr) {
          //console.warn('Navigation on notification tap failed', navErr);
        }
      });

    } catch (e) {
      //console.warn('registerPush error', e);
    }
  };

  registerPush();

  // cleanup
  return () => {
    try {
      if (notifListener?.remove) notifListener.remove();
      else if (notifListener) NotificationsModule.removeNotificationSubscription(notifListener);
    } catch (e) {}
    try {
      if (responseListener?.remove) responseListener.remove();
      else if (responseListener) NotificationsModule.removeNotificationSubscription(responseListener);
    } catch (e) {}
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  const saveTokenToBackend = async (token) => {
    if (!token) return;

    const loggedUser = await AsyncStorage.getItem('username');
    if (!loggedUser) {
      setTimeout(() => saveTokenToBackend(token), 2000);
      return;
    }

    try {
      const lastToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (lastToken === token) return; // Already sent

      const payload = {
        inApiParameters: [
          { label: 'P_PERSONAL_NO', value: loggedUser },
          { label: 'P_DEVICE_TOKEN', value: token },
          { label: 'P_DEVICE_TYPE', value: Platform.OS === 'android' ? 'ANDROID' : 'IOS' },
        ],
        apiId: '50',
        token: 'IEBL0001',
      };

      const response = await fetch('https://ebazarapi.iffco.in/API', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ReactNativeApp/1.0',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Server returned: ${response.status}`);

      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
       //Alert.alert("Token successfully saved.", token);
      //console.log('Token successfully saved:', token);
    } catch (error) {
      //console.log('Error saving token:', error);
    }
  };



  return (
    // <ErrorBoundary>

  
    // <SafeAreaProvider>
    //   <TouchableWithoutFeedback
    //     onPress={() => {
    //       Keyboard.dismiss(); // Hide keyboard when tapping outside
    //       resetTimer(); // Reset inactivity timer
    //     }}
    //   >
       
    //     <SafeAreaView style={{ flex: 1 }}>
    //       {!isLoggedIn ? (
    //         <LoginPage onLogin={handleLogin} />
            
    //       ) : (
    //         <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={resetTimer}>
    //           <AppNavigator onLogout={handleLogout} userType={userType} />
               
                
    //         </TouchableOpacity>
            
    //       )}          
         
    //           <CkeckUpdate/>

    //       <AlertWithIcon
    //         visible={alert.visible}
    //         title={alert.title}
    //         message={alert.message}
    //         type={alert.type}
    //         onClose={() => setAlert({ ...alert, visible: false })}
    //       />
    //     </SafeAreaView>
       
    //   </TouchableWithoutFeedback>
    // </SafeAreaProvider>
    //   </ErrorBoundary>

    <SafeAreaProvider>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); resetTimer(); }}>
        <View style={{ flex: 1 }}>
          {!isLoggedIn ? (
            <LoginPage onLogin={handleLogin} />
          ) : (
            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={resetTimer}>
              <AppNavigator onLogout={handleLogout} userType={userType} />
            </TouchableOpacity>
          )}

          <CkeckUpdate />

          <AlertWithIcon
            visible={alert.visible}
            title={alert.title}
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ ...alert, visible: false })}
          />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>

  );
};

export default App;


