import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView, RefreshControl } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ODLeaveTypePicker from '../Component/ODLeaveTypePicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertWithIcon from '../Component/AlertWithIcon';
import { useNavigation } from '@react-navigation/native';

const ODApply = () => {
  const [leaveType, setLeaveType] = useState(''); 
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [reason, setReason] = useState('');
  const [punchIn, setPunchIn] = useState('');
  const [punchOut, setPunchOut] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [message, setMessage] = useState('');
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  const onRefresh = () => {
    setRefreshing(true);

    // Simulate API call / reload data
    resetForm();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const resetForm = () => {
    setLeaveType('');  
    setFromTime('');
    setToTime('');
    setReason('');
    setPunchIn('');
    setPunchOut('');
    setSelectedDate(null);
    setMessage('');
  };

  const handleDateChange = async (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);  
      const formattedDate = formatDate(date);  
      try {
        const loggedUser = await AsyncStorage.getItem('username'); 
        setPunchIn('');
        setPunchOut('');
        setFromTime('');
        setToTime('');
        setMessage('');

        const postData = {
          token: "IEBL0001",
          apiId: "17",
          inApiParameters: [
            { label: "P_PERSONAL_NO", value: loggedUser },
            { label: "P_ATTENDACE_DT", value: formattedDate },
          ],
        };
        
        try {
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
        
          if (!response.ok || text.trim().startsWith("<")) {
            throw new Error(`HTTP error or invalid response format: ${response.status}`);
          }
        
          const result = JSON.parse(text);
        
          if (result?.output && Array.isArray(result.output) && result.output.length > 0) {
            const details = result.output[0];
            if (details?.TIME_IN) {
              setPunchIn(String(details.TIME_IN));
              setPunchOut(details.TIME_OUT ? String(details.TIME_OUT) : "0.0");
            } else {
              setMessage("Punch details not found");
            }
          } else {
            setMessage("Punch details not found");
          }
        } catch (error) {
          setMessage("Fetch error: " + error.message);
        }
        
      } catch (error) {
        setMessage('Punch detail not found');
        //console.error('Error fetching data:', error);
        setAlert({ visible: true, title: "Error", message: error.message || "Failed to fetch data. Please try again.", type: "error" });

      }
    }
  };  

  const handleLeaveTypeChange = (value) => {
    setLeaveType(value);
  };

  const isValidTimeFormat = (time) => {
    const timePattern = /^(0[0-9]|1[0-9]|2[0-3])\.[0-5][0-9]$/; // Regex for HH.MM format
    return timePattern.test(time);
  };



