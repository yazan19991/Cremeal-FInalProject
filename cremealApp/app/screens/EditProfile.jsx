import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import React, { useEffect, useCallback, useState } from "react";
import { Button } from "@rneui/themed";
import { useNavigation,useFocusEffect } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { TouchableOpacity } from "react-native-gesture-handler";
import {
  user_update_profile,
  user_upload_image,
  Get_User_Rligon_And_Alergens,
} from "../../assets/utils/api/user_api";
import religionData from "../../assets/utils/religionData";
import allergicData from "../../assets/utils/allergicData";
import DropdownComponent from "../components/DropdownComponent";
import MultiSelectComponent from "../components/MultiSelectComponent";
import AppLoader from "../components/AppLoader";
import { useDispatch, useSelector } from 'react-redux';
import { setUserInformation, setUserImage } from '../../redux/slices/userSlice';
import { useIsFocused } from "@react-navigation/native";
import { Toasterror,Toastsuccess } from "../components/alerts";

export function EditProfile() {
  const [isBusy, setBusy] = useState(true);
  const [image, setImage] = useState(null);
  const [allergicTo, setAllergicTo] = useState([]);
  const [religion, setReligion] = useState(null);
  const [UserReligion, UserSetReligion] = useState(null);
  const [UserAllergicTo, UsersetAllergicTo] = useState(null);
  const dispatch = useDispatch();
  const UserImage = useSelector((state) => state.user.userImage);
  const userInfo = useSelector((state) => state.user.userInformation);
  const { navigate } = useNavigation();
  const [Nametext, setNameText] = useState("");
  const [Emailtext, setEmailText] = useState("");
  const isFocused = useIsFocused();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();



  useFocusEffect(
    useCallback(() => {
      if (!isFocused || !userInfo) return;
      const fetchUserReligionAndAllergens = async () => {
        try {
          const result = await Get_User_Rligon_And_Alergens(userInfo);
          console.log("Get_User_Rligon_And_Alergens: ",result.data);
          UserSetReligion(result.data.religion_id);
          UsersetAllergicTo(result.data.allergic_to);
        } catch (err) {
          console.log("Get_User_Rligon_And_Alergens error: " + err);
        }
      };
  
      fetchUserReligionAndAllergens();
      return () => {
      };
    }, [userInfo])
  );
  


  useEffect(() => {
    if (userInfo && UserImage ) {
      setBusy(false);
    }
  }, [userInfo, UserImage]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      
      const imageUri = result.assets[0].uri; 
      const imageUriWithTime = `${imageUri}?t=${Math.floor(Date.now() / 1000)}`;
      user_upload_image(userInfo, imageUriWithTime)
        .then((response) => {
          if (response.status === 200) {
            dispatch(setUserImage(imageUri));
            console.log("Image updated successfully. ",imageUriWithTime);        
            setImage(imageUriWithTime); 

          }
        })
        .catch((err) =>{
          Toasterror("Error", "Failed to update image.");
          console.log("user_upload_image: ", err)})
    }
    
  };



  const LeftArrowOnPress = () => {
    navigate("UserSettings");
  };

  const saveOnPress = (data) => {
    reset();
    const updatedProfile = {
      name: Nametext || userInfo.name,
      email: Emailtext || userInfo.email,
      allergicTo: allergicTo.join(","),
      religion: parseInt(religion, 10)
    };

    user_update_profile(updatedProfile, userInfo.jwtToken)
      .then((result) => {
        if (result.status === 200) {
          const updatedUserInfo = { ...userInfo, ...updatedProfile };
          dispatch(setUserInformation(updatedUserInfo));
          AsyncStorage.setItem("userInformation", JSON.stringify(updatedUserInfo));
          console.log("Profile updated successfully.");
          Toastsuccess("Success", "User profile has been successfully updated.")
        }
      })
      .catch((err) => {
        Toasterror("Error", "Failed to user update profile.");
        console.log("user_update_profile: ", err)})
  };

  return (
    <SafeAreaView style={stylesFn.SafeAreaView}>
      {isBusy ? (
        <AppLoader />
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={stylesFn.SupContainer0}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <AntDesign
                style={stylesFn.BackArrow}
                onPress={LeftArrowOnPress}
                name="arrowleft"
                size={30}
                color="black"
              />
              <Text style={stylesFn.Title}> Edit Profile </Text>
            </View>
          </View>
          <View style={stylesFn.SupContainer1}>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={pickImage}>
                <Image
                  style={stylesFn.profileImg}
                  source={{ uri: image ?? UserImage }}    
                />
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "column",
                  marginHorizontal: "10%",
                  justifyContent: "center",
                }}
              >
                <Text style={stylesFn.NameText}>Welcome,</Text>
                <Text style={stylesFn.NameText}>{userInfo.name}</Text>
              </View>
            </View>
            <View></View>
          </View>

          <View style={stylesFn.SupContainer3}>
            <View>
              <Controller
                control={control}
                render={({ field }) => (
                  <View style={stylesFn.fieldRow2}>
                    <Text>Edit Name</Text>
                    <View style={stylesFn.inputRow2}>
                      <TextInput
                        {...field}
                        style={[stylesFn.input2]}
                        placeholder={userInfo.name}
                        onChangeText={(newText) => setNameText(newText)}
                        onBlur={field.onBlur}
                        value={field.value}
                      />
                    </View>
                  </View>
                )}
                name={"name"}
              />
              {errors.name && (
                <Text style={stylesFn.errorText2}>{errors.name.message}</Text>
              )}

              <Controller
                control={control}
                render={({ field }) => (
                  <View style={stylesFn.fieldRow2}>
                    <Text>Edit Email</Text>
                    <View style={stylesFn.inputRow2}>
                      <TextInput
                        {...field}
                        style={[stylesFn.input2]}
                        placeholder={userInfo.email}
                        onChangeText={(newText) => setEmailText(newText)}
                        onBlur={field.onBlur}
                        value={field.value}
                      />
                    </View>
                  </View>
                )}
                name={"email"}
              />
              {errors.email && (
                <Text style={stylesFn.errorText2}>{errors.email.message}</Text>
              )}
              <Text style={{ textAlign: "center" }}>
                -------------------------
              </Text>
              <DropdownComponent
                data={religionData}
                sendValueToParent={setReligion}
                UserValue={UserReligion}
      
              />

              <MultiSelectComponent
                data={allergicData}
                sendValueToParent={setAllergicTo}
                UserValue={UserAllergicTo}
              />
            </View>
          </View>
          <View style={stylesFn.SupContainer4}>
            <Button
              titleStyle={{ fontSize: 23, color: "#ffff" }}
              buttonStyle={{ width: "100%", backgroundColor: "#0e81cc" }}
              containerStyle={{ marginBottom: "0%", marginHorizontal: "0%" }}
              onPress={handleSubmit(saveOnPress)}
              title="SAVE"
              radius="5"
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const stylesFn = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  SupContainer0: {
    flex: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: "7%",
  },
  SupContainer1: {
    flex: 5,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  SupContainer3: {
    flex: 20,
    marginHorizontal: "7%",
  },
  SupContainer4: {
    flex: 10,
    marginHorizontal: "7%",
  },
  profileImg: {
    height: 80,
    width: 80,
    borderRadius: 40,
  },

  Title: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "900",
  },
  text: {
    paddingVertical: "3%",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    width: "100%",
    padding: 10,
    backgroundColor: "#eeeeee",
  },
  input2: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    padding: 8,
    marginVertical: 5,
  },
  errorText2: {
    color: "red",
    marginBottom: 10,
  },
  inputRow2: {
    flexDirection: "row",
    borderColor: "black",
    borderWidth: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  fieldRow2: {
    marginTop: 5,
  },
});


