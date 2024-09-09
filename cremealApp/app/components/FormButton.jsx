import { Dimensions, StyleSheet, Text } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
const { width, height } = Dimensions.get("window");

const FormButton = ({ callFunction, text, style }) => {
  return (
    <TouchableOpacity style={[styles.btn, style]} onPress={callFunction}>
      <Text style={{ color: "white" }}>{text}</Text>
    </TouchableOpacity>
  );
};

export default FormButton;

const styles = StyleSheet.create({
  btn: {
    height: 50,
    backgroundColor: "#0e82cd",
    minWidth: width - 100,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 100,
    borderRadius: 10,
  },
});
