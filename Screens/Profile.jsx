import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Linking, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Title, Card, Button } from 'react-native-paper';
import { MaterialIcons, Entypo } from '@expo/vector-icons';

const Profile = (props) => {
  // State to manage visibility
  const [isVisible, setIsVisible] = useState(false); // Default to hidden

  // Destructure the item with default values to handle null values
  const {
    PNO = 'N/A',
    EMP_NAME = 'Unknown',   
    MOBILE_NO_1 = 'N/A',   
    EMAIL = 'N/A',
    EMP_DESIG = 'No Designation',
    STATUS = '' // Added STATUS with a default value
  } = props.route.params.item || {}; // Provide a fallback if item is undefined

  const DeleteEmployee = () => {
    fetch("http://a4a938cb.ngrok.io/delete", {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: PNO
      })
    })
    .then(res => res.json())
    .then(response => {
      if (response?.EMP_NAME) {
        Alert.alert(`${response.EMP_NAME} deleted successfully`);
        props.navigation.navigate("EmployeeDirectory");
      } else {
        Alert.alert("Error", "Failed to delete employee.");
      }
    })
    .catch(err => {
      Alert.alert("Error", "Something went wrong while deleting employee.");
    });
  };

  const openDial = () => {
    const phoneNumber = MOBILE_NO_1 || ''; // Fallback if MOBILE_NO_1 is null
    const url = Platform.OS === 'android' ? `tel:${phoneNumber}` : `telprompt:${phoneNumber}`;
    if (phoneNumber) {
      Linking.openURL(url);
    } else {
      Alert.alert("Error", "No phone number available to dial.");
    }
  };

  const isString = (value) => typeof value === 'string';

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0439b4", "#0439b4"]}
        style={styles.gradient}
      />
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={require('../assets/face01.png')} 
        />
      </View>
      <View style={styles.infoContainer}>
        <Title style={{ fontSize: 20, fontWeight: '700' }}>{isString(EMP_NAME) ? EMP_NAME : 'No Name'}</Title>
        <Text style={styles.designation}>{isString(EMP_DESIG) ? EMP_DESIG : 'No Designation'}</Text>
        <Text style={styles.pno}>{isString(PNO) ? PNO : 'No Phone Number'}</Text>
      </View>
      
      {/* Conditionally render the STATUS text based on isVisible */}
      {isVisible && (
        <View style={styles.infoContainer}>
          <Text style={styles.pno}>{isString(STATUS) ? STATUS : 'No Status'}</Text>
        </View>
      )}
      
      <Card style={styles.myCard} onPress={() => Linking.openURL(`mailto:${isString(EMAIL) ? EMAIL : ''}`)}>
        <View style={styles.cardContent}>
          <MaterialIcons name="email" size={32} color="#006aff" />
          <Text style={styles.cardText}>{isString(EMAIL) ? EMAIL : 'No Email'}</Text>
        </View>
      </Card>
      <Card style={styles.myCard} onPress={openDial}>
        <View style={styles.cardContent}>
          <Entypo name="phone" size={32} color="#006aff" />
          <Text style={styles.cardText}>{isString(MOBILE_NO_1) ? MOBILE_NO_1 : 'No Mobile Number'}</Text>
        </View>
      </Card>
      <Card style={styles.myCard}>        
        <View style={styles.buttonContainer}>
          <Button
            icon="account-edit"
            mode="contained"
            theme={theme}
            onPress={() => {
              props.navigation.navigate("Create", {   
                PNO,             
                EMP_NAME,                
                MOBILE_NO_1,                
                EMAIL,
                EMP_DESIG
              });
            }}
          >
            Edit
          </Button>
          <Button
            icon="delete"
            mode="contained"
            theme={theme}
            onPress={DeleteEmployee}
          >
            Fire Employee
          </Button>
        </View>
      </Card>
    </View>
  );
};

const theme = {
  colors: {
    primary: "#006aff"
  }
};

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  gradient: {
    height: "20%"
  },
  imageContainer: {
    alignItems: "center"
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginTop: -50
  },
  infoContainer: {
    alignItems: "center",
    margin: 15
  },
  title: {
    fontSize: 20,
    fontWeight: '700' // Correct way to set font weight
  },
  designation: {
    fontSize: 16,
    fontWeight: 700
  },
  pno: {
    fontSize: 16,
    fontWeight: 700
  },
  myCard: {
    margin: 3
  },
  cardContent: {
    flexDirection: "row",
    padding: 8
  },
  cardText: {
    fontSize: 18,
    marginTop: 3,
    marginLeft: 5
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  }
});

export default Profile;
