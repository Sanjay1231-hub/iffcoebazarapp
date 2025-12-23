export default {
  expo: {    
    name: "IffcoEbazar",   
    //name: "Iffco Ebazar App",   
    slug: "ReactProjectApp",
    //slug: "ebzbazarsoftapp",
    scheme: "exp+iffcoebazar",
    //scheme: "exp+ebzbazarsoftapp",
    version: "1.0.4",
    owner: "ebazartesting",
    //owner: "iffcoebazaritapp",
    icon: "./assets/icon01.png",
    entryPoint: "./App.js",
    userInterfaceStyle: "light",    
    // --- JavaScript Engine Configuration (Disabling Hermes) ---
    // This top-level setting applies to both platforms
    // and is crucial for EAS build to respect the change.
    jsEngine: "jsc", 
    hermes: false,
    
    // --- Splash Screen ---
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    // --- Plugins ---
    plugins: [
      "./plugins/withHermesFix.js",
      "expo-dev-client",
      "expo-notifications",
      "expo-font",
    ],

    // --- Updates and Runtime ---
    runtimeVersion: {
      policy: "appVersion"
    },
    updates: {
      url: "https://u.expo.dev/c3c8075c-04e3-47e1-b58c-19f17cf4c14d",
      //url: "https://u.expo.dev/8ac27d53-267f-451b-87b7-28c1ac75e2f1",
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
    },

    // --- iOS Configuration ---
    ios: {
      usesAppleSignIn: true,
      supportsTablet: true,
      bundleIdentifier: "com.iffcoebazar.ebazar",
      //bundleIdentifier: "com.iffcoebazar.bazarsoft",
      buildNumber: "1.0.4",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "We need your location to show nearby places",
        NSLocationAlwaysUsageDescription: "We need your location for continuous tracking",
        UIBackgroundModes: ["remote-notification"],
        NSMicrophoneUsageDescription: "This app needs access to your microphone for voice recognition.",
      },
    },

    // --- Android Configuration ---
    android: {
      // Build Settings
      compileSdkVersion: 35,
      targetSdkVersion: 35,
      minSdkVersion: 24,
      versionCode: 14,
      //versionCode: 1,
      package: "com.iffcoebazar.ebazar",
      //package: "com.iffcoebazar.bazarsoft",

      // **NOTE:** You don't need to repeat jsEngine/hermes here since it's set at the top level, 
      // but keeping it for redundancy doesn't hurt.
      jsEngine: "jsc", // Redundant but explicit confirmation
      hermes: false,   // Redundant but explicit confirmation

     
      permissions: [
        "INTERNET",
        "RECORD_AUDIO",
        "POST_NOTIFICATIONS",
        "VIBRATE",
        "CAMERA"
      ],

      webView: {
        geolocationEnabled: true
      },

      // Icons and Notifications
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      useNextNotificationsApi: true,
      googleServicesFile: "./google-services.json",
      notification: {
        icon: "./assets/notification-icon.png",
        color: "#008000",
        channelId: "default",
      },

      // Build Optimization
      enableProguardInReleaseBuilds: true,
      enableShrinkResourcesInReleaseBuilds: true,
      enableEdgeToEdge: true,
      allowBackup: false,
    },

    // --- Web Configuration ---
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },

    // --- Extra Configuration ---
    extra: {
      //apiUrl: process.env.API_URL || 'https://mappws.iffco.coop/ebazarapi',
      apiUrl: process.env.API_URL || 'https://ebazarapi.iffco.in/API',
      eas: {
        projectId: "c3c8075c-04e3-47e1-b58c-19f17cf4c14d"
        //projectId: "8ac27d53-267f-451b-87b7-28c1ac75e2f1"
      },
    },

    // --- Doctor Configuration ---
    doctor: {
      reactNativeDirectoryCheck: {
        listUnknownPackages: false
      }
    }
  }
};