const formatTime = (text, setter) => {
  // Remove non-numeric characters
  let formattedText = text.replace(/[^0-9]/g, "");

  // Limit to 4 digits (HHMM format)
  if (formattedText.length > 4) return;

  // Auto-format when 4 digits are entered
  if (formattedText.length === 4) {
      const hh = formattedText.slice(0, 2); // First two digits (HH)
      const mm = formattedText.slice(2, 4); // Last two digits (MM)

      // Validate time range (00-23 for HH, 00-59 for MM)
      if (parseInt(hh, 10) > 23 || parseInt(mm, 10) > 59) {
          return; // Invalid time, do not set state
      }

      formattedText = `${hh}.${mm}`; // Convert to HH.MM format
  }

  setter(formattedText);
};

  const handleSubmit = async () => {
    if (!reason) {
      setAlert({ visible: true, title: "Validation Error", message: "Please enter a Remarks for your leave.", type: "warning" });
      return;
    }
    if (!isValidTimeFormat(fromTime)) {
      setAlert({ visible: true, title: "Validation Error", message: "Please enter a valid From Time in HH.MM format (00.00).", type: "warning" });
      return;
    }
    if (!isValidTimeFormat(toTime)) {
      setAlert({ visible: true, title: "Validation Error", message: "Please enter a valid To Time in HH.MM format (00.00).", type: "warning" });
      return;
    }
    if (leaveType === '') {
      setAlert({ visible: true, title: "Validation Error", message: "Please select a valid leave type option.", type: "warning" });
      return;
    }  
    const loggedUser = await AsyncStorage.getItem('username');   
    const requestData = {
      token: 'IEBL0001',
      apiId: '19',
      inApiParameters: [
        { label: 'P_PERSONAL_NO', value: loggedUser },
        { label: 'P_APPLICANT_REMARK', value: reason },
        { label: 'P_OD_DATE', value: formatDate(selectedDate) },
        { label: 'P_OD_FROM_TIME', value: fromTime },
        { label: 'P_OD_TO_TIME', value: toTime },
        { label: 'P_OD_TYPE', value: leaveType },
        { label: 'P_SOURCE', value: "MOB_APP" },
      ],
    };    
    
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }    
      const data = await response.json();
      setAlert({ visible: true, title: "Success", message: "Your OD has been applied successfully!", type: "success" });
    
      resetForm();
    } catch (error) {
      //console.error('Error fetching data:', error);
      setAlert({ visible: true, title: "Error fetching data", message: error.message, type: "error" });
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

return (
    <ScrollView contentContainerStyle={styles.container} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.ODbuttonContainer}>   
      <Text style={styles.label}>
          OD / Time Loss Date<Text style={styles.asterisk}>*</Text>
        </Text>    
        <TouchableOpacity
          onPress={() => navigation.navigate('ODHistory')}
          //style={styles.historyButton}
        >
          <Text style={styles.odText}> OD History</Text>
        </TouchableOpacity>
      </View>
     

      {Platform.OS === 'web' ? (
      <input
        type="date"
        onChange={(e) => {
          const date = new Date(e.target.value);
          setSelectedDate(date);
          handleDateChange(null, date); // Call handleDateChange with the selected date
        }}
        style={styles.webDateInput}
      />
      ) : (
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
      </TouchableOpacity>
      )}
      {showDatePicker && Platform.OS !== 'web' && (
      <DateTimePicker
        value={selectedDate || new Date()}
        mode="date"
        display="default"
        onChange={handleDateChange}
      />
    )}

      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={[styles.cell, styles.heading, { borderRightWidth: 1, borderRightColor: '#ddd' }]}>Punch In</Text>
          <Text style={[styles.cell, styles.heading]}>Punch Out</Text>
        </View>
          {/* Display Punch In and Punch Out Times */}
          {punchIn && punchOut ? (
                <View style={[styles.row, { height: 60 }]}>
                <Text style={[styles.cell, { borderRightWidth: 1, borderRightColor: '#ddd' }]}>{punchIn}</Text>
                <Text style={styles.cell}>{punchOut}</Text>              
      
              </View>
            ) : (
                message ? (
                    <View style={[styles.row, { height: 60, justifyContent: 'center' }]}>
                      <Text>{message}</Text> 
                    </View>// Display the message if no data
                ) : <View style={[styles.row, { height: 60 }]}>
                      <Text>{message}</Text> 
                    </View> // If no message, render nothing
            )}

      </View>

      <View style={{ marginBottom: 10,}}>
        <Text style={styles.label}>From Time<Text style={styles.asterisk}>*</Text></Text>
        <TextInput
            style={styles.textInput}
            value={fromTime}
            onChangeText={(text) => formatTime(text, setFromTime)}
            //onChangeText={handleFromTimeChange}
            placeholder="HH.MM"
            placeholderTextColor="#a3a3a3"
            maxLength={5}
            //keyboardType="numeric"
        />
      </View>

      <Text style={styles.label}>To Time<Text style={styles.asterisk}>*</Text></Text>
      <TextInput
            style={styles.textInput}
            value={toTime}
            onChangeText={(text) => formatTime(text, setToTime)}
            //onChangeText={handleToTimeChange}
            placeholder="HH.MM"
            placeholderTextColor="#a3a3a3"
            maxLength={5}
            //keyboardType="numeric"
        />

       <Text style={[styles.note, { fontSize: 13 }]}>*Time Should be in hh.mm format only</Text>     

      <Text style={styles.label}>OD / Time Loss Reason<Text style={styles.asterisk}>*</Text></Text>
      <View style={{ marginBottom: 10,}}>
        <ODLeaveTypePicker selectedValue={leaveType} onValueChange={handleLeaveTypeChange} />
      </View>

      <Text style={styles.label}>Remarks<Text style={styles.asterisk}>*</Text></Text>
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={2}
        value={reason}
        onChangeText={setReason}
        placeholder="Enter the reason for your leave"
        placeholderTextColor='#a3a3a3'
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>      

        
      </View>

      {/* Reusable Custom Alert */}
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
  },
  note: {
    color: '#427af1',
    fontSize: 13,
    marginBottom: 10,
    letterSpacing: 0.3, 
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
    letterSpacing: 0.3, 
  },
  textInput: {
    fontSize: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    minHeight: 35,
  },
  webDateInput: {
    fontSize: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    minHeight: 35,
    width: '100%', // Make sure it occupies the full width
    letterSpacing: 0.3, 
  },
 
  
  ODbuttonContainer: {
    flexDirection: 'row',
    //justifyContent: 'flex-end',
    justifyContent: 'space-between',
    //marginBottom: -16, // positive margin instead of -20
  },

  buttonContainer: {
    //flexDirection: 'row',   
    justifyContent: 'center', // Push content to the bottom    
  },
  submitButton: {
    //backgroundColor: '#0063B2',
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
  historyButton: {
    backgroundColor: '#89a9f0',
    paddingVertical: 8,
    paddingHorizontal: 8,
    //marginTop: 10,
    //marginBottom: 10,
    borderRadius: 5,
    alignItems: 'center',
    fontWeight: '500',
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
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.4, 
  },
  odText: {
    color: '#0000ff',
    textDecorationLine: 'underline',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.1,
    paddingBottom: 10, 
  },
 
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    flex: 1,
    padding: 5,
    textAlign: 'center',
  },
  heading: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '400',
    backgroundColor: '#6c80ad',
    letterSpacing: 0.3, 
  },
});

export default ODApply;