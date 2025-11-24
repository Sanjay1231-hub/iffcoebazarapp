import React, { useState, useEffect  } from 'react';
import AlertWithIcon from "../Component/AlertWithIcon";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity  } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from "react-native-webview";

const FarmerMeetingTarget = () => {
    const navigation = useNavigation();
    const [fieldDayMeeting, setFieldDayMeeting] = useState(0);
    const [target, setTarget] = useState(100);
    const [totalFarmer, setTotalFarmer]= useState(null);
    const [totalDistrict, setTotalDistrict]= useState(null);
    const [totalBlock, setTotalBlock]= useState(null);
    const [totalVillage, setTotalVillage]= useState(null);
    const [farmerMeeting, setFarmerMeeting] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState("");
    const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
   


    useEffect(() => {      
    const fetchMeetingRecord = async () => {
      try {
        const loggedUserStoreCd = await AsyncStorage.getItem('officeCode');
        if (!loggedUserStoreCd) {
          throw new Error('No user found');
        } 
        const postData = {
          token: "IEBL0001",
          apiId: "45",
          inApiParameters: [
            {
              label: "P_STORE_CD",
              value: loggedUserStoreCd
            }
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
  
        const text = await response.text();
  
        if (!response.ok) {
          //console.warn('Non-200 response:', response.status);
          //console.warn('Raw response body:', text);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        let result;
        try {
          result = JSON.parse(text);
        } catch (jsonError) {
          throw new Error('Invalid JSON response received.');
        }
  
        if (result && Array.isArray(result.output) && result.output.length > 0) {
              const farmer = (result.output[0].FM_COUNT / 10) * 100;
              //console.log('farmer response body:', farmer);
              const field = (result.output[0].FD_COUNT / 10) * 100;
              const district = result.output[0].DISTRICT_COUNT ;
              const block = result.output[0].BLOCK_COUNT;
              const village = result.output[0].VILLAGE_COUNT;
              const farmers = result.output[0].TOTAL_FARMERS;


          setFarmerMeeting(Math.round(farmer || 0));
          setFieldDayMeeting(Math.round(field || 0));

          setTotalFarmer(Math.round(farmers || 0));
          setTotalDistrict(Math.round(district || 0));
          setTotalBlock(Math.round(block || 0));
          setTotalVillage(Math.round(village || 0));
          setErrors("");
          
        } else {
          //setAlert({ visible: true, title: "Info", message: "No record data found.", type: "warning" });
          setErrors("No meeting record data found.");
        }
  
      } catch (error) {
        setAlert({ visible: true, title: "Error", message: error.message || 'Failed to fetch data. Please try again.', type: "error" });
      } finally {
        setLoading(false);
      }
      };
    
      fetchMeetingRecord();
    }, []);

    const chartHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Charts</title>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body {
              margin: 0;
              padding: 20px 10px;
              display: flex;
              justify-content: space-around;
              align-items: center;
              background: #ffffffff;
              font-family: Arial;
            }
            .chartBox {
              text-align: center;
            }
            canvas {
              width: 320px !important;
              height: 320px !important;
            }
            .title {
              font-size: 44px;
              font-weight: 500;
              color: #1e3a8a;
              margin-bottom: 20px;
            }
            .subtitle {
              font-size: 36px;
              color: #094ac2ff;
              margin-bottom: 50px;
            }
            .percent {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 36px;
              font-weight: 500;
            }
            .chartWrapper {
              position: relative;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="chartBox">
            <div class="title">Farmer Meeting</div>
            <div class="subtitle">Total Vs Actual</div>
            <div class="chartWrapper">
              <canvas id="farmerChart"></canvas>
              <div class="percent">${farmerMeeting}%</div>
            </div>
          </div>

          <div class="chartBox">
            <div class="title">Field Day Program</div>
            <div class="subtitle">Total Vs Actual</div>
            <div class="chartWrapper">
              <canvas id="fieldChart"></canvas>
              <div class="percent">${fieldDayMeeting}%</div>           
            </div>         
          </div>

            

          <script>
            const farmerData = {
              datasets: [{
                data: [${farmerMeeting}, ${target - farmerMeeting}],
                backgroundColor: ['#3b82f6', '#e5e7eb'],
                borderWidth: 0
              }]
            };

            const fieldData = {
              datasets: [{
                data: [${fieldDayMeeting}, ${target - fieldDayMeeting}],
                backgroundColor: ['#3b82f6', '#e5e7eb'],
                borderWidth: 0
              }]
            };

            new Chart(document.getElementById('farmerChart'), {
              type: 'doughnut',
              data: farmerData,
              options: {
                cutout: '75%',
                plugins: { legend: { display: false } }
              }
            });

            new Chart(document.getElementById('fieldChart'), {
              type: 'doughnut',
              data: fieldData,
              options: {
                cutout: '75%',
                plugins: { legend: { display: false } }
              }
            });
          </script>
        </body>
      </html>
    `;


    return (
      <ScrollView contentContainerStyle={styles.container}> 
          <WebView originWhitelist={["*"]} source={{ html: chartHtml }} />        

          { errors && <View style={{ padding: 10, backgroundColor: '#f3f182ff'}}>    
          <Text style={{ color: "red", textAlign: 'center', fontSize: 16  }}>{errors}</Text>
          </View> }

          <View style={styles.chartRow}>         
                  <Text style={styles.label}>Total district covered</Text>
                  <Text style={styles.label1}>{totalDistrict ? totalDistrict : 0}</Text> 
          </View>

          <View style={styles.chartRow}>      
              <Text style={styles.label}>Total block covered</Text>
              <Text style={styles.label1}>{totalBlock ? totalBlock : 0}</Text>
          </View>

          <View style={styles.chartRow}>
              <Text style={styles.label}>Total village covered</Text>
              <Text style={styles.label1}>{totalVillage ? totalVillage : 0}</Text>
          </View>

          <View style={styles.chartRow}>       
              <Text style={styles.label}>Total farmers covered</Text>
              <Text style={styles.label1}>{totalFarmer ?  totalFarmer : 0}</Text> 
          </View>
          <View style={styles.buttonWrapper}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => navigation.navigate("FarmerMeeting")}
              >
                <Text style={styles.buttonText}>Farmer Meeting / Field Day Program</Text>
              </TouchableOpacity>
          </View>
          <AlertWithIcon
            visible={alert.visible}
            title={alert.title}
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ ...alert, visible: false })}
          /> 
      </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,       
    },
    loader: { 
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    label: {
        fontSize: 16,
        fontWeight: "400",
        color: "#1e3a8a", // deep blue
        textAlign: "left",
        paddingVertical: 20,
        paddingHorizontal: 20, 
        
    }, 
    label1: {
        fontSize: 16,
        fontWeight: "400",
        color: "#1e3a8a", // deep blue
        textAlign: "right",
        paddingVertical: 20,
        paddingHorizontal: 20, 
        
    }, 
    chartRow: {
        flexDirection: "row",
        justifyContent: "space-between",        
        borderBottomWidth: 2,
        borderColor: '#ffffff',    
    },       
    buttonWrapper: {
        padding: 16,
        backgroundColor: "#fff",
    },
     button: {
        backgroundColor: "#456cd6ff", // button color
        paddingVertical: 9,
        paddingHorizontal: 20,
        borderRadius: 5,           // rounded corners
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "#ffffff",              // text color
        fontSize: 16,
        fontWeight: "500",
    },
});
export default  FarmerMeetingTarget