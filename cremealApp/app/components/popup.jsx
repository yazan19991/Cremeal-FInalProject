import React, { useState, useRef } from "react";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { Add_To_Favorite, Remove_From_Favorite } from "../../assets/utils/api/meal_api";

import {
    TouchableOpacity,
    View,
    Modal,
    StyleSheet,
    Text,
    Animated as RNAnimated,
    Easing,
    TouchableWithoutFeedback,
    Dimensions,
} from "react-native";
import * as FileSystem from 'expo-file-system';
import Share from 'react-native-share';
import tailwind from 'twrnc';
import { useDispatch } from 'react-redux';
import { addFavoriteMeal, removeFavoriteMeal } from '../../redux/slices/FavoriteMealSlice';
const springConfig = {
    mass: 1,
    velocity: 0,
    stiffness: 250,
    damping: 45,
};

const PopupMenu = ({ meal, user }) => {
    const [visible, setVisible] = useState(false);
    const scale = useRef(new RNAnimated.Value(0)).current;
    const toggleAnim = useSharedValue(0);
    const [liked, setLiked] = useState(meal.favorite);

    const dispatch = useDispatch();

    const AddToFavorite = () => {
        console.log("AddToFavorite: ", meal.id)
        console.log(user.jwtToken)
        return Add_To_Favorite(meal.id, user.jwtToken)
            .then((result) => {
                console.log(result)
            })
            .catch((err) => console.log(err));
    };

    const RemoveFromFavorite = () => {
        console.log("Removing meal with ID:", meal.id); // Check if this logs
        return Remove_From_Favorite(meal.id, user.jwtToken)
            .then((result) => {
                console.log(result)
            })
            .catch((err) => console.log(err));
    };


    const inviteOnPress = async () => {
        console.log(meal);
        const ingredients = meal.ingredients ? meal.ingredients.split(', ').join('\n- ') : '';
        const instructions = meal.instructions ? meal.instructions.split('\n').map(instruction => instruction.trim()).join('\n') : '';

        const message = `
    🍽 Meal: ${meal.name}

    🕒 Cooking Time: ${meal.cookingTime} minutes

    🔍 Description: ${meal.description}

    🌶 Difficulty: ${meal.difficulty}

    📝 Ingredients:
    - ${ingredients}

    👩‍🍳 Instructions:
    ${instructions}

    This meal was created by the CremEAL App. Check out more delicious recipes at appLink

    Enjoy your meal! 🍛
        `;

        try {
            const imageUri = `${FileSystem.cacheDirectory}${meal.name}.jpg`;
            await FileSystem.downloadAsync(meal.imageLink, imageUri);

            const shareOptions = {
                title: 'Share your meal',
                message: message.trim(),
                url: 'file://' + imageUri,
                type: 'image/jpeg',
            };

            await Share.open(shareOptions);
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    const dotTransform = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: interpolate(toggleAnim.value, [0, 1], [0, 1]),
                },
            ],
        };
    });

    const centerLineTransform = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    rotate: `${interpolate(toggleAnim.value, [0, 1], [0, -45])}deg`,
                },
            ],
        };
    });

    const topLineTransform = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: -6.5,
                },
                {
                    rotate: `${interpolate(toggleAnim.value, [0, 1], [0, 45])}deg`,
                },
                {
                    translateX: interpolate(toggleAnim.value, [0, 1], [8.5, 10]),
                },
            ],
        };
    });

    const bottomLineTransform = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: 6.5,
                },
                {
                    rotate: `${interpolate(toggleAnim.value, [0, 1], [0, 45])}deg`,
                },
                {
                    translateX: interpolate(toggleAnim.value, [0, 1], [-8.5, -10]),
                },
            ],
        };
    });

    const handlePress = () => {
        if (toggleAnim.value) {
            toggleAnim.value = withSpring(0, springConfig);
        } else {
            toggleAnim.value = withSpring(1, springConfig);
        }
    };

    function resizeBox(to) {
        to === 1 && setVisible(true);
        RNAnimated.timing(scale, {
            toValue: to,
            useNativeDriver: true,
            duration: 200,
            easing: Easing.linear,
        }).start(() => to === 0 && setVisible(false));
    }

    function handleMainPress() {
        resizeBox(1);
        handlePress();
    }

    function TouchStart() {
        resizeBox(0);
        handlePress();
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={tailwind.style("flex-1 items-center justify-center")}>
                <TouchableWithoutFeedback
                    onPress={handleMainPress}
                    style={tailwind.style(
                        "relative w-14 bg-white h-14 rounded-lg flex justify-center items-center",
                    )}
                >
                    <View style={tailwind.style("flex flex-col")}>
                        <Animated.View
                            style={[
                                tailwind.style(
                                    "absolute right-0 bottom-0 top-0 left-0 justify-center items-center",
                                ),
                                dotTransform,
                            ]}
                        >
                            <View
                                style={tailwind.style("h-1.5 w-1.5 bg-black rounded-full")}
                            />
                        </Animated.View>
                        <Animated.View
                            style={[
                                tailwind.style("flex flex-row justify-start"),
                                topLineTransform,
                            ]}
                        >
                            <View
                                style={tailwind.style("h-0.90 w-3.5 rounded-md bg-black mb-0.75")}
                            />
                        </Animated.View>

                        <Animated.View
                            style={[
                                tailwind.style("h-0.80 w-7 rounded-md bg-black"),
                                centerLineTransform,
                            ]}
                        />
                        <Animated.View
                            style={[
                                tailwind.style("flex flex-row justify-end"),
                                bottomLineTransform,
                            ]}
                        >
                            <View
                                style={tailwind.style("h-0.90 w-3.5 rounded-md bg-black mt-0.75")}
                            />
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            </View>

            <Modal transparent visible={visible}>
                <SafeAreaView style={{ flex: 1 }} onTouchStart={TouchStart}>
                    <RNAnimated.View
                        style={[
                            styles.popup,
                            {
                                opacity: scale.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                                transform: [{ scale }],
                            },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                if (liked) {
                                    RemoveFromFavorite()
                                        .then(() => {
                                            setLiked(false);
                                            dispatch(removeFavoriteMeal({ id: meal.id }));
                                        })
                                        .catch((err) => console.log(err));
                                } else {
                                    AddToFavorite()
                                        .then(() => {
                                            setLiked(true);
                                            dispatch(addFavoriteMeal(meal)); 
                                        })
                                        .catch((err) => console.log(err));
                                }
                                setTimeout(() => setVisible(false), 100);
                            }}
                            style={[
                                styles.option,
                                { borderBottomWidth: 0 },
                            ]}
                        >
                            <Text>Favorite</Text>
                            <MaterialIcons
                                name={liked ? "favorite" : "favorite-outline"}
                                size={32}
                                color={liked ? "black" : "black"}
                                style={{ marginLeft: 10 }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                inviteOnPress();
                                setVisible(false);
                            }}
                            style={[
                                styles.option,
                                { borderBottomWidth: 0 },
                            ]}
                        >
                            <Text>Share</Text>
                            <AntDesign name={"sharealt"} size={26} color={'#212121'} style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                    </RNAnimated.View>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
    popup: {
        borderRadius: 8,
        borderColor: '#333',
        borderWidth: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        position: 'absolute',
        top: 55,
        right: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 7,
        borderBottomColor: '#ccc',
    },
});

export default PopupMenu;
