import React, { useState, useEffect } from 'react';
import { Text,TouchableOpacity, TextInput, StyleSheet, Alert, Platform, View, Linking, Modal, ActivityIndicator, FlatList } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing'; // To share the file in Androi
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import AlertWithIcon from '../Component/AlertWithIcon';
import { WebView } from 'react-native-webview';   // ✅ Import WebView

const SalarySlip = () => { 
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });    
  const [showPdf, setShowPdf] = useState(false);  // ✅ New state

  useEffect(() => {
    const fetchData = async () => {
      try {        
        const postData = { 
          inApiParameters: [],
          apiId: "6",
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
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        let result;
    
        try {
          result = JSON.parse(text);
        } catch (jsonError) {
          throw new Error('Invalid JSON response received.');
        }
    
        // Optional: Add format validation
        if (!result || typeof result !== 'object') {
          throw new Error('Unexpected data format received.');
        }
        setLoading(false);       
        setData(result.output);

      } catch (error) {
        //console.error('Error fetching data:', error);
        Alert.alert('Fetch Error', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); 


  const handleSelect = (item) => {
    setSelectedValue(item.YEARMONTH);    
    setModalVisible(false);
};


const downloadAndOpenPdf = async () => {

  const loggedUser = await AsyncStorage.getItem('username');
 const url = 'https://ebazar.iffco.coop/workflowrdlc/workflow/PAY_SLIP.aspx?P_PERSONAL_NO=' + loggedUser + '&P_YEARMONTH=' + selectedValue + '';
  const fileUri = FileSystem.documentDirectory + "temp.pdf";
  const { uri } = await FileSystem.downloadAsync(url, fileUri);
  await Sharing.shareAsync(uri);
};

const downloadPdf = async () => {
  setIsDownloading(true); // Set downloading state to true when the download starts

  try {
    // Step 1: Check if selectedValue is null or empty
    if (!selectedValue) {
      setAlert({ visible: true, title: "Validation Error", message: "Please select a valid year-month to proceed.", type: "warning" });

      setIsDownloading(false);
      return;
    }

    const loggedUser = await AsyncStorage.getItem('username');
    const url = 'https://ebazar.iffco.coop/workflowrdlc/workflow/PAY_SLIP.aspx?P_PERSONAL_NO=' + loggedUser + '&P_YEARMONTH=' + selectedValue + '';

    // Step 2: Request permissions to access media library (Android)
    if (Platform.OS === 'android') {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setAlert({ visible: true, title: "Permission Denied", message: "We need permission to save the file.", type: "warning" });

        setIsDownloading(false);
        return;
      }
    }
    // Step 3: Fetch the PDF from the API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/pdf',
        'Accept': 'application/pdf',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    // Step 4: Read the response as a Blob
    const blob = await response.blob();
    // Convert Blob to Base64 string
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64data = reader.result.split(',')[1]; // Extract the Base64 part of the data
      // Define the file path for external storage (Downloads directory)
      let fileUri = FileSystem.documentDirectory + 'SalarySlip_' + selectedValue + '.pdf';

      try {
        // Step 5: Save the PDF file to the app's document directory or Downloads folder
        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // Step 6: Attempt to share the file
        if (Platform.OS === 'android') {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(fileUri);
            setAlert({ visible: true, title: "Success", message: "File shared in PDF viewer!", type: "success" });

          } else {
            setAlert({ visible: true, title: "Sharing Not Available", message: "Unable to share file in PDF viewer.", type: "error" });

          }
        } else {
          const fileURL = `file://${fileUri}`;
          await Linking.openURL(fileURL);
          setAlert({ visible: true, title: "Success", message: "File opened in PDF viewer!", type: "success" });

        }
      } catch (error) {
         //console.error('Saving Error', error);
        setAlert({ visible: true, title: "Saving Error", message: `There was an error saving the PDF. Error: ${error.message}`, type: "error" });

      }
    };
  } catch (error) {
    //console.error('Error downloading file:', error);
    setAlert({ visible: true, title: "Failed", message: `There was an error Sharing the PDF. Error: ${error.message}`, type: "error" });

  } finally {
    setIsDownloading(false); // Reset downloading state after process is done
  }
};

const openPdf = async () => {
    if (!selectedValue) {
      setAlert({
        visible: true,
        title: "Validation Error",
        message: "Please select a valid year-month to proceed.",
        type: "warning",
      });
      return;
    }
    setShowPdf(true); // ✅ Switch to WebView mode
  };

// Build PDF URL
const [pdfUrl, setPdfUrl] = useState('');

useEffect(() => {
  const loadUrl = async () => {
    const loggedUser = await AsyncStorage.getItem("username");
    if (selectedValue && loggedUser) {
      setPdfUrl(`https://ebazar.iffco.coop/workflowrdlc/workflow/PAY_SLIP.aspx?P_PERSONAL_NO=${loggedUser}&P_YEARMONTH=${selectedValue}`);
    }
  };
  loadUrl();
}, [selectedValue]);

// If PDF should be shown → return WebView instead of form
if (showPdf && pdfUrl) {
  return (
    <View style={{ flex: 1 }}>
      {/* Top bar with Back + Check buttons */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#4a80f5', 
        padding: 10 
      }}>
        {/* Back button */}
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => setShowPdf(false)}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 6 }}>Back</Text>
        </TouchableOpacity>        
      </View>        

      {/* WebView */}
      <WebView 
        source={{ uri: pdfUrl }} 
        style={{ flex: 1 }} 
        startInLoadingState={true}
        renderLoading={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#4a80f5" />
          </View>
        )}
      />
    </View>

  );
}

