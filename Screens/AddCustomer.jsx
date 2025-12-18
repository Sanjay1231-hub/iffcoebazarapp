import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView,  KeyboardAvoidingView,  Platform } from 'react-native';
import CustomerIdProofType from '../Component/CustomerIdProofType';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertWithIcon from '../Component/AlertWithIcon';

const AddCustomer = () => {
  const [formData, setFormData] = useState({
    telephone: '',
    name: '',
    fatherSpouse: '',
    nominee: '',
    idProof: '',
    idNumber: '',
    address: '',    
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });

  const handleChange = (field, value) => {
    // For telephone, allow only digits and limit to 10 characters
    if (field === 'telephone') {
      value = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
  
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors({});
  };
  

  const validateForm = () => {
    const newErrors = {};
  
    if (!formData.telephone || formData.telephone.length !== 10) {
      newErrors.telephone = 'Enter a valid 10-digit number';
    }
  
    if (!formData.name) newErrors.name = 'Customer Name is required';

    if (!formData.fatherSpouse) newErrors.fatherSpouse = 'Father/Spouse Name is required';

    if (!formData.nominee) newErrors.nominee = 'Nominee Name is required';

    if (!formData.idProof || formData.idProof === "0") {
          newErrors.idProof = "ID Proof Name is required";
        }

    if (!formData.idNumber) newErrors.idNumber = 'id Number Name is required';

    if (!formData.address) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
  
    return Object.keys(newErrors).length === 0;
  };


 const handleSubmit = async () => {
  // Clear any previous alerts
  setAlert(a => ({ ...a, visible: false }));

  // Validate
  if (!validateForm()) return;

  setLoading(true);
  try {
    const loggedInEmpStore = await AsyncStorage.getItem('officeCode') || '';
    const loggedState      = await AsyncStorage.getItem('stateCd')     || '';
    //console.log("formdata is", formData);
    
    const requestData = {
      token: 'IEBL0001',
      apiId: '41',
      inApiParameters: [
        { label: 'P_CNAME',         value: formData.name.trim().toUpperCase() },
        { label: 'P_PHONE',         value: formData.telephone.trim().toUpperCase() },
        { label: 'P_FATHER',        value: formData.fatherSpouse.trim().toUpperCase() },
        { label: 'P_NOMINEE',       value: formData.nominee.trim().toUpperCase() },
        { label: 'P_VILLAGE',       value: formData.address.trim().toUpperCase() },
        { label: 'P_FSC_CD',        value: loggedInEmpStore?.toString().trim().toUpperCase() },
        { label: 'P_STATE_CD',      value: loggedState?.toString().trim().toUpperCase() },
        { label: 'P_IDENTITY_TYPE', value: formData.idProof.trim().toUpperCase() },
        { label: 'P_IDENTITY_NO',   value: formData.idNumber.trim().toUpperCase() },
      ],

    };

    const response = await fetch('https://ebazarapi.iffco.in/API', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':   'ReactNativeApp/1.0',
        'Accept':       'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON in server response');
    }

    const out = result.output?.OUT_PARAM_1;
    if (out) {

      const outVal = out.toString().trim();
      if (/ORA-\d+/i.test(outVal) || outVal.toUpperCase().includes("ERROR")) {
        // Oracle error → show warning
        setAlert({
          visible: true,
          title: "Warning",
          message: outVal, // remove "Error:" prefix if present
          type: "warning",
        });
      } else {
        // Success case
        setAlert({
          visible: true,
          title: "Success",
          message: outVal,
          type: "success",
        });
      }
      //setAlert({ visible: true, title: 'Success', message: out, type: 'success' });
      // Reset form
      setFormData({
        telephone: '',
        name: '',
        fatherSpouse: '',
        nominee: '',
        idProof: '',
        idNumber: '',
        address: '',
      });
      setErrors({});
    } else {
      throw new Error('Unexpected server response');
    }
  } catch (err) {
    setAlert({ visible: true, title: 'Error', message: err.message, type: 'error' });
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.heading}>Fill Customer Details</Text>           
            <View style={styles.row}>
                <Text style={styles.label}>Customer Name <Text style={styles.asterisk}>*</Text></Text>
                <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
             <View style={styles.row}>
                <Text style={styles.label}>Customer Mobile No. <Text style={styles.asterisk}>*</Text></Text>
                <TextInput
                style={styles.input}
                keyboardType="numeric"
                maxLength={10}
                value={formData.telephone}
                onChangeText={(text) => handleChange('telephone', text)}
                />
                {errors.telephone && <Text style={styles.errorText}>{errors.telephone}</Text>}
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Father/Spouse Name <Text style={styles.asterisk}>*</Text></Text>
                <TextInput
                style={styles.input}
                value={formData.fatherSpouse}
                onChangeText={(text) => handleChange('fatherSpouse', text)}
                />
                {errors.fatherSpouse && <Text style={styles.errorText}>{errors.fatherSpouse}</Text>}
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Nominee Name <Text style={styles.asterisk}>*</Text></Text>
                <TextInput
                style={styles.input}
                value={formData.nominee}
                onChangeText={(text) => handleChange('nominee', text)}
                />
                {errors.nominee && <Text style={styles.errorText}>{errors.nominee}</Text>}
            </View>
             <View style={styles.row}>
                <Text style={styles.label}>Customer ID Proof <Text style={styles.asterisk}>*</Text></Text>
                <View style={{ marginBottom: 3,}}>
                  <CustomerIdProofType selectedValue={formData.idProof} onValueChange={(text) => handleChange('idProof', text)} />
                </View>
                {errors.idProof && <Text style={styles.errorText}>{errors.idProof}</Text>}
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>ID Proof No. <Text style={styles.asterisk}>*</Text></Text>
                <TextInput
                style={styles.input}
                value={formData.idNumber}
                onChangeText={(text) => handleChange("idNumber", text.toUpperCase())} // force uppercase
                //autoCapitalize="characters" // ensures keyboard inputs in uppercase
                />
                {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Full Address <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={formData.address}
                onChangeText={(text) => handleChange('address', text)}
                multiline={true}
                numberOfLines={3}
              />
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>            

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.addButton, loading && { opacity: 0.6 }]}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.addButtonText}>Save Customer</Text>}
          </TouchableOpacity>
             {/* Reusable Custom Alert */}
        <AlertWithIcon
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ ...alert, visible: false })}
        />  
      </View> 
    </ScrollView>


  </KeyboardAvoidingView>
     
  );
};

