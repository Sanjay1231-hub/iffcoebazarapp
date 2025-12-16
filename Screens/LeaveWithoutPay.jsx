import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, Button, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertWithIcon from '../Component/AlertWithIcon';

const LeaveWithoutPay = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
   const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" }); 

  const handleFromDateChange = (event, date) => {
    setShowFromDatePicker(false);
    if (date) {
      setFromDate(date);
    }
  };

  const handleToDateChange = (event, date) => {
    setShowToDatePicker(false);
    if (date) {
      setToDate(date);
    }
  };
  

  const handleSubmit = async () => {
    if (!fromDate) {
       setAlert({ visible: true, title: "Validation Error", message: "Please select from date.", type: "warning" });
      return;
    }
    if (!toDate) {
       setAlert({ visible: true, title: "Validation Error", message: "Please select to date.", type: "warning" });
      return;
    }
    if (!reason) {
       setAlert({ visible: true, title: "Validation Error", message: "Please fill remark field.", type: "warning" });
      return;
    }
    

    let frdt = formatDate(fromDate)
    //console.log("From Date is ", frdt);

    const loggedInEmpStore = await AsyncStorage.getItem('officeCode');
        const loggedUser = await AsyncStorage.getItem('username');

        if (!loggedInEmpStore || !loggedUser) {
            setAlert({ visible: true, title: "Error", message: "No store or user found.", type: "error" });
            setLoading(false);
            return;
        }

               try {
            const postData = {
              token: "IEBL0001",
              apiId: "42",
              inApiParameters: [
                { label: 'P_PERSONAL_NO', value: loggedUser },
                { label: 'P_LWP_FROM_DT', value: formatDate(fromDate) },
                { label: 'P_LWP_TO_DT', value: formatDate(toDate) },
                { label: 'P_APPLICANT_REMARK', value: reason }
              ],
            };
          
            const response = await fetch('https://ebazarapi.iffco.in/API', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'ReactNativeApp/1.0',
                'Accept': 'application/json',
              },
              body: JSON.stringify(postData),
            });
          
            const responseText = await response.text();
          
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
          
            let result;
            try {
              result = JSON.parse(responseText);
              //console.log("Parsed API result:", result);
            } catch (parseError) {
              //console.error('Error parsing server response:', parseError);
              setAlert({
                visible: true,
                title: "Error",
                message: "Failed to parse server response.",
                type: "error",
              });
              return;
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
              setFromDate('');
                      setToDate('');
                      setReason('');
            } else {
              throw new Error('Unexpected server response');
            }
          
            // const responseData = result.output;
          
            // if (responseData?.OUT_PARAM_1) {
            //   setAlert({ visible: true, title: "Success", message: responseData.OUT_PARAM_1, type: "success" });
          
            //   // Reset form fields
            //   setFromDate('');
            //   setToDate('');
            //   setReason('');
              
            // } else {
            //   setAlert({ visible: true, title: "Error", message: "Unexpected server response.", type: "error" });
            // }
          
          } catch (error) {
            //console.error("API error:", error);
            setAlert({
              visible: true,
              title: "Error",
              message: error.message || "An error occurred while leave apply.",
              type: "error"
            });
          } finally {
            setLoading(false);
          }
    //Alert.alert('Success', 'Your leave application has been submitted.');
  };

  const formatDate = (date) => {
    if (!date) return '--Select--';
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>From Date<Text style={styles.asterisk}>*</Text></Text>
      <TouchableOpacity onPress={() => setShowFromDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>{formatDate(fromDate)}</Text>
      </TouchableOpacity>
      {showFromDatePicker && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display="default"
          onChange={handleFromDateChange}
        />
      )}

      <Text style={styles.label}>To Date<Text style={styles.asterisk}>*</Text></Text>
      <TouchableOpacity onPress={() => setShowToDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>{formatDate(toDate)}</Text>
      </TouchableOpacity>
      {showToDatePicker && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display="default"
          onChange={handleToDateChange}
        />
      )}

      <Text style={styles.label}>Remark<Text style={styles.asterisk}>*</Text></Text>
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={2}
        value={reason}
        onChangeText={setReason}
        placeholder="Enter the reason for your leave"
        placeholderTextColor='#797979'
        allowFontScaling={false}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>        
      </View>
       <AlertWithIcon
         visible={alert.visible}
         title={alert.title}
         message={alert.message}
         type={alert.type}
         onClose={() => setAlert({ ...alert, visible: false })}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    letterSpacing: 0.3,
    color: '#424242',
    fontWeight: '400',
  },
  asterisk: {
    color: 'red',
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 5,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  dateText: {
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.3
  },
  textInput: {
    height: 40,
    fontSize: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    minHeight: 40,
    letterSpacing: 0.3
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
 
   submitButton: {
    backgroundColor: '#208cf3',
    paddingVertical: 8,  
    paddingHorizontal: 18,  
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    fontWeight: '700',
    flex: 1,
    justifyContent: 'center',
    // Shadow for iOS
    shadowColor: '#000', // Color of the shadow
    shadowOffset: { width: 0, height: 40 }, // Shadow offset (x, y)
    shadowOpacity: 1, // Transparency of the shadow
    shadowRadius: 5, // Blur effect of the shadow
    
    // Shadow for Android
    elevation: 5, // Elevation for Android shadow
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.3
  }, 

});

export default LeaveWithoutPay;
