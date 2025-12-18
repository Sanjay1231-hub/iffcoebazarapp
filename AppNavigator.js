import React from 'react';
//import { View, TouchableOpacity } from 'react-native';
//import Ionicons from '@expo/vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './Component/navigationService';
import Header from './Component/Header';
import Home from './Screens/Home'; // Import your home screen
import EmployeeDirectory from './Screens/EmployeeDirectory';
import EmployeeDetails from './Screens/EmployeeDetails';
import ODApply from './Screens/ODApply';
import ODHistory from './Screens/ODHistory';
import Recieving from './Screens/Recieving';
import LeaveApply from './Screens/LeaveApply';
import LeaveHistory from './Screens/LeaveHistory';
import LeaveWithoutPay from './Screens/LeaveWithoutPay';
import SalarySlip from './Screens/SalarySlip';
import CashDepositStore from './Screens/BazarSoft/CashDepositStore';
import OverDue from './Screens/Dashboard/OverDue';
import SalesAnalysis from './Screens/Dashboard/SalesAnalysis';
import StoreMaster from './Screens/Dashboard/StoreMaster';
import Invoicing from './Screens/Invoicing';
import PartyBalanceConfirmationOtp from './Screens/BazarSoft/PartyBalanceConfirmationOtp';
import FranchisePage from './Screens/FranchisePage';
import LastFivePayments from './Screens/Franchise/LastFivePayments';
import LastFiveInvoices from './Screens/Franchise/LastFiveInvoices';
import ImprestSettlementStore from './Screens/BazarSoft/ImprestSettlementStore';
import SegmentWiseProfit from './Screens/Dashboard/SegmentWiseProfit';
import TrackLocation from './Screens/TrackLocation';
import IDorITGICard from './Screens/IDorITGICard';
import ImageUpload from './Screens/ImageUpload';
import LeaveApproval from './Screens/LeaveApproval';
import ODApproval from './Screens/ODApproval';
import TourApproval from './Screens/TourApproval';
import CashCollection from './Screens/BazarSoft/CashCollection';
import LoginPage from './Screens/LoginPage';
import AddCustomer from './Screens/AddCustomer';
import FarmerMeeting from './Screens/FarmerMeeting';
import FarmerMeetingTarget from './Screens/FarmerMeetingTarget';
import InvoiceHistory from './Screens/InvoiceHistory';
import IndentScreen from './Screens/IndentScreen';
import PartyLedgerReport from './Screens/Franchise/PartyLedgerReport';
import CashDepositApproval from './Screens/BazarSoft/CashDepositApproval';


const Stack = createStackNavigator();

