import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  FlatList,
  TouchableWithoutFeedback 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AlertWithIcon from './AlertWithIcon';

const LoginUserType = ({ selectedValue = 'IEBL', onValueChange = () => {} }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
  const options = [    
    { label: 'IEBL Employee', value: 'IEBL' },
    { label: 'IFFCO Employee', value: 'IFFCO' },
    { label: 'Franchise / BA', value: 'FRANCHISES' },
    { label: 'Others', value: 'OTHERS' }
  ];

  const handleSelect = (value) => {
    if (value === '') {
      setAlert({ visible: true, title: "Validation Error", message: "Please select a valid option.", type: "warning" });
      return;
    }
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)}      
      >
        <Text style={styles.pickerText}>
          {options.find(option => option.value === selectedValue)?.label || 'IEBL Employee'}
        </Text>
        <Ionicons name="chevron-down-outline" size={20} color="#545454" style={styles.icon} />
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
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pickerText: {
    fontSize: 15,
    letterSpacing: 0.3,
    color: '#333',
    marginRight: 10,
  },
  icon: {
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '65%',
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
  },
  option: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  }, 
  optionText: {
    fontSize: 15,
    letterSpacing: 0.3,
  },
  selectedOption: {
    backgroundColor: '#61bdfa',
  },  
}); 

export default LoginUserType;
