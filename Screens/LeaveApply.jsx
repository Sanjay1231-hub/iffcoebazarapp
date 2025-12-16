import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LeaveApplyDayPicker from '../Component/LeaveApplyDayPicker';
import LeavePurpose from '../Component/LeavePurpose';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertWithIcon from '../Component/AlertWithIcon.js';
import { useNavigation } from '@react-navigation/native';

const LeaveApply = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [reason, setReason] = useState('');
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaveType, setLeaveType] = useState('');
  const [leavePurpose, setLeavePurpose] = useState('');
  const [submitting, setSubmitting] = useState(false); // New loading state for submission
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });

  const navigation = useNavigation();
  

  const resetForm = () => {
    setReason('');    
    setLeaveType('');
    setLeavePurpose('');
    setFromDate(null);
    setToDate(null);
  };

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        const loggedUser = await AsyncStorage.getItem('username');
        if (!loggedUser) {
          throw new Error('No user found');
        }  
        const postData = {
          token: "IEBL0001",
          apiId: "20",
          inApiParameters: [
            {
              label: "P_PERSONAL_NO",
              value: loggedUser
            }
          ]
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
  
        const text = await response.text();
  
        if (!response.ok) {
          //console.warn('Non-200 response:', response.status);
          //console.warn('Raw response body:', text);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        let result;
        try {
          result = JSON.parse(text);
        } catch (jsonError) {
          //or('Failed to parse JSON. Server returned:', text);
          throw new Error('Invalid JSON response received.');
        }
  
        if (result && Array.isArray(result.output) && result.output.length > 0) {
          setLeaveBalance(String(result.output[0].LEAVE_BALANCE || 0));
        } else {
          setAlert({ visible: true, title: "Info", message: "No leave balance data found.", type: "warning" });
        }
  
      } catch (error) {
        setAlert({ visible: true, title: "Error", message: error.message || 'Failed to fetch data. Please try again.', type: "error" });
      } finally {
        setLoading(false);
      }
    };
  
    fetchLeaveBalance();
  }, []);
  

  const handleDateChange = (type, date) => {
    if (date) {
      if (type === 'from') {
        setFromDate(date);
        if (toDate && date > toDate) {
          setAlert({ visible: true, title: "Validation Error", message: "From Date must be less than To Date.", type: "warning" });

          setToDate(null); // Reset toDate
        }
      } else {
        setToDate(date);
        if (fromDate && date < fromDate) {
          setAlert({ visible: true, title: "Validation Error", message: "To Date must be more than From Date.", type: "warning" });
          setToDate(null); // Reset toDate
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!fromDate) {
      setAlert({ visible: true, title: "Validation Error", message: "Please select a From Date.", type: "warning" });
      return;
    }
    
    if (!toDate) {
      setAlert({ visible: true, title: "Validation Error", message: "Please select a To Date.", type: "warning" });
      return;
    }
    
    if (!leavePurpose) {
      setAlert({ visible: true, title: "Validation Error", message: "Please select a leave purpose.", type: "warning" });
      return;
    }   

    if (!leaveType) {
      setAlert({ visible: true, title: "Validation Error", message: "Please select a leave type.", type: "warning" });
      return;
    }   
    
    if (!reason) {
      setAlert({ visible: true, title: "Validation Error", message: "Reason cannot be left blank.", type: "warning" });
      return;
    }
    
    
    if (toDate < fromDate) {
      setAlert({ visible: true, title: "Validation Error", message: "To Date must be more than From Date.", type: "warning" });
      return;
    }

    setSubmitting(true); // Start loading

    const loggedUser = await AsyncStorage.getItem('username');
    if (!loggedUser) {
      //Alert.alert('Error', 'No user found');
      setAlert({ visible: true, title: "Error", message: "No User found.", type: "error" });
      setSubmitting(false); // End loading
      return;
    }

    const requestData = {
      inApiParameters: [
        { label: 'P_APPLICANT_PNO', value: loggedUser },
        { label: 'P_LEAVE_FROM_TIME', value: formatDate(fromDate) },
        { label: 'P_LEAVE_TO_TIME', value: formatDate(toDate) },
        { label: 'P_HALF_FULL', value: leaveType },
        { label: 'P_APPLICANT_REMARK', value: reason },        
        { label: 'P_LEAVE_PURPOSE', value: leavePurpose },
        { label: 'P_SOURCE', value: "MOB_APP" },
      ],
      apiId: '21',
      token: 'IEBL0001',      
    };

    //console.log("Leae Apply submitg data",requestData);
    
    try {
      const response = await fetch('https://ebazarapi.iffco.in/API', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ReactNativeApp/1.0',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorData.message}`);
      }
    
      setAlert({
        visible: true,
        title: "Success",
        message: "Your Leave has been applied successfully!",
        type: "success",
      });
    
      resetForm();
    } catch (error) {
      setAlert({
        visible: true,
        title: "Error",
        message: error.message || 'An error occurred while applying for your Leave.',
        type: "error",
      });
    } finally {
      setSubmitting(false); // End loading
    }
    
  };

  const formatDate = (date) => {
    if (!date) return '--Select--';
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ transform: [{ scale: 0.6 }] }}>
          <ActivityIndicator size={50} color="#4a80f5" />
        </View>       
      </View>
    );
  }
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ transform: [{ scale: 0.6 }] }}>
          <ActivityIndicator size={50} color="#4a80f5" />
        </View>
      </View>
      ) : (
        <>
          <View style={{ marginBottom: 10, justifyContent: 'space-between', flexDirection: 'row'}}>
            <Text style={styles.label}>Leave Balance : <Text style={{ color: '#1b74f5', fontWeight: 500,}}>{leaveBalance !== null ? leaveBalance : '--Loading--'}</Text></Text>
             <TouchableOpacity
                      onPress={() => navigation.navigate('LeaveHistory')}
                      //style={styles.historyButton}
                    >
                      <Text style={styles.odText}> Leave History</Text>
                    </TouchableOpacity>
          </View>
          <View style={{ marginBottom: 5,}}>
            <Text style={styles.label}>From Date<Text style={styles.asterisk}>*</Text></Text>
            <TouchableOpacity onPress={() => setShowFromDatePicker(true)} style={styles.dateButton}>
              <Text style={styles.dateText}>{formatDate(fromDate)}</Text>
            </TouchableOpacity>
            {showFromDatePicker && (
              <DateTimePicker
                value={fromDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => { setShowFromDatePicker(false); handleDateChange('from', date); }}
              />
            )}
          </View>         

          <View style={{ marginBottom: 10,}}>
            <Text style={styles.label}>To Date<Text style={styles.asterisk}>*</Text></Text>
            <TouchableOpacity onPress={() => setShowToDatePicker(true)} style={styles.dateButton}>
              <Text style={styles.dateText}>{formatDate(toDate)}</Text>
            </TouchableOpacity>
            
            {showToDatePicker && (
              <DateTimePicker
                value={toDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => { setShowToDatePicker(false); handleDateChange('to', date); }}
              />
            )}
          </View>
        
          <View style={{ marginBottom: 15,}}>
              <Text style={styles.label}>Leave Purpose<Text style={styles.asterisk}>*</Text></Text>       
              <LeavePurpose selectedValue={leavePurpose} onValueChange={setLeavePurpose} />
          </View>
          <View style={{ marginBottom: 15,}}>
              <Text style={styles.label}>Half/Full Day<Text style={styles.asterisk}>*</Text></Text>       
              <LeaveApplyDayPicker selectedValue={leaveType} onValueChange={setLeaveType} />
          </View>
          <View style={{ marginBottom: 10,}}>
            <Text style={styles.label}>Remark<Text style={styles.asterisk}>*</Text></Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={2}
              value={reason}
              onChangeText={setReason}
              placeholder="Enter the reason for your leave..."
              placeholderTextColor='#a3a3a3'
              allowFontScaling={false}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.buttonDisabled]} 
              onPress={handleSubmit} 
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

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
    flexGrow: 1,  // Ensure the content container grows
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#424242',
    fontWeight: '400',
    letterSpacing: 0.3, 
  },
  asterisk: {
    color: 'red',
    fontSize: 16,
    letterSpacing: 0.3, 
  },
  dateButton: {
    //backgroundColor: '#f0f0f0',
    backgroundColor: '#f1f1f1',
    padding: 5,
    borderRadius: 5,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  dateText: {
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.3, 
  },
  textInput: {
    fontSize: 15,
    lineHeight: 20,            // Ensures text fits vertically
    minHeight: 40,             // Use minHeight instead of fixed height
    color: '#333',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,      // Left/right padding
    marginBottom: 2,
    letterSpacing: 0.3, 
  },  
  
  buttonContainer: {
    //flexDirection: 'row',
    //justifyContent: 'space-between',
  },
  submitButton: {
    //backgroundColor: '#0063B2',
    backgroundColor: '#208cf3',
    marginTop: 10,
    borderRadius: 5,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for iOS
    shadowColor: '#000', // Color of the shadow
    //shadowColor: '#0368ff', // Color of the shadow
    shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
    shadowOpacity: 0.1, // Transparency of the shadow
    shadowRadius: 5, // Blur effect of the shadow
    
    // Shadow for Android
    elevation: 5, // Elevation for Android shadow
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: 0.3, 
  },
  odText: {
    color: '#0000ff',
    textDecorationLine: 'underline',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.1,
    //paddingBottom: 10, 
    //lineHeight: 14,
  },
});

export default LeaveApply;
