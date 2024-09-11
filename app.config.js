import { config as dotenvConfig } from 'dotenv';

// Load environment variables from .env file
dotenvConfig();

export default {
  expo: {
    name: "ReactProjectApp",
    slug: "ReactProjectApp",
    version: "1.0.0",
    owner: "ebazartesting",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.ebazaar.ReactProjectApp" // Add your unique Android package name here
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    
    extra: {
      apiUrl: process.env.API_URL || 'https://reactapi.iffco.coop',
      //apiKey: process.env.API_KEY || 'default-api-key',
      eas: {
        projectId: "c3c8075c-04e3-47e1-b58c-19f17cf4c14d"
      }
    },
    plugins: [
      "expo-router"
    ]
  }
};
