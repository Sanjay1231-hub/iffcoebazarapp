import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PieChart({ percentage = 65, size = 120 }) {
  const half = size / 2;
  const rotate = (percentage / 100) * 360;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: half }]}>
      <View
        style={[
          styles.halfCircle,
          { width: size, height: size, borderRadius: half, transform: [{ rotate: `${rotate}deg` }] },
        ]}
      />
      <View style={[styles.center, { width: size - 40, height: size - 40, borderRadius: (size - 40) / 2 }]}>
        <Text style={styles.text}>{percentage}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 10,
    borderColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  halfCircle: {
    position: "absolute",
    borderWidth: 10,
    borderColor: "#4CAF50",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },
  center: {
    position: "absolute",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "bold",
    fontSize: 18,
  },
});
