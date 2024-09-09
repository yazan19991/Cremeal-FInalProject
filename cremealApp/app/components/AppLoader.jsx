import React from 'react';
import { StyleSheet, View } from "react-native";
import LottieView from 'lottie-react-native';

const AppLoader = () => {
    console.log("AppLoader rendered");
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.container]}>
            <View style={styles.circle}>
                <LottieView
                    source={require('../../assets/utils/cremealLoading.json')}
                    autoPlay
                    loop
                    style={styles.lottie}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 1,
    },
    circle: {
        width: 200,
        height: 200,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 100, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottie: {
        width: 200, 
        height: 200,
    },
});
export default AppLoader;