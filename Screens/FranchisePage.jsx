import React, { useEffect, useState} from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getTodayDate, formatIndianNumber } from '../Component/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Octicons  } from '@expo/vector-icons';
import AlertWithIcon from '../Component/AlertWithIcon';

const FranchisePage = () => {
  const navigation = useNavigation();
  const [fscState, setFscState] = useState(null);
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });

  useEffect(() => {
    const fetchFscName = async () => {
      try {
        const loggedfscState = await AsyncStorage.getItem('stateCd');
        setFscState(loggedfscState);  // Update state with fetched value
      } catch (error) {
        //console.error('Error fetching FSC details from AsyncStorage:', error);
        Alert.alert('Error', 'Error fetching FSC details from AsyncStorage');
      }
    };
    fetchFscName();  // Call async function inside useEffect
  }, []);  // Empty dependency array means it will run only once when the component mounts

  useEffect(() => {
    fetchData(); // Call fetchData when the component mounts
  }, []);

  const fetchData = async () => {
    try {      
      const fscOffice = await AsyncStorage.getItem('officeCode');    

      const postData = {
        token: "IEBL0001",
        apiId: "16",                
        inApiParameters: [ 
          { label: "P_FSC_CD", value: fscOffice }
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

      const responseText = await response.text();
  
      if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error('Invalid JSON response received.');
      }

      if (result?.output && Array.isArray(result.output)) {
        setData(result.output);
      } else {
        throw new Error('Unexpected data format received.');
      }
    } catch (error) {
      //console.error('Error fetching data:', error);
      setAlert({ visible: true, title: "Fetch Error", message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };
  
  const clickPartyBalanceConfirmationOtp =() => {
    navigation.navigate('PartyBalanceConfirmationOtp'); // Navigate to PartyBalanceConfirmationOtp screen
  }; 
  const clickLastFivePayments =() => {
    navigation.navigate('LastFivePayments'); // Navigate to LastFivePayments screen
  }; 
  const clickLastFiveInvoices =() => {
    navigation.navigate('LastFiveInvoices'); // Navigate to LastFiveInvoices screen
  };   
  const clickIndent =() => {
    navigation.navigate('IndentScreen'); // Navigate to IndentScreen screen
  };   
  const clickPartyLedger =() => {
    navigation.navigate('PartyLedgerReport'); // Navigate to PartyLedgerReport screen
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.HeadingContainer}>
        <View style={styles.HeadingText}>
          <View style={styles.line} />
          <Text style={styles.text}>Franchise Dashboard</Text>
        </View>        
      </View>
      { loading ? (
      <Text>Loading...</Text>
        ) : (
          Array.isArray(data) && data.length > 0 ? (
            data.map(item => (
            <View key={item.FSC_CD}> 
              <View style={styles.buttonContainer}>  
                <View style={{ padding: 5}}>
                  <View style={styles.informationRow}>
                      <Text style={styles.partylabel}>Party Name : </Text>
                      <Text style={styles.partydetail}>{item.FSC_NAME}</Text>
                  </View>
                  <View style={styles.informationRow}>
                      <Text style={styles.partylabel}>District/State : </Text>
                      <Text style={styles.partydetail}>{item.DISTT_NAME} ({fscState})</Text>
                  </View>
                  <View style={styles.informationRow}>
                      <Text style={styles.partylabel}>Iebl Code : </Text>
                      <Text style={styles.partydetail}>{item.FSC_CD}</Text>
                  </View>
                </View>
              </View>

                <View style={styles.HeadingContainer}>
                  <View style={styles.HeadingText}>
                    <View style={styles.line} />
                    <Text style={styles.text}>Financial Details as on {item.AS_ON_DT}</Text>
                  </View>        
                </View>

                <View style={[styles.buttonContainer, { marginLeft: 0}]}>  
                  <View style={{ padding: 5}}>
                    <View style={styles.informationRow}>
                        <Text style={[styles.partylabel, { fontWeight: 700, letterspacing: 0.3 }]}>Party Balance(Rs.) : </Text>
                        <Text style={[styles.partydetail, { fontWeight: 700, letterspacing: 0.3 }]}>{formatIndianNumber(item.PARTY_BALANCE)}</Text>
                    </View>
                    <View style={styles.informationRow}>
                        <Text style={styles.partylabel}>BG Expiry Date : </Text>
                        <Text style={styles.partydetail}>{item.BG_VALIDITY_DT}</Text>
                    </View>
                    <View style={styles.informationRow}>
                        <Text style={styles.partylabel}>IeBL Account No : </Text>
                        <Text style={styles.partydetail}>{item.VIRTUAL_ACCOUNT_NO}</Text>
                    </View>
                    <View style={styles.informationRow}>
                        <Text style={styles.partylabel}>IeBL IFSC Code : </Text>
                        <Text style={styles.partydetail}>{item.IFSC_CODE}</Text>
                    </View>
                  </View>
                </View>
              </View>
          ))
          ) : (
            <Text>Financial Details as on {getTodayDate()} Not available</Text>
          )
        )}
      

      <View style={styles.HeadingContainer}>
        <View style={styles.HeadingText}>
          <View style={styles.line} />
          <Text style={styles.text}>General</Text>
        </View>        
      </View>

      <View style={styles.buttonContainer}>       
        <View style={styles.containerbutton}>          
          <TouchableOpacity onPress={clickPartyBalanceConfirmationOtp} style={styles.button}>  
            <View style={styles.content}>      
              <Octicons name="verified" size={24} style={styles.icon} />
            </View>
          </TouchableOpacity>
          <Text style={styles.buttonText}>Party Balance Confirmation</Text>
        </View>
        <View style={styles.containerbutton}>          
          <TouchableOpacity onPress={clickLastFivePayments} style={styles.button}>  
            <View style={styles.content}>      
              <Octicons name="briefcase" size={24} style={styles.icon} />
            </View>
          </TouchableOpacity>
          <Text style={styles.buttonText}>Payments</Text>
        </View>
        <View style={styles.containerbutton}>          
          <TouchableOpacity onPress={clickLastFiveInvoices} style={styles.button}>  
            <View style={styles.content}>      
              <Octicons name="stack" size={24} style={styles.icon} />
            </View>
          </TouchableOpacity>
          <Text style={styles.buttonText}>Invoices</Text>
        </View>  
        <View style={styles.containerbutton}>          
          <TouchableOpacity onPress={clickIndent} style={styles.button}>  
            <View style={styles.content}>
              <Octicons name="checklist" size={24}  style={styles.icon} />
            </View>
          </TouchableOpacity>
          <Text style={styles.buttonText}>Indent</Text>
        </View>
      </View>
      
       <View style={styles.buttonContainer}> 
       
        <View style={styles.containerbutton}>          
          <TouchableOpacity onPress={clickPartyLedger} style={styles.button}>  
            <View style={styles.content}>             
              <Octicons name="report" size={24} style={styles.icon} />
            </View>
          </TouchableOpacity>
          <Text style={styles.buttonText}>Party Ledger</Text>
        </View>
        <AlertWithIcon
            visible={alert.visible}
            title={alert.title}
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ ...alert, visible: false })}
          />      
      </View>
 
    </ScrollView>    
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    //paddingVertical: 10,
    paddingHorizontal: 10,
  },  
  informationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',   
    width: '100%',
  }, 
  partylabel: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    //color: '#333',
    color: '#000',
    fontWeight: '500',
    fontSize: 14,
    letterspacing: 0.3,
    fontFamily: 'sans-serif',
  },
  partydetail: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    color: '#545454',
    fontWeight: '500',
    fontSize: 14,
    letterspacing: 0.3,
    fontFamily: 'sans-serif',
  },
   button: {   
    width: 50,
    height: 50,
    borderRadius: 22,    
    backgroundColor: '#fcfeff',
    //backgroundColor: '#1c84f3',
    justifyContent: 'center',
    alignItems: 'center',   
    // Shadow for iOS
    shadowColor: '#000', // Color of the shadow
    shadowOffset: { width: 2, height: 4}, // Shadow offset (x, y)
    shadowOpacity: 0.1, // Transparency of the shadow
    shadowRadius: 5, // Blur effect of the shadow    
    // Shadow for Android
    elevation: 1, // Elevation for Android shadow
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {    
    color: '#3d89fc',  
  },  
  
  HeadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',  
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 2,
  },
  HeadingText: { 
    width: '100%',  
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',   
  },
  SectionHeading: {
    fontSize: 15,
    letterspacing: 0.3,
    fontWeight: '500',
    //color: '#36527d',
    color: '#333',
    marginBottom: 5,
    textAlign: 'left', 
    fontfamily: 'sans-serif',
  },
  text: {
    fontSize: 15,
    fontWeight: 400,
    position: 'relative',
    zIndex: 1, // Ensures text is above the line
    backgroundColor: '#ffffff', 
    paddingRight: 18,
    paddingLeft: 18,
    color: '#424242',
    //color: '#fefefe',
    fontWeight: '500',
    fontFamily: 'sans-serif',   
    letterSpacing: 0.3, 
    borderRadius: 50,
    borderWidth: 1, 
    borderColor: '#dfdddd',
  },
  line: {
    position: 'absolute',
    width: '80%',
    height: 1,
    backgroundColor: '#dfdddd',
    //backgroundColor: '#ffc638',
    bottom: 10, // Adjust distance from text
  },
   
  line1: {
    width: '14%', 
    height: 1, 
    backgroundColor: '#dfdddd', 
    marginRight: 8,
    marginLeft: 8,
  }, 
  line3: {
    width: '35%', 
    height: 1, 
    backgroundColor: '#dfdddd', 
    marginRight: 8,
    marginLeft: 8,
  }, 
  containerbutton: {    
    alignItems: 'center',
    width: '25%',   
    justifyContent: 'flex-start',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 0, 
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 13,
    borderWidth: 1, 
    borderColor: '#dfdddd', 
    backgroundColor: '#ffffff',
    marginBottom: 10,
  }, 
  buttonText: {
    textAlign: 'center',
    color: '#333',   
    fontSize: 13,
    letterspacing: 0.3,
    fontWeight: '400',
    paddingVertical: 5,
  },  
});

export default FranchisePage;
