import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import TransactionHistory from '../screens/TransactionHistory';
import PieChartScreen from '../screens/PieChartScreen';
import AboutUs from '../screens/AboutUsScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

export default function Tabs() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const openNewTransaction = () => {
    const parent = navigation.getParent?.();
    if (parent) parent.navigate('NewTransaction');
    else navigation.navigate('NewTransaction'); 
  };

  return (
    <>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            height: 60 + insets.bottom * 0.3,
            paddingBottom: insets.bottom * 0.2,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'home';
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'PieChart') iconName = focused ? 'pie-chart' : 'pie-chart-outline';
            else if (route.name === 'TransactionHistory') iconName = focused ? 'list' : 'list-outline';
            else if (route.name === 'AboutUs') iconName = focused ? 'information-circle' : 'information-circle-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#6B7280',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Tab.Screen name="PieChart" component={PieChartScreen} options={{ headerShown: false }} />
        <Tab.Screen name="TransactionHistory" component={TransactionHistory} options={{ headerShown: false }} />
        <Tab.Screen name="AboutUs" component={AboutUs} options={{ headerShown: false }} />
      </Tab.Navigator>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Add new transaction"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={[
          styles.tabBarButton,
          { left: width / 2 - 30, bottom: 30 + insets.bottom },
        ]}
        onPress={openNewTransaction}
        activeOpacity={0.85}
      >
        <Text style={styles.tabBarButtonText}>＋</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  tabBarButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 10,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  tabBarButtonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
});
