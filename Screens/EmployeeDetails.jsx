import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure AsyncStorage is installed

const EmployeeDetails = ({ route }) => {
  const { employee } = route.params; // Get employee data passed from EmployeeDetails
  const [imageUrl, setImageUrl] = useState(null); // To store image URL (base64 string)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  
  useEffect(() => {
    fetchData();
  }, []); // Fetch data when component mounts

  const fetchData = async () => {
    try {
      const loggedInEmpStore = await AsyncStorage.getItem('officeCode');
      const loggedUser = await AsyncStorage.getItem('username');
      if (!loggedInEmpStore || !loggedUser) {
        Alert.alert('Error', 'No store or user found');
        return;
      }

      const postData = {
        token: "IEBL0001",
        apiId: "4",
        inApiParameters: [
          { label: "P_PERSONAL_NO", value: `${employee.PERSONAL_NO}` }          
        ],
      };     

      const response = await fetch('https://ebazarapi.iffco.in/API', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ReactNativeApp/1.0',
          'Accept': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const text = await response.text();
    
      if (!response.ok) {
        //console.warn('Non-200 response:', response.status);
        //console.warn('Raw response body:', text);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (jsonError) {
        //console.error('Failed to parse JSON. Server returned:', text);
        throw new Error('Invalid JSON response received.');
      }

      if (!result || typeof result !== 'object') {
        throw new Error('Unexpected data format received.');
      }
      const userData = result.output[0];

      if (userData && userData.EMP_PHOTO) {
        setImageUrl(userData.EMP_PHOTO); // Set the base64 image string from API
      } else {
        setImageUrl(null); // No image found, set as null
      }
    } catch (error) {
      setError('Failed to load image');
      Alert.alert('Fetch Error', error.message); // Show error alert
    } finally {
      setLoading(false);
    }
  };
  // Loading state
  if (loading) {
    return (    
       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ transform: [{ scale: 0.6 }] }}>
          <ActivityIndicator size={50} color="#4a80f5" />
        </View>
          <Text>Loading...</Text>
        </View>
    );
  }
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  } 

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.headerContainer}> 
           <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image
                source={{ uri: `data:image/jpeg;base64,${imageUrl}` }} // Assuming it's a JPEG image
                style={styles.profileImage}
              />
            ) : (
              <Text style={styles.noImageText}>No Image Available</Text>
            )}
          </View> 
          <View style={styles.textContainer}>
            <Text style={styles.name}>{employee.EMP_NAME}</Text>
            <Text style={styles.designation}>{employee.DESIGNATION}</Text>
          </View>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Personal No</Text>
          <Text style={styles.detailValue}>{employee.PERSONAL_NO}</Text>
          <Text style={styles.detailLabel}>Department</Text>
          <Text style={styles.detailValue}>{employee.DEPARTMENT || 'No data found'}</Text>
          <Text style={styles.detailLabel}>Mobile</Text>
          <Text style={styles.detailValue}>{employee.MOBILE_NO || 'No data found'}</Text>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{employee.EMAIL_ID || 'No data found'}</Text>
          {(employee.DEPARTMENT === "STORE") && (
                              <View>
                                <Text style={styles.detailLabel}>Store Name</Text>
                                <Text style={styles.detailValue}>{employee.STORE_NAME || 'No data found'}</Text>
                                <Text style={styles.detailLabel}>State</Text>
                                <Text style={styles.detailValue}>{employee.STATE_NAME || 'No data found'}</Text>
                              </View>
                            )}
          <Text style={styles.detailLabel}>Blood Group</Text>
          <Text style={styles.detailValue}>{employee.BLOOD_GROUP || 'No data found'}</Text>
          <Text style={styles.detailLabel}>Account No.</Text>
          <Text style={styles.detailValue}>{employee.ACCOUNT_NO || 'No data found'}</Text>
          <Text style={styles.detailLabel}>IFSC Code</Text>
          <Text style={styles.detailValue}>{employee.IFSC_CODE || 'No data found'}</Text>
          <Text style={styles.detailLabel}>Bank Name</Text>
          <Text style={styles.detailValue}>{employee.BANK_NAME || 'No data found'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 2,
    backgroundColor: '#ffffff',
  },
  innerContainer: {
    flex: 1,
    padding: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    //marginBottom: 10,
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.3, 
  },
  designation: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 0.3, 
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 100,
    overflow: 'hidden', // Ensures the image stays within the circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 100,
  },
  noImageText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    letterSpacing: 0.3,   
    backgroundColor: '#f4f4f4', 
    height: 120,
    width: 120,
    lineHeight: 110,
    
  },
  detailsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5faff',
    borderRadius: 12,
       
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#085eafff',
    letterSpacing: 0.3, 
  },
  detailValue: {
    fontSize: 14,
    marginBottom: 10,
    color: '#333',
    letterSpacing: 0.3, 
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default EmployeeDetails;