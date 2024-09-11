import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ImageBackground } from 'react-native';


const ButtonWithImage = ({ onPress, title }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <ImageBackground
        source={require('../assets/book.png')} // Update the path to your image
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 80,  // Adjust the width as needed
    height: 80,  // Adjust the height as needed
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'cover',
  },
  imageStyle: {
    borderRadius: 10,  // Optional: add rounded corners to the image
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ButtonWithImage;
