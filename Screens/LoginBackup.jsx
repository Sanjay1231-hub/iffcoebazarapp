import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground, Platform, Image, ActivityIndicator, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import LoginUserType from '../Component/LoginUserType';
import { Ionicons  } from '@expo/vector-icons';
import { Passwordinput, LoginInput } from '../Component/LoginInput';
import AlertWithIcon from '../Component/AlertWithIcon';

const API_TOKEN = 'IEBL0001'; // Move to environment variable in production

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState('IEBL');
  const [otpLoading, setOtpLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(''); // State to store OTP input by the user
  const [otpSent, setOtpSent] = useState(false); // State to check if OTP was sent
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
 const [checkingSession, setCheckingSession] = useState(true); // 🔹 session check state

  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem('username');
        const savedUserType = await AsyncStorage.getItem('userType'); 

        if (savedUsername && savedUserType) {
          if (savedUserType === 'FRANCHISES') {
            onLogin('FRANCHISE');
          } else {
            onLogin();
          }
          return;
        }
      } catch (err) {
        setAlert({ visible: true, title: 'Session Error', message: 'Failed to check session. Please try again.', type: 'error' });
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);



  // Resend OTP timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [resendTimer]);


  const handleLogin = async () => {
    setLoading(true);
    if (!username || !password) {
      Alert.alert("Validation Error", "Please enter username and password.");
      setLoading(false);
      return;
    }

    if (!selectedValue) {
      Alert.alert("Validation Error", "Please select a user type.");
      setLoading(false);
      return;
    }

    const postData = {
      token: API_TOKEN,
      apiId: "18",
      inApiParameters: [
        { label: "P_USERID", value: username },
        { label: "P_PASSWORD", value: password },
        { label: "P_USERTYPE", value: selectedValue },
      ],
    };

    try {
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

      let result;
      try {
        result = JSON.parse(text);
      } catch (jsonError) {
        throw new Error('Invalid JSON response received.');
      }

      if (!result || typeof result !== 'object') {
        throw new Error('Unexpected data format received.');
      }

      const userData = result?.output[0];

      if (userData && userData.O_USER_NAME) {

        await AsyncStorage.setItem('username', String(username ?? ''));
        await AsyncStorage.setItem('empPno', String(userData.PERSONAL_NO ?? ''));
        await AsyncStorage.setItem('empname', String(userData.O_USER_NAME ?? ''));
        await AsyncStorage.setItem('officeCode', String(userData.O_FSC_CD ?? ''));
        await AsyncStorage.setItem('departmentName', String(userData.O_DEPT_N ?? ''));
        await AsyncStorage.setItem('stateCd', String(userData.O_STATE_ ?? ''));
        await AsyncStorage.setItem('mobilleNo', String(userData.O_MOBILE ?? '')); // This line fixes the warning
        await AsyncStorage.setItem('userEmail', String(userData.O_EMAIL ?? ''));
        await AsyncStorage.setItem('userOfficeEmail', String(userData.OFFICE_EMAIL_ID ?? ''));
        await AsyncStorage.setItem('empGrade', String(userData.O_GRADE_ ?? ''));
        await AsyncStorage.setItem('storeUnit', String(userData.O_UNIT_N ?? ''));
        await AsyncStorage.setItem('userDesig', String(userData.O_USER_D ?? ''));
        await AsyncStorage.setItem('empRole', String(userData.O_EMP_RO ?? ''));
        await AsyncStorage.setItem('empStateName', String(userData.STATE_NAME ?? ''));
        await AsyncStorage.setItem('empStoreName', String(userData.STORE_NAME ?? ''));
        await AsyncStorage.setItem('empAccountNo', String(userData.ACCOUNT_NO ?? ''));
        await AsyncStorage.setItem('empBankName', String(userData.BANK_NAME ?? ''));
        await AsyncStorage.setItem('empBankIFSC', String(userData.IFSC_CODE ?? ''));
        await AsyncStorage.setItem('empBloodGroup', String(userData.BLOOD_GROUP ?? ''));
        await AsyncStorage.setItem('empPhoto', String(userData.EMP_PHOTO ?? ''));
        await AsyncStorage.setItem('userType', selectedValue);
        onLogin();
      } else {
        setAlert({ visible: true, title: "Invalid Credentials", message: "The username or password you entered is incorrect.", type: "warning" });
      }
    } catch (error) {
      //console.error('Login error:', error);
      setAlert({ visible: true, title: "Error", message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };



 const EmployeeTypeChange = (value) => {
    setSelectedValue(value);
    //setUsername('');
    //setPassword('');
    setMobileNumber('');
    setOtp('');
    setOtpSent(false);
    setResendTimer(0);
  };

  // OTP send function
  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      setAlert({ visible: true, title: "Invalid Mobile Number", message: 'Please enter a valid 10-digit mobile number.', type: "warning" });
      return;
    }

    setOtpLoading(true);  
      const postData = {
        //token: "IEBL0001",
        token: API_TOKEN,
        apiId: "23",
        inApiParameters: [{ label: "P_PHONE_NO", value: mobileNumber }]
      };
    try { 
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

      //const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
        //console.log("Opening balance API result:", result);
      } catch (parseError) {
        setAlert({
          visible: true,
          title: "Error",
          message: "Failed to parse server response.",
          type: "error",
        });
        return;
      }
      const userData = result.output;

      if (userData.OUT_PARAM_1 == 0) {

        setAlert({ visible: true, title: "Invalid", message: userData.OUT_PARAM_2, type: "warning" });
        setOtpLoading(false);
        return;
      } else if (userData.OUT_PARAM_1 == 1) {

        setOtpSent(true);
        setTimeout(() => {
          setOtpLoading(false);
          setAlert({ visible: true, title: "OTP Sent", message: userData.OUT_PARAM_2, type: "success" });
        }, 2000);
      } else {
        //console.error('Unexpected output from server:', userData);
        setAlert({ visible: true, title: "Error", message: "Unexpected response from the server!", type: "error" });
        setOtpLoading(false);
      }

    } catch (error) {
      //console.error('Login error:', error);
      setAlert({ visible: true, title: "Error", message: error.message || 'Something went wrong. Please try again later.', type: "error" });

    } finally {
      if (!setOtpSent) {
        setOtpLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) {
     setAlert({ visible: true, title: 'Wait', message: `Please wait for ${resendTimer} seconds before resending OTP.`, type: 'warning' });
      return;
    }
    setResendLoading(true);
    await handleSendOtp();
    setResendLoading(false);
  };

  const handleSubmitOtp = async () => {
    if (!otp || otp.length < 4) {
      setAlert({ visible: true, title: "Invalid OTP", message: "Please enter a valid 4-digit OTP.", type: "warning" });
      return;
    }

    // if (!/^\d{4}$/.test(otp)) {
    //   setAlert({ visible: true, title: 'Invalid OTP', message: 'Please enter a valid 4-digit OTP.', type: 'warning' });
    //   return;
    // }
    setOtpLoading(true);
    try {
      const postData = {       
        token: API_TOKEN,
        apiId: "35",
        inApiParameters: [
          { label: "P_MOBILE_NO", value: mobileNumber },
          { label: "P_OTP", value: otp }
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

      if (!response.ok) {
        throw new Error('Failed to verify OTP, please try again.');
      }
      
      const responseText = await response.text();
      let loginData;
      try {
        loginData = JSON.parse(responseText);
      } catch (parseError) {
        //console.error('Error parsing the server response:', parseError);
        setAlert({ visible: true, title: "Error", message: "Failed to parse server response.", type: "error" });
        return;
      }

      const frenchiseData = loginData.output;
      //console.log('OTP verification response:', frenchiseData);

      if (Array.isArray(frenchiseData) && frenchiseData.length > 0) {
  const user = frenchiseData[0]; // pick the first object

  if (user.STATUS == 0) {
    await AsyncStorage.setItem('username', mobileNumber || "");
    await AsyncStorage.setItem('empname', user.FSC_NAME || "");
    await AsyncStorage.setItem('fscName', user.FSC_NAME || "");
    await AsyncStorage.setItem('fscDistName', user.DISTT_NAME || "");
    await AsyncStorage.setItem('fscEmail', user.FSC_EMAIL_ID || "");
    await AsyncStorage.setItem('foEmail', user.FO_EMAIL_ID || "");
    await AsyncStorage.setItem('officeCode', user.FSC_CD || "");
    await AsyncStorage.setItem('stateCd', user.STATE_CD || "");
    await AsyncStorage.setItem('mobilleNo', mobileNumber || "");
    await AsyncStorage.setItem('officeType', user.OFFICE_TYPE || "");
    await AsyncStorage.setItem('userType', selectedValue);


    onLogin('FRANCHISE');
    setOtp('');
  } else {
    setAlert({
      visible: true,
      title: "Invalid OTP",
      message: "The OTP you entered is incorrect.",
      type: "warning"
    });
  }
}
    } catch (error) {
      //console.error('Error during OTP verification:', error);
      setAlert({ visible: true, title: "Error", message: error.message || 'Something went wrong. Please try again later.', type: "error" });

    } finally {
      setOtpLoading(false);
    }
  };


  if (checkingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#f37e20" />
        <Text style={{ marginTop: 10 }}>Checking session...</Text>
      </View>
    );
  }


  return (
    <ImageBackground
      source={require('../assets/LoginBG02.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.ImageContainer}>
          <Image
            style={styles.image}
            source={require('../assets/iffco-logo.png')}
          />
          <Text style={styles.title}>Welcome To</Text>
          <Text style={styles.title1}>BazarSoft</Text>
        </View>

        <View style={{ marginBottom: 10, width: '100%' }}>
          <LoginUserType selectedValue={selectedValue} onValueChange={EmployeeTypeChange} />
        </View>

        {selectedValue !== 'FRANCHISES' && (
          <>

            <LoginInput
              style={styles.input}
              placeholder="Personal No"
              iconName="person-outline"
              value={username}
              onChangeText={(text) => {
                setUsername(text); // Correctly setting username
              }}
              placeholderTextColor="#a3a3a3"
            />

            <Passwordinput
              style={styles.input}
              placeholder="Password"
              iconName="lock-closed-outline"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text); // Correctly setting password
              }}
              placeholderTextColor="#a3a3a3"
            />
          </>
        )}

        {selectedValue === 'FRANCHISES' && !otpSent && (
          <>
            <View style={styles.mobileInputContainer}>
              <Ionicons name="call-outline" size={20} color="#a3a3a3" style={styles.icon} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Mobile Number"
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={(text) => setMobileNumber(text)} // Updating mobile number state
                placeholderTextColor="#a3a3a3"
              />
            </View>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSendOtp}
              disabled={otpLoading}
            >
              {otpLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Send OTP</Text>
              )}
            </TouchableOpacity>

            {/* Resend OTP button */}
            {otpSent && resendTimer == 0 && (
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOtp}
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.resendButtonText}>Resend OTP</Text>
                )}
              </TouchableOpacity>
            )}

            {otpSent && resendTimer > 0 && (
              <Text style={styles.timerText}>Wait for {resendTimer} seconds to resend OTP</Text>
            )}
          </>
        )}

        {selectedValue === 'FRANCHISES' && otpSent && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              keyboardType="numeric"
              maxLength={4}
              value={otp}
              onChangeText={(text) => setOtp(text)} // Updating OTP state
              placeholderTextColor="#a3a3a3"
            />

            {/* Verify OTP Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSubmitOtp}
              disabled={otpLoading}
            >
              {otpLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            {/* Reload OTP Button */}
            <TouchableOpacity
              //style={styles.resendButton}
              onPress={handleResendOtp} // Call your OTP resend function
              disabled={otpLoading}
            >
              <Text style={styles.reloadButtonText}>Resend OTP</Text>
            </TouchableOpacity>
          </>
        )}


        {selectedValue !== 'FRANCHISES' && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Reusable Custom Alert */}
        <AlertWithIcon
                  visible={alert.visible}
                  title={alert.title}
                  message={alert.message}
                  type={alert.type}
                  onClose={() => setAlert({ ...alert, visible: false })}
                />
      </View>
      <View style={styles.versioncontainer}>
        <Text style={styles.versionText}>App Version: {Constants.expoConfig.version}</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ImageContainer: {
    alignItems: 'center',
    justifyContent: 'center', // Ensures image is properly centered
  },

  reloadButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 8,
  },

  image: {
    width: 100,
    height: 40,
    resizeMode: 'contain', // Better for logos or images that shouldn't be cropped
    marginBottom: 10,
  },
  container: {
    width: '75%',
    backgroundColor: 'rgba(0, 0, 0, 0.10)', // Same as '#00000024', but more readable
    paddingVertical: 20, // Adjusted padding for better spacing
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center', // Centers content vertically if needed
    alignSelf: 'center', // Ensures proper alignment
    marginBottom: 55,
  },
  versioncontainer: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
  },
  versionText: {
    fontSize: 13,
    color: '#fff',
  },
  title: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '700',
    textShadowColor: '#838383ff',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'sans-serif',
    textAlign: 'center',
    //marginBottom: 6, // Reduced margin
    //lineHeight: 30, // Slightly more than font size for tight spacing
  },
  title1: {
    fontSize: 36,
    color: '#f37e20',
    fontWeight: '700',
    textShadowColor: '#696969ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    fontFamily: 'sans-serif',
    textAlign: 'center',
    //lineHeight: 38, // Keeps it visually tight
    marginBottom: 30,
  },

  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    fontFamily: 'sans-serif',
  },
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 4,
    backgroundColor: '#fff',
    height: 40,
    width: '100%',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    marginRight: 10,
  },
  inputWithIcon: {
    width: '100%',
    height: 40,

  },
  loginButton: {
    width: '100%',
    height: 40,
    backgroundColor: '#f37e20',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'sans-serif',
  },
  // Add styles for the resend OTP button and timer text
  resendButton: {
    width: '100%',
    height: 40,
    backgroundColor: '#8b8b8c',
    padding: 8,
    borderRadius: 5,
    //marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  resendButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'sans-serif',
  },
  timerText: {
    color: '#fff',
    textAlign: 'center',
    //marginTop: 10,
  },
});

export default LoginPage;
