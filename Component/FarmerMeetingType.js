import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, Alert, TouchableWithoutFeedback } from 'react-native';
import { Ionicons  } from '@expo/vector-icons';
import AlertWithIcon from './AlertWithIcon';

const FarmerMeetingType = ({ selectedValue = '', onValueChange = () => {} }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSelectedValue, setCurrentSelectedValue] = useState(selectedValue);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
  const options = [
    { label: '--Select--', value: '' },
    { label: 'Farmer Meeting', value: 'FM' },
    { label: 'Field Day Program', value: 'FD' },
  ];

  useEffect(() => {
    setCurrentSelectedValue(selectedValue);
  }, [selectedValue]);

  const handleSelect = (value) => {
    if (value === '') {
      setAlert({ visible: true, title: "Validation Error", message: "Please select a valid meeting type option.", type: "warning" });
      return;
    }
    onValueChange(value);
    setCurrentSelectedValue(value); // Update local state to reflect selected value
    setModalVisible(false); // Close modal after selection
  };

  return (
    <View>
      <TouchableOpacity
         style={[styles.pickerButton, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
        onPress={() => setModalVisible(true)} >
        <Text style={styles.pickerText}>
          {options.find(option => option.value === currentSelectedValue)?.label || '--Select--'}
        </Text>
        <Ionicons name="chevron-down-outline" size={20} color="#5f5f5fff" />
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
                            item.value === currentSelectedValue && styles.selectedOption
                          ]}
                          onPress={() => handleSelect(item.value)} >
                          <Text style={styles.optionText}>{item.label}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                 </TouchableWithoutFeedback>                
              </View>
            </TouchableWithoutFeedback>
        
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
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      backgroundColor: '#ffffff',
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
    //padding: 5,
  },
  icon: {
    marginLeft: 5, // Space between the text and the icon (optional)
  },
  optionText: {
    fontSize: 16,
    letterSpacing: 0.3,
    padding: 6,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    
  },
  selectedOption: {
    backgroundColor: '#61bdfa',
  },
});

export default FarmerMeetingType;
