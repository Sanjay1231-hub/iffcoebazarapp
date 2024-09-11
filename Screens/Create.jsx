import React, { useState } from 'react';
import { View, Text, Image, StyleSheet ,Modal, Alert,Keyboard,KeyboardAvoidingView } from 'react-native';

import {TextInput,Button} from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker';
//import * as Permissions from 'expo-permissions';

const Create = ({navigation,route}) => {
  const [picture, setPicture] = useState(null);

  const handleSelectPicture = () => {
    // Logic to select a picture and update the state
    // Example: setPicture(selectedPicture);
  };
  const getDetails=(type)=>{
    
    if(route.params){
      switch(type){
        case "Name":
            return route.params.Name
        case "phone":
            return route.params.phone
        case "email":
            return route.params.email         
        case "position":
                return route.params.position     

      }
    }
      return ""
  }

    const [Name,setName] = useState(getDetails("Name"))
    const [phone,setPhone] = useState(getDetails("phone"))
    const [email,setEmail] = useState(getDetails("email"))
    const [position,setPosition] = useState(getDetails("position"))

    const [modal,setModal] = useState(false)
    const [enableshift,setenableShift]=useState(false)

    const submitData=()=>{
        fetch("http://a4a938cb.ngrok.io/send-data",{
          method: "post",
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({
            Name,
            email,
            phone,
            picture,
            salary,
            position
          })
        }).then(res=>res.json()).then(data=>{
          Alert.alert(`${data.Name}  is saved successfully`)
          navigation.navigate("Home")
        }).catch(err=>{
          Alert.alert("something went wrong")
        })
}

const updateDetails=()=>{
  fetch("http://a4a938cb.ngrok.io/update",{
    method: "post",
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      id:route.params._id,
      Name,
      email,
      phone,
      picture,
      salary,
      position
    })
  }).then(res=>res.json()).then(data=>{
    Alert.alert(`${data.Name}  is updated successfully`)
    navigation.navigate("Home")
  }).catch(err=>{
    Alert.alert("something went wrong")
  })
}

    const pickFromGallery = async ()=>{
        const{granted}= await Permissions.askAsync(Permissions.CAMERA_ROLL)
        if(granted){
              let data= await ImagePicker.launchImageLibraryAsync({
                 mediaTypes:ImagePicker.MediaTypeOptions.Images,
                 allowsEditing:true,
                 aspect:[1,1],
                 quality:0.5
 
                })
                console.log(data)
        
        if(!data.cancelled){
         let newfile={
           uri:data.uri,
           type:`test/${data.uri.split(".")[1]}`,
           name:`test.${data.uri.split(".")[1]}`
          }
          handleUpload(newfile)
       }
       }  else{
            Alert.alert("you need to give permission to work")
        }
       }

       const pickFromCamera = async ()=>{
        const{granted}= await Permissions.askAsync(Permissions.CAMERA)
        if(granted){
              let data= await ImagePicker.launchCameraAsync({
                 mediaTypes:ImagePicker.MediaTypeOptions.Images,
                 allowsEditing:true,
                 aspect:[1,1],
                 quality:0.5
 
                })
               console.log(data)
        
        if(!data.cancelled){
          let newfile={
            uri:data.uri,
            type:`test/${data.uri.split(".")[1]}`,
            name:`test.${data.uri.split(".")[1]}`
           }
           handleUpload(newfile)
        }
      }else{
            Alert.alert("you need to give permission to work")
        }
       }

       const handleUpload=(image)=>{
        const data=new FormData()
         data.append('file',image)
         data.append('upload_preset','employeeapp')
         data.append("cloud_name","anonymous-123")
  
  fetch("https://api.cloudinary.com/v1_1/anonymous-123/image/upload",{
       method:"post",
       body:data
   }).then(res=>res.json()).
      then(data=>{
        console.log(data)
        setpicture(data.url)
        setModal(false)
      }).catch(err=>{
        Alert.alert("error while uploading")
      })
    
  
      }

  return (
    <KeyboardAvoidingView behaviour="position" style={styles.root} enabled={enableshift}>  
    <View>
    <TextInput
       label='Name'
       style={styles.inputStyle}
       value={Name}
       theme={theme}
       onFocus={()=>setenableShift(false)}
       mode="outlined"
       onChangeText={text => setName(text)}
     />
     
     <TextInput
       label='Email'
       style={styles.inputStyle}
       value={email}
       theme={theme}
       onFocus={()=>setenableShift(false)}
       mode="outlined"
       onChangeText={text => setEmail(text)}
     />
     <TextInput
       label='Phone'
       style={styles.inputStyle}
       value={phone}
       theme={theme}
       onFocus={()=>setenableShift(false)}
       keyboardType="number-pad"
       mode="outlined"
       onChangeText={text => setPhone(text)}
     />
   
<TextInput
               label='position'
               style={styles.inputStyle}
               value={position}
               theme={theme}
                onFocus={()=>setenableShift(true)}
               mode="outlined"
               onChangeText={text =>setPosition(text)}
           />
    <Button 
   style={styles.inputStyle}
   icon={picture==""?"upload":"check"} 
    mode="contained" 
    theme = {theme}
    onPress = {() => setModal(true)}>
               UPLOAD IMAGE
     </Button>
   {(route.params?
    <Button 
   style={styles.inputStyle}
   icon="content-save" 
    mode="contained" 
    theme = {theme}
    onPress = {() => updateDetails()}>
             UPDATE DETAILS
     </Button>
    :
    <Button 
    style={styles.inputStyle}
    icon="content-save" 
     mode="contained" 
     theme = {theme}
     onPress = {() => submitData()}>
              Save
      </Button> 
     
   )}
       <Modal
       animationType="slide"
       transparent={true}
       visible={modal}
       onRequestClose={()=>{
         setModal(false)
       }}
     > 
      
      <View style={styles.modalView}> 
             <View style={styles.modalButtonView}> 
                     <Button icon="camera"
                      theme = {theme}
                      mode="contained" 
                      onPress={() => pickFromCamera()}>
                         Camera
                     </Button>  

                     <Button 
                     icon="image-area" 
                     mode="contained" 
                     theme = {theme}
                        onPress={() => pickFromGallery()}>
                         Gallery
                   </Button>  
          </View>
       <Button 
        theme = {theme}
       onPress={() => setModal(false)}>
               Cancel
          </Button>   
      </View>     
      </Modal>
     
 </View>
 </KeyboardAvoidingView>
    
  );
};
const theme ={
    colors:{
        primary:"#006aff"
    }
};
const styles=StyleSheet.create({
    root:{
        flex:1
    },
    inputStyle:{
        margin:5
    },
    modalView:{
      position:"absolute",
      bottom:2,
      width:"100%",
      backgroundColor:"white"
    },
    modalButtonView:{
      flexDirection:"row",
      justifyContent:"space-around",
      padding:10
    }
});
export default Create;
