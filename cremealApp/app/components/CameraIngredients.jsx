import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

const CameraIngredients = ({ data, onDelete }) => {

  return (
    <View style={stylesFn.container}>
      <View style={stylesFn.border}>
        <View style={stylesFn.data}>
          <View style={stylesFn.Supcontainer1}>
            <Image style={stylesFn.logo} source={{ uri: data.url }} />
          </View>
          <View style={stylesFn.Supcontainer2}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={stylesFn.TitleText}
              onTextLayout={(e) => {
                const { lines } = e.nativeEvent;
                if (lines.length > 1) {
                  setCurrentFont(currentFont - 1);
                }
              }}
            >
              {data.title}
            </Text>
          </View>
          <View style={stylesFn.Supcontainer3}>
            <TouchableOpacity onPress={() => onDelete(data.id)}>
              <AntDesign name="minuscircleo" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CameraIngredients;

const stylesFn = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width * 0.6,
    height: 40,
    borderWidth: 3,
    borderRadius: 20,
    justifyContent: "center",
    marginBottom: 3,
  },

  data: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    height: 35,
    width: 50,
    resizeMode: "center",
  },
  Supcontainer1: {
    flex: 1,
    alignItems: "center",
  },
  Supcontainer2: {
    flex: 3,
    alignItems: "center",
  },
  Supcontainer3: {
    flex: 1,
    alignItems: "center",
  },
  TitleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
});
