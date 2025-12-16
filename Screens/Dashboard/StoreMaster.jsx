import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AlertWithIcon from '../../Component/AlertWithIcon';

function StoreMaster() {
  const [originalData, setOriginalData] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });

  const RenderItemComponent = React.memo(({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 0.5, textAlign: 'left', borderLeftWidth: 1, bordercolor: '#ccc' }]}>{item.STATE_CD}</Text>
      <Text style={[styles.cell, { flex: 1.25, textAlign: 'left' }]}>{item.DISTT_NAME}</Text>
      <Text style={[styles.cell, { flex: 2.25, textAlign: 'left' }]}>{item.STORES}</Text>
    </View>
  )); 

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filteredData = originalData.filter(item =>
        item?.STATE_CD?.toLowerCase().includes(query.toLowerCase()) ||
        item?.DISTT_NAME?.toLowerCase().includes(query.toLowerCase()) ||
        item?.STORES?.toLowerCase().includes(query.toLowerCase())
      );
      setData(filteredData); // Update displayed data
    } else {
      setData(originalData); // Restore to original data
    }
  }, [originalData]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
  
      const postData = { 
        inApiParameters: [],
        apiId: "1",
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

      //console.warn('Non-200 response:', response.ok);
  
      const text = await response.text();
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      let result;
  
      try {
        result = JSON.parse(text);
      } catch (jsonError) {
        //console.error('Failed to parse JSON. Server returned:', text);
        throw new Error('Invalid JSON response received.');
      }
  
      if (!result || typeof result !== 'object') {
        throw new Error('Unexpected data format received.');
      }
  
      setOriginalData(result.output);
      setData(result.output);
  
    } catch (error) {
      setAlert({ visible: true, title: "Fetch Error", message: error.message || "Failed to fetch data. Please try again.", type: "error" });

    } finally {
      setLoading(false);
    }
  }, []);
  

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  

  //const renderItem = ({ item }) => <RenderItemComponent item={item} />;
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
      <View style={styles.dashboardcontainer}>
        <View style={styles.prdRow}>
          <TextInput
            style={[styles.searchInput, { }]}
            placeholder="Type here to search..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#a3a3a3"
            allowFontScaling={false}
          />
          {/* <Ionicons name="filter-outline" size={22} color="#a3a3a3" style={styles.Searchbtn} /> */}
          {/* <Ionicons name="filter-outline" size={24} color="black" style={styles.Searchbtn} /> */}
           <Image style={styles.calliing} source={require('../../assets/filter.png')} />
        </View>

        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={[styles.headerCell, { flex: 0.53, textAlign: 'center' }]}>State</Text>
            <Text style={[styles.headerCell, { flex: 1.16, textAlign: 'center' }]}>District</Text>
            <Text style={[styles.headerlastCell, { flex: 2, textAlign: 'center' }]}>Store</Text>
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
            //keyExtractor={(item, index) => index.toString()}
            keyExtractor={(item) => item.SNO.toString()}
            showsVerticalScrollIndicator={true}
            style={styles.flatList}
            // initialNumToRender={10}
            // maxToRenderPerBatch={5}
            // windowSize={5}
          />
        )}
         {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Total Records: {data.length}</Text>
        </View>
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
        //alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#ffffff',
        padding: 3,
      },
     
      dashboardcontainer: {
        flex: 1,
        paddingHorizontal: 5,
        width: '100%',
        height: 300,
      },
      inputContainer: {
        marginBottom: 2, // Add some space below the input
      },
      prdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,   
        backgroundColor: '#ffffff',
        borderRadius: 3,
        paddingHorizontal: 10,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#ccc',
      },
      searchInput: {
          flex: 1,
          fontSize: 16,
          lineHeight: 22,          // ✅ CRITICAL
          color: '#000',
          paddingVertical: 8,      // ✅ give breathing space
          //paddingHorizontal: 6,
          minHeight: 40,           // ✅ NOT height
          textAlignVertical: 'center',
          fontFamily: 'sans-serif',
      },
      Searchbtn: {
        marginLeft: 15,        
        padding: 5,
    },
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#ccc',
      },
      cell: {
        flex: 1,
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderRightWidth: 1,
        borderColor: '#ccc',
      },
      headerContainer: {
        //backgroundColor: '#9dacd9',
        zIndex: 1,
      },
      header: {
         flexGrow: 0, // This makes the FlatList take the available space
        width: '100%',
        flexDirection: 'row',
        backgroundColor: '#6c80ad',
        //backgroundColor: '#1668b4ff',
      },
      headerCell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
        letterSpacing: 0.3,
        color: '#fff',
        paddingVertical: 3,
        borderRightWidth: 1,
        borderColor: '#FFFFFF',
      },
      headerlastCell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
        letterSpacing: 0.3,
        color: '#fff',
        paddingVertical: 3,
      },
      flatList: {
        flex: 1,
        maxHeight: 600,
      },
      footer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#f2f2f2",
    },
    footerText: {
        fontSize: 14,
        color: "#555",
        fontWeight: "500",
    },
    calliing: {
      backgroundColor: '#ffffff',      
      width: 23,
      height: 23,   
      textAlign: 'center',
    },
   
});

export default StoreMaster;
