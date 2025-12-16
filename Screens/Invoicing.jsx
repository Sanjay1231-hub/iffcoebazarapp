import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Modal, FlatList, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Optional: for the Add icon
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import AlertWithIcon from '../Component/AlertWithIcon';
import { useNavigation } from '@react-navigation/native';

export default function Invoicing() {
    const data = new Array(1).fill(null).map((_, index) => `Item ${index}`);
    // State to manage the rows and their data
    const [rows, setRows] = useState([
        { id: '1', prdname: '', productcode: '', bagcode: '', rate: '', rateId: '', batch: '', qty: '', value: '', batchReq: '' }  // Default row with empty inputs
    ]);
    const [payment, setPayment] = useState([
        { PAYMENT: 'CASH' }
    ]);
    const [customers, setCustomers] = useState([]);
    const [product, setProduct] = useState([]);
    const [filteredProduct, setFilteredProduct] = useState([]);
    const [rate, setRate] = useState([]);
    const [batch, setBatch] = useState([]);
    const [summaryDetail, setSummaryDetail] = useState([]);
    const [showList, setShowList] = useState(false);   
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProductCode, setSelectedProductCode] = useState(false);
    const [selectedBagCode, setSelectedBagCode] = useState(false);  
    const [rateModalVisible, setRateModalVisible] = useState(false);
    const [batchModalVisible, setBatchModalVisible] = useState(false);
    const [prodModalVisible, setProdModalVisible] = useState(false); 
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [selectedCname, setSelectedCname] = useState('');
    const [selectedCustId, setSelectedCustId] = useState(''); 
    const [selectedCustPhone, setSelectedCustPhone] = useState('');
    const [selectedCustState, setSelectedCustState] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // Search query state
    const [searchPrdQuery, setSearchPrdQuery] = useState(''); // Search query state
    const [paymentMethod, setPaymentMethod] = useState('');
    const [selectedTab, setSelectedTab] = useState(null);
    const [orderId, setOrderId] = useState(null); // State to store orderId
    const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });

    const API_BASE_URL = process.env.API_URL || 'https://ebazarapi.iffco.in/API';

      const navigation = useNavigation();

    // Fetch Order ID from API on page load
    const fetchOrderId = async () => {
       
        try {
           
            const postData = {
                token: "IEBL0001",
                apiId: "34",                
                inApiParameters: [],
            };
            //const response = await fetch('https://ebazarapi.iffco.in/API', {
            const response = await fetch(API_BASE_URL, {
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
              } catch (jsonError) {
                //console.error('JSON parse error:', jsonError);
                throw new Error('Invalid JSON response received.');
              }
              const responseData = result.output;
              const branchCode = await AsyncStorage.getItem('officeCode'); // Get branch code
        
              if (result?.output && Array.isArray(result.output)) {
                const newOrderId = incrementOrderId(responseData[0].MAX_ORDER_ID, branchCode);
                //console.log("New MAx No Order ID:", newOrderId);
                setOrderId(newOrderId);
              } else {
                const newOrderId = `MO${branchCode}00001`;
                setOrderId(newOrderId);
                //throw new Error('Unexpected data format received.');
              }
        } catch (error) {
            //console.error("Error fetching Order ID:", error);
            //Alert.alert("Error", "Failed to fetch Order ID from API.");
            setAlert({ visible: true, title: "Error", message: "Failed to fetch Order ID from API.", type: "error" });

        }
    };

    // Increment Order ID
    const incrementOrderId = (lastOrderNumber, branchCode) => {
        const newOrderNumber = (parseInt(lastOrderNumber, 10) + 1).toString().padStart(5, "0");
        return `MO${branchCode}${newOrderNumber}`;
    };

    // Fetch Order ID when the component mounts
    useEffect(() => {
        fetchOrderId();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);         
        if (isNaN(date.getTime())) {
            return 'Invalid Date';  // Return a fallback message
        }  
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const fetchCustomers = async () => {
        try {
            const loggedInEmpStore = await AsyncStorage.getItem('officeCode');
            const loggedState = await AsyncStorage.getItem('stateCd'); 
            const postData = {
                token: "IEBL0001",
                apiId: "32",                
                inApiParameters: [
                    { label: 'P_LOV_TYPE', value: "C" },               
                    { label: 'P_FSC_CD', value: loggedInEmpStore },               
                    { label: 'P_PRD_CD', value: "" },               
                    { label: 'P_BAG_CD', value: "" },               
                    { label: 'P_BILLNO', value: "" },
                    { label: 'P_STATE_CD', value: loggedState },
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
                //console.warn('Non-200 response:', response.status);
                //console.warn('Raw response body:', responseText);
                throw new Error(`HTTP error! Status: ${response.status}`);
                }
        
              let result;
              try {
                result = JSON.parse(responseText);
              } catch (jsonError) {
                //console.error('JSON parse error:', jsonError);
                throw new Error('Invalid JSON response received.');
              }
        
              if (result?.output && Array.isArray(result.output)) {
                setCustomers(result.output);
                setFilteredData(result.output);
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

    const fetchProduct = async () => {
        //console.log("button pressed");
        try {
            const loggedInEmpStore = await AsyncStorage.getItem('officeCode');            
            const postData = {
                token: "IEBL0001",
                apiId: "32",                
                inApiParameters: [
                    { label: 'P_LOV_TYPE', value: "P" },               
                    { label: 'P_FSC_CD', value: loggedInEmpStore },               
                    { label: 'P_PRD_CD', value: "" },               
                    { label: 'P_BAG_CD', value: "" },               
                    { label: 'P_BILLNO', value: "" },
                    { label: 'P_STATE_CD', value: "" },
                ],
            };

             //console.log('JSON parse postData:', JSON.stringify(postData));
        
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
        
              if (text.trim().startsWith('<')) {
                throw new Error('Received HTML instead of JSON. API may be down or URL might be wrong.');
              }
        
              let result;
              try {
                result = JSON.parse(text);
              } catch (jsonError) {
                //console.error('JSON parse error:', jsonError);
                throw new Error('Invalid JSON response received.');
              }
        
              if (result?.output && Array.isArray(result.output)) {
                setProduct(result.output);
                setFilteredProduct(result.output);
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

    const fetchRate = async (productCode, BagCode) => {
        try {
            const BagCd = BagCode;
            const PrdCd = productCode;
            const loggedInEmpStore = await AsyncStorage.getItem('officeCode');
            const loggedState = await AsyncStorage.getItem('stateCd'); 

            const postData = {
                token: "IEBL0001",
                apiId: "32",                
                inApiParameters: [
                    { label: 'P_LOV_TYPE', value: "R" },               
                    { label: 'P_FSC_CD', value: loggedInEmpStore },               
                    { label: 'P_PRD_CD', value: PrdCd },               
                    { label: 'P_BAG_CD', value: BagCd },               
                    { label: 'P_BILLNO', value: "" },
                    { label: 'P_STATE_CD', value: loggedState },
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
        
              if (text.trim().startsWith('<')) {
                throw new Error('Received HTML instead of JSON. API may be down or URL might be wrong.');
              }
        
              let result;
              try {
                result = JSON.parse(text);
              } catch (jsonError) {
                //console.error('JSON parse error:', jsonError);
                throw new Error('Invalid JSON response received.');
              }
        
              if (result?.output && Array.isArray(result.output)) {
                setRate(result.output);
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

    const fetchBatch = async (productCode, BagCode) => {
        try {
            const loggedInEmpStore = await AsyncStorage.getItem('officeCode');    
            const BagCd = BagCode;
            const PrdCd = productCode;

            const postData = {
                token: "IEBL0001",
                apiId: "32",                
                inApiParameters: [
                    { label: 'P_LOV_TYPE', value: "B" },               
                    { label: 'P_FSC_CD', value: loggedInEmpStore },               
                    { label: 'P_PRD_CD', value: PrdCd },               
                    { label: 'P_BAG_CD', value: BagCd },               
                    { label: 'P_BILLNO', value: "" },
                    { label: 'P_STATE_CD', value: "" },
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
                //console.warn('Non-200 response:', response.status);
                //console.warn('Raw response body:', responseText);
                throw new Error(`HTTP error! Status: ${response.status}`);
                }
        
              let result;
              try {
                result = JSON.parse(responseText);
              } catch (jsonError) {
                //console.error('JSON parse error:', jsonError);
                throw new Error('Invalid JSON response received.');
              }
        
              if (result?.output && Array.isArray(result.output)) {
                setBatch(result.output);
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

    // Toggle visibility of the customer list
    const toggleCustomerTab = () => {
        setSelectedTab((prevTab) => (prevTab === 'customer' ? null : 'customer'));
               
    };
    // Toggle visibility of the product list
    const toggleProductTab = () => {
        setSelectedTab((prevTab) => (prevTab === 'product' ? null : 'product'));
               
    };
        // Toggle visibility of the product list
    const togglePaymentTab = () => {
        setSelectedTab((prevTab) => (prevTab === 'payment' ? null : 'payment'));
        
    };
    // Function to add a new row
    const addRow = () => {
        // Check if the previous row is empty
        const lastRow = rows[rows.length - 1];
        
        if (lastRow) {
            if (lastRow.prdname === '') {
                setAlert({ visible: true, title: "Validation Error", message: "Please enter the product name.", type: "warning" });
                return;
            }
            if (lastRow.productcode === '') {
                setAlert({ visible: true, title: "Validation Error", message: "Please enter the product code.", type: "warning" });
                return;
            }
            if (lastRow.rate === '') {
                setAlert({ visible: true, title: "Validation Error", message: "Please enter the rate.", type: "warning" });
                return;
            }
            if (lastRow.qty === '') {
                setAlert({ visible: true, title: "Validation Error", message: "Please enter the quantity.", type: "warning" });
                return;
            }
        }
    
        // Add a new row if validation passes
        const newRow = {
            id: (rows.length + 1).toString(),
            prdname: '',
            productcode: '',
            bagcode: '',
            rate: '',
            rateId: '',
            batch: '',
            qty: '',
            value: '',
            batchReq: ''
        };      

        // Validation function
        const isValid = (value) => value !== null && value !== undefined && value !== '';

        let validationFailed = false; // Flag to track validation failure

        for (let row of rows) {
            if (!isValid(row.productcode) || !isValid(row.qty) || !isValid(row.bagcode) ||
                !isValid(row.rate) || !isValid(row.rateId)) {
                
                setAlert({ 
                    visible: true, 
                    title: "Validation Error", 
                    message: "One or more required fields are missing or invalid.", 
                    type: "warning" 
                });

                validationFailed = true;
                break; // Exit loop immediately when validation fails
            }

            // ✅ Check batch requirement validation
            if (row.batchReq === 'Y' && !isValid(row.batch)) {
                setAlert({ 
                    visible: true, 
                    title: "Validation Error", 
                    message: "Batch is required for selected product.", 
                    type: "warning" 
                });

                validationFailed = true;
                break; // Exit loop immediately when batch validation fails
            }
        }


        if (validationFailed) return; // Stop execution if validation failed

    
        setRows([...rows, newRow]);
    };  

    const selectProduct = (product, rowId) => {      
               
        setRows(prevRows => 
            prevRows.map(row => 
                row.id === rowId 
                    ? { 
                        ...row, 
                        prdname: product.PRD_DESC, 
                        productcode: product.PRD_CD, 
                        bagcode: product.BAG_CD,
                        rate: '', 
                        rateId: '', 
                        qty: '', 
                        batch: '', 
                        value: '',
                        batchReq: product.BATCH_REQUIRED  // Store batch requirement for this row
                    } 
                    : row
            )
        );
        // Set the selected product and bag codes
        setSelectedProductCode(product.PRD_CD);
        setSelectedBagCode(product.BAG_CD);    
        // Open the rate modal with the selected product and bag code
        openRateModal(product.PRD_CD, product.BAG_CD);    
        // Close the product modal after selecting
        closeModalProd();
    };    

    const selectRate = (rate, rowId) => {
        const updatedRows = rows.map(row =>
        row.id === rowId ? { ...row, rate: rate.NETT_RATE, rateId: rate.RATE_ID } : row
        );
        setRows(updatedRows);
        closeRateModal(); // Close the modal after selecting a product
    };

    const selectBatch = (batch, rowId) => {
        //console.log("batch is:", batch.BATCH);
        const updatedRows = rows.map(row =>
        row.id === rowId ? { ...row, batch: batch.BATCH } : row
        );
        setRows(updatedRows);
        closeBatchModal(); // Close the modal after selecting a product
    };

    const handleInputChange = (text, field, id) => {
        const updatedItems = rows.map(item => {
        if (item.id === id) {
            const updatedItem = { ...item, [field]: text };
            
            // Calculate the new value based on qty and rate
            if (field === 'qty') {
            updatedItem.value = calculateValue(updatedItem.qty, updatedItem.rate); // Set the calculated value
            }
            //console.log("updated value is", updatedItem.value)
            return updatedItem;
        } 
        return item;
        });
        //console.log("updated items is", updatedItems)

        setRows(updatedItems);
    };
        // Function to calculate the value (qty * rate)
    const calculateValue = (qty, rate) => {
        return ((parseFloat(qty) || 0) * parseFloat(rate)).toFixed(2);
    };


    const handleSubmit = async () => {
        // Retrieve stored values from AsyncStorage
        const loggedInEmpStore = await AsyncStorage.getItem('officeCode');
        const loggedState = await AsyncStorage.getItem('stateCd');
        // Validation function
        const isValid = (value) => value !== null && value !== undefined && value !== '';
        let validationFailed = false; // Flag to track validation failure

        for (let row of rows) {
            if (!isValid(row.productcode) || !isValid(row.qty) || !isValid(row.bagcode) ||
                !isValid(row.rate) || !isValid(row.rateId) || !isValid(loggedState) || 
                !isValid(loggedInEmpStore)) {
                
                setAlert({ 
                    visible: true, 
                    title: "Validation Error", 
                    message: "One or more required fields are missing or invalid.", 
                    type: "warning" 
                });

                validationFailed = true;
                break; // Exit loop immediately when validation fails
            }

            // ✅ Check batch requirement validation
            if (row.batchReq === 'Y' && !isValid(row.batch)) {
                setAlert({ 
                    visible: true, 
                    title: "Validation Error", 
                    message: "Batch is required for selected product.", 
                    type: "warning" 
                });

                validationFailed = true;
                break; // Exit loop immediately when batch validation fails
            }
        }

        if (validationFailed) return; // Stop execution if validation failed

        // Continue with API submission if validation passed
        for (let row of rows) {
            const dataToSubmit = [
                { label: "P_ORDER_ID", value: orderId },
                { label: "P_PRODUCTCODE", value: row.productcode },
                { label: "P_QUANTITY", value: row.qty },
                { label: "P_PACKING", value: row.bagcode },
                { label: "P_PRODUNITPRICE", value: row.rate },
                { label: "P_RATE_ID", value: row.rateId },
                { label: "P_PAY_TYPE", value: "C" },
                { label: "P_STATE_CD", value: loggedState },
                { label: "P_FSC_CD", value: loggedInEmpStore },
                { label: "P_BATCH", value: row.batch && row.batch.trim() !== "" ? row.batch : "" },// Send empty string if empty
            ];
            
            const postData = {
                inApiParameters: dataToSubmit,
                token: 'IEBL0001',
                apiId: '33'                       
            };

            //console.log("List of products to submit:", dataToSubmit);

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
                    const errorData = await response.json();
                    throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorData.message}`);
                }

                let result;
                try {
                result = JSON.parse(responseText);
                //console.log("Parsed API result:", result);
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
                //const responseData = result.output;
                const outParam = result.output?.OUT_PARAM_1;
          
                if (outParam) {                    
                    const outVal = outParam.toString().trim();
                    if (/ORA-\d+/i.test(outVal) || outVal.toUpperCase().includes("ERROR")) {
                        // Oracle error → show warning
                        setAlert({
                        visible: true,
                        title: "Warning",
                        message: outVal, // remove "Error:" prefix if present
                        type: "warning",
                        });
                    } else {
                        // Success case
                        setAlert({
                        visible: true,
                        title: "Success",
                        message: outVal,
                        type: "success",
                        });
                    }
                    //setAlert({ visible: true, title: "Success", message: responseData?.OUT_PARAM_1, type: "success" });
                    // Reset customer selection
                    setSelectedCname('');
                    setSelectedCustId('');
                    setSelectedCustPhone('');
                    setSelectedCustState('');
                    setPaymentMethod('');

                    // Reset rows after successful submission
                    setRows(prevRows => 
                        prevRows.map(row => ({
                            ...row,
                            prdname: '',
                            productcode: '',
                            bagcode: '',
                            rate: '',
                            rateId: '',
                            qty: '',
                            batch: '',
                            value: '',
                            batchReq: ''
                        }))
                    );

                } else {
                setAlert({ visible: true, title: "Error", message: "Unexpected server response.", type: "error" });
                }
                //console.log("invoices saved successfully.");
                
            } catch (error) {
                //console.error('Error saving data:', error);
                setAlert({ visible: true, title: "Error", message: `There was an error saving a invoices: ${error.message}`, type: "error" });
            }
        }        
    };

    const summary = async () => {
        // Collect all rows data into an array

        const isValid = (value) => value !== null && value !== undefined && value !== '';

        let validationFailed = false; // Flag to track validation failure

        for (let row of rows) {
            if (!isValid(row.productcode) || !isValid(row.qty) || !isValid(row.bagcode) ||
                !isValid(row.rate) || !isValid(row.rateId)) {
                
                setAlert({ 
                    visible: true, 
                    title: "Validation Error", 
                    message: "One or more required fields are missing or invalid.", 
                    type: "warning" 
                });

                validationFailed = true;
                break; // Exit loop immediately when validation fails
            }

            //  Check batch requirement validation
            if (row.batchReq === 'Y' && !isValid(row.batch)) {
                setAlert({ 
                    visible: true, 
                    title: "Validation Error", 
                    message: "Batch is required for selected product.", 
                    type: "warning" 
                });

                validationFailed = true;
                break; // Exit loop immediately when batch validation fails
            }
        }
        
        if (validationFailed) return; // Stop execution if validation failed

        const summarydata = rows.map(row => ({
            PRD_DESC: row.prdname,
            PRD_CD: row.productcode,
            RATE: row.rate,
            BATCH: row.batch,
            VALUE: row.value,
            QTY: row.qty
        }));

        // Calculate totals
        //const totalQty = summarydata.reduce((sum, item) => sum + item.QTY, 0);
        //const totalValue = summarydata.reduce((sum, item) => sum + item.VALUE, 0);
        
        // Update the summary data if showList is already true
        if (showList) {
            setSummaryDetail(summarydata); // Update the list when it is already shown
            //setSummaryTotal(totalValue); // Update the list when it is already shown
        } else {
            // Toggle the showList state to true (if it is false) and set the data
            setShowList(true);
            setSummaryDetail(summarydata);
             //setSummaryTotal(totalValue); // Update the list when it is already shown
        }
    };

    const handleCustomerSelect = (customer) => {
        setSelectedCname(customer.CNAME); // For example, setting the name in the input field
        setSelectedCustId(customer.CUST_ID.toString());
        setSelectedCustPhone(customer.PHONE);
        setSelectedCustState(customer.CLIENT_STATE);
        closeCustomerModal();
    };

    const openCustomerModal = () => {
        fetchCustomers();
        setModalVisible(true);
    };
    const closeCustomerModal = () => {
        setModalVisible(false);
    };

    const openModalProd = () => {
        fetchProduct();
        setProdModalVisible(true);
    };

    // Close Modal Prod
    const closeModalProd = () => {
        setProdModalVisible(false);
    };

    const openRateModal = (productCode, BagCode) => {
         // Check if productCode is null or empty
        if (!productCode || productCode.trim() === '') {           
            setAlert({ visible: true, title: "Validation Error", message: "Product Not Selected, Please select a product to proceed.", type: "warning" });
            return; // Exit the function if productCode is empty
        }

        setSelectedProductCode(productCode);
        setSelectedBagCode(BagCode);        
        fetchRate(productCode, BagCode);
        setRateModalVisible(true);
    };

    const closeRateModal = () => {
        setRateModalVisible(false);
    };
    const openBatchModal = (productCode, BagCode) => {
            // Check if productCode is null or empty
        if (!productCode || productCode.trim() === '') {
            setAlert({ visible: true, title: "Validation Error", message: "Product Not Selected, Please select a product to proceed.", type: "warning" });
            return; // Exit the function if productCode is empty
        }
        setSelectedProductCode(productCode);
        setSelectedBagCode(BagCode);        
        fetchBatch(productCode, BagCode);
        setBatchModalVisible(true);
    };
    const closeBatchModal = () => {
        setBatchModalVisible(false);
    };
    const openPaymentModal = () => {
        setPaymentModalVisible(true);
		setLoading(false);
        //summary();
    };
    // Calculate the total value
    const calculateTotalValue = () => {
        return rows.reduce((total, row) => total + (parseFloat(row.value) || 0), 0).toFixed(2);
    };

    const RenderCustomerItem = React.memo(({ item, onSelect }) => {
        return (
        <TouchableOpacity onPress={() => onSelect(item)}>
            <View style={styles.row}>
            <Text style={[styles.cell, { flex: 3, textAlign: 'left' }]}>
                {item.CNAME || 'N/A'}
            </Text>
            <Text style={[styles.cell, { flex: 0.6, textAlign: 'right' }]}>
                {item.CUST_ID || 'N/A'}
            </Text>
            <Text style={[styles.cell, { flex: 1.5, textAlign: 'left' }]}>
                {item.PHONE || 'N/A'}
            </Text>
            </View>
        </TouchableOpacity>
        );
    });

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim()) {
          const filtered = customers.filter(item => {
            // Make sure CUST_ID is a string and use optional chaining to safely access other fields
            const custId = item?.CUST_ID ? item.CUST_ID.toString().toLowerCase() : '';
            const cname = item?.CNAME?.toLowerCase() || '';
            const phone = item?.PHONE?.toLowerCase() || '';
      
            return cname.includes(query.toLowerCase()) ||
                   phone.includes(query.toLowerCase()) ||
                   custId.includes(query.toLowerCase());
          });
          setFilteredData(filtered);
        } else {
          setFilteredData(customers);
        }
      };    
      
        const handlePrdSearch = (query) => {
        setSearchPrdQuery(query);
        if (query.trim()) {
          const filtered = product.filter(item => {
            // Make sure PRD_DESC is a string and use optional chaining to safely access other fields
            const custId = item?.PRD_CD ? item.PRD_CD.toString().toLowerCase() : '';
            const cname = item?.PRD_DESC?.toLowerCase() || '';
            const phone = item?.BAG_CD?.toLowerCase() || '';
      
            return cname.includes(query.toLowerCase()) ||
                   phone.includes(query.toLowerCase()) ||
                   custId.includes(query.toLowerCase());
          });
          setFilteredProduct(filtered);
        } else {
          setFilteredProduct(product);
        }
      };  

    const selectPayment = (item) => {
        // Validation function
        const isValid = (value) => value !== null && value !== undefined && value !== '';

        let validationFailed = false; // Flag to track validation failure

        for (let row of rows) {
            if (!isValid(row.productcode) || !isValid(row.qty) || !isValid(row.bagcode) ||
                !isValid(row.rate) || !isValid(row.rateId)) {
                
                setAlert({ 
                    visible: true, 
                    title: "Validation Error", 
                    message: "One or more required fields are missing or invalid.", 
                    type: "warning" 
                });

                validationFailed = true;
                break; // Exit loop immediately when validation fails
            }

            //  Check batch requirement validation
            if (row.batchReq === 'Y' && !isValid(row.batch)) {
                setAlert({ 
                    visible: true, 
                    title: "Validation Error", 
                    message: "Batch is required for selected product.", 
                    type: "warning" 
                });

                validationFailed = true;
                break; // Exit loop immediately when batch validation fails
            }
        }


        if (validationFailed) return; // Stop execution if validation failed

        setPaymentMethod(item.PAYMENT);
        setPaymentModalVisible(false);
        summary();
        togglePaymentTab();
    };
    const removeRow = (rowId) => {
        // Remove the row
        const updatedRows = rows.filter(row => row.id !== rowId);
        const reIndexedRows = updatedRows.map((row, index) => ({
            ...row,
            id: index + 1,  // Reassign ids based on new index
        }));
        
        setRows(reIndexedRows);
    };
  return (    
    <FlatList
        data={data}
        keyExtractor={(index) => index.toString()}
        renderItem={() => ( 
        <View style={styles.container}>
             <View style={styles.ODbuttonContainer}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('InvoiceHistory')}
                >
                <Text style={styles.odText}>Invoice History</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.tabheader}>Product<Text style={styles.asterisk}> *</Text></Text>  
            <TouchableOpacity  onPress={toggleProductTab}>
                <View style={[styles.inputContainer, {marginBottom: 3, paddingRight: 15}]}>    
                        <AntDesign name='shopping-cart' size={24} color="#3d89fc" />           
                        <TextInput
                            style={styles.textInput}
                            placeholder="Select Products"
                            placeholderTextColor="#545454"
                            editable={false}
                            allowFontScaling={false}
                        />            
                        <AntDesign name={selectedTab === 'product' ? 'up' : 'down'} size={20} color="#3d89fc" />
                </View>
            </TouchableOpacity>

            {selectedTab === 'product' && (
            <>
               
                {/* Render the rows with inputs */}            
                <FlatList
                    style={{ width: '100%', height: 'auto' }}
                    data={rows}
                    keyExtractor={item => item.id}
                    renderItem={({ item, index }) => ( 
                                               
                   
                        <View style={styles.Prdcell}>
                            <View style={styles.tabInputContainer}>
                                <TouchableOpacity style={styles.buttonLov} onPress={openModalProd}
                                disabled={!(index === rows.length - 1)}
                                >
                                    <Ionicons name="search" size={20} color="white" />                                   
                                </TouchableOpacity>
                                <TextInput
                                    style={[styles.input, { width: '99%', color: '#333', backgroundColor: '#f0f0f0', paddingLeft: 37, marginLeft: -32}]}
                                    placeholder="--Select Product--"
                                    value={item.prdname}
                                    placeholderTextColor="#a3a3a3"
                                    editable={false} // Make the input non-editable, since the product will be selected from modal
                                     allowFontScaling={false}
                                />
                                <TextInput
                                    style={[styles.input, { width: '100%', color: '#333', backgroundColor: '#f0f0f0', paddingLeft: 37, marginLeft: -32, display: 'none', }]}
                                    placeholder="--Select Product Code--"
                                    value={item.productcode}
                                    placeholderTextColor="#a3a3a3"
                                    editable={false} // Make the input non-editable, since the product will be selected from modal
                                     allowFontScaling={false}
                                />
                                <TextInput
                                    style={[styles.input, { width: '100%', color: '#333', backgroundColor: '#f0f0f0', paddingLeft: 37, marginLeft: -32, display: 'none', }]}
                                    placeholder="--Select Bag Code--"
                                    value={item.bagcode}
                                    placeholderTextColor="#a3a3a3"
                                    editable={false} // Make the input non-editable, since the product will be selected from modal
                                    allowFontScaling={false}
                                />
                                <TextInput
                                    style={[styles.input, { width: '100%', color: '#333', backgroundColor: '#f0f0f0', paddingLeft: 37, marginLeft: -32, display: 'none', }]}
                                    placeholder=""
                                    value={item.batchReq}
                                    placeholderTextColor="#a3a3a3"
                                    editable={false} // Make the input non-editable, since the product will be selected from modal
                                    allowFontScaling={false}
                                />
                               
                                <TouchableOpacity onPress={() => removeRow(item.id)} style={[styles.deleteButton, { marginLeft: -29,}]}>
                                    <View style={styles.deleteContent}>                                    
                                        <Ionicons name="trash-outline" size={18} color="#fff" />
                                    </View>
                                </TouchableOpacity>

                                <Modal
                                    animationType="slide"
                                    transparent={true}
                                    visible={prodModalVisible}
                                    onRequestClose={() => setProdModalVisible(false)}
                                > 
                                    <View style={styles.modalContainer}>
                                        <View style={styles.modalContent}>
                                            {/* Fixed Header */}
                                            <View style={styles.row}> 
                                                <Text style={styles.modalTitle}>Product LOV</Text>
                                                <Ionicons name="close" size={24} color="black" onPress={closeModalProd} style={styles.lovclose} />
                                            </View>
                                            {/* Search Input */}
                                            <View style={styles.prdRow}> 
                                                <TextInput
                                                    style={[styles.searchInput,{ width: '90%'}]}
                                                    placeholder="Search by Product Name"
                                                    value={searchPrdQuery}
                                                    onChangeText={handlePrdSearch}
                                                    placeholderTextColor="#a3a3a3"
                                                     allowFontScaling={false}
                                                />
                                                <Ionicons name="search" size={22} color="#a3a3a3" style={styles.Searchbtn} />
                                            </View>

                                            <View style={styles.header}>                           
                                                <Text style={[styles.headerText, { flex: 4, textAlign: 'center' }]}>Product Name</Text>
                                                <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Prod. Cd.</Text>
                                                <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Bag Cd.</Text>
                                                <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Stock</Text>                        
                                            </View>
                                            {/* Loading Indicator */}
                                            {loading ? (
                                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                    <View style={{ transform: [{ scale: 0.6 }] }}>
                                                        <ActivityIndicator size={50} color="#4a80f5" />
                                                    </View>
                                                </View>
                                            ) : (

                                                    <FlatList
                                                        data={filteredProduct}
                                                        //keyExtractor={(item, index) => item.ID ? item.ID.toString() + index.toString() : index.toString()}         
                                                        keyExtractor={(item) => item.PRD_CD.toString()}                    
                                                        renderItem={({ item }) => (
                                                            <TouchableOpacity onPress={() => selectProduct(item, rows[rows.length - 1].id)}>
                                                                <View style={styles.row}>                                       
                                                                    <Text style={[styles.cell, { flex: 4.7, textAlign: 'left' }]}>
                                                                    {item.PRD_DESC || 'No Data'}
                                                                    </Text> 
                                                                    <Text style={[styles.cell, { flex: 1, textAlign: 'left' }]}>
                                                                    {item.PRD_CD || 'No Prd Code'}
                                                                    </Text>
                                                                    <Text style={[styles.cell, { flex: 1, textAlign: 'left' }]}>
                                                                    {item.BAG_CD || 'No Prd Code'}
                                                                    </Text>
                                                                    <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>
                                                                    {item.STOCK != null ? item.STOCK : '0'}
                                                                    </Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        )}
                                                        initialNumToRender={5}  // Initially render only 20 items
                                                        maxToRenderPerBatch={5}  // Render 20 items per batch as you scroll
                                                        windowSize={5}  // Render a few items above and below the viewport
                                                        showsVerticalScrollIndicator={true}
                                                        style={styles.flatList}
                                                    />                     
                                                )}

                                            <View style={styles.footer}>
                                                <Text style={styles.footerText}>Total Records: {filteredProduct.length}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </Modal>
                            </View> 


                            <View style={styles.tabInputContainer}>
                                <Text style={[styles.label, { paddingRight: 4}]}>Rate:</Text> 
                                <TouchableOpacity style={styles.buttonLov} onPress={() => openRateModal(item.productcode, item.bagcode)} disabled={!(index === rows.length - 1)}>
                                    <Ionicons name="search" size={20} color="#fff" />
                                </TouchableOpacity>
                                <TextInput
                                    style={[styles.input, { width: '29%', color: '#333', backgroundColor: '#f0f0f0', paddingLeft: 37, marginLeft: -28, marginRight: 3 }]}
                                    placeholder=""
                                    value={item.rate}
                                    editable={false}
                                    placeholderTextColor="#a3a3a3"
                                    allowFontScaling={false}
                                />
                                <TextInput
                                    style={[styles.input, { width: '20%', color: '#333', backgroundColor: '#f0f0f0', display: 'none', paddingLeft: 10 }]}
                                    placeholder="--Rate id--"
                                    value={item.rateId}
                                    editable={false}
                                    placeholderTextColor="#a3a3a3"
                                    allowFontScaling={false}
                                    />                               
                               

                                <Modal
                                    animationType="slide"
                                    transparent={true}
                                    visible={rateModalVisible}
                                    onRequestClose={() => setRateModalVisible(false)}
                                > 
                                    <View style={styles.modalContainer}>
                                        <View style={styles.modalContent}>
                                            {/* Fixed Header */}
                                            <View style={styles.row}> 
                                                <Text style={styles.modalTitle}>Rate LOV</Text>
                                                <Ionicons name="close" size={24} color="black" onPress={closeRateModal} style={styles.lovclose} />
                                            </View>

                                            <View style={styles.header}>                           
                                                <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Rate Id</Text>
                                                <Text style={[styles.headerText, { flex: 1.5, textAlign: 'center' }]}>Expired Date</Text>
                                                <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Net Rate</Text>
                                            
                                            </View>
                                            {/* Loading Indicator */}
                                            {loading ? (
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                <View style={{ transform: [{ scale: 0.6 }] }}>
                                                    <ActivityIndicator size={50} color="#4a80f5" />
                                                </View>
                                            </View>
                                            ) : (

                                                    <FlatList
                                                        data={rate}
                                                        //keyExtractor={(item, index) => item.ID ? item.ID.toString() + index.toString() : index.toString()}         
                                                        keyExtractor={(item) => item.RATE_ID.toString()}                    
                                                        renderItem={({ item }) => (
                                                            <TouchableOpacity onPress={() => selectRate(item, rows[rows.length - 1].id)}>
                                                                <View style={styles.row}>                                       
                                                                    <Text style={[styles.cell, { flex: 1, textAlign: 'left' }]}>
                                                                    {item.RATE_ID || 'No Data'}
                                                                    </Text>
                                                                    <Text style={[styles.cell, { flex: 1.5, textAlign: 'right' }]}>
                                                                    {item.EXPIRED_DATE ? formatDate(item.EXPIRED_DATE) : 'No Data'}
                                                                    </Text> 
                                                                    <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>
                                                                    {item.NETT_RATE || 'No Prd Code'}
                                                                    </Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        )}
                                                        initialNumToRender={5}  // Initially render only 20 items
                                                        maxToRenderPerBatch={5}  // Render 20 items per batch as you scroll
                                                        windowSize={5}  // Render a few items above and below the viewport
                                                        showsVerticalScrollIndicator={true}
                                                        style={styles.flatList}
                                                    />                     
                                                )}
                                            <View style={styles.footer}>
                                                <Text style={styles.footerText}>Total Records: {rate.length}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </Modal>

                                {/* <Text style={styles.label}>Batch:</Text>  */}
                                <TouchableOpacity 
                                    style={[styles.buttonLov, item.batchReq === 'N' && { opacity: 0.5, backgroundColor: '#494949ff' }]} 
                                    onPress={() => openBatchModal(item.productcode, item.bagcode)}
                                    disabled={item.batchReq === 'N' || index !== rows.length - 1}
                                >
                                    <Ionicons name="search" size={20} color="#fff" />
                                </TouchableOpacity>
                                <TextInput
                                style={[styles.input, { width: '57%', color: '#333', backgroundColor: '#f0f0f0', paddingLeft: 37, marginLeft: -32 }]}
                                placeholder="--Select Batch--"
                                value={item.batch}
                                editable={false}
                                placeholderTextColor="#a3a3a3"
                                allowFontScaling={false}
                                />
                                

                                <Modal
                                    animationType="slide"
                                    transparent={true}
                                    visible={batchModalVisible}
                                    onRequestClose={() => setBatchModalVisible(false)}
                                > 
                                    <View style={styles.modalContainer}>
                                        <View style={styles.modalContent}>
                                            {/* Fixed Header */}
                                            <View style={styles.row}> 
                                                <Text style={styles.modalTitle}>Batch LOV</Text>
                                                <Ionicons name="close" size={24} color="black" onPress={closeBatchModal} style={styles.lovclose} />
                                            </View>

                                            <View style={styles.header}>                           
                                                <Text style={[styles.headerText, { flex: 2, textAlign: 'center' }]}>Batch</Text>
                                                <Text style={[styles.headerText, { flex: 1.5, textAlign: 'center' }]}>Expirey Date</Text>
                                                <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
                                            
                                            </View>
                                            {/* Loading Indicator */}
                                            {loading ? (
                                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                    <View style={{ transform: [{ scale: 0.6 }] }}>
                                                    <ActivityIndicator size={50} color="#4a80f5" />
                                                </View>
                                                </View>
                                                ) : (

                                                    <FlatList
                                                        data={batch}
                                                        keyExtractor={(item, index) => {
                                                            return item.PRD_DESC && index.toString() ? `${item.PRD_DESC}-${index.toString()}` : index.toString();
                                                        }}
                                                        renderItem={({ item }) => (
                                                            <TouchableOpacity onPress={() => selectBatch(item, rows[rows.length - 1].id)}>
                                                                <View style={styles.row}>                                       
                                                                    <Text style={[styles.cell, { flex: 2.18, textAlign: 'left' }]}>
                                                                    {item.BATCH || 'No Data'}
                                                                    </Text>
                                                                    <Text style={[styles.cell, { flex: 1.6, textAlign: 'right' }]}>
                                                                    {item.EXP_DT ? item.EXP_DT : 'No Data'}
                                                                    </Text> 
                                                                    <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>
                                                                    {item.QTY || 'No Prd Code'}
                                                                    </Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        )}
                                                        initialNumToRender={5}  // Initially render only 20 items
                                                        maxToRenderPerBatch={5}  // Render 20 items per batch as you scroll
                                                        windowSize={5}  // Render a few items above and below the viewport
                                                        showsVerticalScrollIndicator={true}
                                                        style={styles.flatList}
                                                    />                     
                                                )}
                                            <View style={styles.footer}>
                                                <Text style={styles.footerText}>Total Records: {batch.length}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </Modal>

                            </View>
                            <View style={styles.tabInputContainer}>  
                                <Text style={[styles.label, { paddingRight: 12}]}>Qty:</Text> 
                                {/* <TextInput
                                style={[styles.input, { width: '29%', color: '#333', }]}
                                placeholder="Enter Qty"
                                value={item.qty}
                                keyboardType="numeric"
                                onChangeText={(text) => handleInputChange(text, 'qty', item.id)}
                                placeholderTextColor="#a3a3a3"
                                 allowFontScaling={false}

                                /> */}

                                <TextInput
                                    style={[styles.input, { width: '29%', color: '#333' }]}
                                    placeholder="Enter Qty"
                                    value={item.qty?.toString() || ""}
                                    keyboardType="numeric"
                                    onChangeText={(text) => {
                                        // Remove non-digits using regex
                                        const intValue = text.replace(/[^0-9]/g, '');
                                        handleInputChange(intValue, 'qty', item.id);
                                    }}
                                    placeholderTextColor="#a3a3a3"
                                     allowFontScaling={false}
                                    />

                                <Text style={[styles.label, { paddingRight: 5, paddingLeft: 5}]}>Value:</Text> 
                                <TextInput
                                    style={[styles.input, { width: '47%', color: '#333', backgroundColor: '#f0f0f0' }]}
                                    placeholder="Net Value"
                                    value={item.value ? item.value.toString() : ''}
                                    placeholderTextColor="#a3a3a3"
                                    editable={false}
                                    allowFontScaling={false}
                                />
                                
                            </View>                            
                        </View>
                        
                  
                    
                    )}
                    showsVerticalScrollIndicator={true}
                />
          
               
                    
                <View style={styles.totalContainer}>
                    <TouchableOpacity onPress={addRow} style={styles.addNewRow}>  
                        <Text style={{ color: '#333', fontWeight: '500'}}>Add Product</Text>                  
                        <MaterialIcons name="add" size={20} color="#333" />
                    </TouchableOpacity>
                    {rows.length > 0 && (
                    <Text style={styles.totalText}>Total Amount: {calculateTotalValue()}</Text>
                )}
                </View>
               
            </>
            
        )}

        <Text style={[styles.tabheader,{marginTop: 10,}]}>Customer<Text style={styles.asterisk}> *</Text></Text> 
        <TouchableOpacity onPress={toggleCustomerTab}>
            <View style={[styles.inputContainer, {marginBottom: 3, paddingRight: 15}]}>               
                <AntDesign name='user' size={24} color="#3d89fc" />                
                <TextInput
                style={styles.textInput}
                placeholder="Select Customer"
                 placeholderTextColor="#545454"
                editable={false}
                 allowFontScaling={false}
                />            
                <AntDesign name={selectedTab === 'customer' ? 'up' : 'down'} size={20} color="#3d89fc" />   
            </View>
        </TouchableOpacity>

        {selectedTab === 'customer' && (
            // {isListVisible && (
            <View style={styles.Prdcell}>           
                <View style={styles.tabInputContainer}>
                    <TouchableOpacity style={styles.buttonLov} onPress={openCustomerModal}>
                        <Ionicons name="search" size={20} color="white" />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { width: '100%', color: '#333', backgroundColor: '#f0f0f0', paddingLeft: 37, marginLeft: -34}]}
                        placeholder="--Select Customer--"
                        value={selectedCname}
                        editable={false}
                        placeholderTextColor="#a3a3a3"
                         allowFontScaling={false}
                    />                
                    

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    > 
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                {/* Fixed Header */}
                                <View style={styles.row}> 
                                    <Text style={styles.modalTitle}>Customer LOV</Text>
                                    <Ionicons name="close" size={24} color="black" onPress={() => setModalVisible(false)} style={styles.lovclose} />
                                </View>
                                {/* Search Input */}
                                <View style={styles.prdRow}> 
                                    <TextInput
                                        style={[styles.searchInput,{ width: '88%'}]}
                                        placeholder="Search by Name"
                                        value={searchQuery}
                                        onChangeText={handleSearch}
                                        placeholderTextColor="#a3a3a3"
                                         allowFontScaling={false}
                                    />
                                    <Ionicons name="search" size={22} color="#a3a3a3" style={styles.Searchbtn} />
                                </View>
                                

                                <View style={styles.header}>                           
                                    <Text style={[styles.headerText, { flex: 2.8, textAlign: 'center' }]}>Customer Name</Text>
                                    <Text style={[styles.headerText, { flex: 0.7, textAlign: 'center' }]}>ID</Text>
                                    <Text style={[styles.headerText, { flex: 1.5, textAlign: 'center' }]}>Phone</Text>
                                   
                                </View>
                                {/* Loading Indicator */}
                                {loading ? (
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <View style={{ transform: [{ scale: 0.6 }] }}>
                                            <ActivityIndicator size={50} color="#4a80f5" />
                                        </View>
                                    </View>
                                ) : (

                                        <FlatList
                                            data={filteredData}
                                            keyExtractor={(item, index) => item.ID ? item.ID.toString() + index.toString() : index.toString()}                             
                                            renderItem={({ item }) => <RenderCustomerItem item={item} onSelect={handleCustomerSelect} />}
                                            initialNumToRender={5}  // Initially render only 20 items
                                            maxToRenderPerBatch={5}  // Render 20 items per batch as you scroll
                                            windowSize={5}  // Render a few items above and below the viewport
                                            showsVerticalScrollIndicator={true}
                                            style={styles.flatListCustomer}
                                        />                     
                                    )}
                                <View style={styles.footer}>
                                    <Text style={styles.footerText}>Total Records: {filteredData.length}</Text>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>

               
                <View style={{marginHorizontal: 0}}>
                    <View style={styles.Custrow}>
                        <Text style={[styles.label, { marginRight: 40}]}>ID:</Text>
                        <TextInput
                            style={[styles.input, { width: '85%', color: '#333', backgroundColor: '#f0f0f0' }]}
                            value={selectedCustId}
                            editable={false}
                             allowFontScaling={false}
                        />
                    </View>
                    {/* Phone Row */}
                    <View style={styles.Custrow}>
                        <Text style={[styles.label, { marginRight: 11}]}>Phone:</Text>
                        <TextInput
                            style={[styles.input, { width: '85%', color: '#333', backgroundColor: '#f0f0f0' }]}
                            value={selectedCustPhone}
                            editable={false}
                             allowFontScaling={false}
                        />
                    </View>

                                        {/* State Row */}
                    <View style={styles.Custrow}>
                        <Text style={[styles.label, { marginRight: 20}]}>State:</Text>
                        <TextInput
                            style={[styles.input, { width: '85%', color: '#333', backgroundColor: '#f0f0f0' }]}
                            value={selectedCustState}
                            editable={false}
                             allowFontScaling={false}
                        />
                    </View>              
                </View>
               
            </View>
        )}
        
        

        <Text style={[styles.tabheader,{marginTop: 10}]}>Payment<Text style={styles.asterisk}> *</Text></Text>  
        <TouchableOpacity onPress={togglePaymentTab}>
            <View style={[styles.inputContainer, {marginBottom: 3, paddingRight: 15}]}>            
                <AntDesign name='wallet' size={24} color="#3d89fc" />                
                <TextInput
                style={styles.textInput}
                placeholder="Payment Method"
                placeholderTextColor="#545454"
                editable={false}
                 allowFontScaling={false}
                />            
                <AntDesign name={selectedTab === 'payment' ? 'up' : 'down'} size={20} color="#3d89fc" />   
            </View>
        </TouchableOpacity>

        {selectedTab === 'payment' && (
            <View style={[styles.listContainer, {marginBottom: 10}]}>           
                <View style={styles.tabInputContainer}>
                    <TouchableOpacity style={styles.buttonLov} onPress={openPaymentModal}>
                        <Ionicons name="search" size={20} color="white" />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { width: '100%', color: '#333', backgroundColor: '#f0f0f0', paddingLeft: 37, marginLeft: -34}]}
                        placeholder="--Select Payment Method--"
                        value={paymentMethod}
                        editable={false}
                        placeholderTextColor="#a3a3a3"
                         allowFontScaling={false}
                    />                
                   

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={paymentModalVisible}
                        onRequestClose={() => setPaymentModalVisible(false)}
                    > 
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                {/* Fixed Header */}
                                <View style={styles.row}> 
                                    <Text style={styles.modalTitle}>Payment LOV</Text>
                                    <Ionicons name="close" size={24} color="black" onPress={() => setPaymentModalVisible(false)} style={styles.lovclose} />
                                </View>                               
                                

                                <View style={styles.header}>                           
                                    <Text style={[styles.headerText, { flex: 3, textAlign: 'center' }]}>Payment Method</Text>                                    
                                   
                                </View>
                                {/* Loading Indicator */}
                                {loading ? (
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <View style={{ transform: [{ scale: 0.6 }] }}>
          <ActivityIndicator size={50} color="#4a80f5" />
        </View>
                                    </View>
                                ) : (

                                <FlatList
                                data={payment}
                                keyExtractor={(item) => item.PAYMENT.toString()}                    
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => selectPayment(item)}>
                                        <View style={styles.row}>                                       
                                            <Text style={[styles.cell, { flex: 3, textAlign: 'left' }]}>
                                            {item.PAYMENT || 'No Data'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                initialNumToRender={5}  // Initially render only 20 items
                                maxToRenderPerBatch={5}  // Render 20 items per batch as you scroll
                                windowSize={5}  // Render a few items above and below the viewport
                                showsVerticalScrollIndicator={true}
                                style={styles.flatListPayment}
                                />                     
                            )}
                            </View>
                        </View>
                    </Modal>
                </View>               
            </View>
        )}  


        {showList && (
            
                <View style={[styles.headerContainer, { borderWidth: 1, borderColor: '#333', padding: 5}]}>
                    <View style={styles.summaryheader}>
                        <Text style={[styles.summarytab, { width: '75%'}]}>Summary</Text>  
                        <TouchableOpacity style={styles.summarybtn} onPress={summary}>   
                            <AntDesign name='reload' size={20} color="#ede213" />      
                            <Text style={{ paddingHorizontal: 5, color: '#ede213'}}>Reload</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.summarytabs}>
                        <Text style={[styles.headerCell, { flex: 0.5 }]}>SrNo</Text>
                        <Text style={[styles.headerCell, { flex: 3 }]}>Products</Text>
                        <Text style={[styles.headerCell, { flex: 1 }]}>Qty</Text>
                        <Text style={[styles.headerCell, { flex: 1 }]}>Amount</Text>
                    </View>

                    <FlatList
                        data={summaryDetail}
                        keyExtractor={(item, index) => `${item.PRD_CD}-${index}`} // Combine PRD_CD and index for uniqueness
                        renderItem={({ item, index }) => (
                            <View style={{ flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 4 }}>
                            <Text style={{ flex: 0.5, textAlign: 'center' }}>
                                {index + 1} {/* Add 1 to index for serial numbering */}
                            </Text>
                            <Text style={{ flex: 3, textAlign: 'left' }}>
                                {item.PRD_DESC || 'No Data'}
                            </Text>
                            <Text style={{ flex: 1, textAlign: 'right' }}>
                                {item.QTY || 'No Data'}
                            </Text>
                            <Text style={{ flex: 1.5, textAlign: 'right' }}>
                                {item.VALUE || 'No Data'}
                            </Text>
                            </View>
                        )}
                        showsVerticalScrollIndicator={true}
                        style={{ borderBottomWidth: 1, borderColor: '#ccc'}}
                        
                        // 👇 Footer for Total VALUE
                        ListFooterComponent={() => {
                            const totalValue = summaryDetail.reduce(
                            (sum, item) => sum + (parseFloat(item.VALUE) || 0),
                            0
                            );

                            return (
                            <View
                                style={{
                                flexDirection: 'row',
                                paddingVertical: 8,
                                paddingHorizontal: 4,
                                borderTopWidth: 1,
                                borderColor: '#ccc',
                                marginTop: 6,
                                }}
                            >
                                <Text style={{ flex: 4.5, textAlign: 'right', fontWeight: 'bold' }}>
                                Total:
                                </Text>
                                <Text style={{ flex: 1.5, textAlign: 'right', fontWeight: 'bold' }}>
                                {totalValue.toFixed(2)}
                                </Text>
                            </View>
                            );
                        }}
                        />

                      
                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                        <Text style={{ flex: 1,fontSize: 15}}>Customer Name: </Text>
                        <Text style={{ flex: 2,fontSize: 15}}>{selectedCname}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 10  }}>
                        <Text style={{ flex: 1,fontSize: 15}}>Payment Mode: </Text>
                        <Text style={{ flex: 2,fontSize: 15}}>{paymentMethod}</Text>
                    </View>
                </View>
            )}
                   
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>       
            <Text style={styles.saveButtonText}>Save Invoice</Text>
        </TouchableOpacity> 
        {/* Reusable Custom Alert */}
      <AlertWithIcon
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />

    </View>
        
    )}
    showsVerticalScrollIndicator={true}
    />
  );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,       
        paddingHorizontal: 5,
        paddingVertical: 5,
        backgroundColor: '#fff',
    },
    inputContainer: {      
        flexDirection: 'row',
        alignItems: 'center', // centers everything vertically
        justifyContent: 'space-between',
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: '#fff',
        minHeight: 45, // set a consistent container height
        lineHeight: 22,
    },
    summaryheader: {
        flexDirection: 'row',
        width: '100%',  
        justifyContent: 'space-between',  
        //backgroundColor: '#f0f3ff',
        //color: '#333'
    },
    summarybtn: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 32,
        justifyContent: 'center',
        borderColor: '#ede213',
        borderWidth: 2,
        width: '25%',
        paddingHorizontal: 5,   
        borderRadius: 4,
        //backgroundColor: '#6883e3',
        backgroundColor: '#5e5e5c',
        // Shadow for iOS
        shadowColor: '#000', // Color of the shadow
        shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
        shadowOpacity: 0.1, // Transparency of the shadow
        shadowRadius: 5, // Blur effect of the shadow
        // Shadow for Android
        elevation: 5, // Elevation for Android shadow
    },
    listContainer: {
        width: '100%',
        marginTop: 0,
        justifyContent: 'center',
      
        // padding: 3,
        // borderColor: '#ccc',
        // borderWidth: 1,
        // borderRadius: 4,
    }, 
    tabheader: {
        fontSize: 16,
        letterSpacing: 0.3, 
        width: '100%',       
        paddingVertical: 3,        
        paddingHorizontal: 6,       
        backgroundColor: '#208cf3',       
        color: '#fff',
        // Shadow for iOS
        shadowColor: '#000', // Color of the shadow
        shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
        shadowOpacity: 0.1, // Transparency of the shadow
        shadowRadius: 5, // Blur effect of the shadow
        // Shadow for Android
        elevation: 5, // Elevation for Android shadow
    },
    summarytab: {
        fontSize: 15,
        letterSpacing: 0.3,
        //flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        //width: '100%',
        paddingVertical: 4,
        paddingHorizontal: 6,
        backgroundColor: '#faf9af',
        color: '#333',        
    },
    prdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderRadius: 3,
        borderColor: '#ccc',
        paddingHorizontal: 5,
    },  
    label: {
        fontSize: 15,
        letterSpacing: 0.3,
        paddingVertical: 4,       
        justifyContent: 'center',
        color: '#333',
        fontWeight: '400',
        
      },  
    asterisk: {
        color: 'red',
        fontSize: 15,
        letterSpacing: 0.3,
    },
    input: {
        fontSize: 15,
        lineHeight: 20,            // ensures text fits inside input
        minHeight: 35,             // use minHeight instead of fixed height
        letterSpacing: 0.3,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 6,        // vertical breathing space for text
        color: '#333',
        backgroundColor: "#ffffff",
        textAlignVertical: 'center', // Android vertical alignment
    },   
    modalContent: {
        backgroundColor: '#fff',
        padding: 2,
        //borderRadius: 0,
        width: '90%',
        alignItems: 'center',
    },    
    modalItem: {
        fontSize: 16,
        letterSpacing: 0.3,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    searchInput: {
        height: 37,
        fontSize: 15,
        letterSpacing: 0.3,
        color: '#333',
      },
    cell: {
        flex: 1,
        textAlign: 'right',
        paddingRight: 5,
        paddingVertical: 5,
        paddingLeft: 5,
        borderRightWidth: 1,
        borderColor: '#ccc',
        width: '100%',
        
    },   
    Prdcell: {
        //flex: 1,        
        width: '100%',
        borderBottomColor: '#333',
        //borderBottomWidth: 1,
        marginBottom: 5,
        padding: 3,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
    },   
    textInput: {
        flex: 1, // allow it to expand between icons
        fontSize: 16,
        color: '#000',
        paddingVertical: 0, // prevent extra height from internal padding
        paddingHorizontal: 8,
        textAlignVertical: 'center', // ✅ ensures vertical centering on Android
        fontFamily: 'sans-serif',
        },
    buttonLov: {
        minHeight: 35,
        width: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#208cf3',
        borderRadius: 4,
        paddingHorizontal: 4,
        zIndex: 1,
    },
    disabledButton: {
        backgroundColor: "#cccccc", // Gray color for disabled state
      },
    tabInputContainer: {      
        flexDirection: 'row',
        alignItems: 'center', // centers everything vertically
        justifyContent: 'left',      
        marginBottom: 3, 
        
    },
    modalContainer: {
        flex: 1,       
        justifyContent: 'center',      
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalTitle: {
        fontSize: 14,
        color: '#333',
        backgroundColor: '#e4e4e4',
        paddingVertical: 3,
        paddingHorizontal: 3,
        fontWeight: 500,
        width: '93%',
        letterSpacing: 0.3,
    },
    Searchbtn: {
        marginLeft: 15,
    },
    lovclose: {
        backgroundColor: '#e4e4e4',
        textAlign: 'center',
    },
    addNewRow: {
        flexDirection: 'row',
        width: '35%',       
        justifyContent: 'center',       
        //backgroundColor: '#3ed667',        
        backgroundColor: '#f7cd11',        
        paddingHorizontal: 10,
        paddingVertical: 3,     
        color: '#fff',
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#f7cd11',
        shadowColor: '#000', // Color of the shadow
        shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
        shadowOpacity: 0.1, // Transparency of the shadow
        shadowRadius: 5, // Blur effect of the shadow
        // Shadow for Android
        elevation: 5, // Elevation for Android shadow   
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },       
    Custrow: {
        flexDirection: "row",
        justifyContent: 'space-between',
        //alignItems: "center",
        marginBottom: 1,
    },
    header: {
        flexDirection: 'row',
        width: '100%',
        //justifyContent: 'space-between',
        backgroundColor: '#6c80ad',
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 13,
        color: '#fff',
        borderRightWidth: 1,
        borderColor: '#FFFFFF',
        letterSpacing: 0.3,
    },
    flatList: {
        flexGrow: 1, // This makes the FlatList take the available space
        maxHeight: 400, // Set a maximum height if needed
        width: '100%',
        backgroundColor: '#fff',
    },  
    flatListCustomer: {
        flexGrow: 1, // This makes the FlatList take the available space
        height: 350, // Set a maximum height if needed
        width: '100%',
        backgroundColor: '#fff',
    },
    flatListPayment: {
        flexGrow: 1, // This makes the FlatList take the available space
        maxHeighteight: 200, // Set a maximum height if needed
        width: '100%',
        backgroundColor: '#fff',
    },
    footer: {
        paddingVertical: 5,
        width: '100%',
        paddingHorizontal: 5,
        alignItems: 'right',
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#ccc',
    },
    footerText: {
        fontSize: 14,
        //fontWeight: '500',
        color: '#333',
    },
    
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: '#c7c7c7',
        backgroundColor: '#f55105',
        paddingHorizontal: 5,
        //borderWidth: 1,
        //borderColor: '#f55105',
        minHeight: 35,
        borderRadius: 4,
    },
    deleteContent: {
        //flexDirection: 'row',  // Row layout
        //justifyContent: 'right',  // Space between text and icon
        //alignItems: 'center',  // Align text and icon vertically centered
    },
    deleteText: {
        color: '#333',
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    saveButton: {
        marginTop: 10,
        //marginBottom: 30,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#208cf3',
        //backgroundColor: '#244f8f',
        borderRadius: 5,
        width: '100%',
         // Shadow for iOS
        shadowColor: '#000', // Color of the shadow
        shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
        shadowOpacity: 0.1, // Transparency of the shadow
        shadowRadius: 5, // Blur effect of the shadow
        // Shadow for Android
        elevation: 5, // Elevation for Android shadow
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'sans-serif',
        letterSpacing: 0.3,
    },
    totalContainer: {
        //marginTop: 20,
        //padding: 3,
        flexDirection: 'row',
        //paddingHorizontal: 10,
        //paddingVertical: 4,
        justifyContent: 'space-between',
        //borderTopWidth: 1,
        borderTopColor: '#ccc',
        //backgroundColor: '#797b85',
        width: '100%',
    },
    totalText: {
        fontWeight: '400',
        fontSize: 15,
        letterSpacing: 0.3,
        //fontFamily: 'Lato',
        //fontFamily: 'Futura',
        //fontFamily: 'sans-serif',
        width: '64%',
        textAlign: 'center',
        color: '#fff',
        backgroundColor: '#666666',
        paddingVertical: 3
    },
    headerContainer: {
        backgroundColor: '#ffffff', // Header background color   
        zIndex: 1, // Ensure the header is above other components
      },
      summarytabs: {
        flexDirection: 'row',
        width: '100%', 
        backgroundColor: '#f0f3ff',
        color: '#333'
    },
     
      headerCell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 13,
        letterSpacing: 0.3,
        color: '#333',  
        paddingVertical: 2,
        paddingHorizontal: 3,
        //borderRightWidth: 1,
        //borderColor: '#ccc',
      },
      ODbuttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        
    },
    odText: {
        color: '#0000ff',                // Blue text
        textDecorationLine: 'underline', // Underlined
        fontSize: 16,                     // Font size
        fontWeight: '400',                // Normal weight
        letterSpacing: 0.3,               // Slight spacing between letters
        marginBottom: 5,                  // Space below the text
        lineHeight: 20,  
    },
});
