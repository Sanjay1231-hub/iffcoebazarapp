import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertWithIcon from '../Component/AlertWithIcon';

const LeaveApproval = () => {
  const [leaveList, setLeaveList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toggleAll, setToggleAll] = useState(false); // false = nothing selected
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 4;
  const totalPages = Math.ceil(leaveList.length / itemsPerPage);


  useEffect(() => {
    fetchLeaveData();
  }, []);

   useEffect(() => {
      // Dummy data
      const dummyData = [
          {
            WFL_DOCCUMENT_SNO: 1,
            APPLICANT_PNO: "100245",
            EMP_NAME: "Ravi Kumar",
            DESCRIPTION: "Medical Leave",
            INSERTION_DATE: "2025-08-01",
            LEAVE_FROM_TIME: "2025-08-05",
            LEAVE_TO_TIME: "2025-08-07",
            STATENAME: "Uttar Pradesh",
            PLACE: "Lucknow Store",
          },
          {
            WFL_DOCCUMENT_SNO: 2,
            APPLICANT_PNO: "100312",
            EMP_NAME: "Sneha Sharma",
            DESCRIPTION: "Vacation",
            INSERTION_DATE: "2025-08-03",
            LEAVE_FROM_TIME: "2025-08-10",
            LEAVE_TO_TIME: "2025-08-20",
            STATENAME: "Maharashtra",
            PLACE: "Mumbai Store",
          },
          {
            WFL_DOCCUMENT_SNO: 3,
            APPLICANT_PNO: "100876",
            EMP_NAME: "Amit Verma",
            DESCRIPTION: "Family Function",
            INSERTION_DATE: "2025-08-05",
            LEAVE_FROM_TIME: "2025-08-15",
            LEAVE_TO_TIME: "2025-08-17",
            STATENAME: "Delhi",
            PLACE: "Delhi Head Office",
          },
          {
            WFL_DOCCUMENT_SNO: 4,
            APPLICANT_PNO: "100554",
            EMP_NAME: "Priya Singh",
            DESCRIPTION: "Personal Work",
            INSERTION_DATE: "2025-08-07",
            LEAVE_FROM_TIME: "2025-08-12",
            LEAVE_TO_TIME: "2025-08-14",
            STATENAME: "Rajasthan",
            PLACE: "Jaipur Store",
          },
          {
            WFL_DOCCUMENT_SNO: 5,
            APPLICANT_PNO: "100998",
            EMP_NAME: "Sanjay Yadav",
            DESCRIPTION: "Training Program",
            INSERTION_DATE: "2025-08-08",
            LEAVE_FROM_TIME: "2025-08-18",
            LEAVE_TO_TIME: "2025-08-22",
            STATENAME: "Karnataka",
            PLACE: "Bengaluru Store",
          },
        ];
  
      setLeaveList(dummyData);
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
          token: "IEBL0001",
          apiId: "39",
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

      //setLeaveList(result.output || []); // Assuming array is in data.output
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
        <View style={{ flexDirection: 'row', justifyContent: 'right', marginTop: 0 }}>
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
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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

      //Alert.alert('Success', 'Selected Leave(s) approved.');
      setAlert({
        visible: true,
        title: "Success",
        message: "Selected Leave(s) approved.",
        type: "success",
      });
      fetchLeaveData();
      setSelectedIds([]);
      setToggleAll(false);
    } catch (error) {
      //Alert.alert('Error', 'Failed to approve Leave(s)');
      setAlert({
        visible: true,
        title: "Error",
        message: error.message || "Failed to approve Leave(s)",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

const renderItem = ({ item }) => {
    const isSelected = selectedIds.includes(item.WFL_DOCCUMENT_SNO);
  
    return (
      <View style={[styles.itemContainer, isSelected && styles.selectedItem]}>
        {/* Checkbox at top-right corner */}
        <Checkbox
          value={isSelected}
          onValueChange={() => toggleSelection(item.WFL_DOCCUMENT_SNO)}
          //style={styles.checkboxTopRight}
          style={[
            styles.checkboxTopRight
          ]}
          color={isSelected ? '#007bff' : undefined} // checkbox tick color
        />  
        {/* Touchable content */}
        <TouchableOpacity onPress={() => toggleSelection(item.WFL_DOCCUMENT_SNO)}>
          <View style={{ marginBottom: 1 }}>
            <View style={styles.row}>
              <Text style={styles.label}>Personal No:</Text>
              <Text style={styles.value}>{item.APPLICANT_PNO}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{item.EMP_NAME}</Text>
            </View>  
            <View style={styles.row}>
              <Text style={styles.label}>Leave Purpose:</Text>
              <Text style={styles.value}>{item.DESCRIPTION}</Text>
            </View>  
            <View style={styles.row}>
              <Text style={styles.label}>Application Date:</Text>
              <Text style={styles.value}>{item.INSERTION_DATE}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Leave from Date:</Text>
              <Text style={styles.value}>{item.LEAVE_FROM_TIME}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Leave to Date:</Text>
              <Text style={styles.value}>{item.LEAVE_TO_TIME}</Text>
            </View>       
            <View style={styles.row}>
              <Text style={styles.label}>State:</Text>
              <Text style={styles.value}>{item.STATENAME}</Text>
            </View>       
            <View style={styles.row}>
              <Text style={styles.label}>Store:</Text>
              <Text style={styles.value}>{item.PLACE}</Text>
            </View>       
           
                        
          </View>

          <View style={styles.sectionfooter}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => approveSelected([item.WFL_DOCCUMENT_SNO])}
            >
              <Text style={styles.odText}>Reject This</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => approveSelected([item.WFL_DOCCUMENT_SNO])}
            >
              <Text style={styles.odText}>Approve This</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  

  return (
    <View style={styles.container}>
      

      <View style={styles.paginationRow}>
        <Text style={styles.header}>Leave Approval List</Text>
        <Pagination />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ transform: [{ scale: 0.6 }] }}>
                <ActivityIndicator size={50} color="#4a80f5" />
            </View>
        </View>
      ) : (
        <FlatList
          data={paginatedData}
          keyExtractor={(item) => item.WFL_DOCCUMENT_SNO.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No pending leave requests</Text>
          }
          style={styles.sectionRow}
        />
      )}

      <View style={styles.footer}>

        <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllBtn} >
          <Text style={{ color: '#fff', letterSpacing: 0.3}}>
            {toggleAll ? 'Select None' : 'Select All'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rejectAllBtn} onPress={approveSelected} >
          <Text style={{ color: '#fff', letterSpacing: 0.3 }}>Reject Selected</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.approveAllBtn} onPress={approveSelected} >
          <Text style={{ color: '#fff', letterSpacing: 0.3 }}>Approve Selected</Text>
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

