import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, Alert } from 'react-native';
import AlertWithIcon from './AlertWithIcon';

const InvoicePayment = ({ selectedValue = '', onValueChange = () => {} }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
  const options = [
    { label: '--Select--', value: '' },
    { label: 'CASH', value: 'C' }    
  ];

  const handleSelect = (value) => {  
    if (value === '') {
      setAlert({ visible: true, title: "Validation Error", message: "Please select a valid Payment option.", type: "warning" });
      return;
    }

    // Call onValueChange prop with the selected value
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity style={styles.pickerButton}  onPress={() => setModalVisible(true)} >
        <Text style={styles.pickerText}>
          {options.find(option => option.value === selectedValue)?.label || '--Select--'}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity style={[ styles.option, item.value === selectedValue && styles.selectedOption ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  pickerButton: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
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
  option: {
    padding: 5,
  },
  optionText: {
    fontSize: 15,
    letterSpacing: 0.3,
  },
  selectedOption: {
    backgroundColor: '#87ddeb',
  },
});

export default InvoicePayment;
