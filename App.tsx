import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './src/screen/home';
import Weather from './src/screen/weather';
import InforAQI from './src/screen/infoAQI';

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen 
                    name="Home" 
                    component={Home} 
                    options={{ headerShown: false }} // This hides the header
                />
                <Stack.Screen 
                    name="Weather" 
                    component={Weather} 
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="InforAQI" 
                    component={InforAQI} 
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
