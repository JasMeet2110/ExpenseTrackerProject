import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { auth } from './firebase/firebaseConfig';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './navigation/AuthStack';

import SignUpScreen from './screens/SignUpScreen';
import SignInScreen from './screens/SignInScreen';

export default function App() {
  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  );
}
