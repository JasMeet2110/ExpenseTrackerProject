import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Notifications from "../screens/Notifications";
import TransactionHistory from "../screens/TransactionHistory";
import HomeScreen from "../screens/HomeScreen";
import UserProfile from "../screens/UserProfile";
import AboutUsScreen from "../screens/AboutUsScreen";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");

export default function Tabs() {
  const navigation = useNavigation();

  return (
    <>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: "#FFFFFF",
            borderTopWidth: 0,
            height: 60,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Notifications") {
              iconName = focused ? "notifications" : "notifications-outline";
            } else if (route.name === "AboutUs") {
              iconName = focused
                ? "information-circle"
                : "information-circle-outline";
            } else if (route.name === "UserProfile") {
              iconName = focused ? "person" : "person-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#3B82F6",
          tabBarInactiveTintColor: "#6B7280",
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Tab.Screen name="Notifications" component={Notifications} />
        <Tab.Screen name="AboutUs" component={AboutUsScreen} />
        <Tab.Screen name="UserProfile" component={UserProfile} />
      </Tab.Navigator>
      <TouchableOpacity
        style={[styles.tabBarButton, { left: width / 2 - 30 }]}
        onPress={() => navigation.navigate("NewTransaction")}
      >
        <Text style={styles.tabBarButtonText}>+</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  tabBarButton: {
    position: "absolute",
    bottom: 30, // adjust to sit just above the tab bar
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 10,
  },
  tabBarButtonText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
});
