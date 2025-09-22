import React, { useState } from 'react';
import { Pressable, Text, Image, View, Alert, StyleSheet, Button, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from 'react-native-vector-icons';  // Import Ionicons for button icons

const ImagePickerUploader = () => {
  const [imageBase64, setImageBase64] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [loading, setLoading] = useState(false);


  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        // if (file.size > 32 * 1024) {
        //   Alert.alert('Image must be smaller than 32 KB');
        //   return;
        // }

        setFileUri(file.uri);
        setFileSize(file.size);

        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        setImageBase64(base64);
      } else {
        Alert.alert('No image selected');
      }
    } catch (error) {
      //console.error('Error picking image:', error);
      Alert.alert('Error occurred while picking image');
    }
  };
  

  const CHUNK_SIZE = 32000; // ~100KB, adjust based on server limits

function splitBase64IntoChunks(base64String) {
  const chunks = [];
  for (let i = 0; i < base64String.length; i += CHUNK_SIZE) {
    chunks.push(base64String.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}


const uploadImage = async () => {
  try {
    setLoading(true); // Start loader

    const chunks = splitBase64IntoChunks(imageBase64);
    const totalChunks = chunks.length;
    const token = "IEBL0001";
    const apiId = "37";

    for (let index = 0; index < totalChunks; index++) {
      const payload = {
        token,
        apiId,
        inApiParameters: [
          { label: "P_ID", value: "175" },
          { label: "P_CHUNK_INDEX", value: String(index) },
          { label: "P_TOTAL_CHUNKS", value: String(totalChunks) },
          { label: "P_CHUNK_DATA", value: chunks[index] },
        ]
      };

      const response = await fetch('https://ebazarapi.iffco.in/API', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ReactNativeApp/1.0',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      //console.log(`Chunk ${index + 1} response:`, responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok || data?.error || data?.status >= 400) {
        throw new Error(data?.message || `Upload failed at chunk ${index + 1}`);
      }

      //console.log(`✅ Chunk ${index + 1}/${totalChunks} uploaded successfully.`);
    }

    Alert.alert('✅ Upload Complete', 'uploaded successfully!');
  } catch (error) {
    //console.error('❌ Upload Error:', error.message);
    Alert.alert('Upload failed', error.message);
  } finally {
    setLoading(false); // Stop loader
  }
};


// const uploadImage = async () => {
//   try {
//     const chunks = splitBase64IntoChunks(imageBase64); // Make sure this function is implemented
//     console.log(`Chunk are:`, chunks);
//     const totalChunks = chunks.length;
//     const token = "IEBL0001"; // Consider storing securely (e.g., SecureStore)
//     const apiId = "37";       // Confirm this value with your backend team

//     for (let index = 0; index < totalChunks; index++) {
//       const payload = {
//         token,
//         apiId,
//         inApiParameters: [
//           { label: "P_ID", value: "155" },               // Unique identifier
//           { label: "P_CHUNK_INDEX", value: String(index) },  // Always send as string
//           { label: "P_TOTAL_CHUNKS", value: String(totalChunks) },
//           { label: "P_CHUNK_DATA", value: chunks[index] },
//         ]
//       };

//       const response = await fetch('https://ebazarapi.iffco.in/API', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'User-Agent': 'ReactNativeApp/1.0',
//           'Accept': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       const responseText = await response.text();
//       console.log(`Chunk ${index + 1} response:`, responseText);

//       let data;
//       try {
//         data = JSON.parse(responseText);
//       } catch (error) {
//         console.error(`Chunk ${index + 1} - Invalid JSON response:`, responseText);
//         throw new Error('Invalid JSON response from server');
//       }

//       if (!response.ok || data?.error || data?.status >= 400) {
//         throw new Error(data?.message || `Upload failed at chunk ${index + 1}`);
//       }

//       console.log(`✅ Chunk ${index + 1}/${totalChunks} uploaded successfully.`);
//     }

//     Alert.alert('✅ Upload Complete', 'All chunks uploaded successfully!');
//   } catch (error) {
//     console.error('❌ Upload Error:', error.message);
//     Alert.alert('Upload failed', error.message);
//   }
// };


// Send full Base64 string in one request
const uploadFullImage = async () => {
  const payload = {
    token: "IEBL0001",
    apiId: "36",
    inApiParameters: [
      { label: "P_ID", value: "1234001" },
      { label: "P_BASE64_STR", value: imageBase64 },  // full base64 string here
    ]
  };

  try {
    const response = await fetch('https://ebazarapi.iffco.in/API', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ReactNativeApp/1.0',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    //console.log('Server response:', responseText);

    const result = JSON.parse(responseText);
    if (result.error) {
      Alert.alert('Upload Failed', result.message || 'Server Error');
    } else {
      Alert.alert('Upload Success');
    }
  } catch (err) {
    //console.error('Upload Error:', err.message);
    Alert.alert('Upload Error', err.message);
  }
};




  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={pickImage}>
        <Ionicons name="image" size={20} color="#333" style={styles.icon} />
        <Text style={styles.buttonText}>Pick Image</Text>
      </Pressable>

      {imageBase64 ? (
        <Image
          source={{ uri: 'data:image/jpeg;base64,' + imageBase64 }}
          style={styles.image}
        />
      ) : null}

      <Pressable style={[styles.button, { marginTop: 20 }]} onPress={uploadImage}>
        <Ionicons name="cloud-upload" size={20} color="#333" style={styles.icon} />
        <Text style={styles.buttonText}>Upload Image</Text>
      </Pressable>
      {loading && (
          <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -25 }, { translateY: -25 }] }}>
            <View style={{ transform: [{ scale: 0.6 }] }}>
              <ActivityIndicator size={50} color="#4a80f5" />
            </View>
          </View>
        )}
    </View>
  );
};

export default ImagePickerUploader;
 
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 50,
  },
  button: {
    backgroundColor: '#f0e00a', // Green color
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25, // Rounded corners
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10, // Space between icon and text
  },
  icon: {
    marginRight: 10, // Add some space around the icon
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 15, // Optional rounded image
  },
});
