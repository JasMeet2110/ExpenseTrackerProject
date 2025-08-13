import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { G, Path, Circle } from "react-native-svg";
import {
  collection, onSnapshot, orderBy, query, where, Timestamp, DocumentData,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "../firebase/firebaseConfig";
import MonthSlider from "../components/MonthSlider";
import { useMonthRange } from "../hooks/useMonthRange";

type Txn = { id: string; uid: string; title: string; amount: number; date: Timestamp; category?: string; };

const palette = ["#2563EB","#F59E0B","#EF4444","#8B5CF6","#EC4899","#06B6D4","#22C55E","#F97316","#A855F7","#14B8A6","#EAB308","#F43F5E","#3B82F6","#84CC16","#0EA5E9"];
const getColor = (i:number) => palette[i % palette.length];
const fmtMoney = (n:number)=> n.toLocaleString(undefined,{style:"currency",currency:"CAD"});

function arcPath(cx:number, cy:number, rOuter:number, rInner:number, start:number, end:number){
  const largeArc = end - start > Math.PI ? 1 : 0;
  const sxO = cx + rOuter*Math.cos(start), syO = cy + rOuter*Math.sin(start);
  const exO = cx + rOuter*Math.cos(end),   eyO = cy + rOuter*Math.sin(end);
  const sxI = cx + rInner*Math.cos(end),   syI = cy + rInner*Math.sin(end);
  const exI = cx + rInner*Math.cos(start), eyI = cy + rInner*Math.sin(start);
  return [`M ${sxO} ${syO}`, `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${exO} ${eyO}`, `L ${sxI} ${syI}`, `A ${rInner} ${rInner} 0 ${largeArc} 0 ${exI} ${eyI}`, "Z"].join(" ");
}

export default function PieChartScreen() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [txns, setTxns] = useState<Txn[]>([]);
  const { monthStart, monthEnd, label, prev, next } = useMonthRange();

  useEffect(()=>{ const u = onAuthStateChanged(auth, setUser); return ()=>u(); },[]);

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
        rows.push({ id: doc.id, uid: d.uid, title: d.title ?? "", amount: Number(d.amount ?? 0), date: d.date as Timestamp, category: d.category ?? "Other" });
      });
      setTxns(rows); setLoading(false);
    }, e => { console.error("Pie listener:", e); setLoading(false); });
    return () => unsub();
  }, [user?.uid, monthStart.getTime(), monthEnd.getTime()]);

  const { income, byCat, expTotal } = useMemo(() => {
    let inc = 0; const map = new Map<string,number>();
    for (const t of txns) {
      if (t.amount >= 0) inc += t.amount;
      else map.set(t.category ?? "Other", (map.get(t.category ?? "Other") ?? 0) + Math.abs(t.amount));
    }
    const arr = [...map.entries()].map(([name, amount]) => ({ name, amount }));
    const e = arr.reduce((a,b)=>a+b.amount,0);
    return { income: inc, byCat: arr, expTotal: e };
  }, [txns]);

  const slices = useMemo(() => {
    const remaining = Math.max(0, income - expTotal);
    const rows: { name:string; amount:number; color:string }[] = [];
    if (remaining > 0) rows.push({ name: "Remaining", amount: remaining, color: "#16A34A" });
    byCat.forEach((c, i) => rows.push({ ...c, color: getColor(i) }));
    return rows.length ? rows : [{ name: "No Data", amount: 1, color: "#D1D5DB" }];
  }, [income, expTotal, byCat]);

  const total = (() => {
    const remaining = Math.max(0, income - expTotal);
    return remaining > 0 ? income : expTotal;
  })();

  let sum = 0;
  const cumulative = slices.map(s => {
    const start = total > 0 ? (sum/total)*Math.PI*2 : 0;
    sum += s.amount;
    const end = total > 0 ? (sum/total)*Math.PI*2 : 0;
    return { ...s, start, end };
  });

  // sizing
  const size = Math.min(Dimensions.get("window").width, 340);
  const outer = size * 0.36, inner = outer * 0.6, cx = size/2, cy = size/2;

  const percent = (amt:number) => total>0 ? (amt/total)*100 : 0;
  const remainingNow = Math.max(0, income - expTotal);
  const overBudget = expTotal > income;

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.heading}>Spending Breakdown</Text>
      <MonthSlider label={label} onPrev={prev} onNext={next} />

      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator/><Text style={styles.loadingText}>Loading…</Text></View>
      ) : (
        <>
          <View style={styles.chartWrap}>
            <Svg width={size} height={size}>
              <G>
                {cumulative.map((s, i) => (
                  <Path key={s.name + i}
                        d={arcPath(cx, cy, outer, inner, s.start - Math.PI/2, s.end - Math.PI/2)}
                        fill={s.color} />
                ))}
                <Circle cx={cx} cy={cy} r={inner} fill="#FFFFFF" />
              </G>
            </Svg>
            <View style={styles.centerLabel}>
              <Text style={styles.centerTop}>{remainingNow > 0 ? "Remaining" : "Expenses"}</Text>
              <Text style={[styles.centerVal, remainingNow > 0 ? styles.pos : styles.neg]}>
                {fmtMoney(remainingNow > 0 ? remainingNow : expTotal)}
              </Text>
            </View>
          </View>

          {overBudget ? (
            <Text style={styles.note}>Expenses exceed income — pie shows expenses only.</Text>
          ) : null}

          <View style={styles.table}>
            <View style={[styles.tr, styles.thead]}>
              <Text style={[styles.th, { flex: 2 }]}>Category</Text>
              <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Amount</Text>
              <Text style={[styles.th, { width: 70, textAlign: "right" }]}>%</Text>
            </View>
            <FlatList
              data={slices}
              keyExtractor={(it, idx) => it.name + idx}
              renderItem={({ item, index }) => (
                <View style={styles.tr}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 2 }}>
                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                    <Text style={styles.tdText} numberOfLines={1}>{item.name}</Text>
                  </View>
                  <Text style={[styles.tdText, { flex: 1, textAlign: "right" }]}>{fmtMoney(item.amount)}</Text>
                  <Text style={[styles.tdText, { width: 70, textAlign: "right" }]}>{percent(item.amount).toFixed(1)}%</Text>
                </View>
              )}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  heading: { fontSize: 22, fontWeight: "800", color: "#111827", textAlign: "center", paddingTop: 8 },
  chartWrap: { alignItems: "center", justifyContent: "center", marginTop: 6, marginBottom: 6 },
  centerLabel: { position: "absolute", alignItems: "center", justifyContent: "center" },
  centerTop: { color: "#6B7280", fontSize: 12 },
  centerVal: { fontSize: 16, fontWeight: "800" },
  pos: { color: "#16A34A" }, neg: { color: "#DC2626" },

  table: {
    backgroundColor: "white", borderRadius: 14, margin: 16, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  thead: { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#E5E7EB" },
  tr: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 10 },
  th: { color: "#111827", fontWeight: "800" },
  tdText: { color: "#111827" },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },

  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { color: "#374151" },
  note: { color: "#DC2626", fontSize: 12, textAlign: "center", marginHorizontal: 16, marginBottom: 8 },
});
