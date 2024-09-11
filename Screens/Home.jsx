// screens/Home.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HomeButton from '../Component/HomeButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

function Home() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  //const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        //const storedEmail = await AsyncStorage.getItem('email');

        if (storedUsername !== null) setUsername(storedUsername);
        //if (storedEmail !== null) setEmail(storedEmail);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUserData();
  }, []);


  const handleClick = () => {
    navigation.navigate('Home'); // Navigate to EmployeeDirectory screen
  };
  const handleclick1 = () => {
    navigation.navigate('EmployeeDetails'); // Navigate to EmployeeDetails screen
  }
  const handleclick02 =() => {
    navigation.navigate('EmployeeDirectory'); // Navigate to EmployeeDirectory screen
  };

  return (

    <ScrollView contentContainerStyle={styles.container}> 
    {/* <LinearGradient
    //colors={['#5d0299', '#a366b4']} // Gradient colors
    //colors={['#5f7aa2', '#c2d4d8']} // Gradient colors
    colors={['#F1F1F2', '#F1F1F2']} // Gradient colors
    start={[0, 32]}
    end={[0, 85]}
    style={styles.gradient}
  > */}
      
  
    <Text style={styles.userInfo}>Welcome, {username}</Text>
      <View style={styles.buttonContainer}>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleClick} title="Home" icon="home-outline">       
            {/* <ImageBackground
              source={require('../assets/phonedirectory2.jpg')}
              style={styles.backgroundImage}
              imageStyle={styles.image}
            >        
           
            </ImageBackground>  */}
          </HomeButton>
          <Text style={styles.buttonText}>Home</Text>
        </View>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleclick1} title="Employee Details" icon="grid-outline">       
            {/* <ImageBackground
              source={require('../assets/report.png')}
              style={styles.backgroundImage}
              imageStyle={styles.image}
            >
            
            </ImageBackground> */}
          </HomeButton>
          <Text style={styles.buttonText}>Employees Detail</Text>
        </View>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleclick02} title="TestData" icon="book-outline">
            {/* <ImageBackground
              source={require('../assets/book.png')}
              style={styles.backgroundImage}
              imageStyle={styles.image}
            >           
            </ImageBackground> */}
          </HomeButton>
          <Text style={styles.buttonText}>Employees Directory</Text>
        </View>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleClick} title="Button2" icon="briefcase-outline">
            {/* <ImageBackground
              source={require('../assets/book.png')}
              style={styles.backgroundImage}
              imageStyle={styles.image}
            >
            
            </ImageBackground> */}
          </HomeButton>
          <Text style={styles.buttonText}>Test2</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleClick} title="Test3" icon="bar-chart-outline">
            {/* <ImageBackground
              source={require('../assets/book.png')}
              style={styles.backgroundImage}
              imageStyle={styles.image}
            >            
            </ImageBackground> */}
          </HomeButton>
          <Text style={styles.buttonText}>Test3</Text>
        </View>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleClick} title="Button1" icon="briefcase-outline">
            {/* <ImageBackground
              source={require('../assets/phonedirectory2.jpg')}
              style={styles.backgroundImage}
            >            
            </ImageBackground> */}
            
          </HomeButton>
          <Text style={styles.buttonText}>Button1</Text>
        </View>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleClick} title="Button2" icon="albums-outline">
            {/* <ImageBackground
              source={require('../assets/book.png')}
              style={styles.backgroundImage}
            >              
            </ImageBackground> */}

          </HomeButton>
          <Text style={styles.buttonText}>Button 2</Text>
        </View>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleClick} title="Button3" icon="albums-outline">
            {/* <ImageBackground
              source={require('../assets/information.png')}
              style={styles.backgroundImage}
            >             
            </ImageBackground> */}
          </HomeButton>
          <Text style={styles.buttonText}>Button 3</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleClick} title="Test3" icon="bar-chart-outline">
            {/* <ImageBackground
              source={require('../assets/book.png')}
              style={styles.backgroundImage}
              imageStyle={styles.image}
            >            
            </ImageBackground> */}
          </HomeButton>
          <Text style={styles.buttonText}>Test3</Text>
        </View>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleClick} title="Button1" icon="briefcase-outline">
            {/* <ImageBackground
              source={require('../assets/phonedirectory2.jpg')}
              style={styles.backgroundImage}
            >            
            </ImageBackground> */}
            
          </HomeButton>
          <Text style={styles.buttonText}>Button1</Text>
        </View>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleClick} title="Button2" icon="albums-outline">
            {/* <ImageBackground
              source={require('../assets/book.png')}
              style={styles.backgroundImage}
            >              
            </ImageBackground> */}

          </HomeButton>
          <Text style={styles.buttonText}>Button 2</Text>
        </View>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleClick} title="Button3" icon="albums-outline">
            {/* <ImageBackground
              source={require('../assets/information.png')}
              style={styles.backgroundImage}
            >             
            </ImageBackground> */}
          </HomeButton>
          <Text style={styles.buttonText}>Button 3</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleClick} title="Test3" icon="bar-chart-outline">
            {/* <ImageBackground
              source={require('../assets/book.png')}
              style={styles.backgroundImage}
              imageStyle={styles.image}
            >            
            </ImageBackground> */}
          </HomeButton>
          <Text style={styles.buttonText}>Test3</Text>
        </View>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleClick} title="Button1" icon="briefcase-outline">
            {/* <ImageBackground
              source={require('../assets/phonedirectory2.jpg')}
              style={styles.backgroundImage}
            >            
            </ImageBackground> */}
            
          </HomeButton>
          <Text style={styles.buttonText}>Button1</Text>
        </View>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleClick} title="Button2" icon="albums-outline">
            {/* <ImageBackground
              source={require('../assets/book.png')}
              style={styles.backgroundImage}
            >              
            </ImageBackground> */}

          </HomeButton>
          <Text style={styles.buttonText}>Button 2</Text>
        </View>
        <View style={styles.containerbutton}>
          <HomeButton onPress={handleClick} title="Button3" icon="albums-outline">
            {/* <ImageBackground
              source={require('../assets/information.png')}
              style={styles.backgroundImage}
            >             
            </ImageBackground> */}
          </HomeButton>
          <Text style={styles.buttonText}>Button 3</Text>
        </View>
      </View>
      {/* </LinearGradient> */}
    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  container: {    
    alignItems: 'center',
    flex: 1,   
    justifyContent: 'flex-start',    
    backgroundColor: '#ffffff',
  },
  gradient: {
    width: '100%',
    height: '100%',   
    alignItems: 'center',    
  },
  userInfo: {
    fontSize: 18,
    color: '#5b5b5b',
    margin: 5,
  },
  containerbutton: {    
    alignItems: 'center',
    width: '25%',
    justifyContent: 'flex-start',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20, // marginBottom: 20 is commented out, but you can uncomment if needed
    padding: 9,
    borderRadius: 13,
    borderWidth: 1, // Equivalent to border: 1px solid in web CSS
    borderColor: '#dfdddd', // Border color
  },
  backgroundImage: {
    //flex: 1,
    justifyContent: 'center',   
    width: '100%',
    height: '100%',
  },
  image: {
    //borderRadius: 12,
    //margin: 10,
    // Add additional styling if needed
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    // marginRight: 5, // Space between icon and text
  },
  buttonText: {
    textAlign: 'center',
    color: '#5b5b5b',
    //color: '#2e1a1a',
    fontSize: 12,
    fontWeight: 200,
    fontFamily: 'sans-serif',
    padding: 5,
  },
  
});

export default Home;
