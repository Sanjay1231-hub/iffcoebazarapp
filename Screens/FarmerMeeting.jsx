import React, { useState, useEffect, useCallback  } from 'react';
import { View, Text, Modal, FlatList, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FarmerMeetingType from '../Component/FarmerMeetingType';
import AlertWithIcon from "../Component/AlertWithIcon";

const FarmerMeeting = () => {
    const [bankList, setBankList] = useState([]);
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({           
        amountEntered: '',
        reason: '',
        slipNo: '',
    });
    const [loading, setLoading] = useState(true);
    const [farmerNo, setFarmerNo] = useState("");
    const [remark, setRemark] = useState("");
    const [DistrictModalVisible, setDistrictModalVisible] = useState(false);
    const [blockModalVisible, setBlockModalVisible] = useState(false);
    const [villageModalVisible, setVillageModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [meetingType, setMeetingType] = useState(null);
    const [selectedBlockItem, setSelectedBlockItem] = useState(null);
    const [selectedVillageItem, setSelectedVillageItem] = useState(null);
    const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" }); 

    const fetchData = async (modelType) => {
        try {
          setLoading(true);
      
          //const loggedInEmpStore = await AsyncStorage.getItem('officeCode');
      
          if (!modelType) {
            throw new Error('No Lov selected');
          }
          //console.log("fetch MOdel type is", modelType);
      
          const postData = {
            token: "IEBL0001",
            apiId: "43",
            inApiParameters: [
              { label: "P_LOV_TYPE", value: modelType },
              { label: "P_DISTT_CD", value: selectedItem?.DISTT_CD || "" },
            ],
          };

          //console.warn('postData:', JSON.stringify(postData));
      
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
            throw new Error('Unexpected data format received.');
          }
            //console.log("District list fetched:", result.output);
          setData(result.output);
        
      
        } catch (error) {
          //console.error('Error fetching data:', error);
          setAlert({
            visible: true,
            title: "Fetch Error",
            message: error.message || "Failed to fetch data. Please try again.",
            type: "error",
          });
        } finally {
          setLoading(false);
        };
    };

    const handleSubmit = async () => {
        // Basic validation before API call
        if (!meetingType || meetingType === "---Select---") {
            setAlert({ visible: true, title: "Validation Error", message: "Please select a meeting type.", type: "warning" });
            return;
        }

        if (!selectedItem) {
            setAlert({ visible: true, title: "Validation Error", message: "Please select a district name.", type: "warning" });
            return;
        }

        if (!selectedBlockItem) {
            setAlert({ visible: true, title: "Validation Error", message: "Please select a block name.", type: "warning" });
            return;
        }

        if (!selectedVillageItem) {
            setAlert({ visible: true, title: "Validation Error", message: "Please select a village name.", type: "warning" });
            return;
        }

        if (!farmerNo || isNaN(farmerNo)) {
            setAlert({ visible: true, title: "Validation Error", message: "Please enter number of farmers.", type: "warning" });
            return;
        }

        if (!remark || remark.trim() === "") {
            setAlert({ visible: true, title: "Validation Error", message: "Remarks field cannot be empty.", type: "warning" });
            return;
        } 
        const loggedUserStoreCd = await AsyncStorage.getItem('officeCode');
        if (!loggedUserStoreCd) {
          throw new Error('No user found');
        }

        const requestData = {
            token: 'IEBL0001',
            apiId: '44',
            inApiParameters: [
                { label: 'P_MEETING_FLAG', value: meetingType || "" },
                { label: 'P_DIST_CD', value: selectedItem?.DISTT_CD || "" },
                { label: 'P_DIST_NAME', value: selectedItem?.DISTT_NAME || "" },
                { label: 'P_BLOCK_CD', value: selectedBlockItem?.BLOCK_CD || "" },
                { label: 'P_BLOCK_NAME', value: selectedBlockItem?.BLOCK_NAME || "" },
                { label: 'P_VILLAGE_CD', value: selectedVillageItem?.VILLAGE_CD || "" },
                { label: 'P_VILLAGE_NAME', value: selectedVillageItem?.VILLAGE_NAME || "" },
                { label: 'P_NUM_OF_FARMERS', value: farmerNo },
                { label: 'P_REMARKS', value: remark },
                { label: 'P_PHOTO', value: "" },
                { label: 'P_STORE_CD', value: loggedUserStoreCd },
            ],            
        };  
        
        //console.log("Submitted Values are", requestData)
        
        try {
            const response = await fetch('https://ebazarapi.iffco.in/API', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'ReactNativeApp/1.0',
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestData),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            //console.log("Respose data is", response);
            
            //const data = await response.json();
            setAlert({ visible: true, title: "Success", message: "Record saved successfully", type: "success" });
            resetForm();
        } catch (error) {
            setAlert({ visible: true, title: "Error saving data", message: error.message, type: "error" });
        }   
    };

    const resetForm = () => {
        setMeetingType("---Select---");   // dropdown reset
        setSelectedItem(null);            // District reset

        setSelectedBlockItem(null);       // Block reset

        setSelectedVillageItem(null);     // Village reset

        setFarmerNo("");                  // Farmers count reset
        setRemark("");                    // Remarks reset
    };


    const handleSelectItem = (item) => {
        setSelectedItem(item);  // store the whole object
        setDistrictModalVisible(false);
    };

    const SelectedBlockItem = (item) => {
        setSelectedBlockItem(item);
        setBlockModalVisible(false);
    };

    const SelectedVillageItem = (item) => {
        setSelectedVillageItem(item);
        setVillageModalVisible(false);
    };

   

     const handleModelClick = async (modelType) => {
        //console.log("Modeltype", modelType); 
        setLoading(true);
        await fetchData(modelType);
        //setData(list);
        if(modelType == "D"){
            setDistrictModalVisible(true);
        }
         if(modelType == "B"){
            setBlockModalVisible(true);
        }
         if(modelType == "V"){
            setVillageModalVisible(true);
        }
        
        setLoading(false);
    };



  return (
    <ScrollView contentContainerStyle={styles.container}>
     
            <Text style={styles.heading}>Add Meeting Records</Text>

    
            <View style={styles.row}>            
                <Text style={styles.label}>Meeting Type<Text style={styles.asterisk}>*</Text></Text>                
                <View style={{ width: '60%', backgroundColor: '#f9f9f9'}}>
                    <FarmerMeetingType selectedValue={meetingType} onValueChange={setMeetingType}/>
                </View>
            </View>      


            <View style={styles.row}>
                <Text style={styles.label}>District Name<Text style={styles.asterisk}>*</Text></Text>               
                <TouchableOpacity style={styles.buttonLov}  onPress={() => handleModelClick("D")}>
                    <Ionicons name="search" size={22} color="#fff" />
                </TouchableOpacity>
                <TextInput
                    style={[styles.input, { paddingLeft: 40, color: '#333' }]}
                    placeholder="--Select--"
                    value={selectedItem ? selectedItem.DISTT_NAME : '---Select---'}
                    editable={false}
                />            
              
                <Modal animationType="slide" transparent={true} visible={DistrictModalVisible} onRequestClose={() => setDistrictModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>District LOV</Text>
                                <Ionicons name="close" size={24} onPress={() => setDistrictModalVisible(false)} style={styles.lovclose} />
                            </View>
                            <View style={styles.header}>
                                <Text style={styles.headerText}>District Name</Text>
                                <Text style={styles.headerText}>District Code</Text>
                            </View>
                            <FlatList
                                data={data}
                                keyExtractor={(item) => item.SNO}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => handleSelectItem(item)}>
                                        <View style={styles.tableRow}>
                                            <Text style={[styles.cell, { textAlign: 'left' }]}>{item.DISTT_NAME}</Text>  
                                             <Text style={[styles.cell, { textAlign: 'left' }]}>{item.DISTT_CD}</Text>  
                                        </View>
                                       
                                        
                                    </TouchableOpacity>
                                )}
                                  initialNumToRender={5}  // Initially render only 20 items
                                maxToRenderPerBatch={5}  // Render 20 items per batch as you scroll
                                windowSize={5}  // Render a few items above and below the viewport
                                showsVerticalScrollIndicator={true}
                                style={styles.flatList}
                            />
                        </View>
                    </View>
                </Modal> 
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Block Name<Text style={styles.asterisk}>*</Text></Text>               
                <TouchableOpacity style={styles.buttonLov}  onPress={() => handleModelClick("B")}>
                    <Ionicons name="search" size={22} color="#fff" />
                </TouchableOpacity>
                <TextInput
                    style={[styles.input, { paddingLeft: 40 }]}
                    placeholder="--Select--"
                    value={selectedBlockItem ? selectedBlockItem.BLOCK_NAME : '---Select---'}
                    editable={false}
                />            
               
                <Modal animationType="slide" transparent={true} visible={blockModalVisible} onRequestClose={() => setBlockModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Block LOV</Text>
                                <Ionicons name="close" size={24} onPress={() => setBlockModalVisible(false)} style={styles.lovclose} />
                            </View>
                            <View style={styles.header}>
                                <Text style={styles.headerText}>Block Name</Text>
                                <Text style={styles.headerText}>Block Code</Text>
                            </View>
                            <FlatList
                                data={data}
                                keyExtractor={(item) => item.SNO}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => SelectedBlockItem(item)}>
                                        <View style={styles.tableRow}>
                                            <Text style={[styles.cell, { textAlign: 'left' }]}>{item.BLOCK_NAME}</Text>  
                                             <Text style={[styles.cell, { textAlign: 'left' }]}>{item.BLOCK_CD}</Text>  
                                        </View>                                       
                                        
                                    </TouchableOpacity>
                                )}
                                  initialNumToRender={5}  // Initially render only 20 items
                                maxToRenderPerBatch={5}  // Render 20 items per batch as you scroll
                                windowSize={5}  // Render a few items above and below the viewport
                                showsVerticalScrollIndicator={true}
                                style={styles.flatList}
                            />
                        </View>
                    </View>
                </Modal> 
            </View>

        

            <View style={styles.row}>
                    <Text style={styles.label}>Village Name<Text style={styles.asterisk}>*</Text></Text>              
                    <TouchableOpacity style={styles.buttonLov} onPress={() => handleModelClick("V")}>
                        <Ionicons name="search" size={22} color="#fff" />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { paddingLeft: 40 }]}
                        placeholder="--Select--"
                        value={selectedVillageItem ? selectedVillageItem.VILLAGE_NAME : '---Select---'}
                        editable={false}
                    />            
               
                <Modal animationType="slide" transparent={true} visible={villageModalVisible} onRequestClose={() => setVillageModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Village Name LOV</Text>
                                <Ionicons name="close" size={24} onPress={() => setVillageModalVisible(false)} style={styles.lovclose} />
                            </View>
                            <View style={styles.header}>
                                <Text style={styles.headerText}>Village Name</Text>
                                <Text style={styles.headerText}>Village Code</Text>
                            </View>
                            <FlatList
                                data={data}
                                keyExtractor={(item) => item.SNO}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => SelectedVillageItem(item)}>
                                        <View style={styles.tableRow}>
                                            <Text style={[styles.cell, { textAlign: 'left' }]}>{item.VILLAGE_NAME}</Text>  
                                            <Text style={[styles.cell, { textAlign: 'left' }]}>{item.VILLAGE_CD.trim()}</Text>  
                                        </View>
                                     
                                        
                                    </TouchableOpacity>
                                )}
                                initialNumToRender={5}  // Initially render only 20 items
                                maxToRenderPerBatch={5}  // Render 20 items per batch as you scroll
                                windowSize={5}  // Render a few items above and below the viewport
                                showsVerticalScrollIndicator={true}
                                style={styles.flatList}
                            />
                        </View>
                    </View>
                </Modal> 
            </View>

             <View style={styles.row}>            
                <Text style={styles.label}>No. of Farmers<Text style={styles.asterisk}>*</Text></Text>
                <TextInput
                style={styles.input}
                placeholder="No. Of farmers"
                value={farmerNo}
                onChangeText={setFarmerNo}
                />
            </View>  
            <View style={styles.row}>            
                <Text style={styles.label}>Remarks<Text style={styles.asterisk}>*</Text></Text>
                <TextInput
                style={styles.input}
                placeholder="Remark"
                value={remark}
                onChangeText={setRemark}
                />
            </View>  
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>Submit</Text>
                </TouchableOpacity>      

                
            </View>

            

   
            <AlertWithIcon
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ ...alert, visible: false })}
            />
      
        
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#f0f0f0",
    },
    heading: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
        color: "#084da1",
    },

    row: {
        flexDirection: "row",
        alignItems: "center",        
        marginBottom: 10,    
    },
    tableRow: {
        flexDirection: "row",
        alignItems: "center",    
         borderBottomWidth: 1,
        borderColor: '#ccc',    
        //marginBottom: 10,    
    },
    label: {
        flex: 1, // takes 1 part (left column)
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    asterisk: {
        color: 'red',
        fontSize: 16,
        letterSpacing: 0.3, 
    },
    modalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignItems: "center",
        marginBottom: 12,
    },
     flatList: {
        flexGrow: 1, // This makes the FlatList take the available space
        maxHeight: 400, // Set a maximum height if needed
        width: '100%',
        backgroundColor: '#fff',
    }, 
    buttonLov: {
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007BFF',        
        borderRadius: 5,
        paddingHorizontal: 5,     
        marginRight: -33,
        zIndex: 1
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#e4e4e4',
        borderRadius: 2,
        padding: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',        
        borderBottomWidth: 1,
        borderColor: '#ccc',
        
    },
    header: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        paddingVertical: 3,
        backgroundColor: '#6c80ad',
        borderColor: '#ffffff',
        borderBottomWidth: 1,
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 13,
        color: '#fff',
        borderRightWidth: 1,
        borderColor: '#FFFFFF',
        letterSpacing: 0.3, 

    },
    input: {
        //flex: 3, // takes 2 parts (right column)
        minHeight: 35,
        width: '60%',
        letterSpacing: 0.3, 
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        paddingHorizontal: 10,
        //paddingVertical: 6,
        color: '#333',
        fontSize: 15,
        backgroundColor: "#ffffff",
    },
   
    cell: {
        flex: 1,
        backgroundColor: '#f5f5f5',       
        paddingRight: 5,
        paddingVertical: 5,
        paddingLeft: 5,
        borderRightWidth: 1,
        borderColor: '#ccc',
    },
    modalTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        letterSpacing: 0.3, 

    },
    lovclose: {
        fontSize: 24,
        letterSpacing: 0.3, 

    },
    bankItem: {
        fontSize: 16,
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    saveButton: {
        //backgroundColor: '#0063B2',
        backgroundColor: '#208cf3',
        marginTop: 10,
        borderRadius: 5,
        minHeight: 35,
        alignItems: 'center',
        fontWeight: '500',
        //flex: 1,
        justifyContent: 'center',
        // Shadow for iOS
        shadowColor: '#000', // Color of the shadow
        //shadowColor: '#0368ff', // Color of the shadow
        shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
        shadowOpacity: 0.1, // Transparency of the shadow
        shadowRadius: 5, // Blur effect of the shadow
        
        // Shadow for Android
        elevation: 5, // Elevation for Android shadow
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        letterSpacing: 0.3, 
        fontWeight: '400',
    },
    buttonContainer: {
    //flexDirection: 'row',   
    justifyContent: 'center', // Push content to the bottom    
  },
    
  
});

export default FarmerMeeting;
