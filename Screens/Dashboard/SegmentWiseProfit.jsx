import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert  } from 'react-native';
import AlertWithIcon from '../../Component/AlertWithIcon';
import { formatIndianNumber } from '../../Component/utils';

function SegmentWiseProfit() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });   

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading before fetch starts
      try {
        const postData = {
          inApiParameters: [],
          apiId: "9",
          token: "IEBL0001",
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
          //console.log('Parsed result:', result);
        } catch (jsonError) {
          //console.error('Failed to parse JSON. Raw text:', text);
          throw new Error('Invalid JSON response received.');
        }
  
        if (!result || typeof result !== 'object' || !result.output) {
          throw new Error('Unexpected or missing "output" in response.');
        }
  
        setData(result.output); // Set your data here
  
      } catch (error) {
        //console.error('Error fetching data:', error);
        setAlert({
          visible: true,
          title: "Fetch Error",
          message: error.message || "Failed to fetch data. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false); // Always unset loading
      }
    };
  
    fetchData();
  }, []);
  

 const totalYTD = data.reduce((sum, item) => sum + (parseFloat(item.TOTAL_EARNINGS) || 0), 0);
 const totalMTD = data.reduce((sum, item) => sum + (parseFloat(item.TOTAL_EXPENSES) || 0), 0);
 const totalT1 = data.reduce((sum, item) => sum + (parseFloat(item.PROFIT) || 0), 0);

 const renderFooter = () => (
   <View style={styles.footer}>
     <Text style={[styles.footerCell,{flex: 0.8, textAlign: 'center'}]}>Total</Text>
     <Text style={[styles.footerCell,{textAlign: 'right'}]}>{formatIndianNumber(totalYTD)}</Text>
     <Text style={[styles.footerCell,{textAlign: 'right'}]}>{formatIndianNumber(totalMTD)}</Text>
     <Text style={[styles.footerlastCell,{textAlign: 'right'}]}>{formatIndianNumber(parseFloat(totalT1).toFixed(0))}</Text>
   </View>
 );

const renderItem = ({ item }) => (
    <View style={styles.row}>
        <Text style={[styles.cell, {flex: 0.8, textAlign: 'left'}]}>{item.STORE_TYPE}</Text>
        <Text style={styles.cell}>{formatIndianNumber(item.TOTAL_EARNINGS)}</Text>
        <Text style={styles.cell}>{formatIndianNumber(item.TOTAL_EXPENSES)}</Text>
        <Text style={styles.celllastchild}>{formatIndianNumber(item.PROFIT)}</Text>
    </View>
);

  return (
    <View style={styles.container}>   
        <Text style={styles.asondate}>Segment Wise Profit </Text>       
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <Text style={[styles.headerCell, { flex: 0.8 }]}>Segment</Text>
              <Text style={styles.headerCell}>Earning</Text>
              <Text style={styles.headerCell}>Expenses</Text>
              <Text style={styles.headerlastCell}>Profit</Text>                          
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
                keyExtractor={(item) => item.ROW_NUM ? item.ROW_NUM.toString() : item.ROW_NUM.toString()} // Fallback if PNO is not available
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={true}
                ListFooterComponent={renderFooter} // Add footer here                  
              />            
            )}

      <AlertWithIcon
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
    width: '100%',
    padding: 2,  // Optional padding
  },   
  asondate: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    color: '#084da1',
    fontWeight: '500',
    fontSize: 16,
    fontFamily: 'sans-serif',
    letterSpacing: 0.3,
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
    fontSize: 13,
    letterSpacing: 0.3,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  celllastchild: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    letterSpacing: 0.3,
    paddingHorizontal: 5,
    paddingVertical: 5,
  },  
  footer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 3,
    backgroundColor: '#6c80ad',
    borderColor: '#ffffff',
    borderBottomWidth:1,
  },
  footerCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    letterSpacing: 0.3,
    color: '#fff',  
    borderRightWidth: 1,
    borderColor: '#FFFFFF',
    paddingRight: 5,
  },
  footerlastCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    letterSpacing: 0.3,
    color: '#fff',      
    paddingRight: 5,
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
    fontSize: 13,
    color: '#fff',  
    borderRightWidth: 1,
    borderColor: '#FFFFFF',
  },
  headerlastCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#fff',      
  },
   
});

export default SegmentWiseProfit;
