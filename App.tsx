import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Text, View } from "react-native";
import { auth } from "./firebase/firebaseConfig";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./navigation/AuthStack";
import RootNavigator from "./navigation/RootNavigator";

import SignUpScreen from "./screens/SignUpScreen";
import SignInScreen from "./screens/SignInScreen";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <NavigationContainer>
      {user ? <RootNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
