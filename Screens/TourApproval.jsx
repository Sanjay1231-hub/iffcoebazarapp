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

const TourApproval = () => {
  const [TourList, setTourList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toggleAll, setToggleAll] = useState(false); // false = nothing selected
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;
    const totalPages = Math.ceil(TourList.length / itemsPerPage);

  // Load dummy data for testing
  useEffect(() => {
    const dummyData = [
      {
        WFL_DOCCUMENT_SNO: "103",
        APPLICANT_PNO: "12345",
        EMP_NAME: "Sanjay Kumar",
        APPLICATION_DATE: "2025-08-19",
        TOUR_START_DATE: "2025-08-21",
        TOUR_END_DATE: "2025-08-25",
        DESCRIPTION: "Business meeting with clients",
        ATTACHMENT_NAME: "ticket.pdf",
        TOUR_PURPOSE_CODE: "Official",
        PLACES_OF_VISIT: "Mumbai",
      },
      {
        WFL_DOCCUMENT_SNO: "104",
        APPLICANT_PNO: "67890",
        EMP_NAME: "Divya Sharma",
        APPLICATION_DATE: "2025-08-15",
        TOUR_START_DATE: "2025-08-18",
        TOUR_END_DATE: "2025-08-20",
        DESCRIPTION: "Training & Workshop",
        ATTACHMENT_NAME: "agenda.pdf",
        TOUR_PURPOSE_CODE: "Training",
        PLACES_OF_VISIT: "Bangalore",
      },
      {
        WFL_DOCCUMENT_SNO: "105",
        APPLICANT_PNO: "12345",
        EMP_NAME: "Sanjay Kumar",
        APPLICATION_DATE: "2025-08-19",
        TOUR_START_DATE: "2025-08-21",
        TOUR_END_DATE: "2025-08-25",
        DESCRIPTION: "Business meeting with clients",
        ATTACHMENT_NAME: "ticket.pdf",
        TOUR_PURPOSE_CODE: "Official",
        PLACES_OF_VISIT: "Mumbai",
      },
      {
        WFL_DOCCUMENT_SNO: "106",
        APPLICANT_PNO: "67890",
        EMP_NAME: "Divya Sharma",
        APPLICATION_DATE: "2025-08-15",
        TOUR_START_DATE: "2025-08-18",
        TOUR_END_DATE: "2025-08-20",
        DESCRIPTION: "Training & Workshop",
        ATTACHMENT_NAME: "agenda.pdf",
        TOUR_PURPOSE_CODE: "Training",
        PLACES_OF_VISIT: "Bangalore",
      },
      {
        WFL_DOCCUMENT_SNO: "107",
        APPLICANT_PNO: "12345",
        EMP_NAME: "Sanjay Kumar",
        APPLICATION_DATE: "2025-08-19",
        TOUR_START_DATE: "2025-08-21",
        TOUR_END_DATE: "2025-08-25",
        DESCRIPTION: "Business meeting with clients",
        ATTACHMENT_NAME: "ticket.pdf",
        TOUR_PURPOSE_CODE: "Official",
        PLACES_OF_VISIT: "Mumbai",
      },
      {
        WFL_DOCCUMENT_SNO: "108",
        APPLICANT_PNO: "67890",
        EMP_NAME: "Divya Sharma",
        APPLICATION_DATE: "2025-08-15",
        TOUR_START_DATE: "2025-08-18",
        TOUR_END_DATE: "2025-08-20",
        DESCRIPTION: "Training & Workshop",
        ATTACHMENT_NAME: "agenda.pdf",
        TOUR_PURPOSE_CODE: "Training",
        PLACES_OF_VISIT: "Bangalore",
      },
      {
        WFL_DOCCUMENT_SNO: "109",
        APPLICANT_PNO: "12345",
        EMP_NAME: "Sanjay Kumar",
        APPLICATION_DATE: "2025-08-19",
        TOUR_START_DATE: "2025-08-21",
        TOUR_END_DATE: "2025-08-25",
        DESCRIPTION: "Business meeting with clients",
        ATTACHMENT_NAME: "ticket.pdf",
        TOUR_PURPOSE_CODE: "Official",
        PLACES_OF_VISIT: "Mumbai",
      },
      {
        WFL_DOCCUMENT_SNO: "110",
        APPLICANT_PNO: "67890",
        EMP_NAME: "Divya Sharma",
        APPLICATION_DATE: "2025-08-15",
        TOUR_START_DATE: "2025-08-18",
        TOUR_END_DATE: "2025-08-20",
        DESCRIPTION: "Training & Workshop",
        ATTACHMENT_NAME: "agenda.pdf",
        TOUR_PURPOSE_CODE: "Training",
        PLACES_OF_VISIT: "Bangalore",
      },
      {
        WFL_DOCCUMENT_SNO: "111",
        APPLICANT_PNO: "12345",
        EMP_NAME: "Sanjay Kumar",
        APPLICATION_DATE: "2025-08-19",
        TOUR_START_DATE: "2025-08-21",
        TOUR_END_DATE: "2025-08-25",
        DESCRIPTION: "Business meeting with clients",
        ATTACHMENT_NAME: "ticket.pdf",
        TOUR_PURPOSE_CODE: "Official",
        PLACES_OF_VISIT: "Mumbai",
      },
      {
        WFL_DOCCUMENT_SNO: "112",
        APPLICANT_PNO: "67890",
        EMP_NAME: "Divya Sharma",
        APPLICATION_DATE: "2025-08-15",
        TOUR_START_DATE: "2025-08-18",
        TOUR_END_DATE: "2025-08-20",
        DESCRIPTION: "Training & Workshop",
        ATTACHMENT_NAME: "agenda.pdf",
        TOUR_PURPOSE_CODE: "Training",
        PLACES_OF_VISIT: "Bangalore",
      },
      {
        WFL_DOCCUMENT_SNO: "113",
        APPLICANT_PNO: "12345",
        EMP_NAME: "Sanjay Kumar",
        APPLICATION_DATE: "2025-08-19",
        TOUR_START_DATE: "2025-08-21",
        TOUR_END_DATE: "2025-08-25",
        DESCRIPTION: "Business meeting with clients",
        ATTACHMENT_NAME: "ticket.pdf",
        TOUR_PURPOSE_CODE: "Official",
        PLACES_OF_VISIT: "Mumbai",
      },
      {
        WFL_DOCCUMENT_SNO: "114",
        APPLICANT_PNO: "67890",
        EMP_NAME: "Divya Sharma",
        APPLICATION_DATE: "2025-08-15",
        TOUR_START_DATE: "2025-08-18",
        TOUR_END_DATE: "2025-08-20",
        DESCRIPTION: "Training & Workshop",
        ATTACHMENT_NAME: "agenda.pdf",
        TOUR_PURPOSE_CODE: "Training",
        PLACES_OF_VISIT: "Bangalore",
      },
    ];

    setTourList(dummyData);
  }, []);

  useEffect(() => {
    fetchTourData();
  }, []);

  const fetchTourData = async () => {
    setLoading(true);
    try {
      
        const loggedUser = await AsyncStorage.getItem('username');    
        if (!loggedUser) {
          Alert.alert('Error', 'User information not found. Please login again.');
          return;
        }
    
        const postData = {
          token: "IEBL0001",
          apiId: "40",
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

      //setTourList(result.output || []); // Assuming array is in data.output
    } catch (error) {
      //Alert.alert('Error', 'Failed to fetch Tour data');
      setAlert({
        visible: true,
        title: "Error",
        message: error.message || "Failed to fetch Tour data.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const paginatedData = TourList.slice(
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

  const toggleSelectAll = () => {
    if (toggleAll) {
      // Deselect all
      setSelectedIds([]);
    } else {
      // Select all
      const allIds = TourList.map(item => item.WFL_DOCCUMENT_SNO);
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
    //console.log("length of selected",idsToApprove);
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
        //console.log("Each selected",selectedIds);
        // Replace this with your API
        await fetch('https://your-api-url.com/approve-Tour', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Tour_id: id })
        });
      }

      //Alert.alert('Success', 'Selected Tour(s) approved.');
      setAlert({
        visible: true,
        title: "Success",
        message: "Selected Tour(s) approved.",
        type: "success",
      });
      fetchTourData();
      setSelectedIds([]);
      setToggleAll(false);
    } catch (error) {
      //Alert.alert('Error', 'Failed to approve Tour(s)');
      setAlert({
        visible: true,
        title: "Error",
        message: error.message || "Failed to approve Tour(s)",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };


  const renderItem = ({ item }) => {
      const isSelected = selectedIds.includes(item.WFL_DOCCUMENT_SNO);
    
      return (        
         
            <View style={[styles.tableRow, isSelected && styles.selectedRow]}>
              <Checkbox
                value={isSelected}
                onValueChange={() => toggleSelection(item.WFL_DOCCUMENT_SNO)}
                style={styles.checkbox}
              />
              <Text style={[styles.cell, { flex: 0, textAlign: 'right' }]}></Text>
              <Text style={[styles.cell, { flex: 2, textAlign: 'right' }]}>{item.APPLICANT_PNO}</Text>
              <Text style={[styles.cell, { flex: 3, textAlign: 'left' }]}>{item.EMP_NAME}</Text>
              <Text style={[styles.cell, { flex: 2, textAlign: 'right' }]}>{item.APPLICATION_DATE}</Text>
              <Text style={[styles.cell, { flex: 2, textAlign: 'right' }]}>{item.TOUR_START_DATE}</Text>
              <Text style={[styles.cell, { flex: 2, textAlign: 'right' }]}>{item.TOUR_END_DATE}</Text>
              <Text style={[styles.cell, { flex: 6, textAlign: 'left' }]}>{item.DESCRIPTION}</Text>
              <Text style={[styles.cell, { flex: 3, textAlign: 'left' }]}>{item.ATTACHMENT_NAME}</Text>
              <Text style={[styles.cell, { flex: 3, textAlign: 'left' }]}>{item.TOUR_PURPOSE_CODE}</Text>
              <Text style={[styles.cell, { flex: 2, textAlign: 'left' }]}>{item.PLACES_OF_VISIT}</Text>
            </View>
         
        
      );
    }; 

  return (
    <View style={styles.container}> 
      <View style={styles.paginationRow}>
        <Text style={styles.heading}>Tour Approval List</Text>
        <Pagination />
      </View>

      {/* {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ transform: [{ scale: 0.6 }] }}>
                <ActivityIndicator size={50} color="#4a80f5" />
            </View>
        </View>
      ) : (
        
       
      )} */}

      <ScrollView horizontal>
              <View style={styles.tableContainer}>
                <View style={styles.header}>
                  <Checkbox
                    value={toggleAll}
                    onValueChange={toggleSelectAll}
                    style={styles.checkbox}
                  />
                  <Text style={[styles.headerText, { flex: 0, textAlign: 'center' }]}></Text>
                  <Text style={[styles.headerText, { flex: 2, textAlign: 'center' }]}>Personal No</Text>
                  <Text style={[styles.headerText, { flex: 3, textAlign: 'center' }]}>Employee Name</Text>
                  <Text style={[styles.headerText, { flex: 2, textAlign: 'center' }]}>Apply Date</Text>
                  <Text style={[styles.headerText, { flex: 2, textAlign: 'center' }]}>Start Date</Text>
                  <Text style={[styles.headerText, { flex: 2, textAlign: 'center' }]}>End Date</Text>
                  <Text style={[styles.headerText, { flex: 6, textAlign: 'center' }]}>Description</Text>
                  <Text style={[styles.headerText, { flex: 3, textAlign: 'center' }]}>Attachment</Text>
                  <Text style={[styles.headerText, { flex: 3, textAlign: 'center' }]}>Tour Purpose</Text>
                  <Text style={[styles.headerText, { flex: 2, textAlign: 'center' }]}>Place</Text>
                </View>
                <FlatList
                  data={paginatedData}
                  keyExtractor={(item) => item.WFL_DOCCUMENT_SNO.toString()}
                  renderItem={renderItem}                  
                  ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No pending Tour requests</Text>}
                  stickyHeaderIndices={[20]} // Make the first item (header) sticky
                  ListFooterComponent={
                    <Text style={styles.listfooter}></Text>
                  }
                />
              </View>
            </ScrollView>

     

      <View style={styles.footer}>

        <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllBtn} >
          <Text style={{ color: '#fff', letterSpacing: 0.3, }}>
            {toggleAll ? 'Select None' : 'Select All'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rejectAllBtn} onPress={approveSelected} >
          <Text style={{ color: '#fff', letterSpacing: 0.3, }}>Reject Selected</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.approveAllBtn} onPress={approveSelected} >
          <Text style={{ color: '#fff', letterSpacing: 0.3, }}>Approve Selected</Text>
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

export default TourApproval;

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
    backgroundColor: '#9bdff0ff',
    //paddingHorizontal: 4,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    width: 1100,
  },

  listfooter: {
    backgroundColor: '#9bdff0ff',
    width: 1100,
    height: 5,
    
  },

  headerText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
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
    width: 1100,
    
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
    backgroundColor: '#007bff',
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
  
  approveAllBtn: {
    backgroundColor: '#28a745',
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
    backgroundColor: '#3480d1ff',
    paddingVertical: 6,
    paddingHorizontal: 20,
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
