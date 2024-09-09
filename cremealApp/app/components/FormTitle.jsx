import {  StyleSheet, Text, View } from "react-native";
import React from "react";

const FormTitle = ({ title, description, style }) => {
  return (
    <View style={[styles.title, style]}>
      <Text style={{ fontSize: 40, fontWeight: "bold", textAlign: "center" }}>
        {title}
        <Text style={{ color: "blue" }}>.</Text>
      </Text>
      <Text style={{ width: "60%", textAlign: "center" }}>{description}</Text>
    </View>
  );
};

export default FormTitle;

const styles = StyleSheet.create({
  title: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});
