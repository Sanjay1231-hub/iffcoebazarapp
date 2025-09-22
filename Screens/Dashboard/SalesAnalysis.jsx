import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, ActivityIndicator, Alert  } from 'react-native';
import AlertWithIcon from '../../Component/AlertWithIcon';
import { formatIndianNumber } from '../../Component/utils';

function SalesAnalysis() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    setCurrentDate(formatDate(now));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postData = {
          inApiParameters: [],
          apiId: "13",
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
  
        if (text.trim().startsWith('<')) {
          throw new Error('Received HTML instead of JSON. API may be down or URL might be wrong.');
        }
  
        let result;
        try {
          result = JSON.parse(text);
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
        setAlert({
          visible: true,
          title: "Fetch Error",
          message: error.message || "Something went wrong. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  


 // Calculate totals
 const totalYTD = data.reduce((sum, item) => sum + (parseFloat(item.YTD_SALE_CR) || 0), 0);
 const totalMTD = data.reduce((sum, item) => sum + (parseFloat(item.MTD_SALE_CR) || 0), 0);
 const totalT1 = data.reduce((sum, item) => sum + (parseFloat(item.T_1_SALE_CR) || 0), 0);

 const renderFooter = () => (
   <View style={styles.footer}>
     <Text style={[styles.footerCell,{flex: 2.05, textAlign: 'center'}]}>Total</Text>
     <Text style={[styles.footerCell,{textAlign: 'right'}]}>{formatIndianNumber(totalYTD)}</Text>
     <Text style={[styles.footerCell,{textAlign: 'right'}]}>{formatIndianNumber(totalMTD)}</Text>
     <Text style={[styles.footerlastCell,{textAlign: 'right'}]}>{formatIndianNumber(parseFloat(totalT1).toFixed(2))}</Text>
   </View>
 );

const renderItem = ({ item }) => (
    <View style={styles.row}>
        <Text style={[styles.cell, {flex: 2.1, textAlign: 'left'}]}>{item.TYPE}</Text>
        <Text style={styles.cell}>{formatIndianNumber(item.YTD_SALE_CR)}</Text>
        <Text style={styles.cell}>{formatIndianNumber(item.MTD_SALE_CR)}</Text>
        <Text style={styles.celllastchild}>{formatIndianNumber(item.T_1_SALE_CR)}</Text>
    </View>
);

  return (
    // <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={true}> 
    <View style={styles.container}>
   
        <Text style={styles.asondate}>Sales Analysis As On <Text style={{color: '#333'}}>{currentDate}</Text></Text>
       
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <Text style={[styles.headerCell, { flex: 1.95 }]}>STORE TYPE</Text>
              <Text style={styles.headerCell}>YTD (Cr.)</Text>
              <Text style={styles.headerCell}>MTD (Cr.)</Text>
              <Text style={styles.headerlastCell}>T-1 (Cr.)</Text>                          
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
                keyExtractor={(item) => item.TYPE ? item.TYPE.toString() : item.TYPE.toString()} // Fallback if PNO is not available
                showsVerticalScrollIndicator={true}
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
      
    // </ScrollView>    
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
    //color: '#084da1',
    color: '#1c84f3',
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
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  celllastchild: {
    flex: 1,
    textAlign: 'right',
    paddingHorizontal: 5,
    paddingVertical: 5,
  },  
  footer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 3,
    backgroundColor: '#6c80ad',
    borderColor: '#ffffff',
    borderBottomWidth:1,
  },
  footerCell: {
    flex: 1,
    fontSize: 14,
    letterSpacing: 0.3,
    color: '#fff',  
    borderRightWidth: 1,
    borderColor: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  footerlastCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    letterSpacing: 0.3,
    color: '#fff',      
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  headerContainer: {
    backgroundColor: '#9dacd9', // Header background color   
    zIndex: 1, // Ensure the header is above other components
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    //paddingVertical: 3,
    backgroundColor: '#6c80ad',
    borderColor: '#ffffff',
    borderBottomWidth:1,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    letterSpacing: 0.3,
    color: '#fff',  
    borderRightWidth: 1,
    borderColor: '#FFFFFF',
    paddingVertical: 3,
  },
  headerlastCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#fff',  
    letterSpacing: 0.3,    
  },
   
});

export default SalesAnalysis;
