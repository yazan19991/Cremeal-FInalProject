import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableHighlight,
} from "react-native";
import React, { useEffect, useState,useCallback  } from "react";
import { AntDesign } from "@expo/vector-icons";
import MealsComponent from "../components/MealsComponent";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  user_get_image,
  user_get_meals,
} from "../../assets/utils/api/user_api";
import { apiUrl } from "../../assets/utils/api/ApiManager";
import AppLoader from "../components/AppLoader";
import {Toastwarning,DialogwarningButton} from "../components/alerts";
import { useDispatch, useSelector } from 'react-redux';
import { setUserInformation,setUserImage,setUser_login_google } from '../../redux/slices/userSlice';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Dialog} from "react-native-alert-notification";
import { useIsFocused,useFocusEffect  } from "@react-navigation/native";

export function HomeScreen({ navigation }) {
  const [userMeal, setUserMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [FavoriteMeals, setFavoriteMealsState] = useState([]);
  const [pendingApiCalls, setPendingApiCalls] = useState(2);
  const [isExpired, setisExpired] = useState(false);
  const dispatch = useDispatch();
  const userInformation = useSelector((state) => state.user.userInformation);
  const UserImage = useSelector((state) => state.user.userImage);
  const firstTimeloginGoogle = useSelector((state) => state.user.firstTimeloginGoogle);
  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      if (!isFocused || !userInformation) return;

      const decrementPendingApiCalls = () => {
        setPendingApiCalls((prevCount) => prevCount - 1);
      };

      user_get_meals(userInformation)
      .then((result) => {
        const allMeals = result.data;
        setUserMeals(allMeals);
        const favoriteMeals = allMeals.filter((meal) => meal.favorite);
        setFavoriteMealsState(favoriteMeals);
        dispatch({
          type: 'FavoriteMeal/setFavoriteMeals',
          payload: favoriteMeals,
        });
      })
      .catch((err) => {
        setisExpired(true);
        console.log("user_get_meals error: " + err);
      })
      .finally(decrementPendingApiCalls);
    
      user_get_image(userInformation)
        .then((result) => {
          if (result.status == 200) {
            dispatch(setUserImage(apiUrl + "/Images/UsersImages/" + result.data+`?t=${Math.floor(Date.now() / 1000)}`));
            console.log("Image data found: ", apiUrl + "/Images/UsersImages/" + result.data);

          } else {
            console.log("Image data not found in the result.");

          }
        })
        .catch((err) => {
          console.log("user_get_image error: " + err);

        })
        .finally(decrementPendingApiCalls);

    }, [userInformation, isFocused])
  );


  useEffect(() => {
    console.log(pendingApiCalls)
    if (pendingApiCalls === 0) {
       setLoading(false);
       console.log("UserImage ",UserImage)
       if(isExpired){
        Toastwarning("Opss","It's been 24 hours since you logged in. You have to log in again")
        LogoutOnPress()
        navigation.navigate("LoginScreen");
       }
       if(firstTimeloginGoogle){
        DialogwarningButton(
          "Warning",
          "If you suffer from a certain food allergy, please go and add it in the settings and also make sure you have added your religion",
          "I Understand",
          () => {
            Dialog.hide();
          },
          () => {}
      
        );
      
       }
    }

  }, [pendingApiCalls]);



  const seeAll = (title, meals) => {
    navigation.navigate("GeneratedMeal", {
      meals: meals,
      title: title,
    });
  };
  if (!userInformation) {
    return null; 
  }
  const LogoutOnPress = async () => {
    try {

      await AsyncStorage.removeItem("userInformation");
      dispatch(setUserInformation(null));
      dispatch(setUserImage(null));
  
      const isSignedIn = await GoogleSignin.isSignedIn();
      const WebClientId = process.env.EXPO_PUBLIC_WebClientId 
      if (isSignedIn) {
        GoogleSignin.configure({
          webClientId: WebClientId,
        });



        dispatch(setUser_login_google(false));
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
    
      navigation.navigate("LoginScreen");
    } catch (e) {
      console.log("Logout error: " + e);
    }
  };
  
  return (
    <SafeAreaView style={stylesFn.SafeAreaView}>
      {loading ? (
        <AppLoader />
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={stylesFn.fillspace}></View>
          <View style={stylesFn.SupContainer1}>
            <View style={{ flexDirection: "row" }}>
              <Image style={stylesFn.profileImg} source={{ uri: UserImage }} />
              <View
                style={{
                  flexDirection: "column",
                  marginHorizontal: "10%",
                  justifyContent: "center",
                }}
              >
                <Text style={stylesFn.NameText}>Welcome,</Text>
                <Text style={stylesFn.NameText}>{userInformation.name}</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <AntDesign name="wallet" size={20} color="black" />
                  <Text style={stylesFn.CoinText}>{userInformation.coins}</Text>
                  <Text style={stylesFn.CoinText}>Coins</Text>
                </View>
              </View>
            </View>
            <View>
              <AntDesign
                style={stylesFn.BackArrow}
                name="logout"
                size={30}
                color="black"
                onPress={LogoutOnPress}
              />
            </View>
          </View>
          <View style={stylesFn.SupContainer3}>
            <Image
              style={stylesFn.adsImg}
              source={require("../../assets/images/home/ads.png")}
            />
          </View>

          <View style={stylesFn.SupContainer4}>
            <View
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Text style={{ color: "#6C6C6C", fontSize: 24 }}>
                Your Favorite meal
              </Text>
              <TouchableHighlight
                onPress={() => {
                  seeAll("Favorite meal");
                }}
                underlayColor="white"
              >
                <Text style={{ color: "#6055D8", fontSize: 12 }}>See All</Text>
              </TouchableHighlight>
            </View>
            <View>
              {FavoriteMeals.length > 0 ? (
                <MealsComponent meal={FavoriteMeals[0]} />
              ) : (
                <Text
                  style={{
                    paddingVertical: 20,
                    fontSize: 18,
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  {" "}
                  Go create your first wonderful meal
                </Text>
              )}
            </View>
            <View
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Text style={{ color: "#6C6C6C", fontSize: 24 }}>History</Text>
              <TouchableHighlight
                onPress={() => {
                  seeAll("History", userMeal);
                }}
                underlayColor="white"
              >
                <Text style={{ color: "#6055D8", fontSize: 12 }}>See All</Text>
              </TouchableHighlight>
            </View>
            <View>
              {userMeal.length > 0 ? (
                <MealsComponent meal={userMeal[0]} />
              ) : (
                <Text
                  style={{
                    paddingVertical: 20,
                    fontSize: 18,
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  {" "}
                  You have no History
                </Text>
              )}
            </View>
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
  fillspace: {
    flex: 1,
  },
  SupContainer1: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  SupContainer2: {
    flex: 1,
  },
  SupContainer3: {
    flex: 25,
    alignItems: "center",
  },
  SupContainer4: {
    flex: 10,
    marginHorizontal: "7%",
  },
  SupContainer5: {
    flex: 6,
  },
  profileImg: {
    height: 80,
    width: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "black",
  },
  NameText: {
    color: "#6C6C6C",
    marginBottom: 3,
    marginHorizontal: 3,
    fontSize: 15,
  },
  CoinText: {
    color: "#505050",
    marginBottom: 3,
    marginHorizontal: 3,
    fontSize: 15,
    fontWeight: "900",
  },
  adsImg: {
    height: "100%",
    width: "100%",
    resizeMode: "contain",
  },
});
