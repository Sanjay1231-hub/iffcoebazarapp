import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons  } from '@expo/vector-icons';

const LoginInput = ({
  placeholder,
  secureTextEntry,
  iconName,
  style,
  value,
  onChangeText,
  placeholderTextColor
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      <Ionicons  name={iconName} size={20} style={styles.icon} />
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
  secureTextEntry,
  iconName,
  style,
  value,
  onChangeText,
  placeholderTextColor
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      <Ionicons  name={iconName} size={20} style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={placeholderTextColor}
        style={styles.input}        
      />
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
    },
  });

export { LoginInput, Passwordinput };
