import React, { useState, useEffect } from "react"
import { Text, View, Image,  TouchableOpacity, StyleSheet, Dimensions, ImageBackground, ScrollView } from "react-native"
import { useNavigation } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import { BarChart } from "react-native-chart-kit";
import { Svg, Text as SvgText } from "react-native-svg";

const screenWidth = Dimensions.get("window").width;

const getRandomValue = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const chartConfig = {
  backgroundGradientFrom: "#1c1c1c",
  backgroundGradientTo: "#3a3a3a",
  backgroundGradientFromOpacity: 0.5,
  backgroundGradientToOpacity: 0.7,
  color: (opacity = 2) => `rgba(255, 165, 0, ${opacity})`, // White color for text and lines
  strokeWidth: 3, // Increase line thickness
  barPercentage: 0.5,
  useShadowColorFromDataset: false, // Don't use shadow color from dataset
  fillShadowGradient: `rgba(0, 150, 255, 1)`,
  fillShadowGradientOpacity: 1,
  labelColor: (opacity = 2) => `rgba(255, 165, 0, ${opacity})`,  // Màu chữ
  /* propsForDots: {
    r: "6", // Increase the radius of dots
    strokeWidth: "2",
    stroke: "#ffa726" // Outline for dots
  },
  propsForLabels: {
    fontSize: 12, // Smaller font size for readability
    fontWeight: "bold",
    fill: "#00FF00" // Green color for labels to stand out
  }, 
  */
};

