import {
  Keyboard,
  View,
  Text,
  TouchableHighlight,
  TextInput,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Camera, getCameraDevice } from "react-native-vision-camera";
import React, { useState, useEffect, useRef,useCallback   } from "react";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import CameraIngredients from "../components/CameraIngredients";
import { Button } from "@rneui/themed";
import { get_prediction_ingredients } from "../../assets/utils/api/objectD_api";
import { user_generate_meals } from "../../assets/utils/api/user_api";
import AppLoader from "../components/AppLoader";
import { Toasterror, DialogErrorButton, ToastwarningPress,Toastwarning } from "../components/alerts";
import { Dialog, Toast } from "react-native-alert-notification";
import {  BottomSheetFlatList } from '@gorhom/bottom-sheet';
import BottomSheet from '@gorhom/bottom-sheet';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from 'react-redux';
import { setUserInformation } from '../../redux/slices/userSlice';


export function CameraPage({ navigation }) {
  const cameraRef = useRef(null);
  const BottomSheetModalRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [items, setItems] = useState([]);
  const [itemTitles, setItemTitles] = useState([]);
  const [isInputVisible, setInputVisible] = useState(false);
  const [Ing, IngAdd] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const userInformation = useSelector((state) => state.user.userInformation);
  const dispatch = useDispatch();


  const devices = Camera.getAvailableCameraDevices();
  const [device, setDevice] = useState(null); 


  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      console.log("Camera permission status:", status);
      setHasPermission(status === 'granted');
      console.log("after Camera permission status:", status);
    })();
  }, []);

  useEffect(() => {
    const device = getCameraDevice(devices, 'back');
    if (device) {
      setDevice(device);
    }
    console.log("getCameraDevice");

  }, [devices]);

  useFocusEffect(
    useCallback(() => {
      if (!userInformation) return;
      setIsCameraActive(true);
      coins();

      return () => {
        setIsCameraActive(false);
      };
    }, [userInformation])
  );

  const MainScreen = () => {
    navigation.navigate("TabHomeScreen");
  };

  const GeneratedMeal = () => {
    setLoading(true);
    user_generate_meals(userInformation, itemTitles.join(","))
      .then((result) => {
        setLoading(false);
        if (result && result.data && result.status == '200') {

          const updatedUserInformation = {
            ...userInformation,
            coins: userInformation.coins - 1,
          };
          AsyncStorage.setItem("userInformation", JSON.stringify(updatedUserInformation));
          dispatch(setUserInformation(updatedUserInformation));

          setTimeout(() => {
            navigation.navigate("GeneratedMeal", {
              meals: [result.data],
              title: "Suggested meals",
            });
          }, 500);
        } else if (result.response.status == '400' && result.response.data == "You do not have permission to generate meals. Check your coins.") {
          DialogErrorButton(
            "Error",
            "You don't have enough coins to generate a meal",
            "Buy coins",
            () => {

              Dialog.hide();
              navigation.navigate("SelectPlanScreen")
            },
            () => {

            }

          );
        } else {
          Toasterror(
            "Error",
            "Network error or other unknown error occurred"
          );
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log("error " + error)
        DialogErrorButton(
          "Error",
          "You don't have enough coins to generate a meal",
          "Buy coins",
          () => {

            Dialog.hide();
            navigation.navigate("SelectPlanScreen")
          },
          () => {

          }

        );
        console.error(error);
      });
  };





  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        console.log('Keyboard dismissed');
      }
    );
    
    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const coins = () => {
    console.log("coins ", userInformation.coins)
    if (userInformation.coins == 0) {
      ToastwarningPress("You don't have enough coins to generate a meal",
        "Click here to buy coins",
        () => {
          Toast.hide();
          navigation.navigate("SelectPlanScreen")
        }
      )
    }
  };

  useEffect(() => {
    const device = getCameraDevice(devices, 'back')
    if (device) {
      setDevice(device);
    }
  }, [devices]);

  const captureAndSendOnDemand = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'speed',
      });
      console.log("Photo captured", photo.path);
      sendFrameToServer(photo.path);
    }
  };

  const sendFrameToServer = async (uri) => {

    get_prediction_ingredients(uri).then((result) => {
      console.log(result)
      if (result.data.length == 0) {
        Toastwarning(
          "Nothing detected",
          "Make sure the ingredients are visible for the camera."
        );
      }
      console.log(itemTitles)
      console.log(items)
      result.data.forEach((element) => {
        addItemIng(
          element,
          "https://cdn-icons-png.flaticon.com/512/6192/6192211.png"
        );
      });
    });
  };

  if (hasPermission === null) {
    return <AppLoader />
  }

  if (hasPermission === false) {
    return <AppLoader />
  }

  if (!device) {
    return <AppLoader />
  }

  const addItemIng = (IngName, url) => {
    const itemToAdd = {};
    const id = Math.floor(Math.random() * 10000);
    itemToAdd.title = IngName;
    itemToAdd.url = url;
    itemToAdd.id = id;
    const isItemAlreadyAdded = items.some(
      (item) => item.title === itemToAdd.title
    );

    if (!isItemAlreadyAdded) {
      setItems((currentItems) => [itemToAdd, ...currentItems]);
      setItemTitles((currentTitles) => [itemToAdd.title, ...currentTitles]);
    } else {
      console.log(`Item with ID ${itemToAdd.id} is already added.`);
    }
  };

  const removeItem = (id) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    const itemToRemove = items.find((item) => item.id === id);
    if (itemToRemove) {
      setItemTitles((currentTitles) =>
        currentTitles.filter((title) => title !== itemToRemove.title)
      );
    }
  };

  const clearAllItems = () => {
    setItems([]);
    setItemTitles([]);
  };

  const FnsetInputVisible = () => {
    setInputVisible(!isInputVisible);
  };

  const updateIngAdd = (IngName) => {
    IngAdd(IngName);
  };

  return (
    <SafeAreaView style={stylesFn.container}>
        {loading ? (
          <AppLoader />
        ) : (
          <>
            <Camera
              style={stylesFn.cameraStyle}
              device={device}
              isActive={isCameraActive}
              ref={cameraRef}
              photo={true}
            />
            <SafeAreaView style={stylesFn.overlayContainer}>
              <View style={[stylesFn.SupContainer1, { backgroundColor: "#e9f4f9" }]}>
                <AntDesign
                  style={stylesFn.BackArrow}
                  onPress={MainScreen}
                  name="arrowleft"
                  size={30}
                  color="black"
                />
                {isInputVisible ? (
                  <AntDesign
                    name="up"
                    size={24}
                    color="black"
                    onPress={() => FnsetInputVisible()}
                  />
                ) : (
                  <AntDesign
                    name="pluscircleo"
                    size={30}
                    color="black"
                    onPress={() => FnsetInputVisible()}

                  />
                )}
              </View>
              <View style={stylesFn.SupContainer2}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                    marginTop: 5,
                  }}
                >
                  {isInputVisible && (
                    <>
                      <TextInput
                        style={{
                          backgroundColor: "white",
                          borderRadius: 20,
                          height: 40,
                          paddingLeft: 20,
                          width: "80%",
                        }}
                        placeholder="Type here..."
                        onChangeText={updateIngAdd}
                      />
                      <Button
                        type="outline"
                        buttonStyle={{
                          width: 60,
                          borderRadius: 40,
                          backgroundColor: "#e9f4f9",
                        }}
                        containerStyle={{ margin: 5 }}
                        disabledStyle={{
                          borderWidth: 5,
                          borderColor: "black",
                        }}
                        disabledTitleStyle={{ color: "black" }}
                        linearGradientProps={null}
                        iconContainerStyle={{ background: "black" }}
                        onPress={() =>
                          addItemIng(
                            Ing,
                            "https://cdn-icons-png.flaticon.com/512/6192/6192211.png"
                          )
                        }
                        title="Add"
                        titleProps={{}}
                        titleStyle={{ marginHorizontal: 5 }}
                      />
                    </>
                  )}
                </View>
              </View>

              <BottomSheet
                ref={BottomSheetModalRef}
                index={0}
                snapPoints={["25%", "70%"]}
                enablePanDownToClose={false}
                enableContentPanningGesture={false}
                enableOverDrag={false}
                keyboardBehavior={'extend'}
              >
                <View style={stylesFn.SupSupContainer1}>
                  <TouchableHighlight onPress={clearAllItems} underlayColor="#e9f4f9">
                    <Text style={stylesFn.Text}>Clear</Text>
                  </TouchableHighlight>
                  <TouchableHighlight
                    onPress={captureAndSendOnDemand}
                    underlayColor="#e9f4f9"
                  >
                    <Text style={stylesFn.TitleText}>identify ingredients</Text>
                  </TouchableHighlight>
                  <TouchableHighlight onPress={GeneratedMeal} underlayColor="#e9f4f9">
                    <Text style={stylesFn.Text}>Create</Text>
                  </TouchableHighlight>
                </View>
                <View style={stylesFn.SupSupContainer2}>
                  <BottomSheetFlatList
                    data={items}
                    renderItem={({ item }) => (
                      <CameraIngredients
                        data={item}
                        onDelete={() => removeItem(item.id)}
                      />
                    )}
                    keyExtractor={(item) => item.id}
                  />
                </View>
              </BottomSheet >
            </SafeAreaView>
          </>
        )}
    </SafeAreaView>
  );
}

const stylesFn = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  SupContainer1: {
    flex: 0.4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: "2%",
  },
  SupContainer2: {
    flex: 5,
  },
  SupContainer3: {
    flex: 2.3,
    backgroundColor: "#e9f4f9",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  SupSupContainer1: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  SupSupContainer2: {
    flex: 15,
    alignItems: "center",
  },
  TitleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  Text: {
    fontSize: 15,
    fontWeight: "bold",
    color: "black",
  },
  cameraStyle: {
    flex: 1,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
