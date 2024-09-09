import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Entypo from "@expo/vector-icons/AntDesign";

const DropdownComponent = ({ data, sendValueToParent ,UserValue}) => {
  const [value, setValue] = useState(UserValue);
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    if (UserValue !== undefined && UserValue !== null ) {
      setValue(UserValue);
      sendValueToParent(UserValue)
    }
  }, [UserValue]);

  return (
    <View style={styles.container}>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Please select your religion"
        searchPlaceholder="Search..."
        value={value}
        onChange={(item) => {
          setValue(item.value);
          sendValueToParent(item.value);
        }}
        renderLeftIcon={() => (
          <Entypo
            name="book"
            size={20}
            style={styles.icon}
            color={isFocus ? "blue" : "black"}
          />
        )}
      />
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  container: {
    padding: 1,
    marginTop: 5,
  },
  dropdown: {
    height: 50,
    backgroundColor: "transparent",
    borderColor: "gray",
    borderWidth: 1,
    width: "100%",
    borderRadius: 5,
    padding: 5,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
