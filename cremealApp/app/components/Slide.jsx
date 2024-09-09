import { StyleSheet, View, Image, Dimensions, Text } from "react-native";
const { width } = Dimensions.get("window");

const Slide = ({ item }) => {
  return (
    <View style={{ alignItems: "center" }}>
      <Image
        source={item.image}
        style={{
          height: "75%",
          width,
          resizeMode: "contain",
        }}
      />
      <Text style={styles.titleStyle}>{item.title}</Text>
      <Text>{item.description}</Text>
    </View>
  );
};

export default Slide;

const styles = StyleSheet.create({
  titleStyle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
