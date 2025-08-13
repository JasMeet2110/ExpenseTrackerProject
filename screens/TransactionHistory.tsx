import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection, onSnapshot, orderBy, query, where, Timestamp, DocumentData,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import MonthSlider from "../components/MonthSlider";
import { useMonthRange } from "../hooks/useMonthRange";

type Txn = {
  id: string; uid: string; title: string; amount: number; date: Timestamp;
  category?: string; description?: string;
};

export default function TransactionHistoryScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);

  const { monthStart, monthEnd, label, prev, next } = useMonthRange();

  useEffect(() => { navigation?.setOptions?.({ headerShown: false }); }, [navigation]);
  useEffect(() => { const u = onAuthStateChanged(auth, setUser); return () => u(); }, []);

  useEffect(() => {
    if (!user) { setTxns([]); setLoading(false); return; }
    setLoading(true);

    const q = query(
      collection(db, "transactions"),
      where("uid", "==", user.uid),
      where("date", ">=", Timestamp.fromDate(monthStart)),
      where("date", "<", Timestamp.fromDate(monthEnd)),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(q, snap => {
      const rows: Txn[] = [];
      snap.forEach(doc => {
        const d = doc.data() as DocumentData;
        rows.push({
          id: doc.id, uid: d.uid, title: d.title ?? "",
          amount: Number(d.amount ?? 0), date: d.date as Timestamp,
          category: d.category, description: d.description,
        });
      });
      setTxns(rows); setLoading(false);
    }, e => { console.error("History listener:", e); setLoading(false); });

    return () => unsub();
  }, [user?.uid, monthStart.getTime(), monthEnd.getTime()]);

  const fmtCurrency = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "CAD" });
  const fmtShort = (d: Date) => new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(d);

  const renderItem = ({ item }: { item: Txn }) => {
    const isExpense = item.amount < 0;
    const when = item.date?.toDate ? fmtShort(item.date.toDate()) : "";
    return (
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={1}>{item.title || item.category || "Transaction"}</Text>
          <Text style={styles.rowSub} numberOfLines={1}>{item.category || "Uncategorized"} • {when}</Text>
          {item.description ? <Text style={styles.rowDesc} numberOfLines={1}>{item.description}</Text> : null}
        </View>
        <Text style={[styles.rowAmt, isExpense ? styles.neg : styles.pos]}>
          {isExpense ? `-${fmtCurrency(Math.abs(item.amount))}` : `+${fmtCurrency(item.amount)}`}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.heading}>Transaction History</Text>
      <MonthSlider label={label} onPrev={prev} onNext={next} />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={txns}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No transactions</Text>
              <Text style={styles.emptySub}>Try a different month.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  heading: { fontSize: 22, fontWeight: "800", color: "#111827", textAlign: "center", paddingTop: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },

  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { color: "#374151" },

  row: {
    backgroundColor: "white", borderRadius: 12, padding: 14, marginTop: 10,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  rowTitle: { fontWeight: "700", color: "#111827" },
  rowSub: { color: "#6B7280", fontSize: 12, marginTop: 2 },
  rowDesc: { color: "#6B7280", fontSize: 12, marginTop: 2 },
  rowAmt: { fontWeight: "800" },
  pos: { color: "#16A34A" },
  neg: { color: "#DC2626" },

  emptyWrap: { padding: 24, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4 },
  emptySub: { color: "#6B7280", textAlign: "center" },
});
