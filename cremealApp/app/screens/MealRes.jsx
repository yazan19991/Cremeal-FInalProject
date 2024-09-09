import {
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign, FontAwesome5, Entypo } from "@expo/vector-icons";
import PopupMenu from "../components/popup";
import { useSelector } from 'react-redux';

export function MealRes() {
  const navigation = useNavigation();
  const route = useRoute();
  const { meal } = route.params;
  const userInfo = useSelector((state) => state.user.userInformation);
  const LeftArrowOnPress = () => {
    navigation.goBack();
  };

  const processIngredients = (data = "") => {
    const ingredientsArray = data.split(",");
    return ingredientsArray.map((ingredient, index) => ({
      id: `${index}`,
      name: ingredient.charAt(0) === " " ? ingredient.substring(1) : ingredient,
    }));
  };

  return (
    <SafeAreaView style={stylesFn.container}>
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
          <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "center" }}>
            {meal.name}
          </Text>
        </View>
        <View style={stylesFn.SupSupContainer1}>
          <PopupMenu meal={meal} user={userInfo}/>
        </View>
      </View>
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
      <View style={stylesFn.SupContainer2}>
        <Image style={stylesFn.logo} source={{ uri: meal.imageLink }} />
      </View>
      <SafeAreaView style={stylesFn.SupContainer3}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={stylesFn.center}>
            <Text style={stylesFn.title}>Ingredients</Text>
          </View>
          <View style={{ padding: 20 }}>
            {processIngredients(meal.ingredients).map((item, index) => (
              <View key={index} style={stylesFn.listItem}>
                <Text style={stylesFn.bulletPoint}>•</Text>
                <Text
                  style={[stylesFn.itemText, { flex: 1, flexWrap: "wrap" }]}
                >
                  {item.name}
                </Text>
              </View>
            ))}
          </View>

          <View style={[stylesFn.center, { marginHorizontal: "5%" }]}>
            <Text style={stylesFn.title}>Instructions</Text>
            <Text style={[stylesFn.text, { textAlign: "left" }]}>
              {meal.instructions.replace(/(\.)/g, "$1\n").replace(/\n /g, "\n")}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const stylesFn = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  fillspace: {
    flex: 0.1,
  },
  SupContainer1: {
    flex: 0.2,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  SupContainer2: {
    flex: 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  SupContainer3: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e9f4f9",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  logo: {
    height: 200,
    width: 200,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  center: {
    alignItems: "center",
  },
  SupSupContainer2: {
    flex: 2,
    alignItems: "center",
  },
  SupSupContainer1: {
    flex: 1,
    alignItems: "center",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  bulletPoint: {
    marginRight: 10,
    fontSize: 30,
  },
  itemText: {
    fontSize: 20,
    flex: 1,
    flexWrap: "wrap",
  },
  SupContainerForRow2: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
});
