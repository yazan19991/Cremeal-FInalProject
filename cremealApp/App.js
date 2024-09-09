import "react-native-gesture-handler";
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import messaging from "@react-native-firebase/messaging";
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { Toastwarning } from "./app/components/alerts";
import AppLoader from "./app/components/AppLoader";
import { Provider } from 'react-redux';
import { store } from './redux/store';
import MainApp from './MainApp';
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

export default function App() {
  const [isAppFirstLaunched, setIsAppFirstLaunched] = useState(null);
  const [user, setUser] = useState(null);
  const [initialRouteName, setInitialRouteName] = useState(null);
  const [firstLaunchFetched, setFirstLaunchFetched] = useState(false);
  const [userInformationFetched, setUserInformationFetched] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Request user permission
    if (requestUserPermission()) {
      messaging()
        .getToken()
        .then((token) => {
          console.log(token);
          console.log("Permission  granted");
        });
    } else {
      console.log("Permission not granted", authStatus);
    }

    // Get initial notification
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification caused app to open from quit state:",
            remoteMessage.notification
          );
        }
      });

    // On notification opened app
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        "Notification caused app to open from background state:",
        remoteMessage.notification
      );
    });

    // On message received
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      const { notification, data } = remoteMessage;
      const messageTitle = notification?.title || 'New Notification';
      const messageBody = notification?.body || 'You have received a new message.';

      Toastwarning(messageTitle, messageBody);
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  const askNotification = async () => {
    const { status } = await Notifications.requestPermissionsAsync()
    if (Constants.isDevice && status === 'granted') {
      console.log('Notification permissions granted.')
    }
  }

  useEffect(() => {
    askNotification();
    async function fetchFirstLaunched() {
      try {
        const appData = await AsyncStorage.getItem('isAppFirstLaunched');
        console.log("fetchFirstLaunched :" + appData);
        if (appData == null) {
          setIsAppFirstLaunched(true);
          AsyncStorage.setItem('isAppFirstLaunched', 'false');
        } else {
          setIsAppFirstLaunched(false);
        }
        setFirstLaunchFetched(true);
      } catch (e) {
        console.log("fetchFirstLaunched error :" + e);
      }
    }



    async function fetchUserInformation() {
      try {
        const userInformation = await AsyncStorage.getItem('userInformation');
        console.log("fetchUserInformation userInformation :" + userInformation);
        setUser(JSON.parse(userInformation));
        setUserInformationFetched(true);
      } catch (e) {
        console.log("fetchUserInformation error :" + e);
      }
    }
    fetchUserInformation();
    fetchFirstLaunched();
  }, []);

  useEffect(() => {
    if (firstLaunchFetched && userInformationFetched) {
      selectInitialRouteName();
      setLoading(false); // Data fetching is complete
    }
  }, [firstLaunchFetched, userInformationFetched]);

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  };

  // Register background handler
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("Message handled in the background!", remoteMessage);
  });

  function selectInitialRouteName() {
    console.log("selectInitialRouteName isAppFirstLaunched ", isAppFirstLaunched);
    console.log("selectInitialRouteName user ", user != null);

    if (isAppFirstLaunched) {
      setInitialRouteName("OnboardingScreen");
    } else if (user != null) {
      setInitialRouteName("HomeScreen");
    } else {
      setInitialRouteName("LoginScreen");
    }
  }

  if (loading) {
    return (
           <AppLoader/>
    );
  }

  return (
    
    <Provider store={store}>
      <AlertNotificationRoot theme='dark'>
        <MainApp
          initialRouteName={initialRouteName}
          user={user}
          loading={loading}
        />
      </AlertNotificationRoot>
    </Provider>
  );
}
const styles = StyleSheet.create({});
