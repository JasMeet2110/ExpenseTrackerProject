import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";

import type { StackNavigationProp } from "@react-navigation/stack";

type Props = {
  navigation: StackNavigationProp<any>;
};

export default function NewTransactionScreen({ navigation }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const saveTransaction = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.NewTransactionForm}>
      <TextInput
        placeholder="New Transaction"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      ></TextInput>
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      ></TextInput>
      <Button title="Save Transaction" onPress={saveTransaction}></Button>
      <Button
        title="Cancel"
        color="red"
        onPress={() => navigation.goBack()}
      ></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  NewTransactionForm: {
    flex: 1,
  },
  input: {
    borderColor: "blue",
  },
});
