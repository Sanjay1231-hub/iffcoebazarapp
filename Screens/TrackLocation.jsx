import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Image, Alert, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';  // Import Ionicons

//const FACE_API_KEY = 'your-api-key'; // Replace with your actual Azure Face API Key
//const FACE_API_ENDPOINT = 'https://your-endpoint.cognitiveservices.azure.com/face/v1.0/detect'; // Replace with your Azure endpoint

const TrackLocation = () => {
    const [location, setLocation] = useState(null);  
    const [locationDistance, setLocationDistance] = useState(null);  
    const [errorMsg, setErrorMsg] = useState(null);
    const [locationsList, setLocationsList] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const [isOutHovered, setOutIsHovered] = useState(false);
    const [isImgHovered, setIsImgHovered] = useState(false);
    const [imageUri, setImageUri] = useState(null); // State to hold image URI
    const [resizedImageUri, setResizedImageUri] = useState(null); // State to hold image URI
    const [imageUrl, setImageUrl] = useState(null); // To store image URL (base64 string)
    const [isProcessing, setIsProcessing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingImg, setLoadingImg] = useState(true);
    const [responseMessage, setResponseMessage] = useState(null);
    const [faceData, setFaceData] = useState(null);
    const [faceDetectedData, setFaceDetectedData] = useState(null);
    const [error, setError] = useState(null);
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // MAX FILE SIZE is 2 MB    

    useEffect(() => {
      //fetchImage();
    }, []); // Fetch data when component mounts
  
    const fetchImage = async () => {
      try {
        const loggedInEmpStore = await AsyncStorage.getItem('officeCode');
        const loggedUser = await AsyncStorage.getItem('username');
        if (!loggedInEmpStore || !loggedUser) {
          Alert.alert('Error', 'No store or user found');
          return;
        }
  
        const postData = {
          token: "8548528525568856",
          serviceID: "6041",
          inParameters: [
            {
              label: "P_PERSONAL_NO",
              value: loggedUser
            }
          ],
        };
  
        const response = await fetch('https://mappws.iffco.coop/ebazarapi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        });
        if (!response.ok) {
          const errorText = await response.text(); // Capture the error message
          Alert.alert("Error response: ", errorText); // Log the error for debugging
          throw new Error(`HTTP error! status: ${response.status}, Details: ${errorText}`);
        }
        const result = await response.json(); // Assuming API response is JSON    
  
        //console.log("Image result from database:", result);
        if (result[0].EMP_PHOTO) {
          //console.log("Image found is:", result[0].EMP_PHOTO);
          setImageUrl(result[0].EMP_PHOTO); // Set the base64 image string from API
          uploadImage(result[0].EMP_PHOTO); // Set the base64 image string from API

        } else {
          setImageUrl(null); // No image found, set as null
        }
      } catch (error) {
        setError('Failed to load image');
        Alert.alert('Fetch Error', error.message); // Show error alert
      } finally {
          setLoadingImg(false);
      }
    };  

    const getLocation = async (buttonId) => {
      setErrorMsg(null); // Clear any previous error messages
      //console.log(`Button ${buttonId} pressed`);
  
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }
    
        let { coords } = await Location.getCurrentPositionAsync({});
        const newLocation = {
            latitude: coords.latitude,
            longitude: coords.longitude,
        };
        
        await saveLocation(newLocation, buttonId); // Pass buttonId directly
        setLocationsList((prevList) => [...prevList, newLocation]);
        setLocation(newLocation);
      } catch (error) {
        setErrorMsg('Error retrieving location: ' + error.message);
      }
    };

    const saveLocation = async (newLocation, buttonId) => {        
      if (!newLocation) {
        Alert.alert('Validation Error', 'Punched location not captured.');
        return;
      }
      setLoading(true); // Start loading    
      const loggedUser = await AsyncStorage.getItem('username');
      const loggedFscCD = await AsyncStorage.getItem('officeCode');
      if (!loggedUser) {
        Alert.alert('Error', 'No user found');
        setLoading(false); // End loading
        return;
      }
      const lat = newLocation.latitude;
      const long = newLocation.longitude;
      const latString = lat.toString();
      const longString = long.toString();
  
      const postData = {
        token: '8548528525568856',
        serviceID: '6062',
        inParameters: [
          { label: 'P_LAT2', value: latString },
          { label: 'P_LON2', value: longString },
          { label: 'P_FLAG', value: buttonId },
          { label: 'P_PERSONAL_NO', value: loggedUser },
          { label: 'P_FSC_CD', value: loggedFscCD },
        ],
      };
      //console.log("Punched postData", postData);     
  
      try {
          const response = await fetch('https://mappws.iffco.coop/ebazarapi', {
              method: 'POST',
              headers: {
              'Content-Type': 'application/json',
              },
              mode: 'no-cors',
              body: JSON.stringify(postData),
          });
        
              // Check if the response is ok and parse the JSON
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorData.message}`);
          }
          // Parse the response as JSON
          const responseData = await response.json();
          //console.log("Punched response Data is:", responseData.Msg);    
          Alert.alert('Success', responseData.Msg);
          setLocationDistance(responseData.distance);
          //Alert.alert('Punched postData', JSON.stringify(postData));
          await AsyncStorage.setItem('locations', JSON.stringify([...locationsList, newLocation]));
      } catch (error) {
          setErrorMsg('Error saving location: ' + error.message);
          //console.error(error); // Log the error for debugging
        Alert.alert('Error', error.message || 'An error occurred while Punching.');
      } finally {
          setLoading(false); // End loading
      }
    };

      const handleImagePicker = async () => {
        let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'You need to grant camera permission to capture an image');
        return;
        }
        // Launch camera to capture an image
        const pickerResult = await ImagePicker.launchCameraAsync({
        //allowsEditing: true,
        aspect: [3, 4],
        quality: 0,
        });

        //console.log("Captured Image Result", pickerResult);
        //console.log("Captured Image Result uri", pickerResult.assets[0].uri);
        if (pickerResult.canceled) {
        return;
        }
        const asset = pickerResult.assets[0];
        const originalUri = asset.uri;
        //console.log("originalUri", originalUri);  
        setImageUri(originalUri); // Set captured image URI in state
        //detectImage(originalUri);
        detectCapturedImage(originalUri);
        //fetchCapturedImage();
    };


      // Convert image to base64
    const convertImageToBase64 = async (imageUri) => {
      try {
        return await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (error) {
        //console.error("Error converting image to base64:", error);
        return null;
      }
    };

    const uploadImage = async (base64Image) => {
        setLoading(true);
        setResponseMessage(null);
      
        try {
          const formData = new FormData();
          formData.append('api_key', 'RFP1fxZYMmNlSirYrqjQa8Sq8qL467j_'); // Replace with your actual API key
          formData.append('api_secret', 'LALROJ5OHZZ06NmO5qUfLpZESlDy7kYP'); // Replace with your actual API secret

      
          // Append the base64 string directly to the FormData
          formData.append('image_base64', base64Image);  // Key 'image_base64' as per Face++ documentation
      
          // Optionally, you can specify other parameters like return_landmark, return_attributes
           formData.append('return_landmark', '1');
           formData.append('return_attributes', 'gender,age');
      
          // Send the POST request to the API endpoint
          const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
            method: 'POST',
            body: formData,
          });
      
          const responseText = await response.text(); // Get the raw response as text
          const contentType = response.headers.get('Content-Type');
      
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
      
          if (contentType && contentType.includes('application/json')) {
            const result = JSON.parse(responseText); // Parse the JSON if content is JSON
            //console.log('Upload face API result:', result);
      
            if (result.face_num === 0) {
              setResponseMessage('No faces detected.');
            } else {
              // Extract face data (tokens, rectangle, attributes, landmarks)
              const faces = result.faces;
              const faceData = faces.map((face) => ({
                face_token: face.face_token,
                face_rectangle: face.face_rectangle,
                attributes: face.attributes,
                landmarks: face.landmark,
              }));
      
              setFaceData(faceData);
              setResponseMessage('Fetched Face detected successfully!');
            }
          } else {
            throw new Error('Response is not JSON format');
          }
        } catch (error) {
          setResponseMessage(`Request failed: ${error.message}`);
          //console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      };

      
    //     // Function to upload the image to Face++ API
    // const detectImage = async (imageUri) => {
    //     setLoading(true);
    //     setResponseMessage(null); 
    //     const formData = new FormData();
    //     formData.append('api_key', 'RFP1fxZYMmNlSirYrqjQa8Sq8qL467j_'); // Replace with your actual API key
    //     formData.append('api_secret', 'LALROJ5OHZZ06NmO5qUfLpZESlDy7kYP'); // Replace with your actual API secret
    //     // Create a file object for the selected image
    //     const imageFile = {
    //     uri: imageUri,
    //     name: 'image_file.jpg',
    //     type: 'image/jpeg',
    //     };

    //     formData.append('image_file', imageFile);
    //     formData.append('return_landmark', '1');
    //     formData.append('return_attributes', 'gender,age');

    //     try {
    //         const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
    //             method: 'POST',
    //             body: formData,
    //           });
          
    //           const responseText = await response.text(); // Get the raw response as text
    //           const contentType = response.headers.get('Content-Type');
          
    //           if (!response.ok) {
    //             throw new Error(`HTTP error! Status: ${response.status}`);
    //           }
          
    //           if (contentType && contentType.includes('application/json')) {
    //             const result = JSON.parse(responseText); // Parse the JSON if content is JSON
    //             console.log('Upload face API result:', result);
          
    //             if (result.face_num === 0) {
    //               setResponseMessage('No faces detected.');
    //             } else {
    //               // Extract face data (tokens, rectangle, attributes, landmarks)
    //               const faces = result.faces;
    //               const faceData = faces.map((face) => ({
    //                 face_token: face.face_token,
    //                 face_rectangle: face.face_rectangle,
    //                 attributes: face.attributes,
    //                 landmarks: face.landmark,
    //               }));
          
    //               setFaceDetectedData(faceData);
    //               compareFaces();
    //               setResponseMessage('Faces detected successfully!');
    //             }
    //           } else {
    //             throw new Error('Response is not JSON format');
    //           }
    //     } catch (error) {
    //     setResponseMessage('Request failed: ' + error.message);
    //     } finally {
    //     setLoading(false);
    //     }
    // };

    const getImageSize = async (imageUri) => {
      if (!imageUri) {
        //console.error("Error: imageUri is null or undefined.");
        return false;
      }
      
      try {
        const fileInfo = await FileSystem.getInfoAsync(imageUri);
        
        if (!fileInfo.exists) {
          //console.error("Error: File does not exist.");
          return false;
        }
    
        //console.log("File size (bytes):", fileInfo.size);
    
        // Convert bytes to MB
        const fileSizeInMB = fileInfo.size / (1024 * 1024);
        
        return fileSizeInMB < 2; // Returns true if size < 2MB
      } catch (error) {
        //console.error("Error getting image size:", error);
        return false;
      }
      };
        

    const detectCapturedImage = async (imageUri) => {
        setLoading(true);
        setResponseMessage(null);
        //console.log("detected Image URI:", imageUri);

        const isValidSize = await getImageSize(imageUri);
        
        if (!isValidSize) {
          //console.log("Image too large. Please choose a smaller file.");
          return;
        }
      
        //console.log("Image is less than 2MB, proceeding...");
      
        const base64Image = await convertImageToBase64(imageUri);
      
        if (!base64Image) {
          //console.error("Failed to convert image to base64.");
          return;
        }
      
        try {
          const formData = new FormData();
          formData.append("api_key", "RFP1fxZYMmNlSirYrqjQa8Sq8qL467j_"); // Replace with your actual API key
          formData.append("api_secret", "LALROJ5OHZZ06NmO5qUfLpZESlDy7kYP"); // Replace with your actual API secret
          formData.append("image_base64", base64Image);
          formData.append("return_landmark", "1");
          formData.append("return_attributes", "gender,age");
      
          // Send the POST request to the API endpoint
          const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
            method: 'POST',
            body: formData,
          });
      
          const responseText = await response.text(); // Get the raw response as text
          const contentType = response.headers.get('Content-Type');
      
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
      
          if (contentType && contentType.includes('application/json')) {
            const result = JSON.parse(responseText); // Parse the JSON if content is JSON
            //console.log('Upload face API result:', result);
      
            if (result.face_num === 0) {
              setResponseMessage('No faces detected.');
            } else {
              // Extract face data (tokens, rectangle, attributes, landmarks)
              const faces = result.faces;
              const faceData = faces.map((face) => ({
                face_token: face.face_token,
                face_rectangle: face.face_rectangle,
                attributes: face.attributes,
                landmarks: face.landmark,
              }));
      
              setFaceDetectedData(faceData);
              
              setResponseMessage('Second Faces detected successfully!');
              await compareFaces();
            }
          } else {
            throw new Error('Response is not JSON format');
          }
        } catch (error) {
          setResponseMessage(`Request failed: ${error.message}`);
          //console.error('Error:', error);
        } finally {
          setLoading(false);
        }
    };

    const compareFaces = async () => {
        setLoading(true);
        setResponseMessage(null);
        //console.log("faceData.face_token", faceData[0].face_token);
        //console.log("faceDetectedData.face_token", faceDetectedData[0].face_token);
      
        try {
          const formData = new FormData();
          formData.append('api_key', 'RFP1fxZYMmNlSirYrqjQa8Sq8qL467j_'); // Replace with your actual API key
          formData.append('api_secret', 'LALROJ5OHZZ06NmO5qUfLpZESlDy7kYP'); // Replace with your actual API secret
          formData.append('face_token1', faceData[0].face_token); // The face token of the first face
          formData.append('face_token2', faceDetectedData[0].face_token); // The face token of the second face
      
          // Send the POST request to the Face++ Face Compare API
          const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/compare', {
            method: 'POST',
            body: formData,
          });
      
          const responseText = await response.text(); // Get the raw response as text
          const contentType = response.headers.get('Content-Type');
      
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
      
          if (contentType && contentType.includes('application/json')) {
            const result = JSON.parse(responseText); // Parse the JSON if content is JSON
            //console.log('Face comparison result:', result);
      
            // Check if the comparison is successful and output the similarity score
            if (result.error_message) {
              throw new Error(result.error_message);
            }
      
            const similarityScore = result.confidence; // Similarity score between 0 and 100
            if (similarityScore > 80) {
              setResponseMessage('Faces are similar with a confidence of ' + similarityScore + '%');
            } else {
              setResponseMessage('Faces are not similar with a confidence of ' + similarityScore + '%');
            }
      
          } else {
            throw new Error('Response is not JSON format');
          }
        } catch (error) {
          setResponseMessage(`Request failed: ${error.message}`);
          //console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      };

  return (    
    <ScrollView style={styles.container}>   
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Punch in/out time</Text>               
            <View style={styles.modalActions}>                 
                <Pressable
                style={[styles.button, isOutHovered && styles.buttonHovered]}                
                onPressIn={() => setOutIsHovered(true)}  // Detect when the button is pressed
                onPressOut={() => setOutIsHovered(false)} // Detect when the button press is released
                onPress={() => getLocation('I')} >
                    {/* <Image
                    style={styles.image}
                    source={require('../assets/location.png')}
                    /> */}
                {/* <Ionicons name="location-outline" size={24} color="#fff" /> */}
                <Text style={styles.buttonText}>Punch In</Text>           
                </Pressable>
                <Pressable 
                //style={styles.button} 
                style={[styles.callButton, isHovered && styles.callbuttonHovered]}
                onPressIn={() => setIsHovered(true)}  // Detect when the button is pressed
                onPressOut={() => setIsHovered(false)} // Detect when the button press is released
                onPress={() => getLocation('O')} >
                {/* <Ionicons name="location-outline" size={24} color="#fff" /> */}
                {/* <Image
                    style={styles.image}
                    source={require('../assets/location.png')}
                /> */}
                <Text style={styles.buttonText}>Punch Out</Text>
                </Pressable>                  
            </View>
        </View>
       

        {errorMsg ? (
            <Text style={styles.errortext}>{errorMsg}</Text>
            ) : location && (
            <>
                <Text style={styles.successtext}>
                Distance is - {locationDistance} (meters)
                </Text>
                <Text style={styles.successtext}>
                Current Location - Latitude: {location.latitude}, Longitude: {location.longitude}
                </Text>
            </>
            )}
    

        {/* Conditionally render the image */}
       
                   <View style={styles.modalActions}>
                        <View style={styles.imageContainer}>
                            {imageUrl && (
                                <Image
                                    source={{ uri: `data:image/jpeg;base64,${imageUrl}` }} // Assuming it's a JPEG image
                                    style={styles.profileImage}
                                />
                                // ) : (
                                // <Text></Text>
                            )}
                        </View> 
                        <View style={styles.imageContainer}>
                            {imageUri && (
                                <View style={styles.imageContainer}>                
                                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                                    {isProcessing && <Text>Processing...</Text>}
                                </View>
                            )}
                        </View> 
                  </View> 

        <View style={styles.iconContainer}>
            <Pressable 
                style={[styles.imagebutton, isImgHovered && styles.imgbuttonHovered]}                
                onPressIn={() => setIsImgHovered(true)}  // Detect when the button is pressed
                onPressOut={() => setIsImgHovered(false)} // Detect when the button press is released
                onPress={handleImagePicker}>                            
                     <Ionicons name="camera" size={40} color="#fff" /> 
                <Text style={{ paddingHorizontal: 10, color: '#3333' }}>Take Photo</Text> 
            </Pressable>  

               
                    {loading && <ActivityIndicator size="large" />}
      {responseMessage && <Text style={{ marginTop: 20 }}>{responseMessage}</Text>}
      

{faceData && faceData.length > 0 && (
        <View style={{ marginTop: 20 }}>
          {faceData.map((face, index) => (
            <View key={index}>
              <Text>Face {index + 1}:</Text>
              <Text>Face Token: {face.face_token}</Text>
              <Text>Face Rectangle: {JSON.stringify(face.face_rectangle)}</Text>
              <Text>Gender: {face.attributes.gender.value}</Text>
              <Text>Age: {face.attributes.age.value}</Text>
              {/* <Text>Smile: {face.attributes.smile.value}</Text> */}
              {/* <Text>Landmarks: {JSON.stringify(face.landmarks)}</Text> */}
            </View>
          ))}
        </View>
      )}


{faceDetectedData && faceDetectedData.length > 0 && (
        <View style={{ marginTop: 20 }}>
          {faceDetectedData.map((facedetected, index) => (
            <View key={index}>
              <Text>Face {index + 1}:</Text>
              <Text>Face Token: {facedetected.face_token}</Text>
              <Text>Face Rectangle: {JSON.stringify(facedetected.face_rectangle)}</Text>
              <Text>Gender: {facedetected.attributes.gender.value}</Text>
              <Text>Age: {facedetected.attributes.age.value}</Text>
              {/* <Text>Smile: {facedetected.attributes.smile.value}</Text> */}
              {/* <Text>Landmarks: {JSON.stringify(facedetected.landmarks)}</Text> */}
            </View>
          ))}
        </View>
      )}
        </View>          
    </ScrollView>    
  );
};

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        //justifyContent: 'center',
        //alignItems: 'center',
        padding: 10,       
        paddingBottom: 10,       
      },
      errortext: {
        marginBottom: 10,
        fontSize: 15,
        color: '#f55516',  
        backgroundColor: '#fff',  
        padding: 10, 
        letterSpacing: 0.3, 
      },  
      successtext: {
        marginBottom: 10,
        fontSize: 15,
        color: '#757575',
        backgroundColor: '#fff',
        padding: 10, 
        letterSpacing: 0.3, 
      },  
      imageContainer: {
        marginBottom: 10,
        alignItems: 'center',
      },
      imagePreview: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
      },
      item: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
      },  
      modalContent: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
      },
      modalTitle: {
        fontSize: 16,
        fontWeight: '400',
        marginBottom: 10,
        color: '#3c8bfa',
        letterSpacing: 0.3, 
      },  
      modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      },
      profileImage: {
        width: 150,
        height: 200,
        borderRadius: 0,
      },
      callButton: {
        backgroundColor: '#696764', 
        padding: 10,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#f5f5f5',
        width: '47%',
        alignItems: 'center',
        justifyContent: 'space-around',
        // Shadow for iOS
        shadowColor: '#000', // Color of the shadow
        shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
        shadowOpacity: 0.1, // Transparency of the shadow
        shadowRadius: 5, // Blur effect of the shadow
        // Shadow for android
        elevation: 5
      },
      callbuttonHovered: {
        backgroundColor: '#333', 
      },
      buttonHovered: {
        backgroundColor: '#d69004',
      },
      imgbuttonHovered: {
        backgroundColor: '#f0c505',
        // Shadow for iOS
        shadowColor: '#1647f7', // Color of the shadow
        shadowOffset: { width: 400, height: 400 }, // Shadow offset (x, y)
        shadowOpacity: 1, // Transparency of the shadow
        shadowRadius: 50, // Blur effect of the shadow
        // Shadow for android
        elevation: 50
      },
      buttonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'sans-serif',
        fontWeight: '600',
        letterSpacing: 0.3, 
      },
      button: {
        backgroundColor: '#faae3c',
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: '47%',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'space-around',
        // Shadow for iOS
        shadowColor: '#000', // Color of the shadow
        shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
        shadowOpacity: 0.1, // Transparency of the shadow
        shadowRadius: 5, // Blur effect of the shadow
        // Shadow for android
        elevation: 5
      },
      imagebutton: {  
        backgroundColor: '#f5d742',    
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#f5d742',
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow for iOS
        shadowColor: '#000', // Color of the shadow
        shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
        shadowOpacity: 0.1, // Transparency of the shadow
        shadowRadius: 5, // Blur effect of the shadow
        // Shadow for android
        elevation: 5
      },
      iconContainer: {
        justifyContent: 'center',
        alignItems: 'center', // Align icon and text horizontally
      },
      icon: {
        marginRight: 8, // Space between icon and text
      },
});

export default TrackLocation;
