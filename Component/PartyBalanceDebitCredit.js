import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons  } from '@expo/vector-icons';
import AlertWithIcon from './AlertWithIcon';

const PartyBalanceDebitCredit = ({ selectedValue = 'DR', onValueChange = () => {} }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSelectedValue, setCurrentSelectedValue] = useState(selectedValue); // default to 'DR' if not passed
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
  const options = [
    { label: '--Select--', value: '' },
    { label: 'Debit', value: 'DR' },
    { label: 'Credit', value: 'CR' },
  ];

  useEffect(() => {
    setCurrentSelectedValue(selectedValue);
  }, [selectedValue]);

  const handleSelect = (value) => {
    // Validate to ensure selected value is not blank
    if (value === '') {
      //Alert.alert('Validation Error', 'Please select a valid option.');
      setAlert({ visible: true, title: "Validation Error", message: "Please select a valid option.", type: "warning" });
      return;
    }
    // Call onValueChange prop with the selected value
    onValueChange(value);
    setCurrentSelectedValue(value); // Update local state to reflect selected value
    setModalVisible(false); // Close modal after selection
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)} >
        <Text style={styles.pickerText}>
          {options.find(option => option.value === currentSelectedValue)?.label || 'Debit'}
        </Text>
       <Ionicons name="chevron-down-outline" size={20} color="#545454" style={styles.icon} />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === currentSelectedValue && styles.selectedOption
                  ]}
                  onPress={() => handleSelect(item.value)} >
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
    padding: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    flexDirection: 'row', // Align text and icon in a row
    alignItems: 'center', // Vertically center the text and icon
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
    width: 340,
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
  },
  option: {
    // padding: 5,
  },
  icon: {
    marginLeft: 5, // Space between the text and the icon (optional)
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
});

export default PartyBalanceDebitCredit;
