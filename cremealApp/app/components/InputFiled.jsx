import { Dimensions, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { Tooltip, Text, lightColors } from '@rneui/themed';

const { height } = Dimensions.get("window");
const InputFiled = ({
  control,
  Label,
  placeHolder,
  IsItPassword,
  inputName,
  error,
  tiperror,
}) => {
  const [youCanSeePassword, setYouCanSeePassword] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  return (
    <>
      <Controller
        control={control}
        render={({ field }) => (
          <View style={styles.fieldRow}>
            <Text>{Label}</Text>
            <View style={styles.inputRow}>
              <TextInput
                {...field}
                style={[styles.input, IsItPassword && { width: "90%" }]}
                placeholder={placeHolder}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                value={field.value}
                secureTextEntry={!youCanSeePassword && IsItPassword}
              />
              {IsItPassword && (
                <Feather
                  name={youCanSeePassword ? "eye-off" : "eye"}
                  size={24}
                  color="black"
                  style={{ padding: 10 }}
                  onPress={() => setYouCanSeePassword((prev) => !prev)}
                />
              )}
              {tiperror && (
                <Tooltip
                  popover={<Text>{tiperror}</Text>}
                  width={300}
                  visible={tooltipVisible}
                  onOpen={() => setTooltipVisible(true)}
                  onClose={() => setTooltipVisible(false)}
                  backgroundColor={lightColors.primary}
                >
                  <TouchableOpacity onPress={() => setTooltipVisible(true)}>
                    <MaterialIcons
                      name="error-outline"
                      size={24}
                      color="red"
                      style={styles.errorIcon}
                    />
                  </TouchableOpacity>
                </Tooltip>
              )}
            </View>
          </View>
        )}
        name={inputName}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </>
  );
};

export default InputFiled;

const styles = StyleSheet.create({
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    padding: 8,
    marginVertical: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    borderColor: "black",
    borderWidth: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  fieldRow: {
    marginTop: 5,
  },
  errorIcon: {
    marginHorizontal: 6,
  },
});