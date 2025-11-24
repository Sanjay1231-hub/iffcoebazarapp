import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertWithIcon from '../Component/AlertWithIcon';

const ODHistory = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
      setRefreshing(true);
      // Simulate fetch new data
      fetchODHistory();
      setTimeout(() => {
        //setData([...data, "New Item " + (data.length + 1)]);
        setRefreshing(false);
      }, 2000);
    };

    useEffect(() => {
      fetchODHistory();
    }, []);
      
    const fetchODHistory = async () => {
      try {
        setLoading(true); // Start loader when fetch begins
    
        const loggedUser = await AsyncStorage.getItem('username');
    
        if (!loggedUser) {
          Alert.alert('Error', 'User information not found. Please login again.');
          return;
        }
    
        const postData = {
          token: "IEBL0001",
          apiId: "36",
          inApiParameters: [
            { label: 'P_PERSONAL_NO', value: loggedUser },
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
    
        const text = await response.text();
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        let result;
        try {
          result = JSON.parse(text);
        } catch (jsonError) {
          throw new Error('Invalid JSON response received from server.');
        }
    
        if (!result || typeof result !== 'object' || !Array.isArray(result.output)) {
          throw new Error('Unexpected or invalid data format received.');
        }
    
        //console.log('✅ OD history fetched:', result.output);
        setData(result.output); // Update your state with fetched data
    
      } catch (error) {
        //console.error('❌ Fetch error:', error.message);
        setAlert({
          visible: true,
          title: "Fetch Error",
          message: error.message || "Failed to fetch OD history.",
          type: "error",
        });
      } finally {
        setLoading(false); // Stop loader
      }
    };
      
    const formatDateDDMMYY = (dateString) => {
      if (!dateString) return "N/A";

      // Expecting format "dd-mm-yyyy"
      const parts = dateString.split("-");
      if (parts.length !== 3) return dateString;

      const [day, month, year] = parts;
      const shortYear = year.slice(-2);

      return `${day}-${month}-${shortYear}`;
    };

    const RenderItemComponent = React.memo(({ item }) => (        
      <View style={styles.row}>
        <Text style={[styles.cell, { flex: 0.5, textAlign: 'center' }]}>{item.SNO || 'No data'}</Text>         
        <Text style={[styles.cell, { flex: 1.6, textAlign: 'left' }]}>{formatDateDDMMYY(item.OD_DATE) || 'No data'}</Text>         
        <Text style={[styles.cell, { flex: 1.2, textAlign: 'right' }]}>{item.OD_FROM_TIME || 'No data'}</Text>       
        <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>{item.OD_TO_TIME || 'No data'}</Text> 
        <Text style={[styles.cell, { flex: 2.1, textAlign: 'left' }]}>{item.OD_TYPE || 'No data'}</Text>                    
      </View>        
    ));
  
  
    const renderItem = useCallback(({ item }) => <RenderItemComponent item={item} />, []);
    
  
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
    <View style={styles.container}>
      
        <View style={styles.header}>                           
            <Text style={[styles.headerText, { flex: 0.6, textAlign: 'center' }]}>S.No</Text>
            <Text style={[styles.headerText, { flex: 1.6, textAlign: 'center' }]}>Date</Text>
            <Text style={[styles.headerText, { flex: 1.2, textAlign: 'center' }]}>From Time</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>To Time</Text>
            <Text style={[styles.headerText, { flex: 2, textAlign: 'center' }]}>Reason</Text>
        </View>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.SNO ? item.SNO.toString() : index.toString()} 
          ListEmptyComponent={<Text style={styles.emptyMessage}>No history found</Text>}
          style={{borderColor: '#ccc', borderWidth: 0, height: 'auto' }}
          refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        />

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
    container: {
        flex: 1,
        padding: 5,
        backgroundColor: '#ffffff',
      },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f0f0f0', padding: 8 },
  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },    
  cell: {
    flex: 1,
    backgroundColor: '#ffffff',       
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#6c80ad',
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#fff',
    paddingVertical: 3,
    borderRightWidth: 1,
    borderColor: '#FFFFFF',
    letterSpacing: 0.3, 
  },
});

export default ODHistory;
