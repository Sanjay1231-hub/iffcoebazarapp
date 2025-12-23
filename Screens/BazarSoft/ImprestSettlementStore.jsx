import { useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, ActivityIndicator, Image  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import AlertWithIcon from '../../Component/AlertWithIcon';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // MAX FILE SIZE is 5 MB

export default function ImprestSettlementStore() {

    const [imageUri, setImageUri] = useState(null);
    const [imageName, setImageName] = useState(null);
    const [rows, setRows] = useState([
        { id: '1', expHead: '', glslcd: '', expDate: '', expAmount: '', reason: '', billNo: '', billDate: '' }  // Default row with empty inputs
    ]);
    const [expAmount, setExpAmount] = useState([]);   
    const [expHead, setExpHead] = useState([]);   
    const [glslcd, setGlSlCd] = useState([]);   
    const [reason, setReason] = useState([]);   
    const [billNo, setBillNo] = useState(null);
    const [expDate, setExpDate] = useState(null);
    const [billDate, setBillDate] = useState(null);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [dateType, setDateType] = useState(null); // To differentiate between 'exp' and 'bill'
    const [product, setProduct] = useState([]); 
    const [loading, setLoading] = useState(false); 
    const [prodModalVisible, setProdModalVisible] = useState(false);
    const [pdfUri, setPdfUri] = useState(null);
    const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" }); 
    const [imageBase64, setImageBase64] = useState('');
    const [fileUri, setFileUri] = useState('');
    const [fileSize, setFileSize] = useState(0);

    const formatDate = (date) => {
        if (date) {
          const d = new Date(date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
          const day = String(d.getDate()).padStart(2, '0');
          return `${day}-${month}-${year}`;
        }
        return null;
      };
   
    const fetchExpHead = async () => {
      setLoading(true);
        try {            
            const postData = {
                inApiParameters: [],
                apiId: "30",
                token: "IEBL0001",
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
        
              if (text.trim().startsWith('<')) {
                throw new Error('Received HTML instead of JSON. API may be down or URL might be wrong.');
              }
        
              let result;
              try {
                result = JSON.parse(text);
              } catch (jsonError) {
                //console.error('JSON parse error:', jsonError);
                throw new Error('Invalid JSON response received.');
              }
        
              if (result?.output && Array.isArray(result.output)) {
                setProduct(result.output);
              } else {
                throw new Error('Unexpected data format received.');
              }        
        
        } catch (error) {
            //console.error('Error fetching data:', error);
            //Alert.alert('Fetch Error', error.message);
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

    const openModalProd = () => {
        fetchExpHead();
        setProdModalVisible(true);
    };

    // Close Modal Prod
    const closeModalProd = () => {
        setProdModalVisible(false);
    };

    const handleDateChange = (type, date) => {
        if (date) {
            if (type === 'exp') {
            setExpDate(date); // Save the selected date
            } else if (type === 'bill') {
            setBillDate(date); // (If you have a `billDate` state)
            }           
        }
    };

    const handleExpAmountChange = (value) => {
        // Remove all characters except digits and the dot
        let formattedValue = value.replace(/[^0-9.]/g, '');

        // If the value starts with a dot, prepend a zero
        if (formattedValue.startsWith('.')) {
            formattedValue = '0' + formattedValue;
        }

        // If there are multiple dots, remove the extra dots
        const dotCount = formattedValue.split('.').length - 1;
        if (dotCount > 1) {
            formattedValue = formattedValue.substring(0, formattedValue.lastIndexOf('.'));
        }

        // If the value contains a dot, restrict the number of decimal places to 2
        if (formattedValue.includes('.')) {
            const [integer, decimal] = formattedValue.split('.');
            if (decimal.length > 2) {
                formattedValue = `${integer}.${decimal.substring(0, 2)}`;
            }
        }

        // Set the formatted value in state
        setExpAmount(formattedValue);
    };

    const handleSelect = (item) => {
        setExpHead(item.ACC_DESC);
        setGlSlCd(item.GL_SL_CD);     
        
        setProdModalVisible(false);
    };

    const showDatePicker = (type) => {
        setDateType(type); // Set the type (exp or bill)
        setShowFromDatePicker(true); // Show the date picker
    };

const pickDocument = async () => {
  try {
    setImageUri(null);

    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });

    //console.log('Pdf File Result:', result);

    if (result && result.assets && result.assets[0] && !result.canceled) {
      const file = result.assets[0];
      const currentDate = new Date();
      const yearmonth = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      const loggedInEmpStore =
        (await AsyncStorage.getItem('officeCode')) || 'DEFAULT_STORE';
      const randomNo = Math.floor(Math.random() * 9000) + 1000;
      const fileExtension = file.uri.split('.').pop();

      const newFileName = `${loggedInEmpStore}${yearmonth}${randomNo}.${fileExtension}`;

      if (file.size > 5 * 1024 * 1024) {
        setAlert({
          visible: true,
          title: 'File size too large',
          message: 'Please select a file smaller than 5 MB.',
          type: 'warning',
        });
        setPdfUri(null);
        return;
      }

      setPdfUri(file.uri);
      setImageName(newFileName);
      //setFileUri(file.uri);
      //setFileSize(file.size);

      // ✅ Modern, Hermes-safe file reading:
      const response = await fetch(file.uri);
      const blob = await response.blob();

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // remove "data:application/pdf;base64,"
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      setImageBase64(base64);
    } else {
      setAlert({
        visible: true,
        title: 'No PDF file',
        message: 'No PDF file was selected to upload.',
        type: 'warning',
      });
    }
  } catch (error) {
    //console.error('Error picking document:', error);
    setAlert({
      visible: true,
      title: 'Error',
      message: error.message || 'Error occurred while picking document.',
      type: 'error',
    });
  }
};

    const pickImage = async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'image/*',
          copyToCacheDirectory: true,
        });

        if (result.assets && result.assets.length > 0) {
          const file = result.assets[0];

          const currentDate = new Date();
          const yearmonth = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`;

          const loggedInEmpStore =
            (await AsyncStorage.getItem('officeCode')) || 'DEFAULT_STORE';

          const randomNo = Math.floor(Math.random() * 9000) + 1000;

          //  Safer file extension handling
          const fileExtension = file.name?.split('.').pop() || 'jpg';

          //  Define newUri properly if you need it
          const newFileName = `${loggedInEmpStore}${yearmonth}${randomNo}.${fileExtension}`;
          //const newUri = FileSystem.documentDirectory + newFileName;

          //console.log('New Uri is:', newUri);

          // ✅ File size check
          if (file.size > 5 * 1024 * 1024) {
            setAlert({
              visible: true,
              title: 'File size too large',
              message: 'Please select a file smaller than 5 MB.',
              type: 'warning',
            });
            setImageUri(null);
            return;
          }

          setImageUri(file.uri);
          setImageName(newFileName);
          //setFileUri(file.uri);
          //setFileSize(file.size);

          // ✅ Convert to base64
          const base64 = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setImageBase64(base64);
        } else {
          //Alert.alert('No image selected');
          setAlert({
          visible: true,
          title: 'No image file',
          message: 'No Image file is selected to upload.',
          type: 'warning',
        });
        }
      } catch (error) {
        //console.error('Error picking image:', error);
        setAlert({
          visible: true,
          title: 'Error picking image',
          message: 'Error occurred while picking image.',
          type: 'error',
        });
      }
    };


 

  const CHUNK_SIZE = 32000; // ~32KB, adjust based on server limits
  
  function splitBase64IntoChunks(base64String) {
    const chunks = [];
    for (let i = 0; i < base64String.length; i += CHUNK_SIZE) {
      chunks.push(base64String.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
  }  
  
  const uploadImage = async () => {  
    // Validation: Only one file (image or PDF)
    if (!imageUri && !pdfUri) {
      setAlert({
        visible: true,
        title: "No File",
        message: "Please select a file to upload (image or PDF).",
        type: "warning",
      });
      return;
    }
    if (imageUri && pdfUri) {
      setAlert({
        visible: true,
        title: "Multiple Files",
        message: "You can only select one file at a time (either an image or a PDF).",
        type: "warning",
      });
      return;
    }

     // Validation: Required inputs
     if (!expAmount || !expHead || !glslcd || !reason || !billNo) {
      setAlert({
        visible: true,
        title: "Missing Parameters",
        message: "Please ensure all fields are filled in before uploading.",
        type: "warning",
      });
      return;
    }

    setLoading(true); // Start loader

    try {
      

      const loggedInEmpStore = await AsyncStorage.getItem('officeCode');
      const loggedUser = await AsyncStorage.getItem('username');
  
      if (!loggedInEmpStore || !loggedUser) {
        setAlert({
            visible: true,
            title: "Missing Info",
            message: "Unable to fetch employee information. Please try again later.",
            type: "warning",
          });
        setLoading(false);
        return;
      }
      //const uriParts = fileUri.split('/');
      //const filename = uriParts[uriParts.length - 1];
      
      const chunks = splitBase64IntoChunks(imageBase64);
      const totalChunks = chunks.length;
      const token = "IEBL0001";
      const apiId = "31";
  
      for (let index = 0; index < totalChunks; index++) {       

        const postdata = {
          token,
          apiId,
          inApiParameters: [
            { label: 'P_FILE_NAME', value: imageName },
            { label: 'P_FSC_CD', value: loggedInEmpStore },
            { label: 'P_AMOUNT', value: expAmount },
            { label: 'P_GL_SL_CD', value: glslcd },
            { label: 'P_PAID_AMOUNT', value: expAmount },
            { label: 'P_REMARKS', value: reason },
            { label: 'P_PNO', value: loggedUser },
            { label: 'P_TOTAL_CHUNKS', value:  String(totalChunks) },
            { label: 'P_FILE_BLOB', value: chunks[index] },
          ],
        };
  
        const response = await fetch('https://ebazarapi.iffco.in/API', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'ReactNativeApp/1.0',
            'Accept': 'application/json',
          },
          body: JSON.stringify(postdata),
        });
  
        const responseText = await response.text();
        //console.log(`Chunk ${index + 1} response:`, responseText);
  
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (error) {
          throw new Error('Invalid JSON response from server');
        }
  
        if (!response.ok || data?.error || data?.status >= 400) {
          throw new Error(data?.message || `Upload failed at chunk ${index + 1}`);
        }  
        //console.log(`✅ Chunk ${index + 1}/${totalChunks} uploaded successfully.`);
      }
  
      //Alert.alert('✅ Upload Complete', 'uploaded successfully!');
      setAlert({
        visible: true,
        title: "Upload Complete",
        message: "File uploaded successfully!",
        type: "success",
      });
    } catch (error) {
      //console.error('❌ Upload Error:', error.message);
      //Alert.alert('Upload failed', error.message);
      setAlert({
        visible: true,
        title: "Upload Failed",
        message: error.message,
        type: "error",
      });
    } finally {
      
        // Clear all states regardless of success or failure
        setLoading(false);
        setImageUri(null);
        setPdfUri(null);
        setExpAmount('');
        setExpHead('');
        setExpDate(null);
        setGlSlCd('');
        setReason('');
        setBillNo(null);
        setBillDate(null);
        setImageName('');
      }
      
  };

  return (   
      
    <View style={{ flex: 1, backgroundColor: 'white' }}>
       <View  style={{ flex: 1, backgroundColor: 'white' }}>
              <View style={styles.container}>
                  <View style={styles.section}>
                      <View style={styles.tabInputContainer}>
                          <Text style={[styles.label, {marginRight: 0}]}>Head:</Text> 
                          <TouchableOpacity style={styles.buttonLov} onPress={openModalProd}>
                              <Ionicons name="search" size={20} color="white" />                                   
                          </TouchableOpacity>
                          <TextInput
                              style={[styles.input, { width: '86%', color: '#333', backgroundColor: '#f0f0f0', marginLeft: -27, paddingLeft: 33 }]}
                              placeholder="--Select--"
                              value={expHead}
                              placeholderTextColor="#a3a3a3"
                              allowFontScaling={false}
                              editable={false} // Make the input non-editable, since the product will be selected from modal
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
                                          <Text style={styles.modalTitle}>Expense Head LOV</Text>
                                          <Ionicons name="close" size={24} color="black" onPress={closeModalProd} style={styles.lovclose} />
                                      </View>

                                      <View style={styles.header}>                           
                                          <Text style={[styles.headerText, { flex: 2.7, textAlign: 'center' }]}>ACC_DESC</Text>
                                          <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>GL_SL_CD</Text>
                                                                  
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
                                          keyExtractor={(item) => item.SNO.toString()}                    
                                          renderItem={({ item }) => (
                                              <TouchableOpacity onPress={() => handleSelect(item)}>
                                                  <View style={styles.row}>                                       
                                                      <Text style={[styles.cell, { flex: 3, textAlign: 'left' }]}>
                                                      {item.ACC_DESC || 'No Data'}
                                                      </Text> 
                                                      <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>
                                                      {item.GL_SL_CD || 'No Prd Code'}
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
                                  </View>
                              </View>
                          </Modal>
                      </View> 
                      <View style={[styles.tabInputContainer, {display: 'none'}]}>
                          <Text style={styles.label}>GLSLCD:</Text> 
                          <TextInput
                              style={[styles.input, { width: '80%', color: '#333', backgroundColor: '#dedfe0' }]}
                              placeholder="--Select--"
                              value={glslcd}
                              placeholderTextColor="#a3a3a3"
                              allowFontScaling={false}
                              editable={false} // Make the input non-editable, since the product will be selected from modal
                          />
                      </View>

                      <View style={styles.tabInputContainer}>
                          <Text style={[styles.label, {marginRight: 23}]}>Exp Date:</Text>
                          <TouchableOpacity onPress={() => showDatePicker('exp')} style={styles.dateButton}>
                              <Text style={{ fontSize: 15, textAlign: 'center' }}>
                              {formatDate(expDate) || 'Select Exp Date'}
                              </Text>
                          </TouchableOpacity>               

                          {showFromDatePicker && (
                              <DateTimePicker
                              value={new Date()}
                              mode="date"
                              display="default"
                              onChange={(event, date) => {
                                  setShowFromDatePicker(false); // Hide the date picker after selection
                                  if (date) {
                                  handleDateChange(dateType, date); // Pass selected date and type ('exp' or 'bill')
                                  }
                              }}
                              />
                          )}
                      </View>                    

                      <View style={styles.tabInputContainer}>
                          <Text style={styles.label}>Exp Amount:</Text>
                          <TextInput
                              style={[styles.input, { width: '73%', color: '#333' }]}
                              value={expAmount}
                              keyboardType="numeric"
                              onChangeText={handleExpAmountChange}
                              placeholder="00.00"
                              placeholderTextColor="#a3a3a3"
                              allowFontScaling={false}
                          />
                      </View>                         

                      <View style={styles.tabInputContainer}>
                          <Text style={[styles.label, {marginRight: 24}]}>Remarks:</Text>
                          <TextInput
                              style={[styles.input, { width: '73%', color: '#333' }]}
                              value={reason}
                              onChangeText={setReason}
                              allowFontScaling={false}
                          />
                      </View>  
                  </View>  
                  <View style={styles.section}>
                      <View style={styles.tabInputContainer}>
                          <Text style={[styles.label, {marginRight: 40}]}>Bill No:</Text>
                          <TextInput
                              style={[styles.input, { width: '73%', color: '#333' }]}
                              value={billNo}
                              onChangeText={setBillNo}
                              allowFontScaling={false}
                          />
                      </View>   

                      <View style={styles.tabInputContainer}>
                          <Text style={[styles.label, {marginRight: 28}]}>Bill Date:</Text>
                          <TouchableOpacity onPress={() => showDatePicker('bill')} style={styles.dateButton}>
                              <Text style={{ fontSize: 15, textAlign: 'center' }}>
                              {formatDate(billDate) || 'Select Bill Date'}
                              </Text>
                          </TouchableOpacity>
                      </View> 

                  </View> 

                  <View style={styles.section}>
                    <View style={[styles.tabInputContainer, {marginBottom: 10}]}>
                        <Text style={[styles.label, {marginRight: 20}]}>File Name:</Text>                          
                        {/* Conditionally render image-related content if imageUri exists */}
                        {imageUri && !pdfUri && (
                            <View>                           
                            <Text style={[styles.label]}>{imageName}</Text>                            
                            </View>
                        )}

                        {/* Conditionally render PDF-related content if pdfUri exists */}
                        {pdfUri && !imageUri && (
                            <View>
                            <Text style={[styles.label]}>{imageName}</Text>
                            </View>
                        )}
                    </View> 
                  </View>

                    {/* Note about file size */}
                  <Text style={{ marginVertical: 6, paddingHorizontal: 10, fontSize: 13, color: 'gray', textAlign: 'left' }}>
                    Maximum file size allowed: 5 MB
                  </Text>          
                
                  <View style={{ flex: 1, justifyContent: 'space-evenly', alignItems: 'center', marginBottom: 10, flexDirection: 'row', paddingHorizontal: 10 }}>
                      <TouchableOpacity onPress={pickDocument} style={[ styles.button, { backgroundColor: '#eba204ff' }]}>
                          <Ionicons name="document-attach-outline" size={20} style={styles.icon} />
                          <Text style={styles.buttonText}>Upload PDF file</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity onPress={pickImage} style={[ styles.button, { backgroundColor: '#5b5a61ff', }]}>
                          <Ionicons name="image-outline" size={20} style={styles.icon1} />
                          <Text style={styles.buttonText}>Upload Image file</Text>
                      </TouchableOpacity>
                  </View> 
                  
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 10, flexDirection: 'row' }}>
                      {imageUri && (
                          <View>
                          <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginBottom: 10 }} />
                          </View>
                      )}
                  </View>
                  
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}> 

                      <TouchableOpacity
                        onPress={uploadImage}
                        style={[
                          styles.submitButton,
                          { flexDirection: 'row', opacity: loading ? 0.6 : 1 }
                        ]}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
                            <Text style={{ paddingHorizontal: 20, color: '#fff' }}>Uploading...</Text>
                          </>
                        ) : (
                          <>
                            {/* <Ionicons name="save-outline" size={22} color="#fff" /> */}
                            <Text style={{ paddingHorizontal: 20, color: '#fff', fontSize: 16 }}>Save</Text>
                          </>
                        )}
                        
                      </TouchableOpacity>

                  </View>

                  



              </View>    
                    {/* Custom Alert Modal */}
          <AlertWithIcon
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ ...alert, visible: false })}
        />        
          </View>    
    </View>
        
      
)};

const styles = StyleSheet.create({    
    container: {
      flex: 1,       
      padding: 5,
      backgroundColor: '#fff',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: '#fff',
    },    
    label: {
        fontSize: 15,
        letterSpacing: 0.3,
        paddingVertical: 4,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
        color: '#333',
        fontWeight: '400',        
      },
    section: {
        backgroundColor: '#f2f6fc',
        borderColor: '#f2f6fc', 
        borderWidth: 1, 
        borderRadius: 4, 
        paddingTop: 5, 
        //marginBottom: 100       
      },
    input: {
        height: 40,
        //flex: 1,
        fontSize: 14,
        color: '#333',
        borderColor: '#ccc',
        letterSpacing: 0.3,
        borderWidth: 1,
        borderRadius: 4,
        paddingLeft: 8,
        backgroundColor: '#fff',
        alignItems: 'center', 
        justifyContent: 'space-around',
    },   
    dateButton: {
        width: '40%',
        height: 37,        
        borderRadius: 4,
        borderColor: '#ccc',
        borderWidth: 1,
        letterSpacing: 0.3,
        backgroundColor: "#f0f0f0",       
        alignItems: 'center', 
        justifyContent: 'space-around',
      },
 
    modalContent: {
        backgroundColor: 'white',
        padding: 2,
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
    buttonLov: {
        height: 40,
        width: 35,
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
        marginBottom: 8,      
    },
    modalContainer: {
        flex: 1,       
        justifyContent: 'center',      
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalTitle: {
        fontSize: 14,
        letterSpacing: 0.3,
        color: '#333',
        backgroundColor: '#e4e4e4',
        paddingVertical: 3,
        paddingHorizontal: 3,
        fontWeight: 500,
        width: '93%',
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
   

    submitButton: {
        backgroundColor: '#208cf3',
        width: '94%',
        //marginTop: 10,
        marginBottom: 20,
        borderRadius: 5,
        minHeight: 35,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
      },
    image: {
        width: 200,
        height: 200,
        marginTop: 10,
        borderRadius: 4,
      },
      button: {
        //marginBottom: 10, 
        flexDirection: 'row',
        //paddingVertical: 8,
        //paddingHorizontal: 12,
        borderRadius: 5, // Rounded corners
        elevation: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',       
      },
      buttonText: {
        color: '#fff',
        fontSize: 15,
        paddingHorizontal: 12,
        //fontWeight: '400',
        letterSpacing: 0.3,
        //marginLeft: 3, // Space between icon and text
      },
      icon: {
        marginRight: 3, // Add some space around the icon
        color: '#ffffff',padding: 5,
        borderWidth: 1,
         borderRadius: 5,
         borderColor: '#fff',
         backgroundColor: '#f0ba0aff'
      },
      icon1: {
        marginRight: 3, // Add some space around the icon
        color: '#ffffff',padding: 5,
        borderWidth: 1,
         borderRadius: 5,
         borderColor: '#fff',
         backgroundColor: '#9c9c9cff'
      },
      
});

//export default ImprestSettlementStore;