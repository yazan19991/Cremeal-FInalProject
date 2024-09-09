import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import MealsComponent from "../components/MealsComponent";
import React, { useState, useEffect } from "react";
import { useNavigation, useFocusEffect,useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";
export function GeneratedMeal({ route }) {
  const { navigate } = useNavigation();
  const [mealL, setMealL] = useState(route.params?.meals?.flat() || []);
  const pageTitle = route.params.title;
  const favoriteMeals = useSelector((state) => state.FavoriteMeal.FavoriteMeals);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const LeftArrowOnPress = () => {
    navigate("HomeScreen");
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (pageTitle === "Favorite meal") {
        setMealL(favoriteMeals);
        console.log("setMealL(favoriteMeals):", favoriteMeals)

      }
    });

    return unsubscribe; 
  }, [favoriteMeals, pageTitle]);


  return (
    <View style={stylesFn.container}>
      <View style={stylesFn.fillspace}></View>
      <View style={stylesFn.SupContainer1}>
        <View style={stylesFn.SupSupContainer1}>
          <AntDesign
            style={stylesFn.BackArrow}
            onPress={LeftArrowOnPress}
            name="arrowleft"
            size={30}
            color="black"
          />
        </View>
        <View style={stylesFn.SupSupContainer2}>
          <Text style={{ fontSize: 20, fontWeight: "bold", right: 20 }}>
            {pageTitle}
          </Text>
        </View>
      </View>
      <View style={stylesFn.SupContainer2}>
        <SafeAreaView>
          <ScrollView
            style={{
              showsHorizontalScrollIndicator: false,
              showsHorizontalScrollIndicator: false,
            }}
          >
            {mealL.map((meal, index) => (
              
              <View key={index}>
                <MealsComponent meal={meal} />
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
}
const stylesFn = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  fillspace: {
    flex: 0.2,
  },
  SupContainer1: {
    flex: 0.5,
    alignItems: "center",
    flexDirection: "row",
  },
  SupContainer2: {
    flex: 5,
    alignItems: "center",
  },
  SupContainer3: {
    flex: 0.5,
  },
  SupSupContainer2: {
    flex: 0.9,
    alignItems: "center",
  },
  SupSupContainer1: {
    flex: 0.1,
    alignItems: "center",
  },
});
