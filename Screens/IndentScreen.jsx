import React, { useState, useEffect, useCallback, memo } from "react";
import {  View, Text, TextInput, FlatList, TouchableOpacity, Modal, StyleSheet, Platform, ActivityIndicator, ScrollView, Alert  } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import AlertWithIcon from '../Component/AlertWithIcon';

const API_TOKEN = 'IEBL0001'; // Move to environment variable in production

export default function IndentScreen() {
    const [products, setProducts] = useState([]);
     const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "" });
    // Form state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productDescShort, setProductDescShort] = useState(null);
    const [selectedPrdCd, setSelectedPrdCd] = useState(null);
    const [selectedBagCd, setSelectedBagCd] = useState(null);
    const [rate, setRate] = useState("");
    const [selectedRate, setSelectedRate] = useState("");
    const [qty, setQty] = useState("");
    const [selectedRateId, setSelectedRateId] = useState("");
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [rateModalVisible, setRateModalVisible] = useState(false);
    const [maxId, setMaxId] = useState(null); // State to store orderId

    // Sample product list (replace with your API data)
    const [productLov, setProductLov] = useState();
    const [searchQuery, setSearchQuery] = useState("");
    //const [filteredData, setFilteredData] = useState([]); 
    const [filteredData, setFilteredData] = useState([]);


      // Fetch Order ID when the component mounts
        useEffect(() => {
            fetchMaxId();
        }, []);

    const fetchMaxId = async () => {
        try {
            const postData = {
                token: API_TOKEN,
                apiId: "47",
                inApiParameters: [],
            };

            const response = await fetch("https://ebazarapi.iffco.in/API", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "ReactNativeApp/1.0",
                    Accept: "application/json",
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
                throw new Error("Invalid JSON response received.");
            }

            // ✅ API returns MAX_INDENT_NO, not MAX_ORDER_ID
            if (result?.output && Array.isArray(result.output)) {
                //console.log('indent form max id',  result.output[0]?.MAX_INDENT_NO);
            const maxIndentNo = result.output[0]?.MAX_INDENT_NO;
             setMaxId(maxIndentNo);            
            }
        } catch (error) {
            setAlert({
            visible: true,
            title: "Error",
            message: "Failed to fetch Order ID from API.",
            type: "error",
            });
        }
    };

    const openModalProd = () => {
        fetchProduct();
        setModalVisible(true);
    };


    const fetchProduct = async () => {
        try {

           const values = await AsyncStorage.multiGet(['username', 'officeCode', 'userType']);
            const sessionData = Object.fromEntries(values);
            //console.log(sessionData.officeCode);


            const loggedInEmpStore = await AsyncStorage.getItem('officeCode');  
            //console.log("logged office", loggedInEmpStore);

            // const postData = {
            //     token: API_TOKEN,
            //     apiId: "32",                
            //     inApiParameters: [
            //         { label: 'P_LOV_TYPE', value: "P" },               
            //         { label: 'P_FSC_CD', value: loggedInEmpStore },               
            //         { label: 'P_PRD_CD', value: "" },               
            //         { label: 'P_BAG_CD', value: "" },               
            //         { label: 'P_BILLNO', value: "" },
            //         { label: 'P_STATE_CD', value: "" },
            //     ],
            // };

            const postData = {
                token: API_TOKEN,
                apiId: "3",                
                inApiParameters: [                            
                    
                ],
            };
               //console.log('indent form JSON parse postData:', JSON.stringify(postData));
        
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
                setProductLov(result.output);
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

    const fetchRate = async (productCode, BagCode) => {
        try {
            const BagCd = BagCode;
            const PrdCd = productCode;
            const loggedInEmpStore = await AsyncStorage.getItem('officeCode');
            const loggedState = await AsyncStorage.getItem('stateCd'); 

            // const postData = {
            //     token: API_TOKEN,
            //     apiId: "32",                
            //     inApiParameters: [
            //         { label: 'P_LOV_TYPE', value: "R" },               
            //         { label: 'P_FSC_CD', value: loggedInEmpStore },               
            //         { label: 'P_PRD_CD', value: PrdCd },               
            //         { label: 'P_BAG_CD', value: BagCd },               
            //         { label: 'P_BILLNO', value: "" },
            //         { label: 'P_STATE_CD', value: loggedState },
            //     ],
            // };


            const postData = {
                token: API_TOKEN,
                apiId: "49",                
                inApiParameters: [
                    { label: 'P_FSC_CD', value: loggedInEmpStore },   
                    { label: 'P_STATE_CD', value: loggedState },            
                    { label: 'P_PRD_CD', value: PrdCd },               
                  
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

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
    };

     const formatDate = (date) => {
        if (!date) return '--Select--';
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Helper function to format date as dd-mm-yyyy
    const formatDateddmmyyyy = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;   // <-- dd-mm-yyyy
    };

    const formatDateDDMMYY = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear()).slice(-2); // last 2 digits
        return `${day}-${month}-${year}`;   // <-- dd-mm-yy
    };


    const handleAddProduct = () => {
        // Validate required fields (Product & Quantity only)
        if (!selectedProduct || !qty) {
            let missingFields = [];
            if (!selectedProduct) missingFields.push("Product");
            if (!qty) missingFields.push("Quantity");

            setAlert({
            visible: true,
            title: "Validation Error",
            message: `Please fill the following field(s): ${missingFields.join(", ")}`,
            type: "warning",
            });
            return;
        }

        // Use 0 if rate not provided or invalid
        const rateValue = parseFloat(selectedRate);
        const validRate = isNaN(rateValue) ? 0 : rateValue;

        // Calculate total (rate * qty)
        const total = validRate * parseFloat(qty);

        // Create product entry
        const newItem = {
            id: Date.now().toString(),
            product: selectedProduct,
            productCode: selectedPrdCd,
            productDesc: productDescShort,
            rate: validRate,
            rateId: selectedRateId || '',
            qty: parseInt(qty, 10),
            total,
            date: formatDateddmmyyyy(date),
            datedisplay: formatDateDDMMYY(date),
        };

        // Add item to product list
        setProducts((prev) => [...prev, newItem]);

        // Reset form fields
        setSelectedProduct(null);
        setProductDescShort(null);
        setSelectedRate("");
        setSelectedRateId("");
        setQty("");
    };

   

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim()) {
        const filtered = productLov.filter(item =>
            item?.PRD_DESC?.toLowerCase().includes(query.toLowerCase()) || 
            item?.PRD_CD?.toLowerCase().includes(query.toLowerCase()) 

        );
        setFilteredData(filtered);
        } else {
        setFilteredData(productLov);
        }
    };

    // ✅ Memoized row component to avoid re-rendering
    const ProductRow = memo(({ item, onSelect, styles }) => (
        <TouchableOpacity onPress={() => onSelect(item)}>
            <View style={styles.row}>
            <Text style={[styles.cell, { flex: 2.5, textAlign: "left" }]}>
                {item.PRD_DESC || "No Data"}
            </Text>
            <Text style={[styles.cell, { flex: 0.8, textAlign: "left" }]}>
                {item.PRD_CD || "No Prd Code"}
            </Text>
            </View>
        </TouchableOpacity>
    ));

        // ✅ Stable renderItem
    const renderItem = useCallback(
        ({ item }) => (
        <ProductRow item={item} onSelect={handleSelect} styles={styles} />
        ),
        [handleSelect, styles]
    );

    // ✅ Stable key extractor
    const keyExtractor = useCallback(
        (item) => item.PRD_CD?.toString() || item.PRD_DESC || Math.random().toString(),
        []
    );
            
    const handleSelect = (item) => {

        //console.log("selected values", item);
        setSelectedProduct(item.PRD_DESC);
        setProductDescShort(item.PRD_DESC_SHORT);
        setSelectedPrdCd(item.PRD_CD);
        setSelectedBagCd(item.BAG_CD);
        openRateModal(item.PRD_CD, item.BAG_CD); 
        setModalVisible(false); // close modal after selection
        setSearchQuery("");
    };

    const openRateModal = (productCode, BagCode) => {
         // Check if productCode is null or empty
        if (!productCode || productCode.trim() === '') {           
            setAlert({ visible: true, title: "Validation Error", message: "Product Not Selected, Please select a product to proceed.", type: "warning" });
            return; // Exit the function if productCode is empty
        }

        fetchRate(productCode, BagCode);
        setRateModalVisible(true);
    };  

    const selectRate = (item) => {       
        setSelectedRate(String(item.NETT_RATE)); // 👈 force string
        setSelectedRateId(item.RATE_ID);
        setRateModalVisible(false); 
        //console.log("Selected Rate Is: ", item.NETT_RATE);
    };



    // const handleDeleteProduct = (id) => {
    //     setProducts((prev) => prev.filter((item) => item.id !== id));
    // };
    
    const handleDeleteProduct = (id) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this product?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                    setProducts((prev) => prev.filter((item) => item.id !== id));
                    },
            },
            ],
            { cancelable: true }
        );
    };


    const handleSubmit = async () => {
        setAlert(a => ({ ...a, visible: false })); // clear old alerts

        // 🚨 Validate form
        if (!products || products.length === 0) {
            setAlert({
            visible: true,
            title: "Validation Error",
            message: "Please add at least one product.",
            type: "warning",
            });
            return;
        }

        const loggedInEmpStore = await AsyncStorage.getItem("officeCode") || "";
        const loggedState      = await AsyncStorage.getItem("stateCd") || "";
        let loggedUser = await AsyncStorage.getItem('username') || "";

        // If username length is more than 6 characters → set blank value
        if (loggedUser.length > 6) {
        loggedUser = "";
        }
        //console.log("Loggedddd User is", loggedUser);

        try {
            for (let index = 0; index < products.length; index++) {
            const row = products[index];

            const dataToSubmit = [
                { label: "P_INDENT_NO", value: String(maxId) },
                { label: "P_INDENT_SNO", value: String(index + 1) },
                { label: "P_RATE_ID", value: String(row.rateId) },
                { label: "P_QTY", value: String(row.qty) },
                { label: "P_PRD_CD", value: String(row.productCode) },
                { label: "P_REMARKS", value: String(row.date) },
                { label: "P_FSC_CD", value: String(loggedInEmpStore) },
                { label: "OPTR", value: String(loggedUser) },
            ];

            const requestData = {
                token: API_TOKEN,
                apiId: "48",
                inApiParameters: dataToSubmit,
            };

            //console.log("data to submit for indent", dataToSubmit);

            const response = await fetch("https://ebazarapi.iffco.in/API", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                "User-Agent": "ReactNativeApp/1.0",
                Accept: "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch {
                throw new Error("Invalid JSON in server response");
            }

            // ✅ Oracle OUT_PARAM_1 handling
            const out = result.output?.OUT_PARAM_1;
            if (out) {
                const outVal = out.toString().trim();

                if (/ORA-\d+/i.test(outVal) || outVal.toUpperCase().includes("ERROR")) {
                // 🚨 stop immediately if Oracle error
                setAlert({
                    visible: true,
                    title: "Error",
                    message: outVal,
                    type: "error",
                });
                return;
                }
            } else {
                throw new Error("Unexpected server response");
            }
            }

            // ✅ If loop finishes with no Oracle errors → success
            setAlert({
            visible: true,
            title: "Success",
            message: "Indent saved successfully!",
            type: "success",
            });

            // Reset form values
            setProducts([]);
            setSelectedProduct(null);
            setSelectedPrdCd("");
            setProductDescShort("");
            setSelectedRate("");
            setSelectedRateId("");
            setQty("");
            setDate(new Date());
        } catch (err) {
            setAlert({
            visible: true,
            title: "Error",
            message: err.message,
            type: "error",
            });
        }
        };  

  
    return (
        <View style={styles.container}> 
        {/* Product Picker */}
        <Text style={styles.label}>Product<Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.tabInputContainer}>
            <TouchableOpacity
            style={styles.buttonLov}
            onPress={openModalProd}
            //onPress={() => setModalVisible(true)}
            >
            <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
            <TextInput
                style={[styles.input,{width: "100%", color: "#333", backgroundColor: "#f0f0f0", paddingLeft: 35, marginLeft: -30 },]}
                placeholder="--Select Product--"
                value={selectedProduct}
                placeholderTextColor="#a3a3a3"
                editable={false}
            />
        </View>

        {/* Product LOV Modal */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.row}>
                        <Text style={styles.modalTitle}>Product LOV</Text>
                        <Ionicons
                            name="close"
                            size={24}
                            color="black"
                            onPress={() => setModalVisible(false)}
                            style={styles.lovclose}
                        />
                    </View>

                    {/* Search */}
                    <View style={styles.prdRow}>
                        <TextInput
                            style={[styles.searchInput, { width: "95%" }]}
                            placeholder="Search by Product Name"
                            value={searchQuery}
                            onChangeText={handleSearch}
                            placeholderTextColor="#a3a3a3"
                        />
                        <Ionicons
                            name="search"
                            size={22}
                            color="#a3a3a3"
                            style={styles.searchIcon}
                        />
                    </View>

                    {/* Header row */}
                    <View style={styles.header}>
                        <Text style={[styles.headerText, { flex: 2.5, textAlign: "left" }]}>
                            Product Name
                        </Text>
                        <Text style={[styles.headerText, { flex: 0.8, textAlign: "left" }]}>
                            Prd. Cd.
                        </Text>
                    </View>

                   {/* Product List */}
                    <FlatList
                        data={filteredData}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={true}
                        style={styles.flatList}
                        // ✅ Performance props
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        removeClippedSubviews={true}
                        getItemLayout={(data, index) => ({
                        length: 50, // adjust row height if fixed
                        offset: 50 * index,
                        index,
                        })}
                    />


                     <View style={styles.footer}>
                        <Text style={styles.footerText}>Total Records: {(filteredData ? filteredData.length : 0)}</Text>
                    </View>
                </View>
            </View>
        </Modal>

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
                        <Ionicons name="close" size={24} color="black" onPress={() => setRateModalVisible(false)} style={styles.lovclose} />
                    </View>

                    <View style={styles.header}>                           
                        <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Rate Id</Text>
                        <Text style={[styles.headerText, { flex: 1.5, textAlign: 'center' }]}>Expired Date</Text>
                        <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Net Rate</Text>
                    
                    </View>
                    <FlatList
                                data={rate}
                                //keyExtractor={(item, index) => item.ID ? item.ID.toString() + index.toString() : index.toString()}         
                                keyExtractor={(item) => item.RATE_ID.toString()}                    
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => selectRate(item)}>
                                        <View style={styles.row}>                                       
                                            <Text style={[styles.cell, { flex: 1, textAlign: 'left' }]}>
                                            {item.RATE_ID || 'No Data'}
                                            </Text>
                                            <Text style={[styles.cell, { flex: 1.5, textAlign: 'right' }]}>
                                            {item.EXPIRED_DATE ? formatDateddmmyyyy(item.EXPIRED_DATE) : 'No Data'}
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
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Total Records: {rate.length}</Text>
                    </View>
                </View>
            </View>
        </Modal>

        <View style={styles.tabInputContainer}>
            <Text style={[styles.label,{width: "16%"}]}>Rate<Text style={styles.asterisk}>*</Text></Text>
        
            <TouchableOpacity style={styles.buttonLov} onPress={() => openRateModal(selectedPrdCd, selectedBagCd)}>
                <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
            <TextInput
                style={[styles.input, { width: '34%', color: '#333', backgroundColor: '#f0f0f0', paddingLeft: 35, marginLeft: -30 }]}
                placeholder="Rate"
                placeholderTextColor="#a3a3a3"
                keyboardType="decimal-pad"
                value={selectedRate}
                editable={false}
              
            />


            {/* Quantity Input */}
            <Text style={[styles.label,{width: "16%", paddingLeft: 10,}]}>Qty<Text style={styles.asterisk}>*</Text></Text>
            <TextInput
                //style={styles.input}
                style={[styles.input,{width: "34%", color: "#333"},]}
                placeholder="Quantity"
                keyboardType="numeric"
                placeholderTextColor="#a3a3a3"
                value={qty?.toString() || ""}
                onChangeText={(text) => {
                    // Allow only integers
                    const intValue = text.replace(/[^0-9]/g, '');
                    setQty(intValue);
                }}
            />
        </View>
            

        <View style={[ styles.tabInputContainer,{ marginBottom: 10 }]}>
            <Text style={[styles.label,{width: "35%"}]}>Required Date<Text style={styles.asterisk}>*</Text></Text>
            <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[styles.dateButton,{width: "65%"}]}
            >
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
            <DateTimePicker
                value={date || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
            />
            )}
        </View> 

        {/* Add Button */}
        <TouchableOpacity style={styles.addBtn} onPress={handleAddProduct}>
            <Text style={styles.addBtnText}>+ Add Product</Text>
        </TouchableOpacity>


                <View style={styles.tableContainer}>
                    {/* Header */}
                    <View style={styles.listheader}>
                    <Text style={[styles.headerText, { flex: 1.5, textAlign: "center" }]}>Product</Text>
                    <Text style={[styles.headerText, { flex: 0.8, textAlign: "center" }]}>Rate</Text>
                    <Text style={[styles.headerText, { flex: 0.5, textAlign: "center" }]}>Qty</Text>
                    <Text style={[styles.headerText, { flex: 0.8, textAlign: "center" }]}>Total</Text>
                    <Text style={[styles.headerText, { flex: 1, textAlign: "center" }]}>Req. Date</Text>
                    <Text style={[styles.headerText, { flex: 0.3, textAlign: "center" }]}>...</Text>
                    </View>

                    {/* Rows */}
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.tableRow}>
                            <Text style={[styles.cell, { flex: 1, textAlign: "left", display: 'none' }]}>{item.product}</Text>
                            <Text style={[styles.cell, { flex: 1.5, textAlign: "left" }]}>{item.productDesc}</Text>
                            <Text style={[styles.cell, { flex: 0.8, textAlign: "right" }]}>{item.rate}</Text>
                            <Text style={[styles.cell, { flex: 0.5, textAlign: "right" }]}>{item.qty}</Text>
                            <Text style={[styles.cell, { flex: 0.8, textAlign: "right" }]}>{item.total}</Text>
                            <Text style={[styles.cell, { flex: 1, textAlign: "right" }]}>{item.datedisplay}</Text>
                            <TouchableOpacity
                                onPress={() => handleDeleteProduct(item.id)}
                                style={[styles.cell, { flex: 0.3, textAlign: "center" }]}
                            >
                                <AntDesign name="delete" size={20} color="red" />
                            </TouchableOpacity>
                            </View>
                        )}
                        ListFooterComponent={() => {
                            // ✅ Calculate total safely
                            const totalSum = products.reduce(
                            (sum, item) => sum + (Number(item.total) || 0),
                            0
                            );

                            const totalQty = products.reduce(
                            (sum, item) => sum + (Number(item.qty) || 0),
                            0
                            );
                            return (
                            <View style={[styles.tableTotalRow, { borderTopWidth: 1, borderColor: "#ccc", marginTop: 4 }]}>
                                <Text style={[styles.cell, { flex: 1.25, textAlign: "left", fontWeight: "500" }]}>Total:</Text>
                            
                                <Text style={[styles.cell, { flex: 1.23, textAlign: "right", fontWeight: "500"  }]}>{totalQty}</Text>

                                <Text style={[styles.cell, { flex: 0.7, textAlign: "right", fontWeight: "500" }]}>
                                {totalSum.toFixed(2)}
                                </Text>
                                <Text style={[styles.cell, { flex: 1.2 }]}></Text>
                            
                            </View>
                            );
                        }}
                        showsVerticalScrollIndicator={true}
                        style={styles.flatListList}
                        />
                </View>

                

                
   

        

            {/* Save Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>Save Indent</Text>
            </TouchableOpacity>

            <AlertWithIcon
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ ...alert, visible: false })}
            />
        
        </View>
    );
}

const styles = StyleSheet.create({
  container: { 
        flex: 1, 
        padding: 5, 
        backgroundColor: "#fff" 
    },   
    label: {
        fontSize: 16,
        color: '#424242',
        fontWeight: '400',
        letterSpacing: 0.3,       
        paddingVertical: 2, 
        textAlignVertical: 'center',
    },

    asterisk: {
        color: 'red',
        fontSize: 16,
        letterSpacing: 0.3, 
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
    flatListList: {
        flexGrow: 1,
        maxHeight: 300, // Set a maximum height if needed
        //width: '100%',
        backgroundColor: '#fff',
        //width: 400,
    },   
    searchInput: {
        height: 35,
        fontSize: 15,
        letterSpacing: 0.3,
        color: '#333',
        flex: 1,
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
    lovclose: {
        backgroundColor: '#e4e4e4',
        textAlign: 'center',
    },
    dateButton: {
        height: 37,
        flex: 1,
        justifyContent: 'space-around',
        //paddingVertical: 5,
        borderRadius: 4,
        borderColor: '#ccc',
        borderWidth: 1,
        letterSpacing: 0.3,
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 6,
        textAlignVertical: 'center', 
        //verticalAlign: 'middle',
    },
 
    dateText: {
        fontSize: 15,
        textAlign: 'left',
        letterSpacing: 0.3, 
    },

    tabInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 4,
    },
    buttonLov: {
        height: 40,
        width: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#208cf3',
        borderRadius: 4,
        paddingHorizontal: 5,
        zIndex: 1,
    },
    input: {
        height: 40,
        flex: 1,
        fontSize: 15,
        color: '#333',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingLeft: 8,
        textAlignVertical: 'center',
    },  
    addBtn: {
        backgroundColor: "#f8d81fff",
        marginBottom: 20,
        borderRadius: 5,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow for iOS
        shadowColor: '#000', // Color of the shadow
        //shadowColor: '#0368ff', // Color of the shadow
        shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
        shadowOpacity: 0.1, // Transparency of the shadow
        shadowRadius: 5, // Blur effect of the shadow
          // Shadow for Android
         elevation: 3,
    },
    addBtnText: { 
        fontSize: 16,
        color: "#333", 
        textAlign: "center", 
        fontWeight: "500",
        letterSpacing: 0.3,
    },
  

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#dfdfdfff',
    },   
  
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',    
        //paddingHorizontal: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#dfdfdfff', 
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5, 
        //width: 400,
    },
    tableTotalRow: {
        flexDirection: 'row',
        backgroundColor: '#fcfaafff',    
        //paddingHorizontal: 6,
        borderBottomWidth: 2,
        borderBottomColor: '#c2c2c2ff', 
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5, 
        //width: 400,
    },
    tableContainer: {
        flex: 1,  
        padding: 5,  
    },
    header: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#6c80ad',
    },
    listheader: {
        flexDirection: 'row',
        backgroundColor: '#6c80ad',
        //width: 400,
    },   
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
        paddingVertical: 4,
        paddingHorizontal: 4,
        color: '#fff',
        borderRightWidth: 1,
        borderColor: '#FFFFFF',
        letterSpacing: 0.3,
    },
     cell: {
        flex: 1,
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderRightWidth: 1,
        borderColor: '#dfdfdfff',
        width: '100%',        
    },   
    flatList: {
        flexGrow: 1, // This makes the FlatList take the available space
        maxHeight: 400, // Set a maximum height if needed
        width: '100%',
        backgroundColor: '#fff',
    },
    deleteBtn: {  
        flex: 1,
        textAlign: 'center',
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderRightWidth: 1,
        borderColor: '#ccc',
        width: '100%', 
    }, 
    modalContainer: {
        flex: 1,       
        justifyContent: 'center',      
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 2,
        //borderRadius: 0,
        width: '90%',
        alignItems: 'center',
    }, 
    submitButton: {
        //backgroundColor: '#0063B2',
        backgroundColor: '#208cf3',
        marginTop: 10,
        borderRadius: 5,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow for iOS
        shadowColor: '#000', // Color of the shadow
        //shadowColor: '#0368ff', // Color of the shadow
        shadowOffset: { width: 0, height: 4 }, // Shadow offset (x, y)
        shadowOpacity: 0.1, // Transparency of the shadow
        shadowRadius: 5, // Blur effect of the shadow
        
        // Shadow for Android
        elevation: 3, // Elevation for Android shadow
    },
    submitText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '400',
        letterSpacing: 0.3, 
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
});
