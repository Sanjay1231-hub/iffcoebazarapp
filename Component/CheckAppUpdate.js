import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  BackHandler,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';

const CheckAppUpdate = () => {
  const [visible, setVisible] = useState(false);
  const [updateType, setUpdateType] = useState('optional'); // force | optional
  const [storeUrl, setStoreUrl] = useState('');

  const checkStoreUpdate = async () => {
    try {
        const installedVersionCode =
        Constants.expoConfig?.android?.versionCode ?? 0;

        const postData = {
        token: 'IEBL0001',
        apiId: '54',
        inApiParameters: [],
        };

        const response = await fetch('https://ebazarapi.iffco.in/API', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(postData),
        });

        if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
        }

        const result = await response.json();
        //console.log('installed Version:', installedVersionCode);
        //console.log('API parsed response:', result);

        // ✅ Extract data from output array
        const output = result.output;

        if (!Array.isArray(output) || output.length === 0) {
        throw new Error('Unexpected API format: output is empty');
        }

        const latestVersionCode = Number(output[0].LATEST_VERSION_CD);
        const minVersionCode = Number(output[0].MIN_VERSION_CD);

          // console.log('API minVersionCode response:', minVersionCode);
          //   console.log('API latestVersionCode response:', latestVersionCode);
          //   console.log('API installedVersionCode response:', installedVersionCode);

        const appId = Constants.expoConfig.android?.package;
        const playStoreUrl = `https://play.google.com/store/apps/details?id=${appId}`;

        if (installedVersionCode < minVersionCode) {
            // 🔴 FORCE UPDATE
            setUpdateType('force');
            setStoreUrl(playStoreUrl);
            setVisible(true);
            } else if (installedVersionCode < latestVersionCode) {
                // 🟡 OPTIONAL UPDATE
                setUpdateType('optional');
                setStoreUrl(playStoreUrl);
                setVisible(true);
            }
        } catch (error) {
          //console.log('Update check error:', error.message);
        }
    };

  const handleUpdate = async () => {
    try {
      await Linking.openURL(storeUrl);
    } catch (_) {}
  };

  // 🔒 Disable back button for FORCE update
  useEffect(() => {
    if (updateType === 'force' && visible) {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true
      );
      return () => backHandler.remove();
    }
  }, [visible, updateType]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      checkStoreUpdate();
    }
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (updateType !== 'force') setVisible(false);
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Update Available</Text>

          <Text style={styles.message}>
            {updateType === 'force'
              ? 'You must update the app to continue using it.'
              : 'A newer version of the app is available. Please update for the best experience.'}
          </Text>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdate}
          >
            <Text style={styles.updateText}>Update Now</Text>
          </TouchableOpacity>

          {updateType === 'optional' && (
            <TouchableOpacity
              style={styles.laterButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CheckAppUpdate;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '82%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#f85931',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    color: '#374151',
    marginBottom: 20,
  },
  updateButton: {
    width: '100%',
    backgroundColor: '#f09850',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  laterButton: {
    marginTop: 12,
  },
  laterText: {
    color: '#6B7280',
    fontSize: 14,
  },
});

