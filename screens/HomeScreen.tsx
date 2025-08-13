import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  collection, query, where, onSnapshot, Timestamp, orderBy, deleteDoc, doc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

import MonthSlider from "../components/MonthSlider";
import { useMonthRange } from "../hooks/useMonthRange";

type Txn = {
  id: string;
  title: string;
  amount: number;
  date: Timestamp;
  category: string;
  description?: string;
};

const ROW_HEIGHT = 68;

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);
}
function formatDate(ts: Timestamp) {
  const d = ts.toDate();
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "2-digit" }).format(d);
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<User | null>(auth.currentUser);
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const { monthStart, monthEnd, label: MonthLabel, prev, next } = useMonthRange();

  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) { setTxns([]); setLoading(false); return; }
    setLoading(true);

    const qy = query(
      collection(db, "transactions"),
      where("uid", "==", user.uid),
      where("date", ">=", Timestamp.fromDate(monthStart)),
      where("date", "<", Timestamp.fromDate(monthEnd)),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(
      qy,
      (snap) => {
        const items: Txn[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          items.push({
            id: d.id,
            title: data.title ?? "",
            amount: typeof data.amount === "number" ? data.amount : Number(data.amount || 0),
            date: data.date,
            category: data.category ?? "",
            description: data.description ?? "",
          });
        });
        setTxns(items);
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
        setRefreshing(false);
        Alert.alert("Load error", "Couldn't load transactions.");
      }
    );
    return () => unsub();
  }, [user?.uid, monthStart.getTime(), monthEnd.getTime()]);

  const totals = useMemo(() => {
    let income = 0, expense = 0;
    for (const t of txns) {
      if (t.amount >= 0) income += t.amount;
      else expense += Math.abs(t.amount);
    }
    return { income, expense, net: income - expense };
  }, [txns]);

  const remaining = totals.net;
  const progressUsed = totals.income > 0 ? Math.min((totals.expense / totals.income) * 100, 100) : 0;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const renderItem = ({ item }: { item: Txn }) => {
    const isIncome = item.amount >= 0;
    return (
      <TouchableOpacity
        onLongPress={async () => {
          try { await deleteDoc(doc(db, "transactions", item.id)); }
          catch (e: any) { Alert.alert("Delete error", e?.message || "Couldn't delete item."); }
        }}
        style={styles.txnRow}
      >
        <View style={styles.txnLeft}>
          <Text style={styles.txnTitle} numberOfLines={1}>{item.title || "(No title)"}</Text>
          <Text style={styles.txnMeta}>{item.category || "Uncategorized"} • {formatDate(item.date)}</Text>
        </View>
        <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
          {isIncome ? "+" : "-"}{formatCurrency(Math.abs(Number(item.amount ?? 0)))}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <Text style={styles.heading}>Welcome To Your Expense Tracker!</Text>
        <MonthSlider label={MonthLabel} onPrev={prev} onNext={next} />

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, styles.income]}>{formatCurrency(totals.income)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expense</Text>
            <Text style={[styles.summaryValue, styles.expense]}>{formatCurrency(totals.expense)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text style={[styles.summaryValue, totals.net >= 0 ? styles.income : styles.expense]}>
              {formatCurrency(totals.net)}
            </Text>
          </View>
        </View>

        <View style={styles.topMetrics}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressUsed}%` }]} />
          </View>
          <Text style={styles.remainingLabel}>
            Remaining: {formatCurrency(remaining)} ({Math.round(progressUsed)}% used)
          </Text>

          <TouchableOpacity
            style={styles.breakdownButton}
            onPress={() => navigation.navigate("PieChart")}
          >
            <Text style={styles.breakdownText}>View Spending Breakdown 📊</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.listWrap, { maxHeight: ROW_HEIGHT * 5 }]}>
          {loading ? (
            <View style={{ paddingTop: 24 }}><ActivityIndicator /></View>
          ) : (
            <FlatList
              data={txns}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={[styles.breakdownButton, { backgroundColor: "#111827", marginTop: 0 }]}
            onPress={() => navigation.navigate("TransactionHistory")}
          >
            <Text style={[styles.breakdownText, { color: "white" }]}>View Full Expenses →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  page: { flex: 1 },
  heading: { fontSize: 22, fontWeight: "800", color: "#111827", textAlign: "center", paddingTop: 8 },

  summaryCard: {
    marginTop: 12, marginHorizontal: 16, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#E5E7EB", flexDirection: "row", justifyContent: "space-between",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  summaryItem: { alignItems: "center", flex: 1 },
  summaryLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: "800" },
  income: { color: "#16A34A" },
  expense: { color: "#DC2626" },
  topMetrics: { marginTop: 12, marginHorizontal: 16 },
  progressBar: { height: 12, backgroundColor: "#E5E7EB", borderRadius: 8, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#10B981" },
  remainingLabel: { marginTop: 6, fontSize: 12, color: "#6B7280" },
  breakdownButton: { marginTop: 12, padding: 12, backgroundColor: "#3B82F6", borderRadius: 8, alignItems: "center" },
  breakdownText: { color: "white", fontWeight: "600" },

  listWrap: { marginTop: 8 },
  sep: { height: 10 },
  txnRow: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E5E7EB", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  txnLeft: { flexShrink: 1, paddingRight: 8 },
  txnTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  txnMeta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "700", minWidth: 90, textAlign: "right" },

  bottomBar: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: "transparent" },
});
