import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertWithIcon from '../../Component/AlertWithIcon';

const PartyLedgerReport = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });

  // --- Handle Date Selection ---
  const handleDateChange = (type, selectedDate) => {
    if (!selectedDate) return;

    const date = new Date(selectedDate);
    date.setHours(0, 0, 0, 0); // normalize

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) {
      return showAlert("Validation Error", "You cannot select a future date.", "warning");
    }

    if (type === "from") {
      if (toDate && date > toDate) {
        setToDate(null);
        return showAlert("Validation Error", "From Date must be less than or equal to To Date.", "warning");
      }
      setFromDate(date);
    } else {
      if (fromDate && date < fromDate) {
        return showAlert("Validation Error", "To Date must be greater than or equal to From Date.", "warning");
      }
      setToDate(date);
    }
  };

  const showAlert = (title, message, type) => {
    setAlert({ visible: true, title, message, type });
  };

  // --- Format Date for Display and URL ---
  const formatDate = (date, forUrl = true) => {
    if (!date) return '--Select--';
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const month = forUrl ? String(date.getMonth() + 1).padStart(2, '0') : monthNames[date.getMonth()];
    const year = date.getFullYear();
    return forUrl ? `${day}-${month}-${year}` : `${day}-${month}-${year}`;
  };

  // --- Generate PDF URL and Open ---
  const openPdfNew = async () => {
    if (!fromDate) return showAlert("Validation Error", "Please select a From Date.", "warning");
    if (!toDate) return showAlert("Validation Error", "Please select a To Date.", "warning");

    try {
      setIsDownloading(true);
      const fscOffice = await AsyncStorage.getItem('officeCode');
      console.log("from date",formatDate(fromDate, false));

      const pdfUrl = `https://ebazar.iffco.coop/BazarSoftRDLC/bazarsoftreport/PARTY_LEDGERNEW.aspx?P_FROM_DATE=${formatDate(fromDate, false)}&P_TO_DATE=${formatDate(toDate, false)}&P_PARTY_CD=${fscOffice}&P_ORG_CD=%&Report_Type=PDF_APP&ENCRYPTED=false`;

      console.log("Report URL:", pdfUrl);

      await Linking.openURL(pdfUrl);

    } catch (error) {
      console.log("PDF Download Error:", error);
      showAlert("Error", "Unable to download your report. Please try again.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>     
      {/* From Date */}
      <View style={styles.dateContainer}>
        <Text style={styles.label}>From Date<Text style={styles.asterisk}>*</Text></Text>
        <TouchableOpacity onPress={() => setShowFromDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{formatDate(fromDate, false)}</Text>
        </TouchableOpacity>
        {showFromDatePicker && (
          <DateTimePicker
            value={fromDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowFromDatePicker(false);
              handleDateChange('from', date);
            }}
          />
        )}
      </View>

      {/* To Date */}
      <View style={styles.dateContainer}>
        <Text style={styles.label}>To Date<Text style={styles.asterisk}>*</Text></Text>
        <TouchableOpacity onPress={() => setShowToDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{formatDate(toDate, false)}</Text>
        </TouchableOpacity>
        {showToDatePicker && (
          <DateTimePicker
            value={toDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowToDatePicker(false);
              handleDateChange('to', date);
            }}
          />
        )}
      </View>

      {/* Download Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.downloadButton, isDownloading && { opacity: 0.7 }]}
          onPress={openPdfNew}
          disabled={isDownloading}
        >
          <Ionicons name="open-outline" size={24} color="white" />
          <Text style={styles.downloadText}>{isDownloading ? 'Downloading...' : 'Download'}</Text>
        </TouchableOpacity>
      </View>

      {/* Alert Modal */}
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
    paddingVertical: 15,
  },
  dateContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#424242',
    fontWeight: '500',
  },
  asterisk: {
    color: 'red',
  },
  dateButton: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
  },
  buttonContainer: {
    justifyContent: 'center',      
    alignItems: 'center',
    marginTop: 20,
  },  
  downloadButton: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    backgroundColor: '#208cf3',
    borderRadius: 5,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  }, 
  downloadText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  }, 
});

export default PartyLedgerReport;
