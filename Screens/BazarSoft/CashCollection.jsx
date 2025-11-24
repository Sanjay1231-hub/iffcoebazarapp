import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';

export default function CashCollection() {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [generatedAmount, setGeneratedAmount] = useState('');
  const [generatedName, setGeneratedName] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const expireTimer = useRef(null);

  const isValidAmount = () => {
    const parsed = parseFloat(amount);
    return !isNaN(parsed) && parsed > 0;
  };

  useEffect(() => {
    return () => {
      if (expireTimer.current) clearTimeout(expireTimer.current);
    };
  }, []);
  

  const generateQRCode = () => {
    if (!isValidAmount() || name.trim() === '') return;

    const upiId = 'yourupi@upi'; // Replace with actual UPI ID
    const payeeName = name.trim();
    const merchantCode = '1234';
    const transactionNote = 'IFFCO EBAZAR Purchase';
    const transactionId = 'eBazar' + Date.now();

    const qrValue = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&mc=${merchantCode}&tn=${encodeURIComponent(transactionNote)}&tid=${transactionId}`;

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              background-color: #f5f5f5;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              flex-direction: column;
              font-family: Arial;
            }
            #container {
              position: relative;
              width: 250px;
              height: 250px;
              margin-top: 10px;
            }
            #qrcode {
              width: 100%;
              height: 100%;
            }
            #logo {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 120px;
              height: 50px;
              border-radius: 10px;
            }
          </style>
        </head>
        <body>
          <div>Pay to: <strong>${payeeName}</strong></div>
          <div>Amount: ₹<strong>${amount}</strong></div>
          <div id="container">
            <div id="qrcode"></div>
            <img id="logo" src="https://ebazar.iffco.coop/images/img/iffco-logo.png" />
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
          <script>
            new QRCode(document.getElementById("qrcode"), {
              text: "${qrValue}",
              width: 250,
              height: 250,
              colorDark : "#000000",
              colorLight : "#ffffff",
              correctLevel : QRCode.CorrectLevel.H
            });
          </script>
        </body>
      </html>
    `;

    setHtmlContent(html);
    setGeneratedAmount(amount);
    setGeneratedName(payeeName);
    setAmount('');
    setName('');
    setIsExpired(false);
  
    if (expireTimer.current) clearTimeout(expireTimer.current);
    expireTimer.current = setTimeout(() => {
      setHtmlContent('');
      setIsExpired(true);
    }, 60000); // 60 seconds
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, padding: 20 }}>
        <TextInput
          placeholder="Enter payee name"
          value={name}
          onChangeText={setName}
          style={{
            borderBottomWidth: 1,
            marginBottom: 20,
            fontSize: 18,
            paddingVertical: 8,
          }}
        />
        <TextInput
          placeholder="Enter amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={(text) => {
            // Accept only numeric values (with optional decimals)
            const filtered = text.replace(/[^0-9.]/g, '');
            setAmount(filtered);
          }}
          style={{
            borderBottomWidth: 1,
            marginBottom: 20,
            fontSize: 18,
            paddingVertical: 8,
          }}
        />
        <Button
          title="Generate QR Code"
          onPress={generateQRCode}
          disabled={!isValidAmount() || name.trim() === ''}
        />
        {htmlContent !== '' ? (
            <View style={{ flex: 1, marginTop: 20, alignItems: 'center' }}>
               
                <WebView
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                style={{
                    width: Dimensions.get('window').width - 40,
                    height: Dimensions.get('window').width - 40,
                }}
                key={htmlContent}
                />
            </View>
            ) : isExpired ? (
            <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={{ fontSize: 16, color: 'red' }}>QR Code expired</Text>
            </View>
        ) : null}

      </View>
    </KeyboardAvoidingView>
  );
}
