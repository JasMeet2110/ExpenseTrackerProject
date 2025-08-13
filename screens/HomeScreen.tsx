import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut, onAuthStateChanged, getAuth } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AuthStack";

export default function HomeScreen() {
  const auth = getAuth();
  console.log(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState("0");
  const [isEditingIncome, setIsEditingIncome] = useState(false);

  const expenses = 0;
  const remaining = Number(income) - expenses;
  const progressPercent =
    Math.min((expenses / Number(income)) * 100, 100).toFixed(0) + "%";
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(docRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setIncome(data.income?.toString() ?? "0");
          }
          setLoading(false);
        } catch (err) {
          console.error("Error fetching income:", err);
        }
        if (loading) {
          return (
            <SafeAreaView style={styles.safeArea}>
              <Text style={{ padding: 20 }}>Loading data...</Text>
            </SafeAreaView>
          );
        }
      }
    });
    return () => unsubscribe(); // cleanup on unmount
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome to Expense Tracker!</Text>
          <TouchableOpacity
            onPress={async () => {
              try {
                await signOut(auth);
                navigation.replace("Auth");
              } catch (error) {
                console.error("Logout error:", error);
              }
            }}
          >
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        {/* Monthly Summary */}
        <View style={styles.summary}>
          <Text style={styles.sectionTitle}>Monthly Summary</Text>

          <View style={{ marginVertical: 4 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginVertical: 4,
              }}
            >
              <Text style={styles.label}>
                Income: <Text style={styles.incomeText}>${income}</Text>
              </Text>

              {isEditingIncome ? (
                <TextInput
                  style={[styles.incomeInput, { textAlign: "right" }]}
                  value={income}
                  onChangeText={setIncome}
                  keyboardType="numeric"
                  onBlur={async () => {
                    setIsEditingIncome(false);
                    const user = auth.currentUser;
                    if (user) {
                      try {
                        await setDoc(
                          doc(db, "users", user.uid),
                          {
                            income: Number(income),
                          },
                          { merge: true }
                        );
                      } catch (err) {
                        console.error("Error saving income:", err);
                      }
                    }
                  }}
                  autoFocus
                />
              ) : (
                <TouchableOpacity onPress={() => setIsEditingIncome(true)}>
                  <Text style={{ fontSize: 16 }}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Text style={styles.label}>Expenses: </Text>
              <Text style={styles.expenseText}>${expenses}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(expenses / Number(income)) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.remainingLabel}>
            Remaining: ${remaining} ({progressPercent} used)
          </Text>
        </View>

        {/* Spending Breakdown Button */}
        <TouchableOpacity style={styles.breakdownButton}>
          <Text style={styles.breakdownText}>View Spending Breakdown 📊</Text>
        </TouchableOpacity>

        {/* Recent Transactions */}
        <View style={styles.transactions}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {[{ category: "(No expenses yet! Click to add.)", amount: 0 }].map(
            (tx, idx) => (
              <View key={idx}>
                <View style={styles.transactionRow}>
                  <Text>{tx.category}</Text>
                  <Text>${tx.amount}</Text>
                </View>
                <View style={styles.txDivider} />
              </View>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { padding: 20, paddingBottom: 100 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { fontSize: 20, fontWeight: "bold" },
  logout: { color: "#EF4444", fontWeight: "600" },

  divider: { height: 1, backgroundColor: "#D1D5DB", marginVertical: 12 },

  summary: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  label: { fontSize: 16, fontWeight: "500" },
  incomeText: { color: "#10B981", fontWeight: "600", fontSize: 16 },
  incomeInput: {
    borderBottomWidth: 1,
    borderColor: "#10B981",
    paddingVertical: 4,
    minWidth: 80,
    fontSize: 16,
  },
  expenseText: { color: "#EF4444", fontWeight: "600", fontSize: 16 },

  progressBar: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
  },
  remainingLabel: { marginTop: 4, fontSize: 12, color: "#6B7280" },

  breakdownButton: {
    marginVertical: 20,
    padding: 12,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    alignItems: "center",
  },
  breakdownText: { color: "white", fontWeight: "600" },

  transactions: { marginTop: 20 },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  txDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
});
