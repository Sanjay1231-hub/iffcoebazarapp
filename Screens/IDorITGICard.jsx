import React, { useState } from 'react';
import { Text,TouchableOpacity, StyleSheet, Platform, View, Linking, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing'; // To share the file in Androi
import Ionicons from '@expo/vector-icons/Ionicons';
import AlertWithIcon from '../Component/AlertWithIcon';

const IDorITGICard = () => {   
  const [selectedValue, setSelectedValue] = useState(''); // Default selection set to '--Select--'
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });  
  const options = [
    { label: '--Select--', value: '' },
    { label: 'ID Card', value: 'EMP_CARD_DTLS_REP' },
    { label: 'ITGI Card', value: 'EMP_ITGI_CARD_REP' },
  ];
  
  const handleSelect = (value) => {
    if (value === '') {
        setAlert({ visible: true, title: "Validation Error", message: "Please select a valid option.", type: "warning" });
        return;
      }     
    setSelectedValue(value); // Corrected this line
    setModalVisible(false);
  };

  const downloadPdf = async () => {
    setIsDownloading(true); // Set downloading state to true when the download starts

    try {
      if (!selectedValue) {
        setAlert({ visible: true, title: "Validation Error", message: "Please select a valid card type to proceed.", type: "warning" });
        setIsDownloading(false);
        return;
      }

      const url = 'https://ebazar.iffco.coop/workflowrdlc/workflow/EMP_CARD_DTLS_REP.aspx';

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
        let fileUri = FileSystem.documentDirectory + 'ID_' + selectedValue + '.pdf';

        if (Platform.OS === 'android') {
          const downloadDir = FileSystem.documentDirectory + 'Downloads/';
          const downloadDirExists = await FileSystem.getInfoAsync(downloadDir);

          if (!downloadDirExists.exists) {
            await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
          }
          fileUri = downloadDir + 'ID_' + selectedValue + '.pdf';
        }

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
              //Alert.alert('Download Complete', 'File shared in PDF viewer!');
              setAlert({ visible: true, title: "Success", message: "File shared in PDF viewer!", type: "success" });

            } else {
              //Alert.alert('Sharing Not Available', 'Unable to share file in PDF viewer.');
              setAlert({ visible: true, title: "Sharing Not Available", message: "Unable to share file in PDF viewer.", type: "error" });

            }
          } else {
            const fileURL = `file://${fileUri}`;
            await Linking.openURL(fileURL);
            setAlert({ visible: true, title: "Success", message: "File opened in PDF viewer!", type: "success" });

          }
        } catch (error) {
          setAlert({ visible: true, title: "Saving Error", message: `There was an error saving the PDF. Error: ${error.message}`, type: "error" });

        }
      };
    } catch (error) {
      setAlert({ visible: true, title: "Failed", message: `There was an error Sharing the PDF. Error: ${error.message}`, type: "error" });

    } finally {
      setIsDownloading(false); // Reset downloading state after process is done
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.section}>
          <Text style={[styles.label, { marginBottom: 12}]}>Card Type<Text style={styles.asterisk}>*</Text></Text>
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

        <View style={styles.buttonContainer}>
            <TouchableOpacity
            style={styles.downloadButton}
            onPress={downloadPdf}
            disabled={isDownloading}
            >
            <Ionicons name="open-outline" size={24} color="white" />
            <Text style={styles.downloadText}>
                {isDownloading ? 'Openning...' : 'View'}
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
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  section: {
    //flex: 1,
    padding: 10,
    backgroundColor: '#f7f8fa',
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#f7f9fc',    
  },
  label: {
    fontSize: 16,
    marginBottom: 6,  // Reduce space below label for a tighter layout
    color: '#424242',
    fontWeight: '500',
    fontFamily: 'sans-serif',
    lineHeight: 22,  // Ensures better readability
    letterSpacing: 0.3,  // Adds slight spacing for a cleaner look
  },
  pickerButton: {
    paddingHorizontal: 10,
    height: 35,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    justifyContent: 'center',  // Centers content vertically
    marginBottom: 15, 
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
  buttonContainer: {
    justifyContent: 'center',      
    alignItems: 'center',
    marginTop: 20,
  },
  asterisk: {
    color: 'red',
    fontSize: 16,
    letterSpacing: 0.3, 
  }, 
  downloadButton: {
    flexDirection: 'row',
    //width: '60%',
    paddingHorizontal: 20,
    backgroundColor: '#208cf3',
    borderRadius: 5,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
      // Shadow for iOS
    shadowColor: '#000', // Color of the shadow
    shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
    shadowOpacity: 0.1, // Transparency of the shadow
    shadowRadius: 5, // Blur effect of the shadow
      
      // Shadow for Android
    elevation: 5, // Elevation for Android shadow
  },
  downloadText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '400',
    letterSpacing: 0.3, 
  },     
});

export default IDorITGICard;