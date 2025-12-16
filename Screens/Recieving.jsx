import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, FlatList, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform, VirtualizedList  } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertWithIcon from '../Component/AlertWithIcon';

const Recieving = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedValue, setSelectedValue] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [purchaseNo, setPurchaseNo] = useState('');
    const [qty, setQty] = useState(0);
    const [qtyEntered, setQtyEntered] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });  

    useEffect(() => {
        const now = new Date();
        setCurrentDate(formatDate(now));
    }, []);

    useEffect(() => {
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
              apiId: "26",
              inApiParameters: [
                { label: "P_FSC_CD", value: loggedInEmpStore }
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
      
            const responseText = await response.text();
      
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
      
            let result;
            try {
              result = JSON.parse(responseText);
            } catch (parseError) {
              setAlert({
                visible: true,
                title: "Error",
                message: "Failed to parse server response.",
                type: "error",
              });
              return;
            }
      
            const responseData = result.output;
      
            if (Array.isArray(responseData)) {
              setData(responseData);
            } else {
              throw new Error('Unexpected response format. Expected an array.');
            }
      
          } catch (error) {
            //console.error('Error fetching data:', error);
            setAlert({
              visible: true,
              title: "Fetch Error",
              message: error.message,
              type: "error",
            });
          } finally {
            setLoading(false);
          }
        };
      
        fetchData();
      }, []);
    
    const formatDate = (date) => {
        if (!date) return '--Select--';
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleSelect = (item) => {
        setSelectedValue(item.PRD_DESC);
        setPurchaseNo(item.PURCHASE_NO);
        setQty(item.TOTAL_QTY);
        setQtyEntered('');
        const [day, month, year] = item.PURCHASE_DT.split('-');
        const formattedDate = new Date(year, month - 1, day);
        setPurchaseDate(isNaN(formattedDate.getTime()) ? '--Invalid Date--' : formatDate(formattedDate));
        setModalVisible(false);
    };

    const handleSave = async () => {
        setLoading(true);
        if (!selectedValue || !purchaseNo || !purchaseDate || !qty ||!qtyEntered) {
            setAlert({ visible: true, title: "Validation Error", message: "Please fill in all required fields!", type: "warning" });
            setLoading(false);
            return;
        }    
        
        if (!qty) {
            setAlert({ visible: true, title: "Validation Error", message: "Please fill the Qty field!", type: "warning" });
            setLoading(false);
            return;
        } 

        const loggedInEmpStore = await AsyncStorage.getItem('officeCode');
        const loggedUser = await AsyncStorage.getItem('username');

        if (!loggedInEmpStore || !loggedUser) {
            setAlert({ visible: true, title: "Error", message: "No store or user found.", type: "error" });
            setLoading(false);
            return;
        }
        
        try {
            const postData = {
              token: "IEBL0001",
              apiId: "27",
              inApiParameters: [
                { label: 'P_FSC_CD', value: loggedInEmpStore },
                { label: 'P_PURCHASE_NO', value: purchaseNo },
                { label: 'P_QTY_PENDING', value: qtyEntered }
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

            const out = result.output?.OUT_PARAM_1;
            if (out) {

              const outVal = out.toString().trim();
              if (/ORA-\d+/i.test(outVal) || outVal.toUpperCase().includes("ERROR")) {
                // Oracle error → show warning
                setAlert({
                  visible: true,
                  title: "Warning",
                  message: outVal, // remove "Error:" prefix if present
                  type: "warning",
                });
              } else {
                // Success case
                setAlert({
                  visible: true,
                  title: "Success",
                  message: outVal,
                  type: "success",
                });
              }
              //setAlert({ visible: true, title: 'Success', message: out, type: 'success' });
              // Reset form fields
              setSelectedValue('');
              setPurchaseNo('');
              setPurchaseDate('');
              setQty('');
              setQtyEntered('');
            } else {
              throw new Error('Unexpected server response');
            }          
          } catch (error) {
            //console.error("API error:", error);
            setAlert({
              visible: true,
              title: "Error",
              message: error.message || "An error occurred while depositing amount.",
              type: "error"
            });
          } finally {
            setLoading(false);
          }
          
    };

    const generateKey = (item, index) => {
        return `${item.FSC_CD}_${item.PURCHASE_NO}_${index}`; // Ensures uniqueness
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>     
        <View style={styles.section}>
          <Text style={styles.label}>Product Name<Text style={styles.asterisk}>*</Text></Text>            
            <View style={styles.modal_container}>
                <TouchableOpacity style={styles.buttonLov} onPress={() => setModalVisible(true)}>
                    <Ionicons name="search" size={22} color="white" />
                </TouchableOpacity>
                <TextInput
                    style={[styles.textInput, { backgroundColor: '#f0f0f0', width: '100%', paddingLeft: 40 }]}
                    placeholder="--Select--"
                    value={selectedValue}
                    editable={false}
                     allowFontScaling={false}
                />
                
                
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    {/* Fixed Header */}
                    <View style={styles.row}>
                      <Text style={styles.modalTitle}>Product LOV</Text>
                      <Ionicons
                        name="close"
                        size={24}
                        color="black"
                        onPress={() => setModalVisible(false)}
                        style={styles.lovclose}
                      />
                    </View>

                    {/* Wrap header + list inside horizontal ScrollView */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                      <View>
                        {/* Header */}
                        <View style={styles.header}>
                          <Text style={[styles.headerText, { flex: 3, textAlign: "center" }]}>
                            Product Name
                          </Text>
                          <Text style={[styles.headerText, { flex: 2.4, textAlign: "center" }]}>
                            Purchase No
                          </Text>
                          <Text style={[styles.headerText, { flex: 2, textAlign: "center" }]}>
                            Purchase Date
                          </Text>
                          <Text style={[styles.headerText, { flex: 1, textAlign: "center" }]}>
                            Qty
                          </Text>
                          <Text style={[styles.headerText, { flex: 2, textAlign: "center" }]}>
                            Expiry Date
                          </Text>
                         
                        </View>

                     
                        {loading ? (
                          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <View style={{ transform: [{ scale: 0.6 }] }}>
                              <ActivityIndicator size={50} color="#4a80f5" />
                            </View>
                          </View>
                        ) : (
                          <FlatList
                            data={data}
                            keyExtractor={(item, index) => generateKey(item, index)}
                            renderItem={({ item }) => (
                              <TouchableOpacity onPress={() => handleSelect(item)}>
                                <View style={styles.row}>
                                  <Text style={[styles.cell, { flex: 3.2, textAlign: "left" }]}>
                                    {item.PRD_DESC || ""}
                                  </Text>
                                  <Text style={[styles.cell, { flex: 2.5, textAlign: "left" }]}>
                                    {item.PURCHASE_NO || ""}
                                  </Text>
                                  <Text style={[styles.cell, { flex: 2.1, textAlign: "right" }]}>
                                    {item.PURCHASE_DT || ""}
                                  </Text>
                                  <Text style={[styles.cell, { flex: 1, textAlign: "right" }]}>
                                    {item.TOTAL_QTY != null ? item.TOTAL_QTY : "0"}
                                  </Text>
                                  <Text style={[styles.cell, { flex: 2.1, textAlign: "right" }]}>
                                    {item.EXPDATE != null ? item.EXPDATE : "0"}
                                  </Text>
                                 
                                </View>
                              </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                            style={styles.flatList}
                          />
                        )}
                      </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                      <Text style={styles.footerText}>Total Records: {data.length}</Text>
                    </View>
                  </View>
                </View>
              </Modal>
            </View> 

            <View style={styles.section}>
              <Text style={styles.label}>Purchase No<Text style={styles.asterisk}>*</Text></Text>
              <TextInput 
                  style={[styles.textInput, {backgroundColor: '#f0f0f0'}]} 
                  value={purchaseNo} 
                  editable={false} 
                   allowFontScaling={false}
              />
            </View>

             <View style={styles.section}>
                <Text style={styles.label}>Purchase Date<Text style={styles.asterisk}>*</Text></Text>
                <TextInput 
                style={[styles.textInput, {backgroundColor: '#f0f0f0'}]}  
                value={purchaseDate} 
                editable={false} 
                 allowFontScaling={false}
                />
             </View>
           
              <View style={styles.section}>
                <Text style={styles.label}>Purchase Qty<Text style={styles.asterisk}>*</Text></Text>
                <TextInput 
                style={[styles.textInput, {backgroundColor: '#f0f0f0'}]}  
                value={qty.toString()} 
                editable={false}
                allowFontScaling={false}
                 />
              </View>           

              <View style={styles.section}>
                <Text style={styles.label}>Receipt Date<Text style={styles.asterisk}>*</Text></Text>
                <TextInput style={[styles.textInput, {backgroundColor: '#f0f0f0'}]}  value={currentDate} editable={false} allowFontScaling={false} />
              </View>            

             <View style={styles.section}>
              <Text style={styles.label}>Reciept Qty<Text style={styles.asterisk}>*</Text></Text>
              <TextInput
                  style={styles.textInput}
                  value={qtyEntered}
                  placeholder="Enter Qty"
                  onChangeText={(text) => {
                      const regex = /^\d*$/;

                      if (regex.test(text)) {
                          const numericValue = parseInt(text, 10) || 0;

                          if (numericValue > 0 && numericValue <= qty) {
                              setQtyEntered(text);
                          } else {
                              //Alert.alert("Error", numericValue > qty ? "Quantity entered cannot be more then available quantity." : "Quantity must be greater than 0.");
                              if (numericValue > qty || numericValue <= 0 ) {
                                  const message = numericValue > qty
                                    ? "Quantity entered cannot be more than available quantity."
                                    : "Quantity must be greater than 0.";
                                
                                  // Using your custom alert component (recommended for consistency)
                                  setAlert({
                                    visible: true,
                                    title: "Invalid Quantity",
                                    message: message,
                                    type: "error",
                                  });
                                
                                setQtyEntered('');
                                  return; 
                                }
                          }
                      } else {
                          Alert.alert("Error", "Please enter a valid whole number.");
                      }
                  }}
                  placeholderTextColor="#a3a3a3"
                  keyboardType="numeric"
                  allowFontScaling={false}
              />
             </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>       
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
       
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
        padding: 8,
    },
    section: {        
        marginBottom: 6       
    },
    selectedText: {
        marginTop: 20,
        fontSize: 16,
        letterSpacing: 0.3, 

    },
    buttonLov: {
        height: 40,
        width: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007BFF',
        borderRadius: 5,
        paddingHorizontal: 5,
        //marginBottom: 10,
        marginRight: -33,
        zIndex: 1
      },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 0.3, 

    },
    label: {
        fontSize: 15,
        //marginBottom: 5,
        paddingHorizontal: 4,
        paddingVertical: 3,
        color: '#424242',
        fontWeight: '400',
        letterSpacing: 0.3, 

    },
    asterisk: {
        color: 'red',
        fontSize: 15,
        letterSpacing: 0.3, 

    },
    modal_container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    modalContainer: {
        flex: 1,       
        justifyContent: 'center',      
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        flex: 1,        
        width: '84%',
        maxHeight: 400, // Set the height of the modal
        backgroundColor: '#e4e4e4',
        borderRadius: 2,
        padding: 5,
        elevation: 5, // shadow (Android)
        shadowColor: "#000", // shadow (iOS)
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 14,
        color: '#000',
        backgroundColor: '#e4e4e4',
        fontWeight: 500,
        letterSpacing: 0.3, 
        flex: 1,
        //color: "#1e3a8a", // deep blue
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    lovclose: {
        //backgroundColor: '#e4e4e4',
        //textAlign: 'center',
    },
     header: {
        flexGrow: 0, // This makes the FlatList take the available space
        width: 600,
        flexDirection: 'row',
        backgroundColor: '#6c80ad',
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
        letterSpacing: 0.3, 
        color: '#fff',
        borderRightWidth: 1,
        borderColor: "rgba(255,255,255,1)",
        paddingVertical: 3,
    },
    flatList: {
        flexGrow: 0, // This makes the FlatList take the available space
        width: 600,
        backgroundColor: '#ffffff',
    },    
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        alignItems: "center",
    },   
    cell: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        fontSize: 14,
        color: "#333",
        paddingHorizontal: 5,
        paddingVertical: 6,
        borderRightWidth: 1,
        borderColor: '#ccc',
    },   
    footer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#f2f2f2",
    },
    footerText: {
        fontSize: 13,
        color: "#555",
        fontWeight: "500",
    },
    
    textInput: {
        height: 40,
        fontSize: 15,
        color: '#000',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        //marginBottom: 10,
        minHeight: 35,
        letterSpacing: 0.3, 

    },
    saveButton: {
        marginTop: 10,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#208cf3',
        borderRadius: 5,
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
        fontWeight: '400',
        letterSpacing: 0.3, 

    },
});

export default Recieving;