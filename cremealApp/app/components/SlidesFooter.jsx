import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const SlidesFooter = ({ slides, currentIndex, setCurrentIndex, listRef }) => {
  const navigation = useNavigation();
  const goNextSlide = () => {
    const nextSlideIndex = currentIndex + 1;
    if (nextSlideIndex != slides.length) {
      const offset = nextSlideIndex * width;
      listRef?.current?.scrollToOffset({ offset });
      setCurrentIndex(nextSlideIndex);
    }
  };
  const navigateToHomeScreen = () => {
    navigation.navigate("LoginScreen");
  };
  return (
    <View
      style={{
        height: height * 0.25,
        justifyContent: "center",
        marginTop: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicators,
              currentIndex == index && {
                backgroundColor: "#0e82cd",
                width: 25,
              },
            ]}
          ></View>
        ))}
      </View>
      <View style={{ marginBottom: 20, marginTop: 50 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <TouchableOpacity
            style={styles.btn}
            onPress={
              currentIndex != slides.length - 1
                ? goNextSlide
                : navigateToHomeScreen
            }
          >
            <Text style={{ color: "white", fontSize: 18 }}>
              {currentIndex != slides.length - 1 ? "CONTINUE" : "Get Start"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SlidesFooter;

const styles = StyleSheet.create({
  indicators: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "gray",
    marginHorizontal: 2,
  },
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
