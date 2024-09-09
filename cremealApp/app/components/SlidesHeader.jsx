import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

const SlidesHeader = ({ slides, currentIndex, setCurrentIndex, listRef }) => {
  const skip = () => {
    const lastSlidesIndex = slides.length - 1;
    const offset = lastSlidesIndex * width;
    listRef?.current?.scrollToOffset({ offset });
    setCurrentIndex(lastSlidesIndex);
  };
  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "flex-end",
        margin: currentIndex != slides.length - 1 ? 20 : 40.5,
      }}
    >
      {currentIndex != slides.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={skip}>
          <Text>Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SlidesHeader;

const styles = StyleSheet.create({
  skipBtn: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#f1f1f1",
    borderColor: "gray",
    borderStyle: "solid",
    borderWidth: 1,
  },
});
