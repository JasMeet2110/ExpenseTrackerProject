import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TransactionHistory() {
  return (
    <View style={styles.header}>
      <Text>Transaction History</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    backgroundColor: "green",
  },
});
