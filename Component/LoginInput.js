import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LoginInput = ({
  placeholder,
  secureTextEntry,
  iconName,
  style,
  value,
  onChangeText,
  placeholderTextColor,
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      <Ionicons name={iconName} size={20} style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={placeholderTextColor}
        style={styles.input}
        maxLength={6} // Set max length to 6 characters
      />
    </View>
  );
};

const Passwordinput = ({
  placeholder,
  iconName,
  style,
  value,
  onChangeText,
  placeholderTextColor,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.inputContainer, style]}>
      <Ionicons name={iconName} size={20} style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        secureTextEntry={!showPassword}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={placeholderTextColor}
        style={styles.input}
      />
      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        <Ionicons
          name={showPassword ? 'eye-outline' : 'eye-off-outline'}
          size={20}
          color="#a3a3a3"
          style={styles.eyeIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
      inputContainer: {    
      flexDirection: 'row',
      alignItems: 'center',   
    },
    icon: {
      marginRight: 10,
      color: '#a3a3a3',
    },
    input: {
      flex: 1,
      height: 36,
      fontSize: 14, 
      letterSpacing: 0.3,
    },
  
});

export { LoginInput, Passwordinput };

