import React, { useEffect, useState } from 'react';
import { Alert, Linking, Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';

let Updates;

try {
  // Only load expo-updates if it's available (custom dev client / production)
  if (!Constants.expoConfig || Constants.expoConfig?.extra?.eas?.projectId) {
    Updates = require('expo-updates');
  }
} catch (err) {
  //console.log('expo-updates is not available in Expo Go');
}

const CkeckUpdate = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [storeUpdateUrl, setStoreUpdateUrl] = useState('');

  // // Check OTA updates (only in custom client or production)
  // const checkOTAUpdate = async () => {
  //   if (!Updates) {
  //     //console.log('Skipping OTA update check in Expo Go');
  //     return;
  //   }
  //   try {
  //     const update = await Updates.checkForUpdateAsync();
  //     if (update.isAvailable) {
  //       await Updates.fetchUpdateAsync();
  //       setModalVisible(true);
  //     }
  //   } catch (err) {
  //     //console.log('Error checking OTA update:', err);
  //   }
  // };

  // // Check Play Store / Native update
  // const checkStoreUpdate = async () => { 
  //   try {    
  //     const installedVersion = Constants.expoConfig.version || '0.0.0';
  //     //console.log("installed version is", installedVersion);   
       
  //     const latestVersion = '1.0.4';
  //     const appId = Constants.expoConfig.android?.package;
  //      //console.log("Application id/package name", appId);

  //      const normalizeVersion = (v) =>
  //       v.split(".").map(n => n.padStart(2, "0")).join("");

  //     if (normalizeVersion(installedVersion) < normalizeVersion(latestVersion)) {     
  //       setStoreUpdateUrl(`https://play.google.com/store/apps/details?id=${appId}`);
  //       setModalVisible(true);
  //     }
  //   } catch (err) {
  //     //console.log('Error checking store version:', err);
  //   }
  // };

  const checkStoreUpdate = async () => {
    try {
      const installedVersionCode =
        Constants.expoConfig?.android?.versionCode ?? 0;

      // 🔴 Fetch this from API in real apps
      const latestVersionCode = 13;

      if (installedVersionCode < latestVersionCode) {
        const appId = Constants.expoConfig.android?.package;
        setStoreUpdateUrl(
          `https://play.google.com/store/apps/details?id=${appId}`
        );
        setModalVisible(true);
      }
    } catch (e) {
      console.log('Update check error', e);
    }
  };

   const handleUpdate = () => {
    if (storeUpdateUrl) {
      Linking.openURL(storeUpdateUrl).catch(err => console.log('Failed to open store URL', err));
    } else if (Updates) {
      Updates.fetchUpdateAsync()
        .then(() => Updates.reloadAsync())
        .catch(err => console.log('Failed to fetch OTA update', err));
    }
    setModalVisible(false);
  };

  useEffect(() => {
    //checkOTAUpdate();
    checkStoreUpdate();
  }, []);

  return (
    // <Modal transparent visible={modalVisible} animationType="fade">
    //   <View style={styles.modalContainer}>
    //     <View style={styles.modalContent}>
    //       <Text style={styles.title}>Update Available</Text>
    //       <Text style={styles.message}>{updateMessage}</Text>
    //       <View style={styles.buttonsRow}>
    //         <TouchableOpacity
    //           style={[styles.button, { backgroundColor: '#f38e60ff' }]}
    //           onPress={handleUpdate}
    //         >
    //         <Text style={[styles.buttonText, { color: '#ffffffff',}]}>Update Now</Text>
    //         </TouchableOpacity>
    //         {/* <TouchableOpacity
    //           style={[styles.button, { backgroundColor: '#7e7e7eff' }]}
    //           onPress={() => setModalVisible(false)}
    //         >
    //           <Text style={[styles.buttonText, { color: '#ffffffff',}]}>Later</Text>
    //         </TouchableOpacity> */}
    //       </View>
    //     </View>
    //   </View>
    // </Modal>

    
    <Modal
      animationType="fade"
      transparent
      visible={modalVisible}
      onRequestClose={() => {
        //console.log('Update required, cannot dismiss.');
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Update Required</Text>
          <Text style={styles.modalText}>
           A new version is available on Play Store.
          </Text>
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.updateButtonText}>Update Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CkeckUpdate;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '75%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
     //borderWidth: 1, 
    borderColor: '#bbbbbbff',
  },
  buttonText: {  
    fontSize: 15,  
    fontWeight: '500',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    width: '80%',
  },
  modalTitle: {
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
    color: '#f85931ff',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 15,
    color: '#374151',
  },
  updateButton: {
    backgroundColor: '#f09850ff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    elevation: 2,
    minWidth: '70%',
  },
  updateButtonText: {
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 15,
  },
});