export default LeaveApproval;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#ffffff',
  },
  header: {
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
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',    
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    //margin: 2,
    borderRadius: 3,
    padding: 10,
    position: 'relative', // Needed for absolute checkbox
    borderWidth: 1,
    borderColor: '#ccc',
  },
  checkboxTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    //alignSelf: 'flex-end',
    //margin: 5,
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  infoContainer: {
    flex: 1,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  label: {
    width: 150,
    fontWeight: '600',
    //color: '#444',
  },
  value: {
    flex: 1,
    color: '#000',
  },
  selectedItem: {
    //backgroundColor: '#d0e6ff',
    //backgroundColor: '#fafcca',
  },
  approveButton: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
  },
  odText: {
    //color: '#0000ff',
    color: '#0c08eeff',
    textDecorationLine: 'underline',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  sectionfooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  footer: {
    backgroundColor: '#e0e0dc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    borderRadius: 3
  },
  
  selectAllBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    // Shadow for iOS
    shadowColor: '#000', // Color of the shadow
    //shadowColor: '#0368ff', // Color of the shadow
    shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
    shadowOpacity: 0.1, // Transparency of the shadow
    shadowRadius: 5, // Blur effect of the shadow
    
    // Shadow for Android
    elevation: 5, // Elevation for Android shadow
  },
  
  approveAllBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    // Shadow for iOS
    shadowColor: '#000', // Color of the shadow
    //shadowColor: '#0368ff', // Color of the shadow
    shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
    shadowOpacity: 0.1, // Transparency of the shadow
    shadowRadius: 5, // Blur effect of the shadow
    
    // Shadow for Android
    elevation: 5, // Elevation for Android shadow
    letterSpacing: 1,
  },
  rejectAllBtn: {
    backgroundColor: '#3480d1ff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
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
