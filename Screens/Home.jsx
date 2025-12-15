import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeButton = ({ onPress, children, icon }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>  
    <View style={styles.content}>      
        {icon && <Ionicons  name={icon} size={24} style={styles.icon} />}      
        {children} 
    </View>    
  </TouchableOpacity>
);

function Home() { 
  const navigation = useNavigation();
  const [loggedUser, setLoggedUser] = useState(null);   
  const [loggedEmpRole, setLoggedEmpRole] = useState(null);
  const rolesForODApply       = ["HO", "STORE", "HELPER"];   // allowed roles
  const rolesForApproval      = ["IF", "RM"];      // verified roles
  const rolesForBazarSoft     = ["STORE", "HELPER"];         // only store


  useEffect(() => {
    // load once on mount
    AsyncStorage.getItem('username')
      .then(user => {
        setLoggedUser(user);
      })
      .catch(err => {
        //console.error('Failed to load username', err);
      });
  }, []);

  useEffect(() => {
    // load once on mount
    AsyncStorage.getItem('empRole')
      .then(userOffice => {
        setLoggedEmpRole(userOffice);
      })
      .catch(err => {
        //console.error('Failed to load Employee Role', err);
      });
  }, []);

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };
  
  return (

    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.HeadingContainer}>
        <View style={styles.HeadingText}>
          <View style={styles.line} />
            <Text style={styles.text}>General / WorkFlow</Text>
        </View>        
      </View>

      <View style={styles.buttonContainer}>    
        <View style={styles.buttonGrid}>        
          <View style={styles.containerbutton}>   
            <HomeButton onPress={() => navigateToScreen("EmployeeDirectory")} icon="book-outline" >          
            </HomeButton>
            <Text style={styles.buttonText}>Employees Directory</Text>
          </View> 

          {(rolesForODApply.includes(loggedEmpRole)) && (
            <View style={styles.containerbutton}>
              <HomeButton onPress={() => navigateToScreen("ODApply")} title="ODApply" icon="calendar-clear-outline">
              </HomeButton>
              <Text style={styles.buttonText}>OD Apply</Text>
            </View> 
          )}

          {(rolesForODApply.includes(loggedEmpRole)) && (
            <View style={styles.containerbutton}>        
              <HomeButton onPress={() => navigateToScreen("LeaveApply")} title="LeaveApply" icon="calendar-outline">    
              </HomeButton>
              <Text style={styles.buttonText}>Leave Apply</Text>
            </View>
          )}

          {(rolesForODApply.includes(loggedEmpRole)) && (            
            <View style={styles.containerbutton}>
              <HomeButton onPress={() => navigateToScreen("SalarySlip")} title="SalarySlip" icon="document-text-outline">
              </HomeButton>
              <Text style={styles.buttonText}>Salary Slip</Text>
            </View> 
          )}

          {/* {rolesForApproval.includes(loggedEmpRole)  && loggedUser !== "108842" && (
            <View style={styles.containerbutton}>
            <HomeButton onPress={() => navigateToScreen("ODApproval")} title="ODApproval" icon="bookmark-outline">
            </HomeButton>
            <Text style={styles.buttonText}>OD Approval</Text>
          </View>
          )}        

          {rolesForApproval.includes(loggedEmpRole)  && loggedUser !== "108842" && (
            <View style={styles.containerbutton}>
              <HomeButton onPress={() => navigateToScreen("LeaveApproval")} title="LeaveApproval" icon="flag-outline">
              </HomeButton>
              <Text style={styles.buttonText}>Leave Approval</Text>
            </View>
          )}         

          {rolesForApproval.includes(loggedEmpRole)  && loggedUser !== "108842" && (
            <View style={styles.containerbutton}>
              <HomeButton onPress={() => navigateToScreen("TourApproval")} title="TourApproval" icon="recording-outline">
              </HomeButton>
              <Text style={styles.buttonText}>Tour Approval</Text>
            </View>
          )}       */}

          {rolesForODApply.includes(loggedEmpRole) && (
            <View style={styles.containerbutton}>
              <HomeButton onPress={() => navigateToScreen("LeaveWithoutPay")} title="LeaveWithoutPay" icon="calendar-number-outline">
              </HomeButton>
              <Text style={styles.buttonText}>LWP Apply</Text>
            </View>  
          )}          

          {rolesForODApply.includes(loggedEmpRole) && (
             <View style={styles.containerbutton}>
              <HomeButton onPress={() => navigateToScreen("IDorITGICard")} title="IDorITGICard" icon="id-card-outline">
              </HomeButton>
              <Text style={styles.buttonText}>ID/ITGI Card</Text>
            </View>
          )}     

           {rolesForODApply.includes(loggedEmpRole) && (
             <View style={styles.containerbutton}>
              <HomeButton onPress={() => navigateToScreen("PartyLedgerReport")} title="PartyLedgerReport" icon="document-text-outline">
              </HomeButton>
              <Text style={styles.buttonText}>Party Ledger</Text>
            </View>
          )}          
     

        
        </View> 
      </View>

      {rolesForBazarSoft.includes(loggedEmpRole)  && (
        <View style={styles.HeadingContainer}>
          <View style={styles.HeadingText}>
            <View style={styles.line} />
            <Text style={styles.text}>BazarSoft</Text>
          </View>        
        </View> 
      )} 

      {rolesForBazarSoft.includes(loggedEmpRole)  &&  (
          <View style={styles.buttonContainer}>  
          <View style={styles.buttonGrid}>

            {rolesForBazarSoft.includes(loggedEmpRole) && (
              <View style={styles.containerbutton}>
                <HomeButton onPress={() => navigateToScreen("CashDepositStore")} title="CashDepositStore" icon="cash-outline">                           
                </HomeButton>
                <Text style={styles.buttonText}>Cash Deposit</Text>
              </View>
            )}          
            
            {rolesForBazarSoft.includes(loggedEmpRole) && (
              <View style={styles.containerbutton}>
                <HomeButton onPress={() => navigateToScreen("Recieving")} title="Recieving" icon="briefcase-outline">           
                </HomeButton>
                <Text style={styles.buttonText}>Receiving</Text>
              </View>
            )} 

            {rolesForBazarSoft.includes(loggedEmpRole) &&  (
              <View style={styles.containerbutton}>
                <HomeButton onPress={() => navigateToScreen("Invoicing")} title="Invoicing" icon="receipt-outline">           
                </HomeButton>
                <Text style={styles.buttonText}>Invoicing</Text>
              </View> 
            )} 

            {rolesForBazarSoft.includes(loggedEmpRole) && (
              <View style={styles.containerbutton}>
                <HomeButton onPress={() => navigateToScreen("AddCustomer")} title="AddCustomer" icon="person-add-outline">    
                </HomeButton>
                <Text style={styles.buttonText}>Customer</Text>
              </View>
            )}  

            {rolesForBazarSoft.includes(loggedEmpRole) && (
              <View style={styles.containerbutton}>
                <HomeButton onPress={() => navigateToScreen("ImprestSettlementStore")} title="ImprestSettlementStore" icon="nuclear-outline">   
                </HomeButton>
                <Text style={styles.buttonText}>Imprest</Text>
              </View> 
            )}               

            {rolesForBazarSoft.includes(loggedEmpRole) && (
              <View style={styles.containerbutton}>
                <HomeButton onPress={() => navigateToScreen("FarmerMeetingTarget")}  title="FarmerMeetingTarget" icon="people-outline">    
                </HomeButton>
                <Text style={styles.buttonText}>Farmers Meeting</Text>
              </View>
            )}  

            {rolesForBazarSoft.includes(loggedEmpRole) && (
              <View style={styles.containerbutton}>
                <HomeButton onPress={() => navigateToScreen("IndentScreen")}  title="Indent" icon="reader-outline">    
                </HomeButton>
                <Text style={styles.buttonText}>Indent</Text>
              </View>
            )}

            
          </View>
        </View>
      )} 

     

      <View style={styles.HeadingContainer}>
        <View style={styles.HeadingText}>
          <View style={styles.line} />
          <Text style={styles.text}>Dashboard</Text>
        </View>        
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonGrid}>
          <View style={styles.containerbutton}>
            <HomeButton onPress={() => navigateToScreen("OverDue")} title="OverDue" icon="logo-stackoverflow">    
            </HomeButton>
            <Text style={styles.buttonText}>Overdue</Text>
          </View> 

          <View style={styles.containerbutton}>        
            <HomeButton onPress={() => navigateToScreen("SalesAnalysis")}  title="SalesAnalysis" icon="bar-chart-outline">    
            </HomeButton>
            <Text style={styles.buttonText}>Sales</Text>
          </View>

          <View style={styles.containerbutton}>
            <HomeButton onPress={() => navigateToScreen("StoreMaster")}  title="StoreMaster" icon="server-outline">    
            </HomeButton>
            <Text style={styles.buttonText}>Master</Text>
          </View>  


               

          {/* <View style={styles.containerbutton}>
            <HomeButton onPress={() => navigateToScreen("SegmentWiseProfit")}  title="SegmentWiseProfit" icon="analytics-outline">    
            </HomeButton>
            <Text style={styles.buttonText}>Segment Wise Profit</Text>
          </View> */}
          
        </View>
      </View>

    </ScrollView>    
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    //minHeight: 600,  // Ensure enough height for scrolling
    backgroundColor: '#ffffff',
    paddingTop: 5,
    paddingHorizontal: 12,
    //paddingTop: 3,
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
    //color: '#ffffffff',  
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
  
  text: {
    fontSize: 15,
    fontWeight: 400,
    position: 'relative',
    zIndex: 1, // Ensures text is above the line
    //backgroundColor: '#5a8ed1', 
    backgroundColor: '#ffffff', 
    paddingHorizontal: 18,  
    color: '#424242',
    fontWeight: '500',
    letterSpacing: 0.3, 
    borderRadius: 50,
    borderWidth: 1, 
    //borderColor: '#5a8ed1',
    borderColor: '#eeeeeeff',
  },
  line: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#eeeeeeff',
    bottom: 10, // Adjust distance from text
  }, 
  containerbutton: {    
    alignItems: 'center',
    width: '25%',   
    justifyContent: 'flex-start',
    marginVertical: 5,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',   
    justifyContent: 'flex-start',
    //paddingHorizontal: 10,
    //marginTop: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 5, 
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 13,
    borderWidth: 1, 
    //borderColor: '#5a8ed1', 
    borderColor: '#eeeeeeff', 
    backgroundColor: '#ffffff',
  },
  buttonText: {
    textAlign: 'center',
    color: '#424242',   
    fontSize: 13,
    fontWeight: '400',
    marginTop: 5,
    letterSpacing: 0.3,
  },   
  
});

export default Home;
