import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
} from "react-native";
import { FontAwesome5, Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const MealsComponent = ({ meal }) => {
  const { navigate } = useNavigation();
  const imageSource = { uri: meal.imageLink };

  const goSomeWhere = () => {
    navigate("MealRes", { meal });
  };

  return (
    <TouchableOpacity style={stylesFn.container} onPress={goSomeWhere}>
      <View style={stylesFn.border}>
        <View style={stylesFn.SupContainerForRow}>
          <Image style={stylesFn.logo} source={imageSource} />
          <View style={stylesFn.title}>
            <Text style={stylesFn.text}>{meal.name}</Text>
            <View style={stylesFn.SupContainerForRow2}>
              <FontAwesome5 name="signal" size={15} color="black" />
              <Text style={{ fontSize: 15, paddingHorizontal: 5 }}>
                {meal.difficulty}
              </Text>
              <Entypo name="time-slot" size={15} color="black" />
              <Text style={{ fontSize: 15, paddingHorizontal: 5 }}>
                {meal.cookingTime}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MealsComponent;

const stylesFn = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 10,
    marginVertical: 5,
  },
  border: {
    borderWidth: 3,
    borderRadius: 20,
    width: Dimensions.get("window").width * 0.8,
    height: "100%",
  },
  SupContainerForRow: {
    flexDirection: "row",
  },
  SupContainerForRow2: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    height: 100,
    width: 100,

    borderBottomLeftRadius:17,
    borderTopLeftRadius:17,

  },
  title: {
    justifyContent: "center",
    alignItems: "center",
    width: Dimensions.get("window").width * 0.8 - 110,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom: 5,
  },
});
