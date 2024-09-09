import {Keyboard,
    View,
    Text,
    TouchableHighlight,
    TextInput,
    StyleSheet
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Camera, getCameraDevice } from "react-native-vision-camera";

import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import CameraIngredients from "../components/CameraIngredients";
import { Button } from "@rneui/themed";
import { UserContext } from '../../UserContext';
import { user_generate_meals } from "../../assets/utils/api/user_api";
import AppLoader from "../components/AppLoader";
import { Toasterror, DialogErrorButton, ToastwarningPress } from "../components/alerts";
import { Dialog, Toast } from "react-native-alert-notification";
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetFlatList } from '@gorhom/bottom-sheet';
//        ///////Tensorflow Model//////
import { useFrameProcessor, runAtTargetFps } from "react-native-vision-camera";
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useResizePlugin } from 'vision-camera-resize-plugin';
function tensorToString(tensor) {
    return `\n  - ${tensor.dataType} ${tensor.name}[${tensor.shape}]`
}

function modelToString(model) {
    return (
        `TFLite Model (${model.delegate}):\n` +
        `- Inputs: ${model.inputs.map(tensorToString).join('')}\n` +
        `- Outputs: ${model.outputs.map(tensorToString).join('')}`
    )
}
//        ///////////////////////////////////////
export function CameraPage({ navigation }) {
    const cameraRef = useRef(null);
    const BottomSheetModalRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(null);
    const [items, setItems] = useState([]);
    const [itemTitles, setItemTitles] = useState([]);
    const [isInputVisible, setInputVisible] = useState(false);
    const [Ing, IngAdd] = useState("");
    const [userInformation, setUserInformation] = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);


    const devices = Camera.getAvailableCameraDevices();
    const [device, setDevice] = useState(null);

    //        ///////Tensorflow Model//////
    const model = useTensorflowModel(require('../../assets/model/3.tflite'));
    const actualModel = model.state === 'loaded' ? model.model : undefined;
    console.log("1");
    useEffect(() => {
        console.log("useEffect 1");
        if (actualModel == null) return;
        console.log(`Model loaded! Shape:\n${modelToString(actualModel)}]`);
    }, [actualModel]);
    console.log("2");

    const { resize } = useResizePlugin();

    const frameProcessor = useFrameProcessor(
        (frame) => {
            'worklet';
            console.log("frameProcessor");
            if (!actualModel) {
                console.log('Model is not loaded yet');
                return;
            }

            const parseDetections = (result) => {
                
                console.log("in parseDetections");
                const numDetections = result[3]?.[0]; // Assuming num_detections is in result[3]
                const detectedClasses = result[1]; // Assuming classes are in result[1]
                const detectedScores = result[2]; // Assuming scores are in result[2]
                const detectedBoxes = result[0]; // Assuming bounding boxes are in result[0]
                console.log("1 parseDetections");
                if (!numDetections || !detectedClasses || !detectedScores || !detectedBoxes) {
                    console.log('One or more results are undefined');
                    return [];
                }
                console.log("2 parseDetections");
                const detections = [];
                for (let i = 0; i < numDetections; i++) {
                    if (detectedScores[i] > 0.5) { // Threshold for considering a detection
                        detections.push({
                            class: detectedClasses[i],
                            score: detectedScores[i],
                            box: detectedBoxes[i],
                        });
                    }
                }
                return detections;
            };

            const getClassNameFromId = (classId) => {
                'worklet';
                console.log("getClassNameFromId");
                // Map class IDs to class names
                const classNames = {
                    1: "apple",
                    2: "tometo",
                    
                };
                return classNames[classId] || "Unknown Ingredient";
            };

            runAtTargetFps(1, () => {
                console.log("runAtTargetFps");
                try {
                    const resized = resize(frame, {
                        scale: {
                            width: 320,
                            height: 320,
                        },
                        pixelFormat: 'rgb',
                        dataType: 'uint8',
                    });

                    if (!resized) {
                        console.log('Resizing failed');
                        return;
                    }
                    console.log("B actualModel.runSync");
                    const result = actualModel.runSync([resized]);
                    console.log("A actualModel.runSync");

                    if (!result) {
                        console.log('Model inference failed');
                        return;
                    }


                    console.log("B parseDetections");
                    const detections = parseDetections(result);
                    console.log('Detections:', detections);

                    detections.forEach((detection) => {
                        const className = getClassNameFromId(detection.class);
                        addItemIng(className, "https://cdn-icons-png.flaticon.com/512/6192/6192211.png");
                    });
                } catch (error) {
                    console.error('Error during frame processing:', error);
                }
            });
        },
        [actualModel]
    );
    //        ///////////////////////////////////////

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
            // Camera is active when the screen is focused
            setIsCameraActive(true);

            return () => {
                // Camera is inactive when the screen is unfocused
                setIsCameraActive(false);
            };
        }, [])
    );
    const MainScreen = () => {
        navigation.navigate("TabHomeScreen");
    };
    function handlePresentModal() {
        BottomSheetModalRef.current?.present();
    }
    function handldismissModal() {
        BottomSheetModalRef.current?.dismiss();
    }

    const GeneratedMeal = () => {
        handldismissModal()
        setLoading(true);
        user_generate_meals(userInformation, itemTitles.join(","))
            .then((result) => {
                setLoading(false);
                if (result && result.data && result.status == '200') {
                    navigation.navigate("GeneratedMeal", {
                        meals: [result.data],
                        title: "Suggested meals",
                    });
                } else if (result.response.status == '400' && result.response.data == "You have no premesion to generate meals check your conis") {
                    DialogErrorButton(
                        "Error",
                        "You don't have enough coins to generate a meal",
                        "Buy coins",
                        () => {
                            handldismissModal()
                            Dialog.hide();
                            navigation.navigate("SelectPlanScreen")
                        },
                        () => {
                            handldismissModal()
                            handlePresentModal()
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
                        handldismissModal()
                        Dialog.hide();
                        navigation.navigate("SelectPlanScreen")
                    },
                    () => {
                        handldismissModal()
                        handlePresentModal()
                    }
                );
                console.error(error);
            });
    };



    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            coins();
            if (items.length > 0) {
                handlePresentModal()
            }
        });
        return unsubscribe;
    }, [navigation, items]);
    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                console.log('Keyboard dismissed');
                handldismissModal()
                handlePresentModal()
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
    // useEffect(() => {
    //   const device = getCameraDevice(devices, 'back')
    //   if (device) {
    //     setDevice(device);
    //   }
    // }, [devices]);
    // const captureAndSendOnDemand = async () => {
    //   if (cameraRef.current) {
    //     const photo = await cameraRef.current.takePhoto({
    //       qualityPrioritization: 'speed',
    //     });
    //     console.log("Photo captured", photo.path);
    //     // sendFrameToServer(photo.path);
    //   }
    // };
    // const sendFrameToServer = async (uri) => {
    //   get_prediction_ingredients(uri).then((result) => {
    //     result.data.predictions.forEach((element) => {
    //       addItemIng(
    //         element.className,
    //         "https://cdn-icons-png.flaticon.com/512/6192/6192211.png"
    //       );
    //     });
    //   });
    // };
    if (hasPermission === null) {
        return <Text>Waiting for camera permissions...</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }
    if (!device) {
        return <Text>Loading camera device...</Text>;
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
            handlePresentModal()
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
            <BottomSheetModalProvider>
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
                            frameProcessor={frameProcessor}
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
                            <BottomSheetModal
                                ref={BottomSheetModalRef}
                                index={0}
                                snapPoints={["25%", "70%"]}
                                enablePanDownToClose={false}
                                enableContentPanningGesture={false}
                                enableOverDrag={false}
                                keyboardBehavior={'interactive'}
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
                            </BottomSheetModal>
                        </SafeAreaView>
                    </>
                )}
            </BottomSheetModalProvider>
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