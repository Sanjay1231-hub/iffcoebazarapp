import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator, ScrollView, Animated, Easing, Image, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Ionicons } from '@expo/vector-icons';

const Header = ({ onLogout }) => {
  const [loggedUserDetails, setLoggedUserDetails] = useState({});
  const [trimedOfficeCode, setTrimedOfficeCode] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [empPhoto, setEmpPhoto] = useState(null);
  const [officeType, setOfficeType] = useState(null);
  const [isPressed, setIsPressed] = useState(false);

useEffect(() => {
  const fetchOfficeType = async () => {
    const Offtype = await AsyncStorage.getItem('officeType');
    //console.log('logged User office type:', Offtype);
    setOfficeType(Offtype);
  };

  fetchOfficeType();
}, []); 
  
  // Animated Value for Slide Effect
  const slideAnim = useRef(new Animated.Value(-300)).current; // Start off-screen (left)

  useEffect(() => {
    const getPhoto = async () => {
      const photo = await AsyncStorage.getItem('empPhoto');
      if (photo) {
        setEmpPhoto(photo);
      }
    };
    getPhoto();
  }, []);

  useEffect(() => {
    const fetchLoggedUserData = async () => {
      setLoading(true);
      try {          
          const FscCode = (await AsyncStorage.getItem('officeCode')) || ''; 
          const trimmedOfficeCode = FscCode ? FscCode.slice(0, -4) : '';          
          setTrimedOfficeCode(trimmedOfficeCode);
          const userData = {
            empName: await AsyncStorage.getItem('empname') || 'N/A',
            office_code: await AsyncStorage.getItem('officeCode') || 'N/A',
            departmentName: await AsyncStorage.getItem('departmentName') || 'N/A',
            stateCd: await AsyncStorage.getItem('stateCd') || 'N/A',
            mobilleNo: await AsyncStorage.getItem('mobilleNo') || 'N/A',
            PersonalEmail: await AsyncStorage.getItem('userEmail') || '',
            OfficeEmail: await AsyncStorage.getItem('userOfficeEmail') || 'N/A',
            GradeCode: await AsyncStorage.getItem('empGrade') || 'N/A',
            UnitName: await AsyncStorage.getItem('storeUnit') || 'N/A',
            Designation: await AsyncStorage.getItem('userDesig') || 'N/A',
            UserRole: await AsyncStorage.getItem('empRole') || 'N/A',
            EmpStateName: await AsyncStorage.getItem('empStateName') || 'N/A',
            EmpAccountNo: await AsyncStorage.getItem('empAccountNo') || 'N/A',
            EmpBankName: await AsyncStorage.getItem('empBankName') || 'N/A',
            EmpBankIFSC: await AsyncStorage.getItem('empBankIFSC') || 'N/A',
            EmpBloodGroup: await AsyncStorage.getItem('empBloodGroup') || 'N/A',
            EmpStoreName: await AsyncStorage.getItem('empStoreName') || 'N/A',
          };
          //console.log('User details:', userData);
          Object.entries(userData).forEach(([key, value]) => {
            //console.log(`${key}: "${value}"`);
          });
          if (userData.empName && userData.office_code) {
            setLoggedUserDetails(userData);
          }    

      } catch (error) {
        //console.error('Error fetching user details:', error);
        setAlert({ visible: true, title: "Error fetching user details:", message: error.message, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchLoggedUserData();
  }, []);
  
  const openSidebar = () => {
    if (officeType !== 'F') {
      setSidebarVisible(true);
    }
    //setSidebarVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0, // Move to visible position
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -300, // Move back off-screen
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => setSidebarVisible(false)); // Hide modal after animation
  };

  const confirmLogout = async () => {
    try {
      await AsyncStorage.removeItem('username');
      //await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      setLogoutModalVisible(false);
      onLogout();
    } catch (error) {
      //console.error('Failed to logout', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    
    <View style={styles.header}>
      {/* Profile Icon (Opens Sidebar) */}
      <TouchableOpacity style={styles.profileContainer} onPress={openSidebar}>
        {empPhoto ? (
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${empPhoto}` }} // Assuming it's a JPEG image
                        style={{ marginRight: 10, backgroundColor: '#fff', borderRadius: 100, paddingHorizontal: 13, paddingVertical: 13, borderWidth: 1, borderColor: '#fff' }}
                      />
                    ) : (
                      <Ionicons name="person-outline" size={20} color="#fff" style={{ marginRight: 4, backgroundColor: '#333', borderRadius: 100, paddingHorizontal: 4, paddingVertical: 2, }} />
                    )}
       
        <Text style={styles.usernameText}>{loggedUserDetails.empName}</Text>
      </TouchableOpacity>

      {/* Logout Button (Opens Logout Modal) */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => setLogoutModalVisible(true)}>
        <AntDesign name="logout" size={22} color="#fff" style={{ transform: [{ rotate: '270deg' }] }} />
      </TouchableOpacity>

      {/* Sidebar Modal */}
      <Modal transparent={true} visible={sidebarVisible} animationType="none">
        <View style={styles.fullScreenContainer}>
          {/* Clickable overlay to close the sidebar */}
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeSidebar} />    
          {/* Sidebar */}
          <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
            <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
              <AntDesign name="arrow-left" size={20} color="#333" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ transform: [{ scale: 0.6 }] }}>
                    <ActivityIndicator size={50} color="#4a80f5" />
                  </View>
                </View>
              ) : (
              loggedUserDetails ? (
                <View>
                  {/* User Info Section */} 
                  <View style={styles.profileSection}>
                    {/* User Image */}                  

                    {empPhoto ? (
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${empPhoto}` }} // Assuming it's a JPEG image
                        style={styles.profileImage}
                      />
                    ) : (
                      <Text style={styles.userInfo}>No Image Available</Text>
                    )}
                    
                    <Text style={styles.sidebarTitle}>{loggedUserDetails.empName}</Text>
                    <Text style={styles.userInfo}>+91 - {loggedUserDetails.mobilleNo}</Text>
                    <Text 
                      style={styles.userInfo} 
                      //onPress={() => Linking.openURL(`mailto:${loggedUserDetails.PersonalEmail}`)}
                    >{loggedUserDetails.PersonalEmail}</Text>
                  </View>

       {/* Office Details Section */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Office Details</Text>
                    {/* <View style={styles.innersection}> */}
                    <Text><Text style={styles.label}>Email: </Text><Text style={styles.userInfo}>{loggedUserDetails.OfficeEmail}</Text></Text>               
                    <Text><Text style={styles.label}>Department: </Text><Text style={styles.userInfo}>{loggedUserDetails.departmentName}</Text></Text>
                    <Text><Text style={styles.label}>Unit: </Text><Text style={styles.userInfo}>{loggedUserDetails.UnitName}</Text></Text>
                    <Text><Text style={styles.label}>Designation: </Text><Text style={styles.userInfo}>{loggedUserDetails.Designation}</Text></Text>
                    <Text><Text style={styles.label}>Grade: </Text><Text style={styles.userInfo}>{loggedUserDetails.GradeCode}</Text></Text>
                    <Text><Text style={styles.label}>Office Code: </Text><Text style={styles.userInfo}>{loggedUserDetails.office_code}</Text></Text>
                    <Text><Text style={styles.label}>State Code: </Text><Text style={styles.userInfo}>{loggedUserDetails.stateCd}</Text></Text>
                  {/* </View> */}
                    </View>         

                  {trimedOfficeCode?.slice(0, 2) === "IB" && officeType === null && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Store Details</Text>
                      <Text>
                        <Text style={styles.label}>State Name: </Text>
                        <Text style={styles.userInfo}>{loggedUserDetails.EmpStateName}</Text>
                      </Text>
                      <Text>
                        <Text style={styles.label}>Store Name: </Text>
                        <Text style={styles.userInfo}>{loggedUserDetails.EmpStoreName}</Text>
                      </Text>
                    </View>
                  )}

                  {/* Additional Details Section */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bank Details</Text>
                    <Text><Text style={styles.label}>Bank Name: </Text><Text style={styles.userInfo}>{loggedUserDetails.EmpBankName}</Text></Text>
                    <Text><Text style={styles.label}>IFSC Code: </Text><Text style={styles.userInfo}>{loggedUserDetails.EmpBankIFSC}</Text></Text>
                    <Text><Text style={styles.label}>Account No.: </Text><Text style={styles.userInfo}>{loggedUserDetails.EmpAccountNo}</Text></Text>
                  </View>
                  {/* Other Details Section */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Other Details</Text>
                    <Text>
                      <Text style={styles.label}>Blood Group: </Text>
                      <Text style={styles.userInfo}>{loggedUserDetails.EmpBloodGroup}</Text>
                    </Text>

                  </View>
                  {/* Logout Button */}
                  {/* <TouchableOpacity style={[
                      styles.sidebarLogoutButton,
                      { borderColor: isPressed ? '#ff4d4d' : '#ddd' } // Change border color on press
                    ]} onPress={() => setLogoutModalVisible(true)}>
                    <Text style={styles.sidebarLogoutText}>Logout</Text>
                  </TouchableOpacity> */}
                   {/* <TouchableOpacity onPress={() => Linking.openURL('https://docs.google.com/document/d/1mVa1LjlG8G68UmKRbQNrdAquKzP1pjahU0SzOwm35iI/edit?usp=sharing')}>
          <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>Privacy Policy</Text>
        </TouchableOpacity> */}
                </View>
              ) : (
                <Text style={styles.userInfo}>No user details found.</Text>
              )
            )}
  </ScrollView>
           
          </Animated.View>          
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal transparent={true} visible={logoutModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="warning-outline" size={40} color="#ff6347" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Confirm Logout</Text>
           
            <View style={styles.textcontainer}>
                <Text style={styles.modalMessage}>{loggedUserDetails.empName} !</Text>
                <Text style={styles.modalMessage}> Are you sure you want to logout ?</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutConfirmButton} onPress={confirmLogout}>
                <Text style={styles.logoutConfirmButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 8,
    paddingBottom: 10,
    backgroundColor: '#3d89fc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  container: {
    flexGrow: 1,
    //minHeight: 600,  // Ensure enough height for scrolling
    backgroundColor: '#ffffff',
    paddingTop: 15,
    paddingHorizontal: 15,
    //paddingTop: 3,
  }, 
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  logoutButton: {
    //padding: 5,
    //marginRight: 5,
  },
  /* Sidebar Styles */
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },  
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },  
  sidebar: {
    width: 300,
    height: '100%',
    //backgroundColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    position: 'absolute',
    left: 0,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },  
  closeButton: {
    alignSelf: 'flex-end',
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    //color: '#2a7afa',
    color: '#f86c0fff',
    //marginTop: 30,
    marginBottom: 5,
    transform: 'uppercase',
    letterSpacing: 0.3,
  },
  profileSection: {
    alignItems: 'center',
    borderBottomColor: '#333',
    borderBottomWidth: 1,
    //paddingBottom: 10,
    marginBottom: 10,
  },  
  profileImage: {
    width: 80,  // Adjust size as needed
    height: 80,
    borderRadius: 40, // Makes it circular
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },  
  userInfo: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  userInfoLink: {
    color: '#2a7afa',
    fontSize: 14,
    cursor: 'pointer',
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333',
      color: '#2a7afa',
    letterSpacing: 0.3,
  },
  section: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 10,
    //alignItems: 'center',

  },
  innersection: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 15,
    letterSpacing: 0.3,
    fontWeight: '400',
    color: '#fff',
    //color: '#4d5bff',
    marginBottom: 5,
    //backgroundColor: '#ff4d4d',
    backgroundColor: '#2a7afa',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sidebarLogoutButton: {
    //backgroundColor: '#ff4d4d',
    paddingVertical: 5,
    paddingHorizontal: 3,
    borderRadius: 4,
    alignItems: 'center',
    //marginTop: 20,
    width: 70,
    //height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  sidebarLogoutText: {
    //color: '#fff',
    fontSize: 14,
    letterSpacing: 0.3,
    fontWeight: '600',
  },  
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
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
    letterSpacing: 0.3,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    letterSpacing: 0.2,
    color: '#555',
    textAlign: 'center',
    //marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  textcontainer: {
     marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  logoutConfirmButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#ff6347',
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutConfirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Header;
