import { Keyboard, Dimensions, StyleSheet, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import {  user_register } from "../../assets/utils/api/user_api";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import InputFiled from "../components/InputFiled";
import FormTitle from "../components/FormTitle";
import BackButton from "../components/BackButton";
import DropdownComponent from "../components/DropdownComponent";
import MultiSelectComponent from "../components/MultiSelectComponent";
import religionData from "../../assets/utils/religionData";
import allergicData from "../../assets/utils/allergicData";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const { width, height } = Dimensions.get("window");

const registerSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/[A-Z]/, { message: "least one uppercase letter" })
    .regex(/[a-z]/, { message: "least one lowercase letter" })
    .regex(/^\S*$/, { message: "must not contain spaces" })
    .regex(/[!@#$%^&*()\-_=+{}[\]|;:'",<.>/?\\~`]/, { message: "Password must contain at least one special character" }),
    CPassword: z.string().min(6, { message: "Confirm Password must be at least 6 characters long" }),
}).refine((data) => data.password === data.CPassword, {
  message: "Passwords must match",
  path: ["CPassword"],
});
const RegisterScreen = () => {
  const {
    control,
    handleSubmit,
    formState: { errors }, 
  } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const [submittedData, setSubmittedData] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [nextInputs, setNextInputs] = useState(false);
  const [allergicTo, setAllergicTo] = useState([]);
  const [religion, setReligion] = useState(null);
  const navigation = useNavigation();


  const onContinue = (data) => {
    Keyboard.dismiss();
    console.log(data);
    setSubmittedData(data);
    setNextInputs(true);
  };

  const onSignUp = (data) => {
    user_register({
      name: submittedData.name,
      email: submittedData.email,
      hashedPassword: submittedData.password,
      allergicTo: allergicTo.join(", "),
      religion: religion,
    })
      .then((result) => {
        if (result.status === 200) {
          setResultData(result.data);
          console.log(result.data)
          navigation.navigate('LoginScreen');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const goBack = () => {
    setNextInputs(false);
  };
  return (
    <SafeAreaView>
      <View style={styles.container}>
        {nextInputs && <BackButton callFunction={goBack}/>}
        <FormTitle
          title={nextInputs ? "Additional Info" : "Sign Up"}
          description={
            nextInputs
              ? null
              : "Don't waste any time and start to generate meals now"
          }
          style={{
            marginTop: nextInputs ? (height * 20) / 100 : (height * 4) / 100,
          }}
        />
        <View style={styles.middleSection}>
          {!nextInputs ? (
            <>
              <InputFiled
                placeHolder={"your name here"}
                control={control}
                Label={"User Name"}
                inputName={"name"}
                tiperror={errors.name?.message}
                IsItPassword={false}
              />
              <InputFiled
                placeHolder={"User@email.com"}
                control={control}
                Label={"Email Here"}
                inputName={"email"}
                tiperror={errors.email?.message}
                IsItPassword={false}
              />
              <InputFiled
                placeHolder={"your password"}
                control={control}
                Label={"Password"}
                inputName={"password"}
                tiperror={errors.password?.message}
                IsItPassword={true}
              />
              <InputFiled
                placeHolder={"your password"}
                control={control}
                Label={"Confirm Password"}
                inputName={"CPassword"}
                tiperror={errors.CPassword?.message}
                IsItPassword={true}
              />
            </>
          ) : (
            <>
              <DropdownComponent
                data={religionData}
                sendValueToParent={setReligion}


              />
              <MultiSelectComponent
                data={allergicData}
                sendValueToParent={setAllergicTo}
                reg={true}


              />
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={
            nextInputs ? handleSubmit(onSignUp) : handleSubmit(onContinue)
          }
        >
          <Text style={{ color: "white" }}>
            {nextInputs ? "Sign Up" : "Continue"}
          </Text>
        </TouchableOpacity>
    

        <View
          style={{
            flexDirection: "row",
            gap: 10,
            justifyContent: "center",
            alignItems: "center",
            height: (height * 20) / 100,
            
          }}
        >
          <Text>Don't Have An Account ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
            <Text style={{ color: "#0e82cd" }}>Sign In Here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },

  btn: {
    height: 50,
    backgroundColor: "#0e82cd",
    minWidth: width - 100,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 100,
    borderRadius: 10,
  },
  middleSection: {
    marginVertical: 15,
  },
  splitter: {
    textAlign: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginVertical: 20,
  },
  line: {
    width: 100,
    height: 0,
    borderColor: "gray",
    borderWidth: 1,
  },
});
