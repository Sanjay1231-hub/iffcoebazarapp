import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AlertWithIcon = ({ visible, title, message, type = "error", onClose }) => {
  // Define icon and color based on alert type
  const getAlertConfig = () => {
    switch (type) {
      case "success":
        return { icon: "checkmark-circle-outline", color: "#28a745" }; // Green for success
      case "warning":
        return { icon: "warning-outline", color: "#ffc107" }; // Yellow for warning
      case "error":
        return { icon: "close-circle-outline", color: "#dc3545" }; // Red for error
      default:
        return { icon: "information-circle-outline", color: "#17a2b8" }; // Default to blue info icon
    }
  };
  

  const { icon, color } = getAlertConfig();

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        
        {/* Title Bar */}
        <View style={[styles.modalTitleBar, { backgroundColor: color }]}>
          <Text style={styles.modalTitleText}>{title}</Text>
        </View>
  
        {/* Icon */}
        <Ionicons name={icon} size={42} color={color} style={styles.modalIcon} />
  
        {/* Message */}
        <Text style={styles.modalMessage}>{message}</Text>
  
        {/* OK Button */}
        <TouchableOpacity style={[styles.okButton, { backgroundColor: color }]} onPress={onClose}>
          <Text style={styles.okButtonText}>OK</Text>
        </TouchableOpacity>
  
      </View>
    </View>
  </Modal>
  
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    paddingBottom: 20,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  modalTitleBar: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: 18,
    letterSpacing: 0.3,
    fontWeight: '500',
    color: '#fff',
  },
  modalIcon: {
    marginTop: 10,
  },
  modalMessage: {
    fontSize: 15,
    color: '#333',
    letterSpacing: 0.2,
    textAlign: 'center',
    //marginVertical: 10,
    paddingHorizontal: 16,
  },
  okButton: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
  },
  okButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  
});

export default AlertWithIcon;
