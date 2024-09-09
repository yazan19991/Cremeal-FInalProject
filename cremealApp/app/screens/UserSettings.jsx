import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableHighlight,
  StyleSheet,
  Share,
} from "react-native";
import React, {  useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  AntDesign,
  Ionicons,
  FontAwesome5,
  FontAwesome,
} from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";
import AppLoader from "../components/AppLoader";
import { useSelector } from 'react-redux';


export function UserSettings() {
  const { navigate } = useNavigation();
  const [isBusy, setBusy] = useState(false);
  const UserImage = useSelector((state) => state.user.userImage);

  const url = 'https://www.youtube.com/watch?v=mWonAu_4-R0&t'
  const LeftArrowOnPress = () => {
    navigate("TabHomeScreen");
  };
  const EditProfileOnPress = () => {
    navigate("EditProfile");
  };
  const buyOnPress = () => {
    navigate("SelectPlanScreen");
  };

  const inviteOnPress = async () => {
    try {
      await Share.share({
          message: ('invite your friend to use cremeal\n'+url)
      });
  } catch (error) {
      console.error('Error sharing:', error);
  }
  };
  return (
    <SafeAreaView style={stylesFn.SafeAreaView}>
      {isBusy ? (
        <AppLoader/>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={stylesFn.SupContainer1}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <AntDesign
                style={stylesFn.BackArrow}
                onPress={LeftArrowOnPress}
                name="arrowleft"
                size={30}
                color="black"
              />
              <Text style={stylesFn.Title}> Profile </Text>
            </View>
            <View></View>
          </View>
          <View style={stylesFn.SupContainer2}>
            <Image
              style={stylesFn.profileImg}
              source={{ uri: UserImage }}
            />
          </View>
          <View style={stylesFn.SupContainer3}>
            <View style={{ marginHorizontal: "7%", marginVertical: "7%" }}>
              <TouchableHighlight
                onPress={EditProfileOnPress}
                underlayColor="white"
              >
                <View style={stylesFn.OptionsContainer1}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="person" size={24} color="#0056D2" />
                    <Text style={stylesFn.OptionsTitle}> Edit Profile </Text>
                  </View>
                  <View>
                    <AntDesign name="right" size={24} color="black" />
                  </View>
                </View>
              </TouchableHighlight>
              {/* -------------------------------------------------------------------- */}
              <TouchableHighlight underlayColor="white" onPress={buyOnPress}>
                <View style={stylesFn.OptionsContainer1}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="card" size={24} color="#0056D2" />
                    <Text style={stylesFn.OptionsTitle}>
                      {" "}
                      Buy Coins
                    </Text>
                  </View>
                  <View>
                    <AntDesign name="right" size={24} color="black" />
                  </View>
                </View>
              </TouchableHighlight>
              {/* -------------------------------------------------------------------- */}
              <TouchableHighlight underlayColor="white">
                <View style={stylesFn.OptionsContainer1}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="newspaper" size={24} color="#0056D2" />
                    <Text style={stylesFn.OptionsTitle}>
                      {" "}
                      Terms & Conditions{"\n"} (coming soon){" "}
                    </Text>
                  </View>
                  <View>
                    <AntDesign name="right" size={24} color="black" />
                  </View>
                </View>
              </TouchableHighlight>
              {/* -------------------------------------------------------------------- */}
              <TouchableHighlight underlayColor="white">
                <View style={stylesFn.OptionsContainer1}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <FontAwesome5 name="headset" size={24} color="#0056D2" />
                    <Text style={stylesFn.OptionsTitle}>
                      {" "}
                      Help Center{"\n"} (coming soon){" "}
                    </Text>
                  </View>
                  <View>
                    <AntDesign name="right" size={24} color="black" />
                  </View>
                </View>
              </TouchableHighlight>
              {/* -------------------------------------------------------------------- */}
              <TouchableHighlight
                onPress={inviteOnPress}
                underlayColor="white"
              >
                <View style={stylesFn.OptionsContainer1}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <FontAwesome name="paper-plane" size={24} color="#0056D2" />
                    <Text style={stylesFn.OptionsTitle}>
                      {" "}
                      Invite Friends
                    </Text>
                  </View>
                  <View>
                    <AntDesign name="right" size={24} color="black" />
                  </View>
                </View>
              </TouchableHighlight>
            </View>
          </View>
          <View style={stylesFn.SupContainer4}></View>
          <View style={stylesFn.SupContainer4}></View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const stylesFn = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  SupContainer1: {
    flex: 0.4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: "7%",
  },
  SupContainer2: {
    flex: 0.1,
    alignItems: "center",
    marginHorizontal: "7%",
  },
  SupContainer3: {
    flex: 0.5,
    backgroundColor: "#F4F9FF",
    borderWidth: 3,
    borderRadius: 20,
    borderColor: "#DEDEDE",
    marginHorizontal: "7%",
  },
  SupContainer4: {
    flex: 0.5,
  },
  Title: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "900",
  },
  OptionsTitle: {
    color: "#202244",
    fontSize: 20,
    fontWeight: "900",
    marginLeft: "5%",
  },
  OptionsContainer1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  profileImg: {
    height: 80,
    width: 80,
    borderRadius: 40,
  },
});