const styles = StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
    },
    container: {
      flex: 1,  // Ensure the content container grows
      backgroundColor: '#ffffffff',    
      padding: 10,
    },
    
    heading: {      
      fontSize: 16,      
      color: '#208cf3',
      fontWeight: '400',
      letterSpacing: 0.3,
      marginBottom: 10,
      textAlign: 'center'
      
    },
    addButton: {
      backgroundColor: '#208cf3',
      paddingVertical: 8,
      marginTop: 10,
      marginBottom: 10,
      borderRadius: 5,
      alignItems: 'center',
      fontWeight: '700',
      //flex: 1,
      justifyContent: 'center',
      // Shadow for iOS
      shadowColor: '#000', // Color of the shadow
      shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
      shadowOpacity: 0.1, // Transparency of the shadow
      shadowRadius: 5, // Blur effect of the shadow
      
      // Shadow for Android
      elevation: 5, // Elevation for Android shadow
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'sans-serif',
        letterSpacing: 0.3,
    },
    row: {
      marginBottom: 3,
    },
    asterisk: {
        color: 'red',
    },
    errorText: {
        marginBottom: 4,
        color: '#ff7703',
        //fontSize: 16,
        letterSpacing: 0.1,
    },
    label: {
       fontSize: 15,
      marginBottom: 5,
      color: '#424242',
      fontWeight: '400',
      letterSpacing: 0.3,
    },
    input: {
      fontSize: 16,
      lineHeight: 20,            // Ensures text fits vertically
      minHeight: 40,             // Use minHeight instead of fixed height
      color: '#333',
      backgroundColor: '#fff',
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 8,      // Left/right padding
      marginBottom: 2,
      textAlignVertical: 'center', // Vertical centering on Android
    }, 
  });

export default AddCustomer;

  