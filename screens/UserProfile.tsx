import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function UserProfile() {
  return (
    <View style={styles.header}>
      <Text>User Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "blue",
  },
});
