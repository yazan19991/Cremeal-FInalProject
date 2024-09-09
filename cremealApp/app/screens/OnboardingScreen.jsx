import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import slides from "../../assets/utils/onboardingData";
import { SafeAreaView } from "react-native-safe-area-context";
import Slide from "../components/Slide";
import SlidesFooter from "../components/SlidesFooter";
import SlidesHeader from "../components/SlidesHeader";
import { useRef, useState } from "react";

// get the width and height of the screen
const { width, height } = Dimensions.get("window");
const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef(null);

  const updateCurrentSlideIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(currentIndex);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SlidesHeader
        slides={slides}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        listRef={listRef}
      />
      <FlatList
        ref={listRef}
        data={slides}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        pagingEnabled // snap animation
        contentContainerStyle={{ height: height * 0.75 }}
        showsHorizontalScrollIndicator={false}
        horizontal
        renderItem={({ item }) => <Slide item={item} />}
      />
      <SlidesFooter
        slides={slides}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        listRef={listRef}
      />
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({});
