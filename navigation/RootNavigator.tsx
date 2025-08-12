import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Tabs from "./Tabs";
import NewTransactionScreen from "../screens/NewTransactionsScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={Tabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewTransaction"
        component={NewTransactionScreen}
        options={{ headerShown: true, presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
