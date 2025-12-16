import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAsOnDate } from '../../Component/utils';
import PartyBalanceDebitCredit from '../../Component/PartyBalanceDebitCredit';
import AlertWithIcon from '../../Component/AlertWithIcon';

const PartyBalanceConfirmationOtp = () => {
  const [previousyear, setPYear] = useState(new Date().getFullYear()-1); 
  const [data, setData] = useState([]);
  const [eVikasPCd, setEVikasPCd] = useState([]);
  const [partyAmt, setPartyAmt] = useState([]);
  const [debitCredit, setDebitCredit] = useState('DR');
  const [mobileNo, setMobileNo] = useState([]);
  const [verifiedAmount, setVerifiedAmount] = useState('');
  const [recievedOtp, setRecievedOtp] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
  
  useEffect(() => {
    setOtp(''); // Clear OTP state on page mount
  }, []);

  // Reset OTP when input field is focused
  const handleFocus = () => {
    setOtp(''); // Clear the OTP when the input is focused
  };

  useEffect(() => {
    const fetchOpeningBalance = async () => {
      try {
        // Fetch data from AsyncStorage
        const loggedMobile = await AsyncStorage.getItem('mobilleNo');
        const fscState = await AsyncStorage.getItem('stateCd');
        const fscOffice = await AsyncStorage.getItem('officeCode');
        setMobileNo(loggedMobile);
  
        const postData = {
          token: "IEBL0001",
          apiId: "22",
          inApiParameters: [
            { label: "P_STATE_CD", value: fscState },
            { label: "P_PARTY_CD", value: fscOffice },
            { label: "P_FROM_DATE", value: "01-JAN-2024" },
            { label: "P_TO_DATE", value: "01-FEB-2025" }
          ]
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
          //console.warn('Non-200 response:', response.status);
         // console.warn('Raw response body:', responseText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        let result;
        try {
          result = JSON.parse(responseText);
          //console.log("Opening balance API result:", result);
        } catch (parseError) {
          //console.error('Error parsing the server response:', parseError);
          setAlert({
            visible: true,
            title: "Error",
            message: "Failed to parse server response.",
            type: "error",
          });
          return;
        }
  
        // Check and set values
        if (Array.isArray(result.output) && result.output.length > 0) {
          //console.warn("valid data fetched as output:", result.output);
          setData(result.output[0]);
          setPartyAmt(String(result.output[0].CL_BAL ?? ''));
          setEVikasPCd(String(result.output[0].IFF_P_CD ?? ''));
        } else {
          //console.warn("Empty or invalid output:", result.output);
          setAlert({
            visible: true,
            title: "Info",
            message: "No opening balance data found.",
            type: "warning",
          });
        }
  
      } catch (error) {
        //console.error('Error fetching data:', error);
        setAlert({
          visible: true,
          title: "Error",
          message: error.message,
          type: "error",
        });
      } finally {
        setDataLoading(false);
      }
    };
  
    fetchOpeningBalance();
  }, []);
  
  

  const formatIndianNumber = (num) => {
    const numStr = num.toString();
    // Split the number into integer and decimal parts (if any)
    let [integerPart, decimalPart] = numStr.split('.');
    // Format the integer part
    const lastThreeDigits = integerPart.slice(-3);
    const otherDigits = integerPart.slice(0, -3);
    // Add commas for the Indian number system
    const formattedInteger = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherDigits.length > 0 ? "," : "") + lastThreeDigits;  
    // Return the formatted number
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

  

  const handleSendOtp = async () => {    
    if (mobileNo.trim() === '') {
      //Alert.alert('Validation', 'Please enter a valid phone number');
      setAlert({ visible: true, title: "Validation Error", message: "Please enter a valid phone number.", type: "warning" });
      return;
    }
  
    // Ensure that the verified amount is not empty and matches CL_BAL
    if (verifiedAmount.trim() === '') {
      //Alert.alert('Validation', 'Please Enter balance as per Books of Party.');
      setAlert({ visible: true, title: "Validation Error", message: "Please Enter balance as per Books of Party.", type: "warning" });
      return;
    }
  
    // Convert verifiedAmount and data.CL_BAL to numbers for comparison
    const verifiedAmountNum = parseFloat(verifiedAmount);
    const closingBalance = parseFloat(data.CL_BAL);
  
    if (isNaN(verifiedAmountNum)) {
      //Alert.alert('Validation', 'Please Enter balance as per Books of Party.');
      setAlert({ visible: true, title: "Validation Error", message: "Please Enter balance as per Books of Party.", type: "warning" });
      return;
    }    
  
    // Check if the entered verified amount matches the closing balance (CL_BAL)
    if (verifiedAmountNum !== closingBalance || debitCredit == data.TAG_CL) {
      //Alert.alert('Validation', 'Iebl balance and your balance is not matching, Kindly contact Mr Abhisheck Shukla at 7303200906 & abhishekshukla@iffcobazar.com!');
      setAlert({ visible: true, title: "Validation Error", message: "Iebl balance and your balance is not matching, Kindly contact Mr Abhisheck Shukla at 7303200906 & abhishekshukla@iffcobazar.com!", type: "warning" });
      return;
    }
    
    setLoading(true);
    setOtp('');  // Reset OTP before sending a new OTP // Nindura Mob No. 9627123464
    try {
      const postData = {
        token: "IEBL0001",
        apiId: "25",
        inApiParameters: [{ label: "P_MOBILE_NO", value: mobileNo }]
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
        //console.log("Opening balance API result:", result);
      } catch (parseError) {
        //console.error('Error parsing the server response:', parseError);
        setAlert({
          visible: true,
          title: "Error",
          message: "Failed to parse server response.",
          type: "error",
        });
        return;
      }
  
      // Parse the response as JSON
      const responseData = result.output;
      // Assuming the success field is in the responseData
      if (responseData.OUT_PARAM_1 !=='') {

        setRecievedOtp(responseData.OUT_PARAM_1);
        setOtpSent(true);
        setResendTimer(30); // Start a 30-second countdown for resend
        setAlert({ visible: true, title: "OTP Sent", message: "An OTP has been sent to your registered mobile number.", type: "success" });
      } else {
        setAlert({ visible: true, title: "Error", message: "Failed to send OTP.", type: "error" });
      }
    } catch (error) {
      setAlert({ visible: true, title: "Error", message: `Failed to send OTP, please try again later: ${error.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle OTP submission (verify the OTP)
  const handleVerifyOtp = async () => {

    if (mobileNo.trim() === '') {
      setAlert({ visible: true, title: "Validation Error", message: "Please enter a valid phone number.", type: "warning" });
      return;
    }
  
    // Ensure that the verified amount is not empty and matches CL_BAL
    if (verifiedAmount.trim() === '') {
      setAlert({ visible: true, title: "Validation Error", message: "Please Enter balance as per Books of Party.", type: "warning" });
      return;
    }
  
    // Convert verifiedAmount and data.CL_BAL to numbers for comparison
    const verifiedAmountNum = parseFloat(verifiedAmount);
    const closingBalance = parseFloat(data.CL_BAL);
  
    if (isNaN(verifiedAmountNum)) {
      setAlert({ visible: true, title: "Validation Error", message: "Please Enter balance as per Books of Party.", type: "warning" });
      return;
    }    
  
    // Check if the entered verified amount matches the closing balance (CL_BAL)
    if (verifiedAmountNum !== closingBalance || debitCredit == data.TAG_CL) {
      setAlert({ visible: true, title: "Validation Error", message: "Iebl balance and your balance is not matching, Kindly contact Mr Abhisheck Shukla at 7303200906 & abhishekshukla@iffcobazar.com!", type: "warning" });
      
      return;
    }

    if (otp.trim().length !== 4) {
      setAlert({ visible: true, title: "Validation Error", message: "Please enter a valid 4-digit OTP", type: "warning" });

      return;
    }

    if (otp !== recievedOtp) {  // Compare entered OTP with the latest received OTP     
      setAlert({ visible: true, title: "Error", message: "Invalid OTP", type: "warning" });
      return;
    }else{
      //console.log("recievedOtp send OTP is:", recievedOtp);
    }
   
    setVerifyLoading(true);    

    try {
      const fscState = await AsyncStorage.getItem('stateCd');
      const fscOffice = await AsyncStorage.getItem('officeCode');
    
      const postData = {        
        inApiParameters: [
          { label: "P_PARTY_CD", value: fscOffice },
          { label: "P_EVIKAS_PRTYCD", value: eVikasPCd },
          { label: "P_STATE_CD", value: fscState },
          { label: "P_PARTY_MOB", value: mobileNo },
          { label: "P_PARTY_AMOUNT", value: verifiedAmount },
          { label: "P_BAZARSOFT_AMOUNT", value: partyAmt },
          { label: "P_TAG_CLOSING", value: debitCredit },
          { label: "P_FIN_YEAR", value: "2024-2025" },
          { label: "P_FROM_DATE", value: "01-FEB-2024" },
          { label: "P_TO_DATE", value: "31-JAN-2025" },
        ],
        apiId: "24",
        token: "IEBL0001"      
      };

      //console.warn('Posted data to verify balance:', JSON.stringify(postData));

    
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
        //console.warn('Non-200 response:', response.status);
        //console.warn('Raw response body:', responseText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
        //console.log("API result:", result);

      } catch (parseError) {
        //console.error('Error parsing server response:', parseError);
        setAlert({
          visible: true,
          title: "Error",
          message: "Failed to parse server response.",
          type: "error",
        });
        return;
      }

      const responseData = result.output;
      //console.log("Parsed output:", responseData);

      if (responseData?.OUT_PARAM_1) {
        // Confirm OTP or data saved successfully
        setAlert({
          visible: true,
          title: "Success",
          message: responseData.OUT_PARAM_1,
          type: "success",
        });
      } else {
        setAlert({
          visible: true,
          title: "Error",
          message: "Unexpected response from server.",
          type: "error",
        });
      }
    
      setOtp('');
    } catch (error) {
      //console.error('API error:', error);
      setAlert({
        visible: true,
        title: "Error",
        message: "Failed to verify OTP, please try again later",
        type: "error",
      });
    }

    setVerifyLoading(false);
  };

   // Function to handle OTP resend
   const handleResendOtp = () => {
    setResendLoading(true);
    if (resendTimer > 0) {
      //Alert.alert('Wait', `You can resend OTP in ${resendTimer} seconds.`);
      setAlert({ visible: true, title: "Wait", message: `You can resend OTP in ${resendTimer} seconds.`, type: "warning" });
      return;
    }
    handleSendOtp(); // Resend OTP request
    setResendLoading(false);
  };

  // Timer function to manage the resend OTP button
  React.useEffect(() => {
    let interval;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

   // Function to handle numeric input only
  const handleVerifiedAmountChange = (input) => {
    // Ensure only numbers are accepted
    if (/^\d*\.?\d*$/.test(input)) {
      setVerifiedAmount(input); // Set the value if it's a valid number
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={true}>     
    <Text style={styles.asondate}>Confirmation Of Balance as on <Text style={{color: '#fc6603', fontWeight: '500'}}>{data.TO_YR || 'Loading...'}</Text></Text>
   {dataLoading ? (      
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ transform: [{ scale: 0.6 }] }}>
          <ActivityIndicator size={50} color="#4a80f5" />
        </View>
          <Text>Loading data...</Text>
        </View>
      ) : (
        <>
        <View style={{ padding: 5, backgroundColor: '#ebfbfc'}}>
          <View style={styles.informationRow}>
              <Text style={styles.partylabel}>Party Name : </Text>
              <Text style={styles.partydetail}>{data.FSC_NAME}</Text>
          </View>
          <View style={styles.informationRow}>
              <Text style={styles.partylabel}>Openning Balance as On <Text style={{ color: '#fc6603'}}>{getAsOnDate(previousyear, 1, 1)}</Text> (Rs.) :</Text>
              <Text style={[styles.partydetail, { fontWeight: 700}]}>{isNaN(parseFloat(data.OP_BAL)) ? '' : formatIndianNumber(parseFloat(data.OP_BAL).toFixed(2))}</Text>
              <Text style={[styles.partydetail, { fontWeight: 700}]}>{data.TAG_OP}</Text>
              
          </View>
        
          <View style={styles.informationRow}>
              <Text style={styles.partylabel}>Total Sales Value(Rs.) : </Text>
              <Text style={styles.partydetail}>{isNaN(parseFloat(data.SALE_SUM)) ? '' : formatIndianNumber(parseFloat(data.SALE_SUM).toFixed(2))}</Text>
              
          </View>
          <View style={styles.informationRow}>
              <Text style={styles.partylabel}>Total Remittence(Rs.) : </Text>
              <Text style={styles.partydetail}>{isNaN(parseFloat(data.REM_SUM)) ? '' : formatIndianNumber(parseFloat(data.REM_SUM).toFixed(2))}</Text>
          </View>
          <View style={styles.informationRow}>
              <Text style={styles.partylabel}>Credit Notes(Rs.) : </Text>            
              <Text style={styles.partydetail}>{isNaN(parseFloat(data.CR_SUM)) ? '' : formatIndianNumber(parseFloat(data.CR_SUM).toFixed(2))}</Text>
          </View>
          <View style={styles.informationRow}>
              <Text style={styles.partylabel}>Debit Notes(Rs.) : </Text>    
              <Text style={styles.partydetail}>{isNaN(parseFloat(data.DB_SUM)) ? '' : formatIndianNumber(parseFloat(data.DB_SUM).toFixed(2))}</Text>        
          </View> 
        
          <View style={styles.informationRow}>
              <Text style={styles.partylabel}>Closing Balance as per IeBL records(Rs.) : </Text>
              <Text style={[styles.partydetail, { fontWeight: 700}]}> {isNaN(parseFloat(data.CL_BAL)) ? '' : formatIndianNumber(parseFloat(data.CL_BAL))}</Text>
              <Text style={[styles.partydetail, { fontWeight: 700}]}>{data.TAG_CL}</Text>
          </View>
        </View>

        </>
      )}       
        
       
        <View style={{ marginTop: 15,}}>
            <View style={styles.otpverficationbox}>
                <Text style={styles.Otptitle}>OTP Verification for party balance</Text>
                <Text style={{ color: '#084da1', marginBottom: 10}}>You will recieve OTP for Balance Confirmation Verification on your mobile no. <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#333', textDecorationLine: 'underline'}}>{mobileNo}</Text></Text>
                <Text style={{ fontSize: 16, marginBottom: 5, color: '#333', fontWeight: '400'}}>Balance as per Books of party(Rs.)</Text>
                <View style={styles.balanceAsBooks}>
                    <TextInput
                        style={[styles.input, { width: '75%', color: '#333' }]}
                        value={verifiedAmount}                
                        placeholder="Enter Amount"
                        placeholderTextColor='#a3a3a3'
                        onChangeText={handleVerifiedAmountChange}
                        keyboardType="numeric"      
                        allowFontScaling={false}                 
                    />
                    <View style={{ width: '25%'}}>
                    <PartyBalanceDebitCredit selectedValue={debitCredit} onValueChange={setDebitCredit}/>
                    </View>
                    
                </View>            
               
                
                <View style={styles.informationRow}>                  

                    <TouchableOpacity  onPress={handleSendOtp} disabled={loading} style={[styles.getOtpButton, { width: '100%', color: '#333' }]}>
                        <Text style={styles.submitText}>{loading ? 'Sending OTP...' : 'Send OTP'}</Text>
                    </TouchableOpacity>
                </View>



                <Text style={{ fontSize: 16, marginTop: 15, marginBottom: 5, color: '#333', fontWeight: '400'}}>Enter OTP</Text>           
                <View>                   
                    <TextInput
                                  style={[styles.input, { marginBottom: 10, }]}
                                  placeholder="Enter OTP"
                                  keyboardType="numeric"
                                  onFocus={handleFocus}  // Clear OTP on focus
                                  autoCompleteType="off" // Prevent auto-fill behavior
                                  autoCorrect={false}    // Disable auto-correction
                                  autoCapitalize="none"  // Disable auto-capitalization
                                  maxLength={4}
                                  value={otp}
                                  onChangeText={(text) => setOtp(text)} // Updating OTP state
                                  placeholderTextColor="#a3a3a3"
                                  allowFontScaling={false}
                                />
                </View>            

                <TouchableOpacity  onPress={handleVerifyOtp} disabled={verifyLoading} style={[styles.getOtpButton, { width: '100%', color: '#333' }]}>
                    <Text style={styles.submitText}>{verifyLoading ? 'Verifying...' : 'Verify'}</Text>
                </TouchableOpacity>

                
                <TouchableOpacity  onPress={handleResendOtp} disabled={resendLoading || resendTimer > 0} style={{ alignItems: 'center', padding: 10 }}>
                    <Text style={{ color: '#208cf3'}}>{resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}</Text>
                </TouchableOpacity>

                <Text style={{ color: '#fc6603', fontStyle: 'italic'}}>Electronically verified by party</Text>
            </View>
            <Text style={{ color: '#018f2c', fontStyle: 'italic'}}>Note: This is system generated report. Signature not required.</Text>
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
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 10,
  }, 
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },   
  asondate: {
    paddingVertical: 3,
    paddingHorizontal: 0,
    marginBottom: 10,
    color: '#084da1',
    fontWeight: '500',
    fontSize: 16,
    letterSpacing: 0.3, 
    fontFamily: 'sans-serif',
  },
  informationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',   
  },
  balanceAsBooks: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  partylabel: {
    paddingVertical: 3,
    color: '#000',
    fontWeight: '500',
    fontSize: 13,
    //letterSpacing: 0.1, 
    fontFamily: 'sans-serif',
  },
  
 
  partydetail: {
    paddingVertical: 3,
    color: '#545454',
    fontWeight: '600',
    fontSize: 13,
    //letterSpacing: 0.1, 
    textAlign: 'right',
    fontFamily: 'sans-serif',
  },
   
  input: {
    height: 40,
    fontSize: 15,
    color: '#333',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 3,
    paddingLeft: 8,
  },
  getOtpButton: {
    backgroundColor: '#208cf3',
    borderRadius: 3,
    padding: 7,
    alignItems: 'center',
    fontWeight: '700',
    justifyContent: 'center',
    // Shadow for iOS
    shadowColor: '#000', // Color of the shadow
    shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
    shadowOpacity: 0.1, // Transparency of the shadow
    shadowRadius: 5, // Blur effect of the shadow
    // Shadow for Android
    elevation: 5, // Elevation for Android shadow
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    letterSpacing: 0.3, 

    fontWeight: '400',
  },
  otpverficationbox: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
  },
  Otptitle: {
    fontSize: 18,
    letterSpacing: 0.3, 

    fontWeight: '500',
    color: '#fc6603',
    textAlign: 'center',
    marginBottom: 10,
  },   
}); 

export default PartyBalanceConfirmationOtp;
  