const AQIDisplay = () => {
  const navigation = useNavigation();

  const [locationAData, setLocationAData] = useState(null);
  // const [locationBData, setLocationBData] = useState(null);

  useEffect(() => {
    // Fetch data for Location A
    const locationARef = database().ref('/smartcity/locationA');
    locationARef.on('value', snapshot => {
      const data = snapshot.val();
      setLocationAData(data);
    });

    /* Fetch data for Location B
    const locationBRef = database().ref('/smartcity/locationB');
    locationBRef.on('value', snapshot => {
      const data = snapshot.val();
      setLocationBData(data);
    }); */

    return () => {
      locationARef.off();
      // locationBRef.off();
    };
  }, []);

  const getCurrentDateTime = () => {
    const date = new Date();
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return `${formattedDate} ${formattedTime}`;
  };

  const aqiColors = [
    '#00FF00', // Màu xanh lá cây
    '#FFFF00', // Màu vàng
    '#FFA500', // Màu cam
    '#8A2BE2', // Màu đỏ cam
    '#FF0000', // Màu đỏ
    '#AF2D24',
  ];
  const getColorForAQI = (aqi) => {
    if (aqi >= 0 && aqi <= 50) {
        return aqiColors[0];
    } else if (aqi > 50 && aqi <= 100) {
        return aqiColors[1];
    } else if (aqi > 100 && aqi <= 150) {
        return aqiColors[2];
    } else if (aqi > 150 && aqi <= 200) {
        return aqiColors[3];
    } else if (aqi > 200 && aqi <= 300) {
        return aqiColors[4];
    } else if (aqi > 300) {
        return aqiColors[5];
    }
  };

  const getAQIStatus = (aqi) => {
    if (aqi >= 0 && aqi <= 50) return "Good";
    else if (aqi > 50 && aqi <= 100) return "Medium";
    else if (aqi > 100 && aqi <= 150) return "Poor";
    else if (aqi > 150 && aqi <= 200) return "Bad";
    else if (aqi > 200 && aqi <= 300) return "Very Bad";
    else if (aqi > 300) return "Danger";
  };

  const data = locationAData ? [
    { label: 'PM 2.5', value: locationAData.PM25, icon: require('../assets/icons/pm2_5.png') },
    { label: 'PM 10', value: locationAData.PM10, icon: require('../assets/icons/pm10.png') },
    { label: 'UV index', value: locationAData.uvIndex, icon: require('../assets/icons/uv.png') },
    { label: 'CO', value: locationAData.CO, icon: require('../assets/icons/co.png') },
    { label: 'Humidity', value: locationAData.humidity + '%', icon: require('../assets/icons/humidity.png') },
    { label: 'Temperature', value: locationAData.temperature + '°C', icon: require('../assets/icons/temperature.png') },
    { label: 'Predicted AQI', value: locationAData.PreAQI, icon: require('../assets/icons/aqi.png') },
  ] : [];

  const [hourlyAQI, setHourlyAQI] = useState(Array(24).fill(0)); // Initialize with 24 zeros
  const [hourlyTemperature, setHourlyTemperature] = useState(Array(24).fill(0)); // Initialize with 24 zeros
  const [hourlyHumidity, setHourlyHumidity] = useState(Array(24).fill(0));
  const [hourlyCO, setHourlyCO] = useState(Array(24).fill(0));
  const [hourlyPM25, setHourlyPM25] = useState(Array(24).fill(0));
  const [hourlyPM10, setHourlyPM10] = useState(Array(24).fill(0));

  useEffect(() => {
    // Get the current hour
    const currentHour = new Date().getHours();

    // Generate fake data for the last 3 hours before the current hour
    const updatedAQI = [...hourlyAQI];
    const updatedTemperature = [...hourlyTemperature];
    const updatedHumidity = [...hourlyHumidity];
    const updatedCO = [...hourlyCO];
    const updatedPM25 = [...hourlyPM25];
    const updatedPM10 = [...hourlyPM10];

    for (let i = 1; i <= 3; i++) {
      const hourIndex = (currentHour - i + 24) % 24; // Wrap around if hour goes negative
      updatedAQI[hourIndex] = getRandomValue(50, 75); // Fake AQI between 0 and 300
      updatedTemperature[hourIndex] = getRandomValue(24, 30); // Fake Temperature between 0 and 50
      updatedHumidity[hourIndex] = getRandomValue(60, 100);
      updatedCO[hourIndex] = getRandomValue(50, 100);
      updatedPM25[hourIndex] = getRandomValue(30, 80);
      updatedPM10[hourIndex] = getRandomValue(50, 100);
    }

    // Update state with the fake data for the last 3 hours
    setHourlyAQI(updatedAQI);
    setHourlyTemperature(updatedTemperature);
    setHourlyHumidity(updatedHumidity);
    setHourlyCO(updatedCO);
    setHourlyPM25(updatedPM25);
    setHourlyPM10(updatedPM10);

    // Fetch the real-time data for the current hour from Firebase
    const locationARef = database().ref('/smartcity/locationA');
    locationARef.on('value', snapshot => {
      const data = snapshot.val();
      setLocationAData(data);

      if (data) {
        // Place the real-time data at the current hour index
        const realTimeAQI = [...updatedAQI];
        const realTimeTemperature = [...updatedTemperature];
        realTimeAQI[currentHour] = data.AQI || 0;
        realTimeTemperature[currentHour] = data.temperature || 0;
        updatedHumidity[currentHour] = data.humidity || 0;
        updatedCO[currentHour] = data.CO || 0;
        updatedPM25[currentHour] = data.PM25 || 0;
        updatedPM10[currentHour] = data.PM10 || 0;

        // Update state with real-time data
        setHourlyAQI(realTimeAQI);
        setHourlyTemperature(realTimeTemperature);
        setHourlyHumidity([...updatedHumidity]);
        setHourlyCO([...updatedCO]);
        setHourlyPM25([...updatedPM25]);
        setHourlyPM10([...updatedPM10]);
      }
    });

    // Clean up the Firebase listener on component unmount
    return () => locationARef.off();
  }, []);



  return (
    <ImageBackground source={require("../assets/images/city3.png")} style={{height: Dimensions.get("window").height,width: Dimensions.get("window").width,}}> 
    <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
    <View style={{flexDirection: "row", marginTop:30}}> 
    
    <TouchableOpacity onPress={() => navigation.goBack()}> 
      <Image source={require('../assets/icons/back.png')} style={styles.iconHeader} /> 
    </TouchableOpacity>
      <Text style={{color:'white', fontWeight: 'bold', fontSize: 30, paddingLeft: 100, paddingBottom: 30}}>Ha Noi</Text>
    </View>
    
    <View style={styles.aqiScaleHeader}>
      <Text style={styles.headerText}>Air Quality Index</Text>
    </View>

      <View style={styles.aqiScaleBar}>
        <View style={[styles.aqiSegment, { backgroundColor: getColorForAQI(10) }]}><Text style={{...styles.aqiRangeText, color: 'black',}}>0-50</Text></View>
        <View style={[styles.aqiSegment, { backgroundColor: getColorForAQI(60) }]}><Text style={{...styles.aqiRangeText, color: 'black',}}>51-100</Text></View>
        <View style={[styles.aqiSegment, { backgroundColor: getColorForAQI(120) }]}><Text style={styles.aqiRangeText}>101-150</Text></View>
        <View style={[styles.aqiSegment, { backgroundColor: getColorForAQI(160) }]}><Text style={styles.aqiRangeText}>151-200</Text></View>
        <View style={[styles.aqiSegment, { backgroundColor: getColorForAQI(220) }]}><Text style={styles.aqiRangeText}>201-300</Text></View>
        <View style={[styles.aqiSegment, { backgroundColor: getColorForAQI(330) }]}><Text style={styles.aqiRangeText}>300+</Text></View>
      </View>

      <View style={styles.aqiDescriptions}>
        <View style={styles.aqiSegment}><Text style={styles.descriptionText}>Good</Text></View>
        <View style={styles.aqiSegment}><Text style={styles.descriptionText}>Medium</Text></View>
        <View style={styles.aqiSegment}><Text style={styles.descriptionText}>Poor</Text></View>
        <View style={styles.aqiSegment}><Text style={styles.descriptionText}>Bad</Text></View>
        <View style={styles.aqiSegment}><Text style={styles.descriptionText}>Very bad</Text></View>
        <View style={styles.aqiSegment}><Text style={styles.descriptionText}>Danger</Text></View>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerText}>AQI – Today</Text>
        <Text style={styles.dateTime}>Update: {getCurrentDateTime()}</Text>
      </View>

      <View style={styles.aqiContainer}>
      <View style={[styles.circle, { borderColor: locationAData ? getColorForAQI(locationAData.AQI) : '#00FF00' }]}>
     { /*  <Text style={styles.aqiText}>AQI</Text> */ }
          {locationAData ? (
            <>
              <Text style={[styles.aqiValue, { color: locationAData ? getColorForAQI(locationAData.AQI) : '#00FF00' }]}>{locationAData.AQI}</Text>
              <Text style={styles.aqiStatus}>{getAQIStatus(locationAData.AQI)}</Text>
            </>
          ) : (
            <></>
          )}
        </View>
      </View>


      <View style={styles.infoEnviroment}>
      {data.map((item, index) => (
        <View key={index} style={styles.card}>
          <Image source={item.icon} style={styles.icon} />
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
      </View>

      {/* Hourly AQI and Temperature Bar Charts */}
  
        {/* Hourly AQI Bar Chart */}
      <Text style={styles.headerText}>AQI - Hourly</Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      <BarChart
        data={{
          labels: Array.from({ length: 24 }, (_, i) => `${i}h`), // Labels 0h to 23h
          datasets: [{ data: hourlyAQI }]
        }}
        width={screenWidth * 2} // Make the chart twice as wide as the screen
        height={220}
        chartConfig={chartConfig}
        verticalLabelRotation={30}
        style={{ marginVertical: 10, marginLeft: 10 }}
      />
      </ScrollView>

      {/* Hourly Temperature Bar Chart */}
      <Text style={styles.headerText}>Temperature - Hourly</Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <BarChart
        data={{
        labels: Array.from({ length: 24 }, (_, i) => `${i}h`), // Labels 0h to 23h
        datasets: [{ data: hourlyTemperature }]
        }}
        width={screenWidth * 2} // Make the chart twice as wide as the screen
        height={220}
        chartConfig={chartConfig}
        verticalLabelRotation={30}
        style={{ marginVertical: 10, marginLeft: 10 }}
        />
        </ScrollView>

        {/* Hourly Humidity Bar Chart */}
      <Text style={styles.headerText}>Humidity - Hourly</Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      <BarChart
        data={{
        labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
        datasets: [{ data: hourlyHumidity }]
      }}
      width={screenWidth * 2}
      height={220}
      chartConfig={chartConfig}
      verticalLabelRotation={30}
      style={{ marginVertical: 10, marginLeft: 10 }}
    />
  </ScrollView>

{/* Hourly CO Bar Chart */}
<Text style={styles.headerText}>CO - Hourly</Text>
<ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
  <BarChart
    data={{
      labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
      datasets: [{ data: hourlyCO }]
    }}
    width={screenWidth * 2}
    height={220}
    chartConfig={chartConfig}
    verticalLabelRotation={30}
    style={{ marginVertical: 10, marginLeft: 10 }}
  />
</ScrollView>

{/* Hourly PM2.5 Bar Chart */}
<Text style={styles.headerText}>PM2.5 - Hourly</Text>
<ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
  <BarChart
    data={{
      labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
      datasets: [{ data: hourlyPM25 }]
    }}
    width={screenWidth * 2}
    height={220}
    chartConfig={chartConfig}
    verticalLabelRotation={30}
    style={{ marginVertical: 10, marginLeft: 10 }}
  />
</ScrollView>

{/* Hourly PM10 Bar Chart */}
<Text style={styles.headerText}>PM10 - Hourly</Text>
<ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
  <BarChart
    data={{
      labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
      datasets: [{ data: hourlyPM10 }]
    }}
    width={screenWidth * 2}
    height={220}
    chartConfig={chartConfig}
    verticalLabelRotation={30}
    fromZero={true}
    style={{ marginVertical: 10, marginLeft: 10 }}
  />
</ScrollView>
      </ScrollView>


      
      
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  iconHeader: {
    width: 30,
    height:30,
    marginLeft:10,
    },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white'
  },
  aqiScaleHeader: {
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  aqiScaleBar: {
    flexDirection: 'row',
    width: '100%',
    height: 40,
    marginBottom: 5
  },
  aqiSegment: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '17%',
  },
  descriptionText: {
    fontSize: 13,
    color: 'white',
    fontWeight: 'bold',
  },
  aqiDescriptions: {
    flexDirection: 'row',
    width: '100%',
    height: 20
  },
  aqiRangeText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  aqiTextScale: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center'
  },
  header: {
    marginTop: 50,
    marginBottom: 10,
    alignItems: 'center',
  },
  dateTime: {
    fontSize: 14,
    color: 'white',
  },
  aqiContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: "#00FF00",
    alignItems: 'center',
    justifyContent: 'center',
   
  },
  aqiText: {
    fontSize: 26,
    color: "white",
    position: 'absolute',
    fontWeight: 'bold',
    top: 20
  },
  aqiValue: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'red'
  },
  aqiStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    position: 'absolute',
    bottom: 20
  },
  details: {
    marginTop: 10
  },
  detailText: {
    fontSize: 16,
    color: 'white',
  },

  environmentalDetails: {
    width: '100%',
    paddingLeft: 30,
    paddingTop: 20,
  },

  infoEnviroment: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
   // backgroundColor: '#F0FFF0', // Màu nền nhẹ
  },
  card: {
    backgroundColor: '#F0FFFB',
    borderRadius: 8,
    width: '23%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: 30,
    height: 30,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default AQIDisplay;
