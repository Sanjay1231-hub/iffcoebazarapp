import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AlertWithIcon = ({ visible, title, message, type = "error", onClose }) => {
  // Define icon and color based on alert type
  const getAlertConfig = () => {
    switch (type) {
      case "success":
        return { icon: "checkmark-circle-outline", color: "#26c221" }; // Green for success
      case "warning":
        return { icon: "warning-outline", color: "#fcac00ff" }; // Yellow for warning
      case "error":
        return { icon: "close-circle-outline", color: "#f5531d" }; // Red for error
      default:
        return { icon: "information-circle-outline", color: "#007bff" }; // Default to blue info icon
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitleBar: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: 18,
    letterSpacing: 0.3,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalIcon: {
    marginTop: 10,
  },
  modalMessage: {
    fontSize: 15,
    color: '#333',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  okButton: {
    marginTop: 10,
    paddingHorizontal: 20,
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
