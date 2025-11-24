import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Modal, FlatList, ActivityIndicator, Alert, TouchableWithoutFeedback } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import AlertWithIcon from '../../Component/AlertWithIcon';

export default function NEFTDeposit() {
    const data = new Array(1).fill(null).map((_, index) => `Item ${index}`);
    // State to manage the rows and their data
    const [rows, setRows] = useState([
        {
          id: 1,
          customername: '',
          customerid: '',
          customerrefname: '',
          fromDate: null,
          toDate: null,
          showFromDatePicker: false,
          showToDatePicker: false,
          amount: '',          
          value: '',
          neftnumber: '',
          remark: '',
          // add other fields as needed
        },
      ]);
          
    const options = [
        { label: '--Select--', value: '' },
        { label: 'NEFT / RTGS', value: 'N' },
        { label: 'Cheque', value: 'C' },
        { label: 'Demand Draft', value: 'D' },
      ];
    const [selectedValue, setSelectedValue] = useState(''); // Default selection set to '--Select--'
    const [bankList, setBankList] = useState([]);
    const [product, setProduct] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalBankVisible, setModalBankVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [prodModalVisible, setProdModalVisible] = useState(false); 
    const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });

    const formatDate = (date) => {
        if (!date) return '--Select--';
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

    const handleDateChange = (type, date, rowIndex) => {
        if (!date) return;
      
        const updatedRows = [...rows];
        const row = updatedRows[rowIndex];
      
        if (type === 'from') {
          row.fromDate = date;
          row.showFromDatePicker = false;
        } else {
          row.toDate = date;
          row.showToDatePicker = false;
        }
      
        setRows(updatedRows);
      };
      

    const fetchBankList = async () => {
        try {
            const loggedInEmpStore = await AsyncStorage.getItem('officeCode');

            if (!loggedInEmpStore) {
                Alert.alert('Error', 'No store found');
                return;
            }

            const postData = {
                token: "8548528525568856",
                serviceID: "6037",
                inParameters: [{ label: "P_FSC_CD", value: loggedInEmpStore }],
            };

            const response = await fetch('https://mappws.iffco.coop/ebazarapi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();

            if (!Array.isArray(result)) throw new Error('Invalid data format received');

            setBankList(result);
        } catch (error) {
            //console.error('Error fetching data:', error);
            //Alert.alert('Fetch Error', error.message);
            setAlert({ visible: true, title: "Fetch Error", message: error.message, type: "error" });

        } 
    };
      
    const fetchProduct = async () => {
        try {
            const loggedInEmpStore = await AsyncStorage.getItem('officeCode');

            const postData = {
                token: "8548528525568856",
                serviceID: "6046",                
                inParameters: [
                    { label: 'P_FSC_CD', value: loggedInEmpStore },               
                    { label: 'P_BILLNO', value: "" },
                    { label: 'P_FSC_CD', value: loggedInEmpStore }
                ],
            };

            const response = await fetch('https://mappws.iffco.coop/ebazarapi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            if (!Array.isArray(result)) throw new Error('Invalid data format received');
            if (result.length > 0) 
            {
                setLoading(false);  // Set loading to false once data is available
            }
            //console.log("fetched product result", result);
            setProduct(result);            
        
        } catch (error) {
            //console.error('Error fetching data:', error);
            //Alert.alert('Fetch Error', error.message);
            setAlert({ visible: true, title: "Fetch Error", message: error.message, type: "error" });

        } finally {
            setLoading(false);
        }
    };

    const selectProduct = (product, rowId) => {             
        setRows(prevRows => 
            prevRows.map(row => 
                row.id === rowId 
                    ? { 
                        ...row, 
                        customername: product.PRD_DESC, 
                        customerid: product.PRD_CD, 
                        customerrefname: product.BAG_CD
                    } 
                    : row
            )
        );        
        closeModalProd();
    }; 
    const selectBank = (bankList, rowId) => {             
        setRows(prevRows => 
            prevRows.map(row => 
                row.id === rowId 
                    ? { 
                        ...row,                                               
                        value: bankList.BANK_NAME                       
                    } 
                    : row
            )
        );
        
        setModalBankVisible(false);
    }; 

    const handleSelect = (value) => {
        //console.log("Selected value:", value);
      
        if (value === '') {
            setAlert({ visible: true, title: "Validation Error", message: "Please select a valid option.", type: "warning" });
            return;
          }      
      
        setSelectedValue(value); // Corrected this line
        setModalVisible(false);
      };

    const openModalProd = () => {
        fetchProduct();
        setProdModalVisible(true);
    };

    const openModalBank = () => {
        fetchBankList();
        setModalBankVisible(true);
    };

    // Close Modal Prod
    const closeModalProd = () => {
        setProdModalVisible(false);
    };

    const removeRow = (rowId) => {
        // Remove the row
        const updatedRows = rows.filter(row => row.id !== rowId);
        const reIndexedRows = updatedRows.map((row, index) => ({
            ...row,
            id: index + 1,  // Reassign ids based on new index
        }));
        
        setRows(reIndexedRows);
    };
  return (    
    <FlatList
        data={data}
        keyExtractor={(index) => index.toString()}
        renderItem={() => ( 
        <View style={styles.container}>
            <Text style={styles.tabheader}>PAYMENT<Text style={styles.asterisk}></Text></Text>
                    {/* Render the rows with inputs */}            
                    <FlatList
                        style={{ width: '100%', height: 'auto' }}
                        data={rows}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => (
                                                
                    
                            <View style={styles.Prdcell}>
                                <View style={styles.tabInputContainer}>
                                    <TouchableOpacity style={styles.buttonLov} onPress={openModalProd} >
                                        <Ionicons name="search" size={20} color="white" />                                   
                                    </TouchableOpacity>
                                    <TextInput
                                        style={[styles.input, { width: '92%', color: '#333', backgroundColor: '#f0f0f0'}]}
                                        placeholder="--Select Customer Name--"
                                        value={item.customername}
                                        placeholderTextColor="#a3a3a3"
                                        editable={false} 
                                    />
                                    <Modal
                                        animationType="slide"
                                        transparent={true}
                                        visible={prodModalVisible}
                                        onRequestClose={() => setProdModalVisible(false)}
                                    > 
                                        <View style={styles.modalContainer}>
                                            <View style={styles.modalContent}>
                                                {/* Fixed Header */}
                                                <View style={styles.row}> 
                                                    <Text style={styles.modalTitle}>Product LOV</Text>
                                                    <Ionicons name="close" size={24} color="black" onPress={closeModalProd} style={styles.lovclose} />
                                                </View>

                                                <View style={styles.header}>                           
                                                    <Text style={[styles.headerText, { flex: 2.7, textAlign: 'center' }]}>Product Name</Text>
                                                    <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Prod. Cd.</Text>
                                                    <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Bag Cd.</Text>
                                                    <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Stock</Text>                        
                                                </View>
                                                {/* Loading Indicator */}
                                                {loading ? (
                                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                        <View style={{ transform: [{ scale: 0.6 }] }}>
          <ActivityIndicator size={50} color="#4a80f5" />
        </View>
                                                    </View>
                                                ) : (

                                                        <FlatList
                                                            data={product}
                                                            //keyExtractor={(item, index) => item.ID ? item.ID.toString() + index.toString() : index.toString()}         
                                                            keyExtractor={(item) => item.PRD_CD.toString()}                    
                                                            renderItem={({ item }) => (
                                                                <TouchableOpacity onPress={() => selectProduct(item, rows[rows.length - 1].id)}>
                                                                    <View style={styles.row}>                                       
                                                                        <Text style={[styles.cell, { flex: 3, textAlign: 'left' }]}>
                                                                        {item.PRD_DESC || 'No Data'}
                                                                        </Text> 
                                                                        <Text style={[styles.cell, { flex: 1, textAlign: 'left' }]}>
                                                                        {item.PRD_CD || 'No Prd Code'}
                                                                        </Text>
                                                                        <Text style={[styles.cell, { flex: 1, textAlign: 'left' }]}>
                                                                        {item.BAG_CD || 'No Prd Code'}
                                                                        </Text>
                                                                        <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>
                                                                        {item.STOCK != null ? item.STOCK : '0'}
                                                                        </Text>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            )}
                                                            initialNumToRender={5}  // Initially render only 20 items
                                                            maxToRenderPerBatch={5}  // Render 20 items per batch as you scroll
                                                            windowSize={5}  // Render a few items above and below the viewport
                                                            showsVerticalScrollIndicator={true}
                                                            style={styles.flatList}
                                                        />                     
                                                    )}

                                                <View style={styles.footer}>
                                                    <Text style={styles.footerText}>Total Records: {product.length}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Modal>
                                </View>

                                <View style={styles.tabInputContainer}>
                                    <TextInput
                                        style={[styles.input, { width: '100%', color: '#333', backgroundColor: '#f0f0f0' }]}
                                        placeholder="--Customer ID--"
                                        value={item.customerid}
                                        placeholderTextColor="#a3a3a3"
                                        editable={false} 
                                    />
                                </View>

                                <View style={styles.tabInputContainer}>
                                    <TextInput
                                        style={[styles.input, { width: '100%', color: '#333', backgroundColor: '#f0f0f0' }]}
                                        placeholder="--Customer Reference NAme--"
                                        value={item.customerrefname}
                                        placeholderTextColor="#a3a3a3"
                                        editable={false} 
                                    />
                                </View>
                                <View style={styles.tabInputContainer}>  
                                    <Text style={[styles.label, { paddingRight: 12}]}>Instrument Type:</Text> 
                                </View> 
                                <View style={styles.tabInputContainer}>
                                    <TouchableOpacity
                                        style={styles.pickerButton}
                                        onPress={() => setModalVisible(true)}
                                    >
                                        <Text style={styles.pickerText}>
                                        {options.find(option => option.value === selectedValue)?.label || '--Select--'}
                                        </Text>
                                    </TouchableOpacity>                                            
                                    <Modal
                                        transparent={true}
                                        visible={modalVisible}
                                        onRequestClose={() => setModalVisible(false)}
                                        animationType="fade"
                                    >
                                        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                                            <View style={styles.modalContainer}>
                                                <TouchableWithoutFeedback>
                                                <View style={styles.modalContent}>
                                                    <FlatList
                                                    data={options}
                                                    keyExtractor={item => item.value}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity
                                                            style={[
                                                                styles.option,
                                                                item.value === selectedValue && styles.selectedOption
                                                            ]}
                                                            onPress={() => handleSelect(item.value)}
                                                        >
                                                        <Text style={styles.optionText}>{item.label}</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                    />
                                                </View>
                                                </TouchableWithoutFeedback>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </Modal>
                                </View>    
                                <View style={styles.tabInputContainer}>  
                                    <Text style={[styles.label, { paddingRight: 12}]}>Cheque/DD/UTR Number:</Text> 

                                </View>    
                                <View style={styles.tabInputContainer}>
                                    <TextInput
                                            style={[styles.input, { width: '100%', color: '#333' }]}
                                            placeholder="Cheque/DD/UTR Number"
                                            value={item.neftnumber}
                                            placeholderTextColor="#a3a3a3"
                                            onChangeText={(text) => {
                                                const updatedRows = [...rows];
                                                updatedRows[index].neftnumber = text;
                                                setRows(updatedRows);
                                            }}
                                    />
                                </View> 
                                <View style={styles.tabInputContainer}>
                                    <Text style={styles.label}>Date<Text style={styles.asterisk}>*</Text></Text>
                                </View>
                                <View style={styles.tabInputContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                        const updatedRows = [...rows];
                                        updatedRows[index].showFromDatePicker = true;
                                        setRows(updatedRows);
                                        }}
                                        style={styles.dateButton}
                                    >
                                        <Text style={styles.dateText}>{item.fromDate ? formatDate(item.fromDate) : '-- Select Date --'}</Text>
                                    </TouchableOpacity>

                                    {item.showFromDatePicker && (
                                        <DateTimePicker
                                        value={item.fromDate || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, date) => handleDateChange('from', date, index)}
                                        />
                                    )}
                                </View>

                                <View style={styles.tabInputContainer}>
                                    <Text style={styles.label}>Accounting Date (DSR)<Text style={styles.asterisk}>*</Text></Text>
                                </View>
                                <View style={styles.tabInputContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                        const updatedRows = [...rows];
                                        updatedRows[index].showToDatePicker = true;
                                        setRows(updatedRows);
                                        }}
                                        style={styles.dateButton}
                                    >
                                        <Text style={styles.dateText}>{item.toDate ? formatDate(item.toDate) : '-- Select Date --'}</Text>
                                    </TouchableOpacity>

                                    {item.showToDatePicker && (
                                        <DateTimePicker
                                        value={item.toDate || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, date) => handleDateChange('to', date, index)}
                                        />
                                    )}
                                </View>
                                
                                <View style={styles.tabInputContainer}>  
                                    <Text style={[styles.label, { paddingRight: 12}]}>Amount:</Text> 
                                </View>
                                <View style={styles.tabInputContainer}>
                                    <TextInput
                                        style={[styles.input, { width: '100%', color: '#333' }]}
                                        placeholder="Enter Amount"
                                        value={item.amount}
                                        keyboardType="decimal-pad"
                                        placeholderTextColor="#a3a3a3"
                                        onChangeText={(text) => {
                                            // Allow only digits and one optional decimal point
                                            const cleanedText = text.replace(/[^0-9.]/g, '');

                                            // Prevent multiple decimals
                                            const decimalCount = (cleanedText.match(/\./g) || []).length;
                                            if (decimalCount > 1) return;

                                            const updatedRows = [...rows];
                                            updatedRows[index].amount = cleanedText;
                                            setRows(updatedRows);
                                        }}
                                    />

                                </View>

                                <View style={styles.tabInputContainer}>
                                    <Text style={[styles.label, { paddingRight: 4, paddingLeft: 4}]}>NEFT Deposited at Bank:</Text> 
                                </View>    
                                <View style={styles.tabInputContainer}>

                                    <TouchableOpacity style={styles.buttonLov} onPress={() => openModalBank(true)}>
                                        <Ionicons name="search" size={22} color="#fff" />
                                    </TouchableOpacity>
                                    <TextInput
                                        style={[styles.input, { width: '92%', color: '#333', backgroundColor: '#f0f0f0'}]}
                                        placeholder="--Select Bank--"
                                        value={item.value}
                                        placeholderTextColor="#a3a3a3"
                                        editable={false}
                                    />
                                
                                    <Modal 
                                        animationType="slide" 
                                        transparent={true} 
                                        visible={modalBankVisible} 
                                        onRequestClose={() => setModalBankVisible(false)}
                                    >                                       
                                        <View style={styles.modalContainer}>
                                            <View style={styles.modalContent}>
                                                <View style={styles.row}> 
                                                    <Text style={styles.modalTitle}>Bank LOV</Text>
                                                    <Ionicons name="close" size={24} color="black" onPress={setModalBankVisible} style={styles.lovclose} />                                                    
                                                </View>
                                            
                                                <View style={styles.header}>
                                                    <Text style={styles.headerText}>Bank Name</Text>
                                                </View>
                                                <FlatList
                                                    data={bankList}
                                                    keyExtractor={(item) => item.BANK_NAME}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity onPress={() => selectBank(item, rows[rows.length - 1].id)}>
                                                            <View style={styles.row}>
                                                                <Text style={[styles.cell, { textAlign: 'left' }]}>{item.BANK_NAME}</Text>  
                                                            </View>
                                                            
                                                        </TouchableOpacity>
                                                    )}                                                    
                                                />
                                                <View style={styles.footer}>
                                                    <Text style={styles.footerText}>Total Records: {bankList.length}</Text>
                                                </View>
                                            </View>
                                        </View>                                        
                                    </Modal>                                  
                                </View> 

                                <View style={styles.tabInputContainer}>
                                    <Text style={[styles.label, { paddingRight: 4, paddingLeft: 4}]}>Remarks:</Text> 
                                </View>    
                                <View style={styles.tabInputContainer}>
                                    <TextInput
                                                   style={[styles.input, { width: '100%', color: '#333' }]}
                                                    multiline
                                                    placeholder="enter your remark"
                                                    value={item.reason}
                                                    placeholderTextColor='#a3a3a3'
                                                    onChangeText={(text) => {
                                                        const updatedRows = [...rows];
                                                        updatedRows[index].remark = text;
                                                        setRows(updatedRows);
                                                    }}
                                                />
                                </View>    
                                <View style={styles.tabInputContainer}>
                                    <TouchableOpacity onPress={() => removeRow(item.id)} style={[styles.deleteButton, { marginLeft: 0, display: 'none'}]}>
                                        <View style={styles.deleteContent}>                                    
                                            <Ionicons name="trash-outline" size={18} color="#fff" />
                                        </View>
                                    </TouchableOpacity>                        
                                </View>                          
                            </View>                          
                    
                        
                        )}
                        showsVerticalScrollIndicator={true}
                    />              
                
          

                   
            <TouchableOpacity style={styles.saveButton} >       
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity> 
        
            <AlertWithIcon
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ ...alert, visible: false })}
            />

        </View>
        
    )}
    showsVerticalScrollIndicator={true}
