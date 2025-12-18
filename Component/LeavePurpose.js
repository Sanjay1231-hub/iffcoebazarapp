import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  FlatList, 
  Alert, 
  TouchableWithoutFeedback 
} from 'react-native';
import AlertWithIcon from './AlertWithIcon';
import { Ionicons } from '@expo/vector-icons';

const LeavePurpose = ({ selectedValue = '', onValueChange = () => {} }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
  const options = [
    { label: '--Select--', value: '' },
    { label: 'Personal', value: '1' },
    { label: 'Sick', value: '4' },
    { label: 'Going Out Station', value: '2' },
    { label: 'Others', value: '14' },
  ];

  const handleSelect = (value) => {
    if (value === '') {
      setAlert({ visible: true, title: "Validation Error", message: "Please select a valid leave purpose.", type: "warning" });
      return;
    }
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
         style={[styles.pickerButton, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.pickerText}>
          {options.find(option => option.value === selectedValue)?.label || '--Select--'}
        </Text>
        {/* <Ionicons name="chevron-down" size={20} color="#5f5f5fff" /> */}
         <View style={styles.iconContainer}>
                      <Ionicons name="chevron-down" size={18} color="#ffffff" />
                    </View>
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
    //paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  pickerText: {
    fontSize: 15,
    letterSpacing: 0.3,
  },
  iconContainer: {
    width: 35,
    height: 35,
    borderTopRightRadius: 5,        // circle
    borderBottomRightRadius: 5,        // circle
    backgroundColor: '#007BFF', // your theme color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -10,
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
});

export default LeavePurpose;
