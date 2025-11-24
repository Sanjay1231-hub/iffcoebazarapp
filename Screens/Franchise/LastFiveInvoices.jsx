import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatIndianNumber } from '../../Component/utils';

function LastFiveInvoices() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const loggedInEmpStore = await AsyncStorage.getItem('officeCode');
            if (!loggedInEmpStore) {
                Alert.alert('Error', 'No store found');
                return;
            }
 
            
            const postData = {
              token: "IEBL0001",
              apiId: "15",                
              inApiParameters: [
                { label: "P_PARTY_CD", value: loggedInEmpStore } 
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
              //console.warn('Non-200 response:', response.status);
              //console.warn('Raw response body:', responseText);
              throw new Error(`HTTP error! Status: ${response.status}`);
              }
      
            let result;
            try {
              result = JSON.parse(responseText);
            } catch (jsonError) {
              //console.error('JSON parse error:', jsonError);
              throw new Error('Invalid JSON response received.');
            }
      
            if (result?.output && Array.isArray(result.output)) {
              setData(result.output);
            } else {
              throw new Error('Unexpected data format received.');
            }
        } catch (error) {
            //console.error('Error fetching data:', error);
            Alert.alert('Fetch Error', error.message);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
}, []); 

const renderItem = ({ item }) => (
    <View style={styles.row}>
        <Text style={[styles.cell, {flex: 2.1, textAlign: 'left'}]}>{item.INVOICE_NO}</Text>
        <Text style={styles.cell}>{item.DTBILL}</Text>
        <Text style={styles.cell}>{formatIndianNumber(item.AMT_D)}</Text>       
    </View>
);

  return (
    <View style={styles.container}>
   
        <Text style={styles.asondate}>Last Five Invoices</Text>
       
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <Text style={[styles.headerCell, { flex: 1.95 }]}>Invoice No.</Text>
              <Text style={styles.headerCell}>Date</Text>
              <Text style={styles.headerCell}>Amount</Text>                                   
            </View>
          </View>
        {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ transform: [{ scale: 0.6 }] }}>
                <ActivityIndicator size={50} color="#4a80f5" />
              </View>
            </View>
        ) : (
            <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.SNO ? item.SNO.toString() : item.SNO.toString()} // Fallback if PNO is not available
            showsVerticalScrollIndicator={true}
            />
        )}      
       
    </View>      
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 2,  // Optional padding
  },   
  asondate: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    color: '#084da1',
    fontWeight: '500',
    fontSize: 16,
    letterSpacing: 0.3, 
    fontFamily: 'sans-serif',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cell: {
    flex: 1,
    textAlign: 'right',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
 
 
  headerContainer: {
    backgroundColor: '#9dacd9', // Header background color   
    zIndex: 1, // Ensure the header is above other components
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 3,
    backgroundColor: '#6c80ad',
    borderColor: '#ffffff',
    borderBottomWidth:1,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    letterSpacing: 0.3, 
    letterSpacing: 0.3, 
    color: '#fff',  
    borderRightWidth: 1,
    borderColor: '#FFFFFF',
  },
  headerlastCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    letterSpacing: 0.3, 
    color: '#fff',      
  },
   
});

export default LastFiveInvoices;
