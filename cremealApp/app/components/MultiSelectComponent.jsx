import React, { useState,useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";

const MultiSelectComponent = ({ data, sendValueToParent,UserValue,reg }) => {
  const [selected, setSelected] = useState(UserValue);
  useEffect(() => {
    if (UserValue !== undefined && UserValue !== null ) {
      setSelected(UserValue);
      sendValueToParent(UserValue)
    }else if (reg) {
      setSelected([]);

    }
  }, [UserValue]);

  return (
    <View style={styles.container}>
      <MultiSelect
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        search
        data={data}
        labelField="label"
        valueField="value"
        placeholder="Please select any allergies you may have"
        searchPlaceholder="Search..."
        value={selected}
        onChange={(item) => {
          setSelected(item);
          sendValueToParent(item);
        }}
        renderLeftIcon={() => (
          <Ionicons
            name="medkit-outline"
            size={20}
            color="black"
            style={styles.icon}
          />
        )}
        selectedStyle={styles.selectedStyle}
      />
    </View>
  );
};

export default MultiSelectComponent;

const styles = StyleSheet.create({
  container: { padding: 1, marginTop: 20, marginBottom: 40 },
  dropdown: {
    height: 50,
    backgroundColor: "transparent",
    borderColor: "gray",
    borderWidth: 1,
    width: "100%",
    borderRadius: 5,
    padding: 5,
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  selectedStyle: {
    borderRadius: 12,
  },
});
