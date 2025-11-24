import React, { useEffect, useState } from "react";
import { View, Text, Button, Modal, StyleSheet, ActivityIndicator, Platform } from "react-native";
import Constants from "expo-constants";

let InAppUpdates, IAUUpdateKind;
// if (Platform.OS === "android" && Constants.executionEnvironment !== "standalone") {
//   InAppUpdates = require("react-native-in-app-updates").default;
//   IAUUpdateKind = require("react-native-in-app-updates").IAUUpdateKind;
// }

export default function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!InAppUpdates) {
     
      setTimeout(() => {
      //console.log("✅ Update check finished");
      setChecking(false);
    }, 2000);
      return;
    }

    const inAppUpdates = new InAppUpdates(false);
    inAppUpdates.checkNeedsUpdate().then((result) => {
      if (result.shouldUpdate) setUpdateAvailable(true);
      setChecking(false);
    }).catch((err) => {
      //console.warn("Update check error:", err);
      setChecking(false);
    });
  }, []);

  const startUpdate = () => {
    if (!InAppUpdates) return;
    InAppUpdates.startUpdate({ updateType: IAUUpdateKind.IMMEDIATE });
  };

//   if (checking) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" />
//         <Text>Checking for updates...</Text>
//       </View>
//     );
//   }

  return (
    <Modal visible={updateAvailable} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.message}>
            A new version of the app is available. Please update to continue.
          </Text>
          <Button title="Update Now" onPress={startUpdate} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  message: { fontSize: 16, textAlign: "center", marginBottom: 20 },
});

