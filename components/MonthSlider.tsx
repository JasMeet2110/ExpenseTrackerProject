import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = { label: string; onPrev: () => void; onNext: () => void; style?: any; };
export default function MonthSlider({ label, onPrev, onNext, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <TouchableOpacity onPress={onPrev} style={styles.btn}><Text style={styles.btnText}>‹</Text></TouchableOpacity>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <TouchableOpacity onPress={onNext} style={styles.btn}><Text style={styles.btnText}>›</Text></TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "white", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    marginHorizontal: 16, marginTop: 8, marginBottom: 8,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  btn: { paddingHorizontal: 10, paddingVertical: 6 },
  btnText: { fontSize: 18, fontWeight: "800", color: "#111827" },
  label: { fontSize: 16, fontWeight: "700", color: "#111827" },
});
