import React, { useState, useEffect, useCallback  } from 'react';
import { View, Text, Modal, FlatList, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '../../Component/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertWithIcon from '../../Component/AlertWithIcon';


const CashDepositApproval = () => {
    const [bankList, setBankList] = useState([]);
    const [storeName, setStoreName] = useState('');
    const [bankName, setBankName] = useState('');   
    const [formData, setFormData] = useState({
        storeName,
        bankName,
        fromDate: new Date(),
        toDate: new Date()     
    });
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" }); 

    useEffect(() => {
        fetchBankList();
    }, []);

    const fetchBankList = useCallback(async () => {
        try {
          setLoading(true);      
          const loggedInEmpStore = await AsyncStorage.getItem('officeCode');
      
          if (!loggedInEmpStore) {
            throw new Error('No store found');
          }
      
          const postData = {
            token: "IEBL0001",
            apiId: "28",
            inApiParameters: [
              { label: "P_FSC_CD", value: loggedInEmpStore }
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
      
          setBankList(result.output);
          // console.log("Bank list fetched:", result.output);
      
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
        }
      }, []);
      

    const handlefromDateChange = (event, date) => {
        if (date) setFormData((prev) => ({ ...prev, fromDate: date }));
        setShowFromDatePicker(false);
    };

    const handletoDateChange = (event, date) => {
        if (date) setFormData((prev) => ({ ...prev, toDate: date }));
        setShowToDatePicker(false);
    };

    const resetForm = () => {
        setFormData({
            storeName,
            bankName,
            fromDate: new Date(),
            toDate: new Date()            
        });
    };

    const handleSave = async () => {
        const { storeName, bankName } = formData;

        if (!storeName || !bankName) {
            setAlert({ visible: true, title: "Validation Error", message: "Please fill all required fields!", type: "warning" });
            return;
        }

        setSaving(true);

        const loggedInEmpStore = await AsyncStorage.getItem('officeCode');

        if (!loggedInEmpStore) {
            setAlert({ visible: true, title: "Error", message: "No store or user found!", type: "error" });
            setSaving(false);
            return;
        }

        const postData = {
            inApiParameters: [
                { label: 'P_DTDEPOSIT', value: formatDate(formData.fromDate) },
                { label: 'P_DTDEPOSIT', value: formatDate(formData.toDate) },            
                { label: 'P_FSC_CD', value: loggedInEmpStore },              
                { label: 'P_DEPOSIT_ENTITY', value: selectedItem?.BANK_NAME },               
                { label: 'P_SOURCE', value: "MOB_APP" }
            ],
            token: 'IEBL0001',
            apiId: '299'                       
        };

        try {
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

            const responseText = await response.text();
          
            if (!response.ok) {              
              throw new Error(`HTTP error! Status: ${response.status}`);
            }

            let result;
            try {
              result = JSON.parse(responseText);
              //console.log("Parsed API result:", result);
            } catch (parseError) {
              //console.error('Error parsing server response:', parseError);
              setAlert({
                visible: true,
                title: "Error",
                message: "Failed to parse server response.",
                type: "error",
              });
              return;
            }

            const responseData = result.output;
          
            if (responseData?.OUT_PARAM_1) {
                setAlert({ visible: true, title: "Success", message: responseData?.OUT_PARAM_1, type: "success" });
                resetForm();
            } else {
              setAlert({ visible: true, title: "Error", message: "Unexpected server response.", type: "error" });
            }

            
        } catch (error) {
            setAlert({ visible: true, title: "Error", message: error.message || 'An error occurred while depositing amount.', type: "error" });

        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item);
        setModalVisible(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.label}>Store Name *</Text>               
                <TextInput
                style={styles.textInput}
                value={formData.storeName}
                onChangeText={(text) => handleInputChange('storeName', text)}
                placeholder="Select Store Name"                                        
                placeholderTextColor='#ddd'
                allowFontScaling={false}
                /> 
            </View>
            
            <View style={styles.section}>
                <Text style={styles.label}>Bank Name<Text style={styles.asterisk}>*</Text></Text>
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.searchIcon} onPress={() => setModalVisible(true)}>
                        <Ionicons name="search" size={22} color="#fff" />
                       
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { backgroundColor: '#f0f0f0', width: '100%' }]}
                        placeholder="--Select--"
                        value={selectedItem ? selectedItem.BANK_NAME : '---Select---'}
                        editable={false}
                        allowFontScaling={false}
                    />                    
                </View>

                <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Bank LOV</Text>
                                <Ionicons name="close" size={24} onPress={() => setModalVisible(false)} style={styles.lovclose} />
                            </View>
                            <View style={styles.header}>
                                <Text style={styles.headerText}>Bank Name</Text>
                            </View>
                            <FlatList
                                data={bankList}
                                keyExtractor={(item) => item.BANK_NAME}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => handleSelectItem(item)}>
                                        <View style={styles.row}>
                                            <Text style={[styles.cell, { textAlign: 'left' }]}>{item.BANK_NAME}</Text>  
                                        </View>
                                        
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </Modal>  
            </View>
            
            <View style={styles.section}>
                <Text style={styles.label}>From Date<Text style={styles.asterisk}>*</Text></Text>
            
                <TouchableOpacity onPress={() => setShowFromDatePicker(true)} style={styles.dateButton}>
                    <Text style={styles.dateText}>{formatDate(formData.fromDate)}</Text>
                </TouchableOpacity>
                
                {showFromDatePicker && (
                    <DateTimePicker
                        value={formData.fromDate}
                        mode="date"
                        display="default"
                        maximumDate={new Date()} // Prevents future dates
                        onChange={handlefromDateChange}
                    />
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>To Date<Text style={styles.asterisk}>*</Text></Text>
            
                <TouchableOpacity onPress={() => setShowToDatePicker(true)} style={styles.dateButton}>
                    <Text style={styles.dateText}>{formatDate(formData.toDate)}</Text>
                </TouchableOpacity>
                
                {showToDatePicker && (
                    <DateTimePicker
                        value={formData.toDate}
                        mode="date"
                        display="default"
                        maximumDate={new Date()} // Prevents future dates
                        onChange={handletoDateChange}
                    />
                )}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
            </TouchableOpacity>

            {/* Custom Alert Modal */}
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
        flexGrow: 1,
        backgroundColor: '#fff',
        padding: 10
    },
    section: {        
        marginBottom: 10       
    },   
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#424242',
        fontWeight: '400',
        letterSpacing: 0.3, 
    },
    asterisk: {
        color: 'red',
        fontSize: 16,
        letterSpacing: 0.3, 
    },   
    dateButton: {
        backgroundColor: '#f0f0f0',
        padding: 5,
        borderRadius: 5,
        marginBottom: 10,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    dateText: {
        fontSize: 15,
        textAlign: 'center',
        letterSpacing: 0.3, 
    },
    textInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 10,        
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,       
        letterSpacing: 0.3, 
        lineHeight: 18,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#f2f2f2',
        height: 40,
        overflow: 'hidden',
    },
    searchIcon: {
        width: 35,
        height: 40,
        backgroundColor: '#0d6efd',
        textAlign: 'center',
        textAlignVertical: 'center',
        padding: 6, // Android alignment fix
        paddingTop: 8, // Android alignment fix
    }, 
    input: {
        flex: 1,
        height: 40,
        paddingHorizontal: 8,
        fontSize: 15,
        color: '#000',
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#ccc',
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
    
});

export default CashDepositApproval;
