import { StyleSheet, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";

const BackButton = ({ callFunction }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-start",
      }}
    >
      <TouchableOpacity
        onPress={callFunction}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          gap: 10,
        }}
      >
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default BackButton;

const styles = StyleSheet.create({});
