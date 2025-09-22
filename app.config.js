export default {
  expo: {
    name: "IffcoEbazar",
    //slug: "iffcoebazar",
    slug: "ReactProjectApp",
    scheme: "exp+iffcoebazar",
    version: "1.0.1",
    owner: "ebazartesting",
    //orientation: "portrait",
    icon: "./assets/icon01.png",
    entryPoint: "./App.js",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    plugins: [
      "expo-speech-recognition",
      "expo-asset"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.iffcoebazar.ebazar",
      //bundleIdentifier: "com.application.iffcoebazar",
      buildNumber: "1.0.1",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "We need your location to show nearby places",
        NSLocationAlwaysUsageDescription: "We need your location for continuous tracking",
      },
      jsEngine: "jsc" // Disable Hermes by switching to JSC engine // Disabled Hermes for iOS
    },
    android: {
      targetSdkVersion: 35,
      versionCode: 7,
      package: "com.iffcoebazar.ebazar",
      //package: "com.application.iffcoebazar", // Add your unique Android package name here
      permissions: [
         "READ_EXTERNAL_STORAGE", // Required to select images/PDFs from device
        "WRITE_EXTERNAL_STORAGE" // Sometimes needed for file copy/cache (may be auto-ignored on Android 11+)
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },   
      enableProguardInReleaseBuilds: true,   // ✅ shrink + obfuscate
      enableShrinkResourcesInReleaseBuilds: true,  // ✅ remove unused resources
      allowBackup: false,
      hermes: false,  // Disable Hermes completely
      jsEngine: "jsc" // Disable Hermes by switching to JSC engine // Disabled Hermes for Android
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },    
    extra: {
      apiUrl: process.env.API_URL || 'https://mappws.iffco.coop/ebazarapi',
      eas: {
        projectId: "c3c8075c-04e3-47e1-b58c-19f17cf4c14d",
        //projectId: "03158572-ce81-4e33-a8b2-5ebabac2cfd8",
      },
    },
    doctor: {
    reactNativeDirectoryCheck: {
      listUnknownPackages: false
    }
  }
  }, 
};
