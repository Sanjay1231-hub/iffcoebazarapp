import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl  } from 'react-native';
import { formatDate, formatIndianNumber } from '../../Component/utils';
import AlertWithIcon from '../../Component/AlertWithIcon';

function OverDue() {

  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [b2Bupto30, setB2BUpto30] = useState('');
  const [b2Bthirtyto60, setB2B30To60] = useState('');
  const [b2Bmore60, setB2BMore60] = useState('');
  const [b2BtotalOverDue, setB2BTotalOverdue] = useState('');
  const [upto30, setUpto30] = useState('');
  const [thirtyto60, set30To60] = useState('');
  const [more60, setMore60] = useState('');
  const [totalOverDue, setTotalOverdue] = useState('');
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
  const [refreshing, setRefreshing] = useState(false);

 

  useEffect(() => {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    setCurrentDate(formatDate(now));
  }, []);



  useEffect(() => { 
    fetchDataB2B();
  }, []);  

  const fetchDataB2B = async () => {
    try {
      const postData = { 
        inApiParameters: [],
        apiId: "10",
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

      // If server returns HTML instead of JSON
      if (text.trim().startsWith('<')) {
        throw new Error('Received HTML instead of JSON. The API might be down or the request is invalid.');
      }

      // Attempt to parse JSON
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseErr) {
        //console.error('JSON parse error:', parseErr);
        throw new Error('Invalid JSON response.');
      }

      // Check expected structure
      if (result?.output && Array.isArray(result.output) && result.output.length > 0) {
        const details = result.output[0];

        setB2BUpto30(String(details.UP_TO_30_DAY ?? '0'));
        setB2B30To60(String(details.DAY_30_60 ?? '0'));
        setB2BMore60(String(details.MORE_60_DAY ?? '0'));
        setB2BTotalOverdue(String(details.TOTAL_OVERDUE ?? '0'));
      } else {
        setAlert({
          visible: true,
          title: "Info",
          message: "No data found.",
          type: "warning",
        });
      }
    } catch (error) {
      //console.error('Fetch error:', error);
      setAlert({
        visible: true,
        title: "Fetch Error",
        message: error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const fetchDataFranchiseBA = async () => {
      try {
        const postData = {
          inApiParameters: [],
          apiId: "11",
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
  
        // Check for unexpected HTML response
        if (text.trim().startsWith('<')) {
          throw new Error('Received HTML instead of JSON. The API might be down or the request is invalid.');
        }
  
        let result;
        try {
          result = JSON.parse(text);
        } catch (parseError) {
          //console.error('JSON parse error:', parseError);
          throw new Error('Invalid JSON response.');
        }
  
        if (result?.output && Array.isArray(result.output) && result.output.length > 0) {
          const details = result.output[0];
  
          setUpto30(String(details.UP_TO_30_DAY ?? '0'));
          set30To60(String(details.DAY_30_60 ?? '0'));
          setMore60(String(details.MORE_60_DAY ?? '0'));
          setTotalOverdue(String(details.TOTAL_OVERDUE ?? '0'));
        } else {
          setAlert({
            visible: true,
            title: "Info",
            message: "Record not found.",
            type: "warning",
          });
        }
      } catch (error) {
        //console.error('Fetch error:', error);
        setAlert({
          visible: true,
          title: "Fetch Error",
          message: error.message,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchDataFranchiseBA();
  }, []);


  useEffect(() => {   
    fetchDataPayable();
  }, []);

  const fetchDataPayable = async () => {
    try {
      const postData = {
        inApiParameters: [],
        apiId: "12",
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
      } catch (parseError) {
        //console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response.');
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
        message: error.message || "Failed to fetch data. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

 const onRefresh = () => {
      setRefreshing(true);
      // Simulate fetch new data
      fetchDataPayable();
      setTimeout(() => {
        setRefreshing(false);
      }, 2000);
    };

const totalOverdue = data.reduce((sum, item) => {
  // Convert the OVERDUE_AMT to a number, handle NaN values
  const overdueAmount = parseFloat(item.OVERDUE_AMT);
  return sum + (isNaN(overdueAmount) ? 0 : overdueAmount);
}, 0);

const renderItem = ({ item }) => (
    <View style={styles.row}>
        <Text style={[styles.cell,{ flex: 1, textAlign: 'left', paddingHorizontal: 5, borderLeftWidth: 1, borderColor: '#ccc', }]}>{item.STATE_NAME}</Text>
        <Text style={[styles.celllastchild,{ flex: 1, paddingHorizontal: 5 }]}>{formatIndianNumber(item.OVERDUE_AMT)}</Text>        
    </View>
);

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
    <View  style={styles.container}>   
        <Text style={styles.asondate}>Overdue(In Lakhs) As On <Text style={{color: '#333'}}>{currentDate}</Text></Text>     
          <View style={styles.dashheading}>
              <Text style={styles.dashttext}>B2B</Text>
          </View>
          <View style={styles.header}>
              <Text style={styles.headerCell}>Up To 30 Days</Text>
              <Text style={styles.headerCell}>30 To 60 Days</Text>
              <Text style={styles.headerCell}>More then 60 Days</Text>
              <Text style={styles.headerlastCell}>Total Overdue</Text>
          </View>
          <View style={[styles.row, {marginBottom: 30}]}>
            <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>{formatIndianNumber(b2Bupto30)}</Text>
            <Text style={[styles.cell, { flex: 1.02, textAlign: 'right' }]}>{formatIndianNumber(b2Bthirtyto60)}</Text>
            <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>{formatIndianNumber(b2Bmore60)}</Text>
            <Text style={[styles.celllastchild, { flex: 1.06, textAlign: 'right' }]}>{formatIndianNumber(b2BtotalOverDue)}</Text>
          </View> 

          <View style={styles.dashheading}>
              <Text style={styles.dashttext}>Franchisee/BA</Text>
          </View>
          <View style={styles.header}>
              <Text style={styles.headerCell}>Up To 30 Days</Text>
              <Text style={styles.headerCell}>30 To 60 Days</Text>
              <Text style={styles.headerCell}>More then 60 Days</Text>
              <Text style={styles.headerlastCell}>Total Overdue</Text>
          </View>
          <View style={[styles.row, {marginBottom: 30}]}>
            <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>{formatIndianNumber(upto30)}</Text>
            <Text style={[styles.cell, { flex: 1.02, textAlign: 'right' }]}>{formatIndianNumber(thirtyto60)}</Text>
            <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>{formatIndianNumber(more60)}</Text>
            <Text style={[styles.celllastchild, { flex: 1.06, textAlign: 'right' }]}>{formatIndianNumber(totalOverDue)}</Text>
          </View> 

          <View style={styles.dashheading}>
              <Text style={styles.dashttext}>Amount payable to IFFCO</Text>
          </View>          
            
          <View style={styles.header}>
            <Text style={[styles.headerCell, { flex: 1 }]}>State</Text>
            <Text style={[styles.headerlastCell, { flex:1 }]}>Overdue Amount</Text>
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
              keyExtractor={(item) => item.STATE_NAME ? item.STATE_NAME.toString() : item.STATE_NAME.toString()} // Fallback if PNO is not available
              showsVerticalScrollIndicator={true}                   
              style={styles.flatList}      
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#4a80f5", "#ff6600", "#00ff15ff"]} // 👈 Android spinner colors
                  //tintColor="#4a80f5"             // 👈 iOS spinner color
                />
              }       
              //ListFooterComponent={renderFooter} // Add footer
            />
          )}
          <View style={styles.footer}>
            <Text style={[styles.headerCell, { flex: 1.01 }]}>{'Total'}</Text>
            <Text style={[styles.headerlastCell, { flex: 1, textAlign: 'right', paddingHorizontal: 5}]}>{formatIndianNumber(totalOverdue)}</Text>
          </View>
      
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
    padding: 2, 
  },
  dashheading: {
    fontSize: 16,    
    letterSpacing: 0.3,
    paddingVertical: 3,
    paddingHorizontal: 5,
    backgroundColor: '#779ff7',
    color: '#fff',    
  },
  dashttext: {
      color: '#fff',
      fontSize: 16,
      letterSpacing: 0.3,
      fontWeight: '400',      
  }, 
  asondate: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    //color: '#084da1',
    color: '#1c84f3',
    fontWeight: '500',
    fontSize: 15,
    letterSpacing: 0.3,
    fontFamily: 'sans-serif',
  },
  row: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cell: {
    flex: 1,
    textAlign: 'right',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderColor: '#ccc',    
    borderLeftWidth: 1,
  },
  celllastchild: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 5,
    paddingVertical: 5,
    borderColor: '#ccc',    
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },  

  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#6c80ad',
    borderColor: '#ffffff',
    borderBottomWidth:1,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    letterSpacing: 0.3,
    paddingHorizontal: 2,
    paddingVertical: 4,
    color: '#fff',  
    borderRightWidth: 1,
    borderColor: '#FFFFFF',
  },
  headerlastCell: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontSize: 13,
    letterSpacing: 0.3,
    color: '#fff',      
  },
  footer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    //paddingVertical: 3,
    backgroundColor: '#6c80ad',
  
  },
  flatList: {
    flex: 1, // This makes the FlatList take the available space
    maxHeight: 210, // Set a maximum height if needed
  },
});

export default OverDue;
