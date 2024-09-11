import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons  } from '@expo/vector-icons';

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
      {/* <Icon name={iconName} size={25} color="#9c9c9c" style={styles.icon} /> */}
      <Ionicons  name={iconName} size={20} color="#9c9c9c" style={styles.icon} />
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
    //borderBottomWidth: 1,
    //borderBottomColor: '#fff',
    //marginVertical: 10,
    //paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
    marginLeft: -10,
  },
  input: {
    flex: 1,
    height: 36,
    fontSize: 14,
 
  },
});

export default Passwordinput;
