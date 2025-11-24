import React, { useState } from 'react';
import { 
  Text, TouchableOpacity, StyleSheet, Platform, View, Linking, Modal, FlatList, TouchableWithoutFeedback 
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AlertWithIcon from '../Component/AlertWithIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IDorITGICard = () => {   
  const [selectedValue, setSelectedValue] = useState(''); 
  const [isDownloading, setIsDownloading] = useState(false);
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
    setSelectedValue(value);
    setModalVisible(false);
  };

  const openPdfNew = async () => {
    if (!selectedValue) {
      setAlert({
        visible: true,
        title: "Validation Error",
        message: "Please select a valid option to proceed.",
        type: "warning",
      });
      return;
    }

    try {
      setIsDownloading(true);
      const loggedUser = await AsyncStorage.getItem("username");
      let pdfUrl = "";

      if (selectedValue === "EMP_ITGI_CARD_REP") {
        pdfUrl = `https://ebazar.iffco.coop/workflowrdlc/WorkFlow/EMP_ITGI_CARD_REP_APP.aspx?P_PERSONAL_NO=${loggedUser}`;
      } else if (selectedValue === "EMP_CARD_DTLS_REP") {
        pdfUrl = `https://ebazar.iffco.coop/workflowrdlc/WorkFlow/EMP_CARD_DTLS_REP_APP.aspx?P_PERSONAL_NO=${loggedUser}`;
      }

      if (!pdfUrl) {
        setAlert({
          visible: true,
          title: "Error",
          message: "Invalid report type selected. Please try again.",
          type: "error",
        });
        return;
      }

      await Linking.openURL(pdfUrl);

    } catch (error) {
      setAlert({
        visible: true,
        title: "Error",
        message: `Unable to download your report. Please try again.`,
        type: "error",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>
          Select Card Type <Text style={styles.asterisk}>*</Text>
        </Text>

        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.pickerText}>
            {options.find(option => option.value === selectedValue)?.label || '--Select--'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#5f5f5fff" />
        </TouchableOpacity>

        <Modal
          transparent
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
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
          style={[styles.downloadButton, isDownloading && { opacity: 0.7 }]}
          onPress={openPdfNew}
          disabled={isDownloading}
        >
          <Ionicons name="open-outline" size={24} color="white" />
          <Text style={styles.downloadText}>
            {isDownloading ? 'Downloading...' : 'Download'}
          </Text>
        </TouchableOpacity>
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
    padding: 10,
    backgroundColor: '#ffffff',
  },
  section: {
    padding: 10,
    backgroundColor: '#f7f8fa',
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#f7f9fc',    
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
    color: '#424242',
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  asterisk: {
    color: 'red',
    fontSize: 16,
  },
  pickerButton: {
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  optionText: {
    fontSize: 16,
  },
  selectedOption: {
    backgroundColor: '#61bdfa',
  },
  buttonContainer: {
    justifyContent: 'center',      
    alignItems: 'center',
    marginTop: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: '#208cf3',
    borderRadius: 5,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  downloadText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default IDorITGICard;
