import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, ActivityIndicator, ScrollView  } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

const EmployeeDetails = () => {
 
  //const apiKey = Constants.expoConfig?.extra?.apiKey;
  const apiUrl = Constants.expoConfig?.extra?.apiUrl;
  
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false); // Default to hidden

  useEffect(() => {
    if (!apiUrl) {
      setError('API URL is missing');
      setLoading(false);
      return;
    }

    const buildUrl = (baseUrl, endpoint) => `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
    const url = buildUrl(apiUrl, 'EmpDirectory/GetEmpDirAllData');

    //fetch('https://reactapi.iffco.coop/EmpDirectory/GetEmpDirAllData')
    fetch(url)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        setData(result);
        setFilteredData(result);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  const handleSearch = (query) => {    
    setSearchQuery(query);  
    if (query.trim()) {     
      const filtered = data.filter(item => 
        item.PNO.toLowerCase().includes(query.toLowerCase()) ||
        item.EMP_NAME.toLowerCase().includes(query.toLowerCase()) ||
        item.OFFICE_CD.toLowerCase().includes(query.toLowerCase()) ||
        item.EMP_DESIG.toLowerCase().includes(query.toLowerCase()) 
      );     
      setFilteredData(filtered);
    } else {
      // If query is empty, show all data
      setFilteredData(data);
    }
  };

  const myItemSeparator = () => {
    return <View style={{ height: 1, backgroundColor: "grey",marginHorizontal:10}} />;
    };
  
  const myListEmpty = () => {
    return (
      <View style={{ alignItems: "center" }}>
      <Text style={styles.item1}>No data found</Text>
      </View>
    );
  };
  

  const renderItem = ({ item }) => {
    // Safely extract and convert item properties to strings
    const empName = item?.EMP_NAME || 'N/A';
    const empId = item?.PNO || 'N/A';
    const officeCd = item?.OFFICE_CD || 'N/A';
    const empDesig = item?.EMP_DESIG || 'N/A';
    const email = item?.EMAIL && typeof item.EMAIL === 'object' ? item.EMAIL.value || 'N/A'  : item?.EMAIL || 'N/A';
    const empRole = item?.EMP_ROLE || 'N/A';
    const mobile1 = item?.MOBILE_NO_1 && typeof item.MOBILE_NO_1 === 'object' ? item.MOBILE_NO_1.value || 'N/A' : item?.MOBILE_NO_1 || 'N/A';
    const status = item?.STATUS || 'N/A';
    //const imageUrl = 'C:/Users/EZB/Documents/testing/React Native26082024/React Native/ReactProjectApp/assets/favicon.png';
  
    return (
      <View style={styles.item}>
        <View style={styles.row}>
          <View style={styles.cell}>
            <Text style={styles.bold}>Name:</Text>
            <Text><Text style={styles.bold}>Pno:</Text> {String(empId)}</Text>
            <Text><Text style={styles.bold}>Office Code:</Text> {String(officeCd)}</Text>
            <Text><Text style={styles.bold}>Designation:</Text> {String(empDesig)}</Text>
            <Text><Text style={styles.bold}>Email ID:</Text> {email}</Text>
            <Text><Text style={styles.bold}>Employee Role:</Text> {String(empRole)}</Text>
            <Text><Text style={styles.bold}>Mobile No:</Text> {mobile1}</Text>
            <Text><Text style={styles.bold}>Status:</Text> {String(status)}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.bold}>{String(empName)}</Text>
            <Image source={require('../assets/face01.png')} style={styles.image} />
          </View>
        </View>
      </View>


    );
  };
  
{/* <View style={styles.row}>
        <Text style={styles.cell}>{empId}</Text>
        <Text style={styles.cell}>{empName}</Text>
        <Text style={styles.cell}>{officeCd}</Text>
        <Text style={styles.cell}>{empDesig}</Text>
        <Text style={styles.cell}>{email}</Text>
         <Text style={styles.cell}>{empRole}</Text>
         <Text style={styles.cell}>{mobile1}</Text>
         <Text style={styles.cell}>{status}</Text>
      </View>  */}


      if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
      }
    
      if (error) {
        return <Text style={styles.error}>{error}</Text>;
      }

  return (
    // <LinearGradient 
    //   colors={['#e0eafc', '#cfdef3']} 
    //   start={[0, 32]}
    //   end={[0, 85]}
    //   style={styles.gradient}
    // >
      <View style={styles.container}>
      {/* <Text>Search...</Text> */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      
      {/* <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View> */}



      {/* Header Row */}
      {/* <View style={styles.header}>
        <Text style={styles.headerText}>Pno</Text>
        <Text style={styles.headerText}>Emp Name</Text>
        <Text style={styles.headerText}>Designation</Text>
      </View> */}


      {/* Data Rows */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.PNO.toLowerCase()}  // Ensure PNO is unique
        style={styles.list} // Apply styles to the FlatList
        ItemSeparatorComponent={myItemSeparator}
      ListEmptyComponent={myListEmpty}
      ListHeaderComponent={() =>         
        {isVisible && (
          <Text style={{ fontSize: 20, textAlign: "center",marginTop:10, marginBottom:5, fontWeight:600, color: '#888888' }}>
          ------ Employees Details ------
        </Text>
        )}      
    }
      ListFooterComponent={() => (
        <Text style={{ fontSize: 20, textAlign: "center",marginBottom:20,fontWeight:600, color: '#888888' }}>------</Text>
      )}
      />
     </View>
    //  </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,  // Full height and width
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff',
    marginBottom: 5,
  },
  ScrollViewcontainer: {
    flexGrow: 1, // Ensures the ScrollView takes up the remaining space
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchInput: {
    //flex: 1, // Take up remaining space
    height: 40,
    borderColor: '#5c6cf5',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 5,

  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10, // Space between icon and input
  },
  item: {
    padding: 15,
    //borderBottomWidth: 1,
    //borderBottomColor: '#ccc',
    borderColor: '#5c6cf5',
    borderWidth: 1,
    borderRadius: 5,
  },
  item1: {
    padding: 20,
    marginTop: 5,
    fontSize: 15,
  },
  image: {
    width: 130, // Adjust width as needed
    height: 130, // Adjust height as needed
    borderRadius: 50, // Optional: makes the image circular
    marginBottom: 5, // Space between image and text
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 600,
    color: '#006aa5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  list: {
    flex: 1, // Ensures FlatList takes up remaining space
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    //borderBottomWidth: 1,
    //borderBottomColor: '#ddd',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  searchIcon: {
    marginRight: 10, // Space between icon and input
  },
});

export default EmployeeDetails;



// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
// import axios from 'axios';

// const EmployeeDetails = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [employees, setEmployees] = useState([]);
//   const [filteredEmployees, setFilteredEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const response = await axios.get('https://reactapi.iffco.coop/EmpDirectory/GetEmpDirAllData');
//         console.log(response.data); // Log the data to check its structure
//         setEmployees(response.data);
//         setFilteredEmployees(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to fetch data');
//         setLoading(false);
//       }
//     };
  
//     fetchEmployees();
//   }, []);

//   useEffect(() => {
//     // Check if employees data is available and has items
//     if (employees.length > 0) {
//       const filtered = employees.filter(employee =>
//         employee.pno.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       setFilteredEmployees(filtered);
//     }
//   }, [searchTerm, employees]);

//   if (loading) {
//     return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
//   }

//   if (error) {
//     return <Text style={styles.error}>{error}</Text>;
//   }

//   return (
//     <View style={styles.container}>
//       <TextInput
//         style={styles.searchInput}
//         placeholder="Search Employees"
//         value={searchTerm}
//         onChangeText={setSearchTerm}
//       />
//       <FlatList
//         data={filteredEmployees}
//         keyExtractor={item => item}
//         renderItem={({ item }) => (
//           <View style={styles.item}>
//             <Text style={styles.itemText}>{item.name}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: '#fff',
//   },
//   searchInput: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginBottom: 20,
//   },
//   item: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   itemText: {
//     fontSize: 16,
//   },
//   loader: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   error: {
//     color: 'red',
//     textAlign: 'center',
//     marginTop: 20,
//   },
// });

// export default EmployeeDetails;