const AppNavigator = ({ onLogout, userType }) => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        //initialRouteName="Home"
        initialRouteName={userType === 'FRANCHISE' ? 'FranchisePage' : 'Home'} // Conditionally set initial route based on userType
        screenOptions={{
          headerStyle: {
            height: 80,
            backgroundColor: '#3d89fc', // Background color
            shadowColor: '#000', // Color of the shadow
            shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
            shadowOpacity: 0.1, // Transparency of the shadow
            shadowRadius: 5, // Blur effect of the shadow
            elevation: 5, // Elevation for Android shadow
            borderBottomWidth: 1, // Add bottom border for a clean line
            borderBottomColor: '#ccc', // Bottom border color            
          },
          headerTintColor: '#fff', // Header text color
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: '300', // Font weight for title
            letterSpacing: 0.3,
            //lineHeight: 20,
          },
          //headerBackTitleVisible: false, // Hide back title text (iOS only)
          //headerTitleAlign: 'center', // Center the title (default is left-aligned)
          //headerShadowVisible: true, // Enable shadow in header (default on Android)
          //headerBackButtonDisplayMode: 'minimal',
          headerShown: true, // Hide the default header
          // headerRight: () => (
          //   <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
          //     {/* Notification Icon */}
          //     <TouchableOpacity style={{ marginRight: 15 }}>
          //       <Ionicons name="notifications-outline" size={24} color="#fff" />
          //     </TouchableOpacity>
          
          //     {/* Logout Button */}
          //     <TouchableOpacity onPress={onLogout}>
          //       <Ionicons name="log-out-outline" size={24} color="#fff" />
          //     </TouchableOpacity>
          //   </View>
          // ),
          // headerLeft: () => (
          //   // Optional: Add custom icon or button to the left of the header
          //   <TouchableOpacity style={{ marginLeft: 15 }}>
          //     <Ionicons name="menu-outline" size={24} color="#fff" />
          //   </TouchableOpacity>
          // ),
        }}

      >
        <Stack.Screen name="Home" component={Home} options={{
            header: () => <Header onLogout={onLogout} />, // Custom header with logout
          }}
        />
        
        <Stack.Screen
          name="FranchisePage"
          component={FranchisePage} // This is the franchise-specific page
          options={{
            title: 'Franchise Dashboard',
            header: () => <Header onLogout={onLogout} />, // Custom header with logout
          }}
        />
        <Stack.Screen name="LoginPage" component={LoginPage} options={{ title: 'Login' }} />
        <Stack.Screen name="EmployeeDirectory" component={EmployeeDirectory} options={{ title: 'Employee Directory' }} />
        <Stack.Screen name="EmployeeDetails" component={EmployeeDetails} options={{ title: 'Employee Details' }} />     
        <Stack.Screen name="ODApply" component={ODApply} options={{ title: 'OD Apply' }} />
        <Stack.Screen name="ODHistory" component={ODHistory} options={{ title: 'OD History' }} />
        <Stack.Screen name="Recieving" component={Recieving} options={{ title: 'Receiving' }} />
        <Stack.Screen name="LeaveApply" component={LeaveApply} options={{ title: 'Leave Apply' }} />
        <Stack.Screen name="LeaveHistory" component={LeaveHistory} options={{ title: 'Leave History' }} />
        <Stack.Screen name="LeaveWithoutPay" component={LeaveWithoutPay} options={{ title: 'Leave Without Pay' }} />
        <Stack.Screen name="SalarySlip" component={SalarySlip} options={{ title: 'Salary Slip' }} />        
        <Stack.Screen name="CashDepositStore" component={CashDepositStore} options={{ title: 'Cash Deposit' }} />
        <Stack.Screen name="OverDue" component={OverDue} options={{ title: 'Overdue Details' }} />
        <Stack.Screen name="SalesAnalysis" component={SalesAnalysis} options={{ title: 'Sales Analysis' }} />
        <Stack.Screen name="StoreMaster" component={StoreMaster} options={{ title: 'Store Master' }} />    
        <Stack.Screen name="Invoicing" component={Invoicing} options={{ title: 'Invoicing' }} />    
        <Stack.Screen name="PartyBalanceConfirmationOtp" component={PartyBalanceConfirmationOtp} options={{ title: 'Party Balance Confirmation' }} />        
        <Stack.Screen name="LastFivePayments" component={LastFivePayments} options={{ title: 'Last Five Payments' }} />
        <Stack.Screen name="LastFiveInvoices" component={LastFiveInvoices} options={{ title: 'Last Five Invoices' }} />
        <Stack.Screen name="ImprestSettlementStore" component={ImprestSettlementStore} options={{ title: 'Imprest Settlement(Store)' }} />
        <Stack.Screen name="SegmentWiseProfit" component={SegmentWiseProfit} options={{ title: 'Segment Wise Profit' }} />
        <Stack.Screen name="TrackLocation" component={TrackLocation} options={{ title: 'Geolocation' }} />
        <Stack.Screen name="IDorITGICard" component={IDorITGICard} options={{ title: 'ID / ITGICard' }} />  
        <Stack.Screen name="ImageUpload" component={ImageUpload} options={{ title: 'Image Upload' }} />  
        <Stack.Screen name="LeaveApproval" component={LeaveApproval} options={{ title: 'Leave Approval' }} />  
        <Stack.Screen name="ODApproval" component={ODApproval} options={{ title: 'OD Approval' }} />  
        <Stack.Screen name="TourApproval" component={TourApproval} options={{ title: 'Tour Approval' }} />  
        <Stack.Screen name="CashCollection" component={CashCollection} options={{ title: 'Cash Collection' }} />  
        <Stack.Screen name="AddCustomer" component={AddCustomer} options={{ title: 'Add Customer' }} />  
        <Stack.Screen name="FarmerMeeting" component={FarmerMeeting} options={{ title: 'Farmer Meeting' }} />  
        <Stack.Screen name="FarmerMeetingTarget" component={FarmerMeetingTarget} options={{ title: 'Farmer Meeting Target' }} />  
        <Stack.Screen name="InvoiceHistory" component={InvoiceHistory} options={{ title: 'Invoice History' }} />  
        <Stack.Screen name="IndentScreen" component={IndentScreen} options={{ title: 'Indent' }} />  
        <Stack.Screen name="PartyLedgerReport" component={PartyLedgerReport} options={{ title: 'Party Ledger Report' }} />  
        <Stack.Screen name="CashDepositApproval" component={CashDepositApproval} options={{ title: 'Cash Deposit Approval' }} />  

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