/>
  );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,       
        paddingHorizontal: 5,
        paddingVertical: 5,
        backgroundColor: '#fff',
    },
   
    tabheader: {
        fontSize: 16,
        letterSpacing: 0.3, 
        width: '100%',       
        paddingVertical: 3,        
        paddingHorizontal: 6,       
        backgroundColor: '#208cf3',       
        color: '#fff',
        // Shadow for iOS
        shadowColor: '#000', // Color of the shadow
        shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
        shadowOpacity: 0.1, // Transparency of the shadow
        shadowRadius: 5, // Blur effect of the shadow
        // Shadow for Android
        elevation: 5, // Elevation for Android shadow
    },
    label: {
        fontSize: 15,
        letterSpacing: 0.3,
        paddingVertical: 4,       
        justifyContent: 'center',
        color: '#333',
        fontWeight: '400',        
    },  
    dateButton: {
        width: '100%',
        backgroundColor: '#f1f1f1',
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
    asterisk: {
        color: 'red',
        fontSize: 15,
        letterSpacing: 0.3,
    },
    input: {
        height: 30,
        color: '#333',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        marginBottom: 10,
    },   
    modalContent: {
        backgroundColor: '#fff',
        padding: 2,
        //borderRadius: 0,
        width: '90%',
        alignItems: 'center',
    }, 
    cell: {
        flex: 1,
        textAlign: 'right',
        paddingRight: 5,
        paddingVertical: 5,
        paddingLeft: 5,
        borderRightWidth: 1,
        borderColor: '#ccc',
        width: '100%',        
    },   
    Prdcell: {
        //flex: 1,        
        width: '100%',
        borderBottomColor: '#333',
        //borderBottomWidth: 1,
        //marginBottom: 5,
        padding: 3,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
    },   
    
    buttonLov: {
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#208cf3',
        //backgroundColor: '#4290f5',
        borderRadius: 4,
        paddingHorizontal: 4,
        zIndex: 1,
    }, 
    tabInputContainer: {
        flexDirection: 'row',
        alignItems: 'right',
        justifyContent: 'right',
        paddingHorizontal: 5,        
    },
    modalContainer: {
        flex: 1,       
        justifyContent: 'center',      
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalTitle: {
        fontSize: 14,
        color: '#333',
        backgroundColor: '#e4e4e4',
        paddingVertical: 3,
        paddingHorizontal: 3,
        fontWeight: 500,
        width: '93%',
        letterSpacing: 0.3,
    },  
    lovclose: {
        backgroundColor: '#e4e4e4',
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },       
    header: {
        flexDirection: 'row',
        width: '100%',
        //justifyContent: 'space-between',
        backgroundColor: '#6c80ad',
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
    flatList: {
        flexGrow: 1, // This makes the FlatList take the available space
        maxHeight: 400, // Set a maximum height if needed
        width: '100%',
        backgroundColor: '#fff',
    },
    footer: {
        paddingVertical: 5,
        width: '100%',
        paddingHorizontal: 5,
        alignItems: 'right',
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#ccc',
    },
    footerText: {
        fontSize: 14,
        //fontWeight: '500',
        color: '#333',
    },    
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: '#c7c7c7',
        backgroundColor: '#f55105',
        padding: 5,
        borderWidth: 1,
        borderColor: '#f55105',
        height: 30,
        borderRadius: 4,
    },
    deleteContent: {
        //flexDirection: 'row',  // Row layout
        //justifyContent: 'right',  // Space between text and icon
        //alignItems: 'center',  // Align text and icon vertically centered
    },
    saveButton: {
        marginTop: 10,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#208cf3',
        //backgroundColor: '#244f8f',
        borderRadius: 5,
        width: '100%',
         // Shadow for iOS
        shadowColor: '#000', // Color of the shadow
        shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
        shadowOpacity: 0.1, // Transparency of the shadow
        shadowRadius: 5, // Blur effect of the shadow
        // Shadow for Android
        elevation: 5, // Elevation for Android shadow
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'sans-serif',
        letterSpacing: 0.3,
    },
    pickerButton: {
        paddingHorizontal: 10,
        height: 35,
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
        justifyContent: 'center',  // Centers content vertically
        marginBottom: 10, 
      },  
      pickerText: {
        fontSize: 15,
        letterSpacing: 0.3,
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
        borderRadius: 5,
        overflow: 'hidden',
      },  
      optionText: {
        fontSize: 16,
        letterSpacing: 0.3,
        padding: 5,
        borderBottomWidth: 1,
        borderColor: '#ccc',
      },
      selectedOption: {
        backgroundColor: '#61bdfa',
      },
      firstOption: {
        backgroundColor: '#f0f0f0', // Light gray background for first value
      },  
  
});
