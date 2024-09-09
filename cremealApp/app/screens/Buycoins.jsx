import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Button, Image } from 'react-native';
import BackButton from "../components/BackButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import { Toasterror } from "../components/alerts";
import { StripeProvider, CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import InputFiled from "../components/InputFiled";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form";
import { user_pay_plan } from "../../assets/utils/api/user_api";
import { setUserInformation } from '../../redux/slices/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Get_All_Plans,
} from "../../assets/utils/api/user_api";
import AppLoader from "../components/AppLoader";
import { useIsFocused } from "@react-navigation/native";

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});
const SelectPlanScreen = ({ navigation }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isBackButtonHide, setBackButton] = useState(true);
  const { confirmPayment, loading } = useConfirmPayment();
  const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_PUBLISHABLEKEY;
  const dispatch = useDispatch();
  const userInformation = useSelector((state) => state.user.userInformation);
  const [Apploading, setLoading] = useState(true);
  const [plans, setplans] = useState([]);
  const [pendingApiCalls, setPendingApiCalls] = useState(1);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused || !userInformation) return;
    const decrementPendingApiCalls = () => {
      setPendingApiCalls((prevCount) => prevCount - 1);
    };

    Get_All_Plans(userInformation)
      .then((result) => {
        console.log(result)
        setplans(result.data)
      })
      .catch((err) => {
        console.log("Get_All_Plans error: " + err);
      })
      .finally(decrementPendingApiCalls);

  }, [userInformation]);

  useEffect(() => {
    if (pendingApiCalls === 0) {
      setLoading(false);
    }

  }, [pendingApiCalls]);


  const buy = async (data) => {
    if (!isReady) {
      Toasterror("Error", "Card details not complete");
      return;
    }

    try {
      console.log("data", data);

      // Make the API call to initiate payment
      const response = await user_pay_plan(
        {
          planId: selectedPlan.id,
          description: `Pay ${selectedPlan.price} usd for ${selectedPlan.coins} coins`,
          amount: selectedPlan.price * 100,
          currency: "usd",
          email: data.email,
          paymentMethodId: "pm_card_visa",
        },
        userInformation.jwtToken
      )
        .then(async (result) => {
          // Make the callback function async
          if (result && result.data && result.status == 200) {
            data = result.data;
            console.log("result.data ", result.data);
            if (data.status == "success") {
              // Payment was successful
              console.log(
                `The payment was confirmed successfully! Payment Intent ID: ${data.paymentIntentId}`
              );
              console.log(`Result: ${data.result}`);
              // Update the user's coin count in Redux
              const updatedUserInformation = {
                ...userInformation,
                coins: userInformation.coins + selectedPlan.coins,
              };
              AsyncStorage.setItem("userInformation", JSON.stringify(updatedUserInformation));
              dispatch(setUserInformation(updatedUserInformation));
              nextStep();
            } else {
              Toasterror("Payment failed", "The payment was not successful.");
            }
          } else if (
            (result.response.status == "400" &&
              result.response.data ==
              "Something went wrong no user retuerned") ||
            (result.response.status == "400" &&
              result.response.data.title ==
              "One or more validation errors occurred.")
          ) {
            Toastwarning("Error", "Payment not completed ");
          }
        })
        .catch((error) => {
          console.log("---------------------------------------");
          console.log(JSON.stringify(error, null, 2));
        });
    } catch (error) {
      console.error(error);
      Toasterror("Error", "An unexpected error occurred. Please try again.");
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
    else if (currentStep == 0) {
      navigation.navigate("UserSettings")
    }
  };

  const progressStepStyle = {
    activeStepIconBorderColor: '#4bb543',
    activeLabelColor: '#4bb543',
    activeStepNumColor: 'white',
    activeStepIconColor: '#4bb543',
    completedStepIconColor: '#4bb543',
    completedProgressBarColor: '#4bb543',
    completedCheckColor: 'white',
  };

  const progressBarStyle = {
    activeStepIconBorderColor: '#2776E8',
    activeStepIconColor: '#0056D2',
    completedStepIconColor: '#0056D2',
    completedProgressBarColor: '#0056D2',
    completedCheckColor: '#FFFFFF',
    labelColor: '#000000',
    activeLabelColor: '#000000',
    completedLabelColor: '#000000',
    activeStepNumColor: '#FFFFFF',
    completedStepNumColor: '#FFFFFF',
  };

  const nextStep = (data) => {
    console.log(isBackButtonHide, currentStep)
    if (data) {
      setSelectedPlan(data);
    }
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      if (currentStep == 1)
        setBackButton(false)
    }
  };

  return (
    <SafeAreaView >
      {Apploading ? (
        <AppLoader />
      ) : (
        <ScrollView style={styles.container}>
          {isBackButtonHide && <BackButton callFunction={goBack} />}
          <View style={styles.steps}>
            <ProgressSteps {...progressBarStyle} activeStep={currentStep}>
              <ProgressStep label="Select Plan" {...progressStepStyle} removeBtnRow={true}>
                <View style={{ alignItems: 'center' }}>
                  <View style={styles.content}>
                    <Text style={styles.title}>Select Unit</Text>

                    {plans.data.map((plan) => (
                      <TouchableOpacity
                        key={plan.id}
                        onPress={() => nextStep({ coins: plan.coins, price: plan.price, id: plan.id })}
                      >
                        <PlanOption
                          name={plan.name}
                          coins={`${plan.coins} Coins`}
                          price={`${plan.price.toFixed(2)} USD`}
                        />
                      </TouchableOpacity>
                    ))}

                  </View>
                </View>
              </ProgressStep>
              <ProgressStep label="Payment Method" {...progressStepStyle} removeBtnRow={true} onNext={() => nextStep()}>
                <View style={{ alignItems: 'center' }}>
                  <StripeProvider publishableKey={PUBLISHABLE_KEY}>
                    <Text>{selectedPlan ? `You are buying ${selectedPlan.coins} Coins for ${selectedPlan.price} USD` : "No plan selected"}</Text>
                    <View style={{ width: "90%", paddingVertical: 10 }}>
                      <InputFiled
                        placeHolder={"User@email.com"}
                        control={control}
                        Label={"Email"}
                        inputName={"email"}
                        tiperror={errors.email?.message}
                        IsItPassword={false}
                      /></View>
                    <CardField
                      postalCodeEnabled={false}
                      placeholder={{
                        number: '4242 4242 4242 4242',
                      }}
                      cardStyle={styles.cardField}
                      style={styles.cardFieldContainer}
                      onCardChange={(cardDetails) => {
                        if (cardDetails.complete) {
                          setIsReady(true);
                        } else {
                          setIsReady(false);
                        }
                      }}
                    />
                    <Button title="Buy" onPress={handleSubmit(buy)} disabled={loading || !isReady} />

                  </StripeProvider>
                </View>
              </ProgressStep>
              <ProgressStep label="Confirmation" {...progressStepStyle} removeBtnRow={true}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.title, { margin: 50 }]}>Transaction Completed</Text>
                  <Image
                    style={styles.Img}
                    source={require("../../assets/images/undraw_completing_re_i7ap.png")}
                  />
                </View>
                <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("TabHomeScreen")}>
                  <Text style={{ color: "white" }}>{"Continue to Home Page"}</Text>
                </TouchableOpacity>
              </ProgressStep>
            </ProgressSteps>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const PlanOption = ({ name, coins, price, bestPrice }) => (
  <View style={styles.planOption}>
    <View>
      <Text style={styles.planName}>{name}</Text>
      <Text style={styles.planCoins}>{coins}</Text>
    </View>
    <View>
      {bestPrice && <Text style={styles.bestPriceLabel}>Best Price</Text>}
      <Text style={styles.planPrice}>{price}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  steps: {
    flex: 1,
    marginVertical: 40,
    borderRadius: 8,
  },
  content: {
    flex: 30,
    width: '90%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#F4F9FF",
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  planCoins: {
    color: '#777',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bestPriceLabel: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: 2,
    borderRadius: 4,
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center',
  },
  cardField: {
    borderColor: '#000000',
    borderRadius: 8,
    borderWidth: 1,
  },
  cardFieldContainer: {
    height: 50,
    marginVertical: 20,
    width: '90%',
  },
  Img: {
    height: 200,
    width: 200
  },
  btn: {
    height: 50,
    backgroundColor: "#0e82cd",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 40,
    marginHorizontal: "6%"
  },
});

export default SelectPlanScreen;
