import React, { useState, useEffect } from "react"
import { Text, View, TextInput,Image, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, Linking, ScrollView } from "react-native"

const Setting = () => {
    return (
        <ImageBackground source={require("../assets/images/city2.png")} style={{height: Dimensions.get("window").height,width: Dimensions.get("window").width,}}> 
            <View style={{flexDirection: "row",alignItems:"center",marginTop:20}}> 
                <TouchableOpacity>
                    <Image source={require('../assets/icons/back.png')} style={styles.iconHeader} />
                </TouchableOpacity>
                <Text style={{color: 'white',fontSize:25, fontWeight:'bold',marginLeft:120}}>Setting</Text>
            </View>

        </ImageBackground>
    ) 
}
export default Setting

const styles = StyleSheet.create({
    iconHeader: {
        width: 30,
        height: 30,
        marginLeft:10,
    },
});