import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // If you're using linear gradients

const CustomHeader = ({ scene, previous, navigation }) => {
  const { options } = scene.descriptor;
  const title = options.headerTitle !== undefined 
    ? options.headerTitle 
    : options.title !== undefined 
    ? options.title 
    : scene.route.name;

  return (
    <LinearGradient colors={['#e0eafc', '#cfdef3']} style={styles.headerContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: 60,
    // Add linear gradient style properties here if needed
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 0.5, // Shadow opacity
    shadowRadius: 4, // Shadow blur radius
    backgroundColor: 'white', // Ensure background color to show shadow
    borderBottomWidth: 1, // Optional: border at the bottom of the header
    borderBottomColor: '#ddd', // Optional: border color
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CustomHeader;
