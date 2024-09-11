import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Image, FlatList, Alert, TextInput } from 'react-native';
import { Card, FAB } from 'react-native-paper';
import Constants from 'expo-constants';

const EmployeeDirectory = ({ navigation }) => {
  const apiUrl = Constants.expoConfig?.extra?.apiUrl;
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');


  const buildUrl = (baseUrl, endpoint) => `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
    const url = buildUrl(apiUrl, 'EmpDirectory/GetEmpDirAllData');

  const fetchData = useCallback(() => {
    //fetch("https://reactapi.iffco.coop/EmpDirectory/GetEmpDirAllData")
    fetch(url)
      .then(res => res.json())
      .then(results => {
        setData(results);
        setFilteredData(results); // Initialize filtered data with full data
        setLoading(false);
      })
      .catch(err => {
        Alert.alert("Error", "Something went wrong while fetching data.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredData(data);
    } else {
      const lowercasedQuery = query.toLowerCase();
      setFilteredData(
        data.filter(item =>
        item.PNO.toLowerCase().includes(query.toLowerCase()) ||
        item.EMP_NAME.toLowerCase().includes(query.toLowerCase()) ||
        item.OFFICE_CD.toLowerCase().includes(query.toLowerCase()) ||
        item.EMP_DESIG.toLowerCase().includes(query.toLowerCase()) 
        )
      );
    }
  };

  const renderListItem = ({ item }) => {
    // Check if item is null or undefined
    if (!item) {
      return null; // or you could render a fallback UI component here
    }
  
    // Destructure item properties with default values
    const { EMP_NAME = 'N/A', EMP_DESIG = 'N/A', EMAIL ='N/A', EMP_ROLE = 'N/A', MOBILE_NO_1 = 'N/A', STATUS = 'N/A' } = item;
  
    return (
      <Card
        style={styles.mycard}
        onPress={() => navigation.navigate("Profile", { item })}
      >
        <View style={styles.cardView}>
          <Image
            style={styles.image}
            source={require('../assets/face01.png')}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.text}>{EMP_NAME}</Text>
            <Text style={styles.text}>{EMP_DESIG}</Text>
          </View>
        </View>
      </Card>
    );
  };
  

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredData}
        renderItem={renderListItem}
        keyExtractor={item => item.PNO.toString()}
        onRefresh={fetchData}
        refreshing={loading}
      />
      <FAB
        onPress={() => navigation.navigate("Create")}
        style={styles.fab}       
        icon="plus"
        theme={{ colors: { accent: "#006aff" } }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderColor: '#5c6cf5',
    borderWidth: 1,
    borderRadius: 30,
    margin: 10,
  },
  mycard: {
    margin: 5,
    backgroundColor: '#ffffff',
  },
  cardView: {
    flexDirection: "row",
    padding: 6,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  infoContainer: {
    marginLeft: 10,
  },
  text: {
    fontSize: 18,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default EmployeeDirectory;
