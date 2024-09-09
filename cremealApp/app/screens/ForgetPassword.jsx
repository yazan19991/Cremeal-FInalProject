import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Keyboard,
} from "react-native";
import {  useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../components/BackButton";
import FormTitle from "../components/FormTitle";
import InputFiled from "../components/InputFiled";
import { useForm } from "react-hook-form";
import FormButton from "../components/FormButton";
import {
  forget_Reset_password,
  forget_Verify_code,
  forget_send_code,
} from "../../assets/utils/api/forget_api";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import { Toasterror } from "../components/alerts";

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const passwordSchema = z.object({
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/^\S*$/, { message: "Password must not contain spaces" })
    .regex(/[!@#$%^&*()\-_=+{}[\]|;:'",<.>/?\\~`]/, { message: "Password must contain at least one special character" }),
  CPassword: z.string().min(6, { message: "Confirm Password must be at least 6 characters long" }),
}).refine((data) => data.password === data.CPassword, {
  message: "Passwords must match",
  path: ["CPassword"],
});

const emailSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});


const { width, height } = Dimensions.get("window");
const ForgetPassword = ({ navigation }) => {
  const [forgetScreenIndex, setForgetScreenIndex] = useState(0);
  const [userId, setUserId] = useState(-1);
  const [userEmail, setUserEmail] = useState(null);
  const selectedSchema = forgetScreenIndex === 0 ? emailSchema : (forgetScreenIndex === 2 ? passwordSchema : null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: selectedSchema ? zodResolver(selectedSchema) : undefined,
  });

  const schedulingOptions = {
    content: {
      title: `Send reset Password`,
      body: "check your email for the code to verify  your email",
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      color: "blue",
    },
    trigger: {
      seconds: 5,
    },
  };

  const sendCode = (data) => {
    Keyboard.dismiss();
    forget_send_code(data.email)
      .then((result) => {
        if (result.status == 200) {
          if (result.data == 0) return;
          Notifications.scheduleNotificationAsync(schedulingOptions);
          setUserId(result.data);
          setForgetScreenIndex(1);
          reset();
        }
      })
      .catch((err) => {
        console.log(err);
        Toasterror("Error", "Failed to send Code.");

      });
  };
  const sendCodeAgain = () => {
    let data = {
      email: userEmail,
    };
    sendCode(data);
  };

  const resetPassword = (data) => {
    console.log("5")
    Keyboard.dismiss();
    if (data.password == data.CPassword) {
      forget_Reset_password(userId, data.password)
        .then((result) => {
          if (result.status == 200) {
            reset();
            setForgetScreenIndex(2);
            navigation.navigate("LoginScreen");
          }
        })
        .catch((err) => {
          Toasterror("Error", "Failed to reset Password.");
          console.log(err);
        });
    }
  };

  const verifyCode = (data) => {
    Keyboard.dismiss();
    forget_Verify_code(userId, data.code)
      .then((result) => {
        if (result.status == 200) {
          reset();
          setForgetScreenIndex((prev) => prev + 1);
        }
      })
      .catch((err) => {
        Toasterror("Error", "Failed to verify Code.");

        console.log(err);
      });
  };
  return (
    <SafeAreaView style={styles.container}>
      {forgetScreenIndex == 0 ? (
        <View>
          <BackButton callFunction={() => navigation.navigate("LoginScreen")} />
          <FormTitle
            title={"Forget Password"}
            description={"Enter you email to get code to reset your password"}
            style={{ marginVertical: (height * 10) / 100 }}
          />
          <InputFiled
            control={control}
            Label={"Email Here"}
            placeHolder={"user@email.com"}
            IsItPassword={false}
            inputName={"email"}
            errors={errors}
          />
          <FormButton
            callFunction={handleSubmit(sendCode)}
            text={"Continue"}
            style={{ marginTop: 5 }}
          />
        </View>
      ) : forgetScreenIndex == 1 ? (
        <View>
          <BackButton
            callFunction={() => {
              setForgetScreenIndex((prev) => prev - 1);
              reset();
            }}
          />
          <FormTitle
            title={"Enter The code that U received "}
            description={"Enter you email to get code to reset your password"}
            style={{ marginVertical: (height * 10) / 100 }}
          />
          <InputFiled
            control={control}
            Label={"Code here"}
            placeHolder={"code"}
            IsItPassword={false}
            inputName={"code"}
            errors={errors}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 5,
            }}
          >
            <Text>Didn't get an code?</Text>
            <TouchableOpacity onPress={sendCodeAgain}>
              <Text style={{ color: "blue" }}>Resend</Text>
            </TouchableOpacity>
          </View>
          <FormButton
            callFunction={handleSubmit(verifyCode)}
            text={"Continue"}
            style={{ marginTop: 5 }}
          />
        </View>
      ) : (
        <View>
          <BackButton
            callFunction={() => {
              setForgetScreenIndex((prev) => prev - 1);
              reset();
            }}
          />
          <FormTitle
            title={"Enter new Password"}
            description={"Enter new password for your account"}
            style={{ marginVertical: (height * 10) / 100 }}
          />
          <InputFiled
            control={control}
            Label={"Password"}
            placeHolder={"*******"}
            IsItPassword={true}
            inputName={"password"}
            tiperror={errors.password?.message}

          />
          <InputFiled
            control={control}
            Label={"Confirm password"}
            placeHolder={"*******"}
            IsItPassword={true}
            tiperror={errors.CPassword?.message}
            inputName={"CPassword"}

          />

          <FormButton
            callFunction={handleSubmit(resetPassword)}
            text={"Reset Password"}
            style={{ marginTop: 5 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ForgetPassword;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
