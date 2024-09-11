import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Home from './Screens/Home'; // Import your home screen
import EmployeeDirectory from './Screens/EmployeeDirectory';
import EmployeeDetails from './Screens/EmployeeDetails';
import Profile from './Screens/Profile';
import Create from './Screens/Create';




const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home"  screenOptions={{
          headerStyle: {
            backgroundColor: '#5c6cf5', // Background color
          },
          headerTintColor: '#fff', // Header text color
          headerTitleStyle: {
            fontWeight: 300,
          },
        }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="EmployeeDirectory" component={EmployeeDirectory} />
        <Stack.Screen name="EmployeeDetails" component={EmployeeDetails} />
        <Stack.Screen name="Profile" component={Profile} />  
        <Stack.Screen name="Create" component={Create} />  
       
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
