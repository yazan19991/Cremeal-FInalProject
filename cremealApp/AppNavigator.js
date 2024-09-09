import React from 'react';
import { View,  Platform } from "react-native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import OnboardingScreen from './app/screens/OnboardingScreen';
import LoginScreen from './app/screens/LoginScreen';
import ForgetPassword from './app/screens/ForgetPassword';
import RegisterScreen from './app/screens/RegisterScreen';
import { HomeScreen } from './app/screens/HomeScreen';
import { CameraPage } from './app/screens/CameraPage';
import { GeneratedMeal } from './app/screens/GeneratedMeal';
import { MealRes } from './app/screens/MealRes';
import { UserSettings } from './app/screens/UserSettings';
import { EditProfile } from './app/screens/EditProfile';
import  SelectPlanScreen  from './app/screens/Buycoins';

import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator({ route }) {
    const routeName = getFocusedRouteNameFromRoute(route) ?? '';
    
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarShowLabel: false,
                headerShown: false,
                tabBarStyle: {
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    left: 0,
                    elevation: 0,
                    height: 60,
                    background: "#0E82CD",
                    display: routeName === 'TabCameraPage' ? 'none' : 'flex'
                },
            }}
        >
            <Tab.Screen name="TabHomeScreen" component={HomeScreen}
                options={{
                    tabBarIcon: ({ focused }) => {
                        return (
                            <View style={{ alignItems: "center", justifyContent: "center" }}>
                                <Entypo name="home" size={30} color={focused ? "#0E82CD" : "#9E9E9E"} />
                            </View>
                        )
                    }
                }}
            />
            <Tab.Screen name="TabCameraPage" component={CameraPage}
                options={{
                    tabBarIcon: ({ focused }) => {
                        return (
                            <View
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#90CAF9",
                                    width: Platform.OS == "ios" ? 50 : 60,
                                    height: Platform.OS == "ios" ? 50 : 60,
                                    top: Platform.OS == "ios" ? -10 : -20,
                                    borderRadius: Platform.OS == "ios" ? 25 : 30
                                }}
                            >
                                <MaterialIcons name="electric-bolt" size={30} color="white" />
                            </View>
                        )
                    }
                }}
            />
            <Tab.Screen name="TabUserSettings" component={UserSettings}
                options={{
                    tabBarIcon: ({ focused }) => {
                        return (
                            <View style={{ alignItems: "center", justifyContent: "center" }}>
                                <Ionicons name="person-sharp" size={30} color={focused ? "#0E82CD" : "#9E9E9E"} />
                            </View>
                        )
                    }
                }}
            />

        </Tab.Navigator>
    );
}

const AppNavigator = ({ initialRouteName }) => (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
        <Stack.Screen name='OnboardingScreen' component={OnboardingScreen} />
        <Stack.Screen name='LoginScreen' component={LoginScreen} />
        <Stack.Screen name='SignUpScreen' component={RegisterScreen} />
        <Stack.Screen name='ForgotPasswordScreen' component={ForgetPassword} />
        <Stack.Screen name='HomeScreen' component={TabNavigator} />
        <Stack.Screen name='GeneratedMeal' component={GeneratedMeal} />
        <Stack.Screen name='MealRes' component={MealRes} />
        <Stack.Screen name='UserSettings' component={UserSettings} />
        <Stack.Screen name='EditProfile' component={EditProfile} />
        <Stack.Screen name='SelectPlanScreen' component={SelectPlanScreen} />
    </Stack.Navigator>
);





export default AppNavigator;
