import React, { useState, useEffect } from "react";
import { Text, View, TextInput, Image, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, ScrollView, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const Weather = () => {
    const navigation = useNavigation();
    const [weatherData, setWeatherData] = useState([]);
    const [city, setCity] = useState("Hanoi"); // Default city name for fetching weather data

    // Function to fetch weather data from WeatherAPI
    const fetchWeatherData = async () => {
        try {
            const response = await axios.get(`https://api.weatherapi.com/v1/forecast.json?key=ca12c27bbbe84967980195208241110&q=${city}&days=7`);
            const forecast = response.data.forecast.forecastday;

            const formattedData = forecast.map(day => ({
                day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
                date: new Date(day.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                high: day.day.maxtemp_c,
                low: day.day.mintemp_c,
                icon: { uri: `https:${day.day.condition.icon}` },
                description: day.day.condition.text,
                humidity: day.day.avghumidity,
                windSpeed: day.day.maxwind_kph,
                windDirection: day.day.maxwind_dir,
                uvIndex: day.day.uv,
                precip_mm: day.day.totalprecip_mm,
                cloud: day.day.cloud,
                sunrise: day.astro.sunrise,
                sunset: day.astro.sunset,
            }));

            setWeatherData(formattedData);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch weather data. Please try again.");
            console.error("Error fetching weather data: ", error);
        }
    };

    useEffect(() => {
        fetchWeatherData();
    }, []);

    return (
        <ImageBackground source={require("../assets/images/city.png")}
            style={{
                height: Dimensions.get("window").height,
                width: Dimensions.get("window").width,
            }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={require('../assets/icons/back.png')} style={styles.iconHeader} />
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 25, fontWeight: 'bold', marginLeft: 20 }}>The next 7 days</Text>
            </View>

            <View style={styles.searchContainer}>
                <TouchableOpacity onPress={fetchWeatherData}>
                    <Image source={require('../assets/icons/search.png')} style={{ width: 30, height: 30, marginRight: 10 }} />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Search..."
                    placeholderTextColor="#888"
                    value={city}
                    onChangeText={setCity}
                />
            </View>

            {/* Display weather information for the next 7 days */}
            <ScrollView style={{ marginBottom: 40 }}>
                {weatherData.map((item, index) => (
                    <View key={index} style={styles.dayWeather}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={styles.day}>{item.day}, {item.date}</Text>
                            <Text style={styles.valueWea}>🔺{item.high}°C 🔻{item.low}°C</Text>
                            <View style={styles.img}><Image source={item.icon} style={{ width: 50, height: 50 }} /></View>
                        </View>
                        <View style={styles.div}></View>
                        <View style={styles.viewTextState}>
                            <Text style={styles.textStateWea}>{item.description}</Text>
                        </View>
                        <View style={{ flexDirection: "row", marginVertical: 10 }}>
                            <Text style={styles.infoLeft}>
                            Precipitation: {item.precip_mm} mm{'\n'}{'\n'}
                            Cloud Cover: {item.cloud}%{'\n'}{'\n'}
                            Humidity: {item.humidity}%{'\n'}{'\n'}
                            </Text>
                            <Text style={styles.infoRight}>
                                Wind Speed: {item.windSpeed} km/h{'\n'}{'\n'}
                                Sunrise: {item.sunrise}{'\n'}{'\n'}
                                Sunset: {item.sunset}{'\n'}{'\n'}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </ImageBackground>
    );
};

export default Weather;

const styles = StyleSheet.create({
    iconHeader: {
        width: 30,
        height: 30,
        marginLeft: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 5,
        marginHorizontal: 10,
        marginVertical: 20,
    },
    input: {
        height: '100%',
        fontSize: 16,
        color: 'black',
    },
    dayWeather: {
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        width: 370,
        marginLeft: 12,
        marginVertical: 15,
    },
    day: {
        flex: 3,
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
        marginLeft: 20
    },
    valueWea: {
        flex: 2,
        fontSize: 20,
        color: "white",
        marginRight: 20,
    },
    img: {
        flex: 1,
        marginLeft: 10,
    },
    div: {
        width: 320,
        height: 2,
        backgroundColor: "white",
        marginLeft: 20,
        marginTop: 15
    },
    viewTextState: {
        alignItems: "center",
        marginVertical: 15,
    },
    textStateWea: {
        fontStyle: 'italic',
        color: "white",
        alignContent: "center",
        fontSize: 20
    },
    infoLeft: {
        flex: 1,
        color: "white",
        fontSize: 14,
        marginLeft: 20
    },
    infoRight: {
        flex: 1,
        color: "white",
        fontSize: 14,
    },
});
