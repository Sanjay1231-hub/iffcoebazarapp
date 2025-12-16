import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl, ScrollView, Image, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons"; 
import AlertWithIcon from '../Component/AlertWithIcon';
import AntDesign from '@expo/vector-icons/AntDesign';


const InvoiceHistory = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
      setRefreshing(true);
      // Simulate fetch new data
      fetchInvoiceHistory();
      setTimeout(() => {
        //setData([...data, "New Item " + (data.length + 1)]);
        setRefreshing(false);
      }, 2000);
    };

    useEffect(() => {
      fetchInvoiceHistory();
    }, []);
      
    const fetchInvoiceHistory = async () => {
      try {
        setLoading(true); // Start loader when fetch begins
    
        const loggedOffice = await AsyncStorage.getItem('officeCode');
    
        if (!loggedOffice) {
          Alert.alert('Error', 'User information not found. Please login again.');
          return;
        }
    
        const postData = {
          token: "IEBL0001",
          apiId: "46",
          inApiParameters: [
            { label: 'P_FSC_CD', value: loggedOffice },
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

    const downloadPdf = async (row) => {
        try {
                // build the URL dynamically from row data
                const pdfUrl = `https://ebazar.iffco.coop/BazarSoftRDLC/BazarSoftReport/EBAZAR_INVOICEB2C_APP.aspx?P_FSC_CD=${row.FSC_CD}&P_BILLNO=${row.BILLNO}&P_STATE_CD=${row.STATE_CD}&P_DTBILL=${row.DT_BILL}`;

                //console.log("Downloading PDF from:", pdfUrl);

            // open in browser (or system PDF viewer)
                await Linking.openURL(pdfUrl);
            } catch (error) {
                //console.error("Failed to open PDF:", error);
        }
    };

    const RenderItemComponent = React.memo(({ item }) => (        
        <View style={styles.row}>
            <Text style={[styles.cell, { flex: 2.2, textAlign: 'left' }]}>
                {item.INVOICE_NO || 'No data'}
            </Text>         
            <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>
                {formatDateDDMMYY(item.DT_BILL) || 'No data'}
            </Text>         
            <Text style={[styles.cell, { flex: 0.5, textAlign: 'right' }]}>
                {item.QTY || 'No data'}
            </Text> 
            <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>
                {item.AMOUNT || 'No data'}
            </Text>  

            <View style={[styles.cell, { flex: 0.5, alignItems: 'center' }]}>          
                <TouchableOpacity onPress={() => downloadPdf(item)}>
                   {/* <AntDesign name="download" size={22} color="#3d6ff8ff" /> */}
                {/* <Ionicons name="download-outline" size={22} color="#f79336ff" /> */}
                 <Image style={styles.calliing} source={require('../assets/pdf.png')} />
                </TouchableOpacity>
            </View>                     
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
        {/* Header */}
        <View style={styles.header}>                           
            <Text style={[styles.headerText, { flex: 2, textAlign: 'center' }]}>Invoice No</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Date</Text>
            <Text style={[styles.headerText, { flex: 0.54, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Amount</Text>
            <Text style={[styles.headerText, { flex: 0.55, textAlign: 'center' }]}>Pdf</Text>
        </View>

        
        {loading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <View style={{ transform: [{ scale: 0.6 }] }}>
                <ActivityIndicator size={50} color="#4a80f5" />
            </View>
            </View>
        ) : (
            <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.SNO ? item.SNO.toString() : index.toString()} 
            ListEmptyComponent={<Text style={styles.emptyMessage}>No history found</Text>}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            showsVerticalScrollIndicator={false}
            style={styles.flatList}
            />
        )}

        {/* Footer */}
        <View style={styles.footer}>
        <Text style={styles.footerText}>Total Records: {data.length}</Text>
        <Text style={styles.footerText2}>** Last 7 days Invoices </Text>
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
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 1,
        backgroundColor: '#ffffff',
      },

  flatList: {
        flexGrow: 1, // This makes the FlatList take the available space
        //width: '100%',
        backgroundColor: '#ffffff',
    },
  
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
    flexGrow: 0, // This makes the FlatList take the available space
    //width: '100%',
    flexDirection: 'row',
    //backgroundColor: '#f5b14a',
    backgroundColor: '#6c80ad',
    },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#fff',
    paddingVertical: 3,
    borderRightWidth: 1,
    borderColor: '#FFFFFF',
    letterSpacing: 0.3, 
    //textTransform: 'uppercase',
    fontWeight: '500',
  },
  footer: {
        flexDirection: "row",
        justifyContent: 'space-between',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#f2f2f2",
    },
    footerText: {
        fontSize: 14,
        color: "#555",
        fontWeight: "400",
    },
    footerText2: {
        fontSize: 14,
        color: "#0da1bbff",
        fontWeight: "400",
    },
     calliing: {
      backgroundColor: '#ffffff',      
      width: 24,
      minHeight: 24,   
      textAlign: 'center',
    }, 
});

export default InvoiceHistory;
