import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons  } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const HomeButton = ({ onPress, children, icon, title }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
   {/* <LinearGradient
      //colors={['#249cc6', '#6adde8f5']} // Gradient colors
      colors={['#1995AD', '#A1D6E2']} // Gradient colors
      //colors={['#ff994ff5', '#fc0']} // Gradient colors
      start={[0, 32]}
      end={[0, 96]}
      style={styles.gradient}
    > */}
    <View style={styles.content}>      
        {icon && <Ionicons  name={icon} size={26} color="#5966f9" style={styles.icon} />}      
        {children} 
    </View>
    {/* </LinearGradient> */}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  button: {   
    width: 60,
    height: 60,
    borderRadius: 16,
    //backgroundColor: '#5d8cd9', 
    //backgroundColor: '#6a6b94', 
    justifyContent: 'center',
    alignItems: 'center',
    // shadow settings
    //elevation: 2, // For Android shadow
    // iOS shadow settings
    //shadowColor: '#585858',
    //shadowColor: '#303030cc',
    //shadowOffset: { width: 2, height: 2 },
    //shadowOpacity: 0.8,
    //shadowRadius: 1,
    //padding: 5,
    padding: 9,
    borderRadius: 13,
    //borderWidth: 1, // Equivalent to border: 1px solid in web CSS
    borderColor: '#dfdddd',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 0, 
    fontWeight: 100,// Space between icon and text
  },
});

export default HomeButton;
