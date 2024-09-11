import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, Platform, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginInput from '../Component/LoginInput';
import Passwordinput from '../Component/Passwordinput';
import Constants from 'expo-constants';

const LoginPage = ({ onLogin }) => {

const apiUrl = Constants.expoConfig.extra.apiUrl;

console.log(`API URL: ${apiUrl}`);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    //const url = 'https://reactapi.iffco.coop/Auth/login';    
    const buildUrl = (baseUrl, endpoint) => {
      return `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
    };
  
    // Construct the login URL
    const url = buildUrl(apiUrl, 'Auth/login');
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        // Handle non-2xx responses
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      await AsyncStorage.setItem('username', username);
      //await AsyncStorage.setItem('email', user.email);
      
      const data = await response.json();
      console.log(data);
      const token = data.token;

      await AsyncStorage.setItem('userToken', token);

      Alert.alert('Success', 'Login successful');
      onLogin();
    } catch (error) {
      //console.error('Login error', error);
      if (error.message.includes('401')) {
        if (Platform.OS === 'web') {
          window.alert('The username or password you entered is incorrect.');
        } else {
          Alert.alert('Invalid Credentials', 'The username or password you entered is incorrect.');
        }
      } else {
        if (Platform.OS === 'web') {
          window.alert('Something went wrong. Please try again.');
        } else {
          Alert.alert('Error', 'Something went wrong. Please try again.');
        }
      }
    }
  };

  return (
    <ImageBackground
      source={require('../assets/LoginBG02.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={require('../assets/iffco-logo.png')} 
        />
      </View>
      <View>
      <Text style={styles.title}>Welcome To</Text>
      <Text style={styles.title1}>BazarSoft</Text>
      </View>
    
      <View style={styles.container}>
       
        <LoginInput 
          placeholder="Username" 
          //iconName="user"
          iconName="person-outline"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#cbcbcb"
        />
        <Passwordinput
          style={styles.input}
          placeholder="Password"          
          //iconName="lock"
          iconName="lock-closed-outline"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#cbcbcb"
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>    
          <Text style={styles.loginButtonText}>Login</Text>     
        </TouchableOpacity>
        <TouchableOpacity style={styles.forgotPasswordButton}>
          <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
        </TouchableOpacity>
        <View style={styles.socialLoginContainer}>
          <Text style={styles.socialLoginText}>or connect with</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButtonFacebook}>
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButtonTwitter}>
              <Text style={styles.socialButtonText}>Twitter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent:'flex-start',
    alignItems: 'center',
  },
  Image: {
    width: '30%',
  },
  container: {
    width: '80%',
    //backgroundColor: '#d6f4ffb3',
    //backgroundColor: '#b3b8e58a',
    backgroundColor: '#00000024',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 1,
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 30,
    marginBottom: 0,
    color: '#fff', 
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    fontfamily: 'sans-serif',
  },
  title1: {
    fontSize: 40,
    marginBottom: 20,
    color: '#ecac57',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    fontfamily: 'sans-serif',

  },
  input: {
    width: '100%',
    height: 39,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loginButton: {
    width: '100%',
    height: 39,
    //backgroundColor: '#4c669f',
    backgroundColor: '#5c6cf5',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,   
  },
  forgotPasswordButton: {
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: 14,
  },
  socialLoginContainer: {
    alignItems: 'center',
  },
  socialLoginText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 15,
  },
  socialButtons: {
    flexDirection: 'row',
  },
  socialButtonFacebook: {
    backgroundColor: '#3b5998',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
  },
  socialButtonTwitter: {
    backgroundColor: '#1DA1F2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LoginPage;
