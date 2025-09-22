import React, { useState } from 'react';
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

export default function PaymentQRCode() {
  const [amount, setAmount] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [generatedAmount, setGeneratedAmount] = useState('');

  const isValidAmount = () => {
    const parsed = parseFloat(amount);
    return !isNaN(parsed) && parsed > 0;
  };

  const generateQRCode = () => {
    if (!isValidAmount()) return;

    const upiId = 'yourupi@upi'; // Replace with actual UPI ID
    const payeeName = 'Your Name';
    const merchantCode = '1234';
    const transactionNote = 'IFFCO Purchase';
    const transactionId = 'TXN' + Date.now();

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
            }
            #container {
              position: relative;
              width: 250px;
              height: 250px;
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
              width: 50px;
              height: 50px;
              border-radius: 10px;
            }
          </style>
        </head>
        <body>
          <div id="container">
            <div id="qrcode"></div>
            <img id="logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/IFFCO_Logo.svg/2560px-IFFCO_Logo.svg.png" />
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
    setAmount(''); // reset input
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, padding: 20 }}>
        <TextInput
          placeholder="Enter amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
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
          disabled={!isValidAmount()}
        />
        {htmlContent !== '' && (
          <View style={{ flex: 1, marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
              Amount: ₹{generatedAmount}
            </Text>
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
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
