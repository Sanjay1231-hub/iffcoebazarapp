import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Modal, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Zocial from '@expo/vector-icons/Zocial';
import Ionicons from '@expo/vector-icons/Ionicons';
import AlertWithIcon from '../Component/AlertWithIcon';

const EmployeeDirectory = () => {
  //const apiUrl = Constants.expoConfig?.extra?.apiUrl; 
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState('');
  const [selectedEmpName, setSelectedEmpName] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
   const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });

  const navigation = useNavigation();

  useEffect(() => {
    fetchEmployeesData();
  }, []);

  const fetchEmployeesData = async () => {
    try {
      const loggedInEmpStore = await AsyncStorage.getItem('officeCode');
      const loggedUser = await AsyncStorage.getItem('username');
  
      if (!loggedInEmpStore || !loggedUser) {
        Alert.alert('Error', 'No store or user found');
        return;
      }
  
      const postData = {
        token: "IEBL0001",
        apiId: "8",
        inApiParameters: [],
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
  
      if (!result || typeof result !== 'object' || !Array.isArray(result.output)) {
        throw new Error('Unexpected or invalid data format received.');
      }
  
      setData(result.output);
      setFilteredData(result.output);
  
      if (result.output.length > 0) {
        //console.log('First record:', result.output[0]);
      }
  
    } catch (error) {
      //console.error('Error fetching data:', error);
      setAlert({
        visible: true,
        title: "Fetch Error",
        message: error.message || "Failed to fetch data. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  
   // Function to initiate a phone call
   const handleCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
  
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Phone call not supported on this device.');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Failed to make a call.');
      });
  };
  
  const openModal = (phoneNumber, empName) => {
    setSelectedPhone(phoneNumber);
    setSelectedEmpName(empName);
    setModalVisible(true);
  };
  // Close the modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedPhone('');
    setSelectedEmpName('');
  };
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = data.filter(item =>
        item?.EMP_NAME?.toLowerCase().includes(query.toLowerCase()) ||
        item?.STORE_NAME?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

   const RenderItemComponent = React.memo(({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('EmployeeDetails', { employee: item })} underlayColor={'#EEEEEE'} style={{borderLeftWidth: 1, borderColor: '#ccc'}}>
        <View style={styles.row}>
          <Text style={[styles.cell, { flex: 1.35, textAlign: 'left' }]}>{item.STORE_NAME || 'HO'}</Text>         
          <Text style={[styles.cell, { flex: 2.25, textAlign: 'left' }]}>{item.EMP_NAME || ''}</Text>       
          <Text style={[styles.cell, { flex: 0.5, textAlign: 'left' }]}>{item.STATE_CD || 'DL'}</Text> 
          <View style={[styles.cell, { flex: 0.3, textAlign: 'center' }]}>          
            <TouchableOpacity onPress={() => openModal(item.MOBILE_NO, item.EMP_NAME)}>  
              <Image style={styles.calliing} source={require('../assets/call.png')} />
            </TouchableOpacity>
          </View>          
        </View>
      </TouchableOpacity> 
    ));


  const renderItem = useCallback(({ item }) => <RenderItemComponent item={item} />, []);
  

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ transform: [{ scale: 0.6 }] }}>
          <View style={{ transform: [{ scale: 0.6 }] }}>
          <ActivityIndicator size={50} color="#4a80f5" />
        </View>
        </View>
      </View>
    );
  }
  
  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {/* <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} /> */}
        <Ionicons name="filter-outline" size={22} color="#777" style={styles.searchIcon} />       
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by Employees or Stores..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#a3a3a3"
          allowFontScaling={false}
        />
        <Image style={[styles.calliing, { marginRight: 0 }]} source={require('../assets/filter.png')} />
      </View>
      
      <View>        
        <View style={styles.header}>                           
            <Text style={[styles.headerText, { flex: 1.4, textAlign: 'center' }]}>Store Name</Text>
            <Text style={[styles.headerText, { flex: 2.25, textAlign: 'center' }]}>Employees Name</Text>
            <Text style={[styles.headerText, { flex: 0.6, textAlign: 'center' }]}>State</Text>
            <Text style={[styles.headerText, { flex: 0.4, textAlign: 'center' }]}>...</Text>
        </View>
        {/* Table Data */}
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.FSC_CD ? item.FSC_CD.toString() : index.toString()} 
          ListEmptyComponent={<Text style={styles.emptyMessage}>No data found</Text>}
          style={{borderColor: '#ccc', borderWidth: 0, height: 'auto' }}
        />

        {/* Modal for Phone Call */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {/* <Text style={styles.modalTitle}>Make a Call</Text> */}
                <Ionicons name="call-outline" size={40} color="#0290e8" style={styles.modalIcon} />              
                <Text style={styles.modalSubTitle}>{selectedEmpName}</Text>
                <Text style={styles.modalText}>(+91) {selectedPhone}</Text>
                
                <View style={styles.modalActions}>
                  {/* Call Button */}
                  <TouchableOpacity style={styles.callButton} onPress={() => handleCall(selectedPhone)}>
                  <View style={styles.innerBorder}>
                  <Zocial name="call" size={24} color="white" />
                    <Text style={styles.callButtonText}>Call</Text>
                  </View>
                    
                  </TouchableOpacity>

                  {/* Close Button */}
                  <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <View style={styles.innerBorder}>
                      <Ionicons name="close-outline" size={26} color="white" />
                      <Text style={styles.closeButtonText}>Close</Text>
                    </View>                    
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

        </View>
        <AlertWithIcon
            visible={alert.visible}
            title={alert.title}
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ ...alert, visible: false })}
          /> 
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 5,
      backgroundColor: '#ffffff',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      //backgroundColor: '#fcfbdc',
      backgroundColor: '#fff',
      borderRadius: 4,
      paddingHorizontal: 6,
      marginBottom: 7,
      borderWidth: 1,
      borderColor: '#ccc',
       minHeight: 42,    // ✅ Pixel-safe
    },
    searchIcon: {
      marginRight: 8,        
    },       
    searchInput: {
      flex: 1,
      fontSize: 16,
      lineHeight: 22,          // ✅ CRITICAL
      color: '#000',
      paddingVertical: 8,      // ✅ give breathing space
      paddingHorizontal: 8,
      minHeight: 40,           // ✅ NOT height
      textAlignVertical: 'center',
      fontFamily: 'sans-serif',
    },
    header: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      backgroundColor: '#6c80ad',
    },
    headerText: {
      flex: 1,
      textAlign: 'center',
      fontSize: 14,
      color: '#fff',
      paddingVertical: 3,
      borderRightWidth: 1,
      borderColor: '#FFFFFF',
      letterSpacing: 0.3, 
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderColor: '#ccc',
    },    
    cell: {
      flex: 1,
      backgroundColor: '#ffffff',       
      paddingVertical: 5,
      paddingHorizontal: 5,
      borderRightWidth: 1,
      borderColor: '#ccc',
    },
    emptyMessage: {
      textAlign: 'center',
      paddingVertical: 20,
    },
    error: {
      color: 'red',
      textAlign: 'center',
      marginTop: 20,
    },   
    calliing: {
      backgroundColor: '#ffffff',      
      width: 23,
      height: 23,   
      textAlign: 'center',
    }, 
    
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      width: '80%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    },
    modalIcon: {
      marginBottom: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      letterSpacing: 0.3, 
    },
    modalSubTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#0290e8',
      marginBottom: 5,
      letterSpacing: 0.3, 
    },
    modalText: {
      fontSize: 15,
      color: '#555',
      marginBottom: 20,
      letterSpacing: 0.3, 
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'center', // Center the buttons horizontally
      alignItems: 'center',
      width: '100%', // or '80%' depending on your layout
      //marginTop: 20,
    },
    callButton: {      
      backgroundColor: '#34cf5eff',      
      marginHorizontal: 15, // Adds spacing between buttons
      padding: 2,
      borderRadius: 50,
      width: '45%',
    },
    callButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '400',
      marginLeft: 10,
      letterSpacing: 0.3,       
    },
    closeButton: {      
      backgroundColor: '#e64312ff',      
      marginHorizontal: 15, // Adds spacing between buttons
      padding: 2,
      borderRadius: 50,
      width: '45%',
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '400',
      marginLeft: 10,
      letterSpacing: 0.3, 
    },
    innerBorder: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',      
      paddingVertical: 5,     
      paddingHorizontal: 5,     
      borderRadius: 50,
      borderWidth: 2,
      borderColor: '#ccc',     
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5, 
    },
    
    
  });

export default EmployeeDirectory;
