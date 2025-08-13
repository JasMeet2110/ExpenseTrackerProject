import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

import AuthStack from "./AuthStack";
import Tabs from "./Tabs";
import NewTransaction from "../screens/NewTransactionsScreen"; 

type RootStackParamList = {
  AuthStack: undefined;
  Tabs: undefined;
  NewTransaction: undefined;
};

const Root = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  if (user === undefined) return null;

  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Root.Screen name="Tabs" component={Tabs} />
          <Root.Screen
            name="NewTransaction"
            component={NewTransaction}
            options={{ presentation: "modal" }}
          />
        </>
      ) : (
        <Root.Screen name="AuthStack" component={AuthStack} />
      )}
    </Root.Navigator>
  );
}
