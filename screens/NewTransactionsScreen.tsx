import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";

import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

import type { StackNavigationProp } from "@react-navigation/stack";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, ScrollView } from "react-native-gesture-handler";

export default function NewTransactionScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isIncome, setIsIncome] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  const saveTransaction = async () => {
    console.log("Saving transaction:");
    if (!title.trim()) {
      alert("Please enter a title for the transaction.");
      return;
    }
    if (!amount.trim() || isNaN(Number(amount))) {
      alert("Please enter a valid amount.");
      return;
    }
    if (!date.trim()) {
      alert("Please enter a date for the transaction.");
      return;
    }
    if (!category.trim()) {
      alert("Please enter a category for the transaction.");
      return;
    }
    if (!description.trim()) {
      alert("Please enter a description for the transaction.");
      return;
    }
    try {
      const dateTimestamp = Timestamp.fromDate(new Date(date));
      await addDoc(collection(db, "transactions"), {
        title,
        amount: Number(amount),
        date: dateTimestamp,
        category,
        description,
        isIncome,
      });
      alert("Transaction saved successfully!");
      navigation.goBack();
    } catch (error) {
      alert(
        "Error saving transaction: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.NewTransactionForm}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.NewTransactionForm}>
          <Text style={styles.label}>Transaction Title</Text>
          <TextInput
            placeholder="Ex. Salary, Bonus, Groceries, etc."
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          ></TextInput>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
          ></TextInput>
          <Text style={styles.label}>Date</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            style={styles.input}
          ></TextInput>

          {/* Category Picker */}
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowPicker(true)}
          >
            <Text style={{ color: category ? "black" : "gray" }}>
              {category ? category : "Select a category"}
            </Text>
          </TouchableOpacity>
          <Modal
            visible={showPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowPicker(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowPicker(false)}
            >
              <View style={styles.modalContent}>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => {
                    setCategory(itemValue);
                    setShowPicker(false);
                  }}
                  style={styles.picker}
                  prompt="Select a category"
                >
                  <Picker.Item label="Food" value="Food" />
                  <Picker.Item label="Salary" value="Salary" />
                  <Picker.Item label="Utilities" value="Utilities" />
                  <Picker.Item label="Transportation" value="Transportation" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>
            </Pressable>
          </Modal>

          <Text style={styles.label}>Description</Text>
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.descriptionInput]}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          ></TextInput>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isIncome && styles.toggleButtonActive,
              ]}
              onPress={() => setIsIncome(true)}
            >
              <Text
                style={[styles.toggleText, isIncome && styles.toggleTextActive]}
              >
                Income
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !isIncome && styles.toggleButtonActive,
              ]}
              onPress={() => setIsIncome(false)}
            >
              <Text
                style={[
                  styles.toggleText,
                  !isIncome && styles.toggleTextActive,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonGroup}>
            {/* Save Transaction Button */}
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={saveTransaction}
            >
              <Text style={styles.buttonText}>Save Transaction</Text>
            </TouchableOpacity>
            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  NewTransactionForm: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
    backgroundColor: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: 300,
    justifyContent: "center",
  },
  pickerContainer: {
    borderColor: "blue",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 24,
    height: 50,
    justifyContent: "center",
  },
  picker: {
    height: 250,
    color: "black",
    width: "100%",
  },
  label: {
    fontWeight: 600,
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    borderColor: "blue",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  descriptionInput: {
    height: 100, // increase height as needed
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "blue",
    borderRadius: 6,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#3B82F6",
  },
  toggleText: {
    color: "blue",
    fontWeight: "600",
    fontSize: 16,
  },
  toggleTextActive: {
    color: "white",
  },
  buttonGroup: {
    marginTop: "auto",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 6,
  },
  saveButton: {
    backgroundColor: "#4CAF50", // green
  },
  cancelButton: {
    backgroundColor: "#E53935", // red
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