const openPdfNew = async () => {
    if (!selectedValue) {
      setAlert({
        visible: true,
        title: 'Validation Error',
        message: 'Please select a valid year-month to proceed.',
        type: 'warning',
      });
      return;
    }

    try {
      setIsDownloading(true);
      const loggedUser = await AsyncStorage.getItem('username');
      const pdfUrl = `https://ebazar.iffco.coop/workflowrdlc/workflow/PAY_SLIP.aspx?P_PERSONAL_NO=${loggedUser}&P_YEARMONTH=${selectedValue}`;
      await Linking.openURL(pdfUrl);
       setAlert({ visible: true, title: "Success", message: "File downloaded successfully", type: "success" });
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Unable to download salary slip. Please try again.',
        type: 'error',
      });
    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Select YearMonth<Text style={styles.asterisk}>*</Text></Text>
          <View style={styles.modalcontainer}>
              <TouchableOpacity style={styles.buttonLov} onPress={() => setModalVisible(true)}>
                  <Ionicons name="search" size={22} color="white" />
              </TouchableOpacity>
              <TextInput
                  style={[styles.textInput, { backgroundColor: '#f0f0f0', width: '100%', paddingLeft: 40 }]}
                  placeholder="--Select--"
                  value={selectedValue}
                  editable={false}
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
                          <Text style={styles.modalTitle}>Year Month LOV</Text>
                          <Ionicons name="close" size={24} color="black" onPress={() => setModalVisible(false)} style={styles.lovclose} />
                      </View>

                      <View style={styles.header}>                           
                          <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>YEAR MONTH</Text>
                          
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
                            data={data}
                            keyExtractor={(item, index) => item.SNO ? item.SNO.toString() : index.toString()}                             
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleSelect(item)}>
                                    <View style={styles.row}>                                       
                                        <Text style={styles.cell}>
                                        {item.YEARMONTH || 'No Data'}
                                        </Text>
                                      
                                    </View>
                                    </TouchableOpacity>
                            )}
                            initialNumToRender={5}  // Initially render only 20 items
                            maxToRenderPerBatch={5}  // Render 20 items per batch as you scroll
                            windowSize={5}  // Render a few items above and below the viewport
                            showsVerticalScrollIndicator={false}
                            style={styles.flatList}
                        />                     
                      )}
                    </View>
                </View>
            </Modal>
              </View> 

               {/* Download Button */}           

             <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.downloadButton}
                //onPress={openPdf}
                onPress={openPdfNew}
                //onPress={downloadAndOpenPdf}
                disabled={isDownloading}
              >
                <Ionicons name="download-outline" size={24} color="white" />
                <Text style={styles.downloadText}>
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Text>
              </TouchableOpacity>
            </View> 
        

          {downloadSuccess !== null && (
          <Text style={{ marginTop: 20, color: downloadSuccess ? 'green' : 'red' }}>
              {downloadSuccess ? 'Shared Successful!' : 'Error Openning Salary Slip'}
          </Text>
          )}

          {/* Custom Alert Modal */}
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
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  section: { padding: 10, backgroundColor: '#f7f8fa', borderWidth: 1, borderRadius: 6, borderColor: '#f7f9fc' },
  label: { fontSize: 16, marginBottom: 6, color: '#424242', fontWeight: '500' },
  modalcontainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  textInput: { fontSize: 15, color: '#333', borderColor: '#ccc', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, height: 40 },
  buttonLov: { height: 40, width: 35, justifyContent: 'center', alignItems: 'center', backgroundColor: '#007BFF', borderRadius: 5, paddingHorizontal: 5, marginRight: -33, zIndex: 1 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { flex: 1, width: '70%', maxHeight: 450, backgroundColor: '#e4e4e4', borderRadius: 2, padding: 5 },
  modalTitle: { fontSize: 14, fontWeight: '500', color: '#000' },
  lovclose: { textAlign: 'center' },
  headerText: { flex: 1, textAlign: 'center', fontSize: 13, color: '#fff', borderRightWidth: 1, borderColor: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#ccc' },
  cell: { flex: 1, textAlign: 'center', padding: 5, backgroundColor: '#ffffffff', },
  header: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', backgroundColor: '#6c80ad' },
  asterisk: { color: 'red', fontSize: 16 },
  buttonContainer: { justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  downloadButton: { flexDirection: 'row', paddingHorizontal: 20, backgroundColor: '#208cf3', borderRadius: 5, height: 40, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  downloadText: { color: '#fff', fontSize: 16, marginLeft: 10, fontWeight: '400' },
});

export default SalarySlip;