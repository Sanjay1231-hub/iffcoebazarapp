import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertWithIcon from '../Component/AlertWithIcon';
import { useNavigation } from '@react-navigation/native';

const API_TOKEN = 'IEBL0001'; // Move to environment variable in production

const ODApproval = () => {
  const [leaveList, setLeaveList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toggleAll, setToggleAll] = useState(false); // false = nothing selected
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(leaveList.length / itemsPerPage);
  const navigation = useNavigation();
  const [odList, setOdList] = useState([]);

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      
        const loggedUser = await AsyncStorage.getItem('username');    
        if (!loggedUser) {
          Alert.alert('Error', 'User information not found. Please login again.');
          return;
        }
    
        const postData = {
          token: API_TOKEN,
          apiId: "38",
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

        //const data = await response.json();

        let result;
        try {
          result = JSON.parse(text);
        } catch (jsonError) {
          throw new Error('Invalid JSON response received from server.');
        }
    
        if (!result || typeof result !== 'object' || !Array.isArray(result.output)) {
          throw new Error('Unexpected or invalid data format received.');
        }

      setLeaveList(result.output || []); // Assuming array is in data.output
    } catch (error) {
      //Alert.alert('Error', 'Failed to fetch leave data');
      setAlert({
        visible: true,
        title: "Error",
        message: error.message || "Failed to fetch leave data.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const paginatedData = leaveList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const Pagination = () => {  
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'right', marginTop: 2 }}>
      {[...Array(totalPages).keys()].map((_, index) => {
        const page = index + 1;
        return (
          <TouchableOpacity
            key={page}
            onPress={() => setCurrentPage(page)}
            style={{
              backgroundColor: page === currentPage ? '#575757ff' : '#ccc',
              paddingHorizontal: 8,
              marginHorizontal: 1,
              borderRadius: 3,
              height: 22,
            }}
          >
            <Text style={{ color: '#fff' }}>{page}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
    
    );
  };

  const toggleSelection = (id) => {
    // setSelectedIds((prev) =>
    //   prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    // );

    setSelectedIds((prev) => {
      let updated;

      if (prev.includes(id)) {
        updated = prev.filter((item) => item !== id);
      } else {
        updated = [...prev, id];
      }

      // ✅ Update header checkbox based on selection count
      if (updated.length === paginatedData.length) {
        setToggleAll(true);
      } else {
        setToggleAll(false);
      }

      return updated;
    });
  };

  // const toggleSelection = (id, status) => {
  //   setSelectedIds((prev) =>
  //     prev.some((item) => item.id === id) ? prev.filter((item) => item.id !== id) : [...prev, { id, status }]
  //   );
  // };

  const toggleSelectAll = () => {
    if (toggleAll) {
      // Deselect all
      setSelectedIds([]);
    } else {
      // Select all
      const allIds = leaveList.map(item => item.WFL_DOCCUMENT_SNO);
      setSelectedIds(allIds);
    }
    setToggleAll(!toggleAll);
  };



  const approveSelected = async (ids = []) => {
    if (!ids || ids.length === 0) {
      Alert.alert("Please select at least one item.");
      return;
    }
    const idsToApprove = ids.length > 0 ? ids : selectedIds;
    
    if (idsToApprove.length === 0) {
        setAlert({
          visible: true,
          title: 'No Selection',
          message: 'Please select at least one record to approve or reject.',
          type: 'warning',
        });
        return;
      }

    try {
      setLoading(true);
      for (const id of selectedIds) {
        // Replace this with your API
        await fetch('https://your-api-url.com/approve-leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leave_id: id })
        });
      }

      //Alert.alert('Success', 'Selected OD(s) approved.');
      setAlert({
        visible: true,
        title: "Success",
        message: "Selected OD(s) are approved.",
        type: "success",
      });
      fetchLeaveData();
      setSelectedIds([]);
      setToggleAll(false);
    } catch (error) {
      //Alert.alert('Error', 'Failed to approve OD(s)');
      setAlert({
        visible: true,
        title: "Error",
        message: error.message || "Failed to approve OD(s)",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

const renderItem = ({ item }) => {
    const isSelected = selectedIds.includes(item.WFL_DOCCUMENT_SNO);
  
    return (        
        <TouchableOpacity >
        <View style={[styles.tableRow, isSelected && styles.selectedRow]}>
          <Checkbox
            value={isSelected}
            onValueChange={() => toggleSelection(item.WFL_DOCCUMENT_SNO)}
            style={styles.checkbox}
          />
          <Text style={[styles.cell, { flex: 0, textAlign: 'center' }]}></Text>
          <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>{item.APPLICANT_PNO}</Text>
          <Text style={[styles.cell, { flex: 2, textAlign: 'left' }]}>{item.EMP_NAME}</Text>
          <Text style={[styles.cell, { flex: 1.4, textAlign: 'left' }]}>{item.STORENAME || 'N/A'}</Text>
          <Text style={[styles.cell, { flex: 1.4, textAlign: 'left' }]}>{item.APPLICATION_DATE || 'N/A'}</Text>
          <Text style={[styles.cell, { flex: 1.1, textAlign: 'right' }]}>{item.OD_DATE}</Text>
          <Text style={[styles.cell, { flex: 1.1, textAlign: 'left' }]}>{item.OD_TYPE}</Text>
          <Text style={[styles.cell, { flex: 1.1, textAlign: 'right' }]}>{item.OD_FROM_TIME}</Text>
          <Text style={[styles.cell, { flex: 1.1, textAlign: 'right' }]}>{item.OD_TO_TIME}</Text>
          <Text style={{ display: "none" }}>{item.DOCUMENT_STATUS}</Text>

        </View>
      </TouchableOpacity>
      
    );
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.paginationRow}>
        <Text style={styles.heading}>OD Approval List</Text>
        <Pagination />
      </View>
      


      <ScrollView horizontal>
        <View style={styles.tableContainer}>
          <View style={styles.header}>
            <Checkbox
              value={toggleAll}
              onValueChange={toggleSelectAll}
              style={styles.checkbox}
            />
            <Text style={[styles.headerText, { flex: 0, textAlign: 'center' }]}></Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Personal No</Text>
            <Text style={[styles.headerText, { flex: 2, textAlign: 'center' }]}>Employee Name</Text>
            <Text style={[styles.headerText, { flex: 1.4, textAlign: 'center' }]}>Store Name</Text>
            <Text style={[styles.headerText, { flex: 1.4, textAlign: 'center' }]}>Apply Date</Text>
            <Text style={[styles.headerText, { flex: 1.1, textAlign: 'center' }]}>OD Date</Text>
            <Text style={[styles.headerText, { flex: 1.1, textAlign: 'center' }]}>OD Type</Text>
            <Text style={[styles.headerText, { flex: 1.1, textAlign: 'center' }]}>In Time</Text>
            <Text style={[styles.headerText, { flex: 1.1, textAlign: 'center' }]}>Out Time</Text>
               <Text style={{ display: "none" }}></Text>
          </View>
          <FlatList
            data={paginatedData}
            //keyExtractor={(item) => item.WFL_DOCCUMENT_SNO.toString()}
            renderItem={renderItem}
            
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No data found</Text>}
            style={{ borderColor: '#ccc', borderWidth: 0 }}
            stickyHeaderIndices={[20]} // Make the first item (header) sticky
            ListFooterComponent={
                                <Text style={styles.listfooter}></Text>
                              }
          />
        </View>
      </ScrollView>


      <View style={styles.footer}>
        <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllBtn} >
          <Text style={{ color: '#fff', letterSpacing: 0.3, textAlign: 'center',}}>
            {toggleAll ? 'Select None' : 'Select All'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rejectAllBtn} onPress={approveSelected} >
          <Text style={{ color: '#fff', letterSpacing: 0.3, textAlign: 'center',}}>Reject Selected</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.approveAllBtn} onPress={approveSelected} >
          <Text style={{ color: '#fff', letterSpacing: 0.3, textAlign: 'center', }}>Approve Selected</Text>
        </TouchableOpacity>
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

export default ODApproval;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#ffffff',
  },
  tableContainer: {
    flex: 1,
    
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#6c80ad',
    //paddingHorizontal: 4,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    width: 800,
  },

  listfooter: {
    backgroundColor: '#6c80ad',
    width: 800,
    height: 5,
    
  },

  headerText: {
    flex: 1,
    fontSize: 14,
    color: '#ffffffff',
    fontWeight: '500',
    borderRightWidth: 1,
    borderRightColor: '#ffffff',    
    paddingHorizontal: 5,
    paddingVertical: 5,
    letterSpacing: 0.3,
  },

  selectedRow: {
    backgroundColor: '#e0f7ff'
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',    
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',    
    //paddingHorizontal: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#dfdfdfff', 
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    width: 800,
    
  },
  cell: {
    flex: 1,  
    fontSize: 13,
    color: '#333',
    borderRightWidth: 1,
    borderRightColor: '#dfdfdfff',   
    paddingHorizontal: 6,
    paddingVertical: 6,
    minHeight: 35,
    letterSpacing: 0.3,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'left',
    letterSpacing: 0.3,
  },
 
  sectionRow: {
    backgroundColor: '#e0e0dc',
    //padding: 2,
    borderRadius: 3
  },
  
  

  checkbox: {
    marginRight: 4,
    marginLeft: 4,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  
  footer: {
    backgroundColor: '#e9e9e9ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    borderRadius: 3
  },
  
  selectAllBtn: {
    width: '30%',
    backgroundColor: '#254285ff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 3,

    // Center children (like Text)
    justifyContent: 'center',
    alignItems: 'center',

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,

    // Shadow for Android
    elevation: 5,
  },
  
  approveAllBtn: {
    width: '35%',
    backgroundColor: '#202020ff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 3,
    // Shadow for iOS
    shadowColor: '#000', // Color of the shadow
    //shadowColor: '#0368ff', // Color of the shadow
    shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
    shadowOpacity: 0.1, // Transparency of the shadow
    shadowRadius: 5, // Blur effect of the shadow
    
    // Shadow for Android
    elevation: 5, // Elevation for Android shadow
  },
  rejectAllBtn: {
    width: '33%',
    backgroundColor: '#5b6d96ff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 3,
    // Shadow for iOS
    shadowColor: '#000', // Color of the shadow
    //shadowColor: '#0368ff', // Color of the shadow
    shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
    shadowOpacity: 0.1, // Transparency of the shadow
    shadowRadius: 5, // Blur effect of the shadow
    
    // Shadow for Android
    elevation: 5, // Elevation for Android shadow
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic'
  }
});
