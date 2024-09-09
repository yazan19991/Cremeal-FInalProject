// MainApp.js
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { setUserInformation } from './redux/slices/userSlice';
import AppNavigator from './AppNavigator';
import AppLoader from "./app/components/AppLoader";

export default function MainApp({ initialRouteName, user, loading }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(setUserInformation(user));
    }
  }, [user, dispatch]);

  if (loading) {
    return <AppLoader />;
  }

  return (
      <NavigationContainer>
        <AppNavigator initialRouteName={initialRouteName} />
      </NavigationContainer>
  );
}
