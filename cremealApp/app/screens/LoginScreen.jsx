import { Keyboard, Dimensions, StyleSheet, Text, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import {  useState ,useEffect} from "react";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import {  user_login ,user_login_google} from "../../assets/utils/api/user_api";
import { AntDesign } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AppLoader from "../components/AppLoader";
import {Toastwarning} from "../components/alerts";
import { setUserInformation ,setUser_login_google} from '../../redux/slices/userSlice';
import { useDispatch } from 'react-redux';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [submittedData, setSubmittedData] = useState(null);
  const [youCanSeePassword, setYouCanSeePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const webClientId = process.env.EXPO_PUBLIC_WebClientId;
    GoogleSignin.configure({
      webClientId: webClientId,
    });
  }, []);



  const signin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      asdfasdf = await user_login_google({
        idToken: user.idToken,
      })
        .then(async (result) => {
          // Make the callback function async
          if (result && result.data && result.status == 200) {
            console.log("result: ---- ", result.data)
            dispatch(setUserInformation(result.data.user));
            AsyncStorage.setItem(
              "userInformation",
              JSON.stringify(result.data.user)
            );
            dispatch(setUser_login_google(result.data.signedFirstTime));
            navigation.navigate("HomeScreen");
          } else if (
            (result.response.status == "400" &&
              result.response.data ==
                "Something went wrong no user retuerned") ||
            (result.response.status == "400" &&
              result.response.data.title ==
                "One or more validation errors occurred.")
          ) {
            Toastwarning("Error", "Invalid email or password");
          }
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
          console.log("---------------------------------------");
          console.log(JSON.stringify(error, null, 2));
        });
    } catch (e) {
      console.log("GoogleSignin: error ", e);
    }
  };

  // const logout = () => {
  //   setUserInfo();
  //   GoogleSignin.revokeAccess();
  //   GoogleSignin.signOut();
  // };

 /////////////////////////////////
  const onSubmit = (data) => {
    Keyboard.dismiss();
    setLoading(true);
    setSubmittedData(data);
    user_login({
      // email: "yazan@y.com",
      // password: "Qq%12345",
      email: data.email,
      password: data.password,
    })
      .then(async (result) => {
        // Make the callback function async
        if (result && result.data && result.status == 200) {
          dispatch(setUserInformation(result.data));
          console.log("status == 200")
          // console.log("result ",result)
          // console.log("result.data ",result.data)
          AsyncStorage.setItem("userInformation", JSON.stringify(result.data));
          // setLoading(false);
          navigation.navigate("HomeScreen");
        }else if(result.response.status == '400' && result.response.data == "Something went wrong no user retuerned" || result.response.status == '400' && result.response.data.title == "One or more validation errors occurred." || result.response.status == '400' && result.response.data == "Email and password are required." ) {

          Toastwarning('Error','Invalid email or password')

        }
        setLoading(false);

      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        console.log("---------------------------------------");
        console.log(JSON.stringify(error, null, 2));
        // Alert.alert(err)
      });
  };
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.title}>
          <Text style={{ fontSize: 50, fontWeight: "bold" }}>
            Sign In<Text style={{ color: "blue" }}>.</Text>
          </Text>
          <Text style={{ width: "60%", textAlign: "center" }}>
            Dont waste any time and start to generate meals now
          </Text>
        </View>
        <View style={styles.middleSection}>
          <Controller
            control={control}
            render={({ field }) => (
              <View style={styles.fieldRow}>
                <Text>Email</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    {...field}
                    style={styles.input}
                    placeholder="User@email.com"
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    value={field.value}
                  />
                </View>
              </View>
            )}
            name="email"
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name.message}</Text>
          )}

          <Controller
            control={control}
            render={({ field }) => (
              <View style={styles.fieldRow}>
                <Text>Password</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    {...field}
                    style={[styles.input, { width: "90%" }]}
             
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    value={field.value}
                    secureTextEntry={!youCanSeePassword}
                  />
                  <Feather
                    name={youCanSeePassword ? "eye-off" : "eye"}
                    size={24}
                    color="black"
                    style={{ padding: 10 }}
                    onPress={() => setYouCanSeePassword((prev) => !prev)}
                  />
                </View>
              </View>
            )}
            name="password"
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name.message}</Text>
          )}

          <TouchableOpacity
            style={{ alignItems: "flex-end" }}
            onPress={() => navigation.navigate("ForgotPasswordScreen")}
          >
            <Text>Forget Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSubmit(onSubmit)}>
          <Text style={{ color: "white" }}>Login</Text>
        </TouchableOpacity>

        <View style={styles.splitter}>
          <View style={styles.line}></View>
          <Text>Or Sign In with</Text>
          <View style={styles.line}></View>
        </View>

        <TouchableOpacity onPress={signin}
          style={[
            styles.btn,
            {
              backgroundColor: "transparent",
              borderColor: "gray",
              borderWidth: 1,
              flexDirection: "row",
              justifyContent: "space-evenly",
            },
          ]}
        >
          <AntDesign name="google" size={24} color="#0e82cd" />
          <Text>SIgn In With Google</Text>
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
          <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
            <Text style={{ color: "#0e82cd" }}>Sign Up Here</Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading ? <AppLoader/> : null}
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    padding: 8,
    marginVertical: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    borderColor: "black",
    borderWidth: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  title: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: (height * 10) / 100,
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
    marginVertical: 30,
  },
  fieldRow: {
    marginVertical: 10,
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
