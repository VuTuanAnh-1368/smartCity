import React, { useState, useEffect } from "react"
import { Text, View, Image, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, Linking, ScrollView, Modal, FlatList } from 'react-native';
import database from '@react-native-firebase/database';
import policyData from '../utils/policy.json'; 
import aboutData from '../utils/about.json';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import PushNotification from 'react-native-push-notification';

PushNotification.configure({
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
    },
    requestPermissions: true,
  });

const Home = () => {
    const navigation = useNavigation();

    // Function to trigger local notifications
    const triggerLocalNotification = (title, message) => {
        PushNotification.localNotification({
            channelId: "default-channel-id", // The same channel ID we created earlier
            title: title, // Notification title
            message: message, // Notification message
            playSound: true,
            soundName: 'default', // Default sound
            priority: 'high',
            vibrate: true,
            vibration: 300, // Vibration duration
        });
     };

  // Check AQI and temperature to trigger notifications
  const checkForNotifications = (data) => {
    if (data) {
      if (data.AQI > 100) {
        triggerLocalNotification('Air Quality Alert', 'Chất lượng không khí không tốt!');
      }
      if (data.AQI > 200) {
        triggerLocalNotification('Severe Air Quality Alert', 'Chất lượng không khí rất xấu, hạn chế ra ngoài!');
      }

      if (data.PreAQI > 100) {
        triggerLocalNotification('Air Quality Alert', 'Dự đoán chất lượng không khí không tốt trong 1 giờ tới!');
      }
      if (data.PreAQI > 200) {
        triggerLocalNotification('Severe Air Quality Alert', 'Dự đoán chất lượng không khí rất xấu trong 1 giờ tới, hạn chế ra ngoài!');
      }

      if (data.temperature > 35) {
        triggerLocalNotification('Heat Alert', 'Nhiệt độ tăng cao, chú ý khi ra đường!');
      } else if (data.temperature < 10) {
        triggerLocalNotification('Cold Alert', 'Nhiệt độ thấp, hãy mặc ấm khi ra đường!');
      }

      if (data.PM25 > 50) {
        triggerLocalNotification('PM2.5 Alert', 'Nồng độ PM2.5 cao!');
      }

      if (data.PM10 > 100) {
        triggerLocalNotification('PM10 Alert', 'Nồng độ PM10 cao!');
      }

      if (data.humidity < 30) {
        triggerLocalNotification('Humidity Alert', 'Độ ẩm thấp, hãy cẩn thận!');
      }

      if (data.CO > 1000) {
        triggerLocalNotification('CO Alert', 'Nồng độ CO cao, có thể nguy hiểm nếu hít phải nhiều!');
      }

      if (data.uvIndex > 8) {
        triggerLocalNotification('UV Index Alert', 'Chỉ số UV cao, hãy che chắn và dùng kem chống nắng khi ra đường!');
      } else if (data.uvIndex > 11) {
        triggerLocalNotification('Extreme UV Alert', 'Chỉ số UV cực cao, hạn chế ra ngoài để tránh tổn thương da!');
      }
    }
  };

    
    const [locationAData, setLocationAData] = useState(null);
    const [locationBData, setLocationBData] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const [cities, setCities] = useState(['Ha Noi', 'Ho Chi Minh', 'An Giang', 'Bac Giang', 'Bac Kan', 'Bac Ninh', 'Binh Dinh', 'Binh Thuan', 'Cao Bang', 'Ha Giang']);
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');

    // Fetch data based on selected district
    useEffect(() => {
        let locationRef;
        if (selectedDistrict === 'Q. Cau Giay') {
            locationRef = database().ref('/smartcity/locationA');
        } else if (selectedDistrict === 'Q. Thanh Xuan') {
            locationRef = database().ref('/smartcity/locationB');
        }

        if (locationRef) {
            locationRef.on('value', snapshot => {
                const data = snapshot.val();
                if (selectedDistrict === 'Q. Cau Giay') {
                    setLocationAData(data);
                } else if (selectedDistrict === 'Q. Thanh Xuan') {
                    setLocationBData(data);
                }
            });

            return () => locationRef.off();
        }
    }, [selectedDistrict]);

    // const [locations, setLocations] = useState(['Q. Long Bien', 'Q. Cau Giay', 'Q. Dong Da', 'Q. Tay Ho']);
    //const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const [currentStep, setCurrentStep] = useState('city');  // 'city' or 'district'

    const cityDistrictMapping = {
        'Ha Noi': [
            'Q. Ba Dinh', 'Q. Hoan Kiem', 'Q. Hai Ba Trung', 'Q. Dong Da', 'Q. Tay Ho', 
            'Q. Cau Giay', 'Q. Thanh Xuan', 'Q. Hoang Mai', 'Q. Long Bien', 'Q. Bac Tu Liem',
            'Q. Nam Tu Liem', 'Q. Ha Dong', 'H. Son Tay', 
            'H. Ba Vi', 'H. Phuc Tho', 'H. Dan Phuong', 'H. Hoai Duc', 
            'H. Quoc Oai', 'H. Thach That', 'H. Chuong My', 'H. Thanh Oai', 
            'H. Thuong Tin', 'H. Phu Xuyen', 'H. Ung Hoa', 'H. My Duc'
        ],
        'Ho Chi Minh': [
            'Q. 1', 'Q. 2', 'Q. 3', 'Q. 4', 'Q. 5', 'Q. 6', 'Q. 7', 
            'Q. 8', 'Q. 9', 'Q. 10', 'Q. 11', 'Q. 12', 'Q. Binh Thanh', 
            'Q. Phu Nhuan', 'Q. Go Vap', 'Q. Binh Tan', 'Q. Tan Binh',
            'Q. Tan Phu', 'Q. Thu Duc', 'H. Cu Chi', 'H. Hoc Mon', 
            'H. Binh Chanh', 'H. Nha Be', 'H. Can Gio'
        ],
        'An Giang': ['Chau Doc', 'Long Xuyen', 'Tan Chau'],
        'Bac Giang': ['Yen The', 'Hiep Hoa', 'Son Dong', 'Luc Nam', 'Luc Ngan'],
        'Bac Kan': ['Ba Be', 'Ngan Son', 'Bach Thong', 'Cho Moi', 'Pac Nam'],
        'Bac Ninh': ['Yen Phong', 'Que Vo', 'Tien Du', 'Tu Son', 'Thuan Thanh'],
        'Binh Dinh': ['Quy Nhon', 'An Lao', 'Hoai Nhon', 'Phu My', 'Phu Cat'],
        'Binh Thuan': ['Phan Thiet', 'Bac Binh', 'Ham Thuan Nam', 'Tuy Phong', 'Duc Linh'],
        'Cao Bang': ['Bao Lac', 'Thach An', 'Ha Quang', 'Trung Khanh', 'Quang Uyen'],
        'Ha Giang': ['Dong Van', 'Quan Ba', 'Yen Minh', 'Meo Vac', 'Hoang Su Phi']
    };

    const handleCitySelection = (city) => {
        setDistricts(cityDistrictMapping[city]);
        setSelectedCity(city);
        setCurrentStep('district');
    };
    
    const handleDistrictSelection = (district) => {
        setSelectedDistrict(district);
        setModalVisible(false);
        setCurrentStep('city');  // Reset for next open
    };

    useEffect(() => {
        let locationRef;
        // Fetch data for Location A
        if (selectedDistrict === 'Q. Cau Giay') {
        const locationARef = database().ref('/smartcity/locationA');
        locationARef.on('value', snapshot => {
          const data = snapshot.val();
          setLocationAData(data);
          checkForNotifications(data);
        });
        } else if (selectedDistrict === 'Q. Thanh Xuan') {
        // Fetch data for Location B
        const locationBRef = database().ref('/smartcity/locationB');
        locationBRef.on('value', snapshot => {
          const data = snapshot.val();
          setLocationBData(data);
          checkForNotifications(data);
        });
    }
    
    return () => {
        if (locationRef) locationRef.off(); // Clean up listener when selectedDistrict changes
      };
    }, [selectedDistrict]);

    const [currentDate, setCurrentDate] = useState(new Date());

    const formatDate = (date) => {
          const options = { year: 'numeric', month: 'long', day: 'numeric' };
          return date.toLocaleDateString('en-US', options);
    };
  
      useEffect(() => {
          const timer = setInterval(() => {
              setCurrentDate(new Date());
          }, 1000 * 60 * 60 * 24);  // Update every 24 hours
  
          return () => clearInterval(timer);
      }, []);

      const [currentTime, setCurrentTime] = useState(new Date());

      const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { timeStyle: 'short' });
     };

     useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());  // Update the time
        }, 60 * 1000);  // Update every minute
    
        return () => clearInterval(timer);  // Clean up the interval on component unmount
    }, []);

    // Current Week Dates and Weather
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
                temp: day.day.avgtemp_c,
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
            const todayIndex = new Date().getDay();
            const startIndex = (todayIndex + 1) % 7;
            const reorderedData = formattedData.slice(startIndex).concat(formattedData.slice(0, startIndex));
            
            setWeatherData(reorderedData);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch weather data. Please try again.");
            console.error("Error fetching weather data: ", error);
        }
    };

    useEffect(() => {
        fetchWeatherData();
    }, []);


    const menuItems = [
        { label: 'Home', icon: require('../assets/icons/home.png') },
        { label: 'Weather', icon: require('../assets/icons/weather_icon.png'), screen: 'Weather' },
        { label: 'Air quality', icon: require('../assets/icons/aqi_icon.png'), screen: 'InforAQI' },
        { label: 'About', icon: require('../assets/icons/info.png') },
        { label: 'Policy', icon: require('../assets/icons/policy.png') },
    ];

    const [modalVisible1, setModalVisible1] = useState(false);
    const [policyVisible, setPolicyVisible] = useState(false);
    const handleMenuItemPress = (item) => {
        if (item.screen) {
            navigation.navigate(item.screen);
        } else if (item.label === 'About') {
            setPolicyVisible(true);
        }
        setModalVisible1(false);
    };


    const renderData = () => {
        const data = selectedDistrict === 'Q. Cau Giay' ? locationAData : locationBData;

        if (!data) return <Text>Loading...</Text>;
    };


    return (
        <ImageBackground source={require("../assets/images/city3.png")} 
                    style={{
                    height: Dimensions.get("window").height,
                    width: Dimensions.get("window").width,
                    }}>    
        <View style={{flex: 1,}}>
            <View style={styles.header}>
                <View style={{color: "red",...styles.leftHeader}}>
                    <TouchableOpacity style={{marginLeft:15,marginTop:30}} onPress={() => setModalVisible1(true)}>
                    {/* onPress={this.props.navigation.openDrawer} */}
                        <Image source={require('../assets/icons/menu.png')} style={styles.iconHeader} />
                    </TouchableOpacity>
                </View>

                {/* Modal for Menu */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible1}
                    onRequestClose={() => setModalVisible1(false)}
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <FlatList
                                data={menuItems}
                                keyExtractor={(item) => item.label}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={() => handleMenuItemPress(item)}
                                    >
                                        <Image source={item.icon} style={styles.menuIcon} />
                                        <Text style={styles.menuText}>{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible1(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>


                 {/* Modal for Policy */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={policyVisible}
          onRequestClose={() => setPolicyVisible(false)}
        >
          <View style={styles.policyModalBackground}>
            <View style={styles.policyContainer}>
              <ScrollView>
                <Text style={styles.policyTitle}>Chính sách</Text>
                <Text style={styles.policyContent}>{aboutData.about}</Text>
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPolicyVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

                <View style={styles.centerHeader}>
                    <Text style={styles.textHeader}>{selectedCity || 'Select City'}</Text>
                    <Text style={{fontSize: 15, color: "white"}}>{formatDate(currentDate)}</Text>
                </View>
               
                <Text style={{marginTop: 30, marginRight: 10, color: "red",fontWeight: 'bold'}}>
                        {selectedDistrict  || 'Select Location'}
                </Text>
                <TouchableOpacity style={{marginTop:20}} onPress={() => setModalVisible(true)}>
                    <Image source={require('../assets/icons/location.png')} style={{width: 30, height:30,}} />
                </TouchableOpacity>
                 {/* Modal Component */}
                 <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                    setCurrentStep('city');  // Reset on close
                }}
            >
                <View style={{ marginTop: 50, backgroundColor: 'white', padding: 20 }}>
                    {currentStep === 'city' ? (
                        <FlatList
                            data={cities}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleCitySelection(item)}>
                                    <Text style={{ padding: 10, fontSize: 18 }}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    ) : (
                        <FlatList
                            data={districts}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleDistrictSelection(item)}>
                                    <Text style={{ padding: 10, fontSize: 18 }}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </Modal>          
            </View>

            {/*********************Container******************************* */ }
            <View style={styles.container1}>
                <View style={styles.mainContainer1}>
                    <Text style={{fontSize: 25,...styles.textContainer1,fontWeight: "bold",}}>Sunny</Text>
                    {locationAData ? (
                    <Text style={{fontSize: 60,...styles.textContainer1,fontWeight: "bold",}}> {selectedDistrict === 'Q. Cau Giay' ? locationAData?.temperature : locationBData?.temperature || 'Loading...'}°C</Text>
                    ) : ( 
                    <Text style={{fontSize: 20,...styles.textContainer1}}>Temperature: 🔺 29°C 🔻25°C</Text>
                    )}
                    <Text style={{fontSize: 20,...styles.textContainer1}}>Temperature: 🔺 31°C 🔻25°C</Text>
                    <Text style={{fontSize: 20, ...styles.textContainer1,fontStyle: 'italic'}}>No rain</Text>
                    <Text style={{fontSize: 15, ...styles.textContainer1}}>
                         Update: {formatTime(currentTime)}
                    </Text>
                </View>
            </View>
            <View style={styles.container2}>
                <ScrollView horizontal = {true} style={{ alignItem: 'center',width: 370,}}>
                    
                    <View style={{marginRight:10,...styles.mainContainer2}}>
                        <Image source={require('../assets/icons/temperature.png')} style={{width: 40, height:40,}} />
                        {selectedDistrict === 'Q. Cau Giay' && locationAData ? (
                        <Text style={styles.numPara}>{locationAData.temperature}°C</Text>  
                        ) : selectedDistrict === 'Q. Thanh Xuan' && locationBData ? (
                        <Text style={styles.numPara}>{locationBData.temperature}°C</Text>
                        ) : (
                        <Text>Loading...</Text>
                         )}
                        <Text style={styles.textPara}>Temperature</Text>
                    </View>
                    
                    <View style={{marginRight:10,...styles.mainContainer2}}>
                        <Image source={require('../assets/icons/humidity.png')} style={{width: 35, height:34,}} />
                        {selectedDistrict === 'Q. Cau Giay' && locationAData ? (
                        <Text style={styles.numPara}>{locationAData.humidity} %</Text>
                        ) : selectedDistrict === 'Q. Thanh Xuan' && locationBData ? (
                        <Text style={styles.numPara}>{locationBData.humidity} %</Text>  
                         ) : (
                        <Text>Loading...</Text>
                         )}
                        <Text style={styles.textPara}>Humidity</Text>
                    </View>

                    <View style={{marginRight:10,...styles.mainContainer2}}>
                        <Image source={require('../assets/icons/pm25.png')} style={{width: 35, height:34,}} />
                        {selectedDistrict === 'Q. Cau Giay' && locationAData ? (
                        <Text style={styles.numPara}>{locationAData.PM25}</Text>
                        ) : selectedDistrict === 'Q. Thanh Xuan' && locationBData ? (
                        <Text style={styles.numPara}>{locationBData.PM25}</Text>  
                         ) : (
                        <Text>Loading...</Text>
                         )}
                        <Text style={styles.textPara}>PM2.5</Text>
                    </View>

                    <View style={{marginRight:10,...styles.mainContainer2}}>
                        <Image source={require('../assets/icons/pm10.png')} style={{width: 35, height:34,}} />
                        {selectedDistrict === 'Q. Cau Giay' && locationAData ? (
                        <Text style={styles.numPara}>{locationAData.PM10}</Text>
                        ) : selectedDistrict === 'Q. Thanh Xuan' && locationBData ? (
                        <Text style={styles.numPara}>{locationBData.PM10}</Text>  
                         ) : (
                        <Text>Loading...</Text>
                         )}
                        <Text style={styles.textPara}>PM10</Text>
                    </View>
                    
                    <View style={{marginRight:10,...styles.mainContainer2}}>
                        <Image source={require('../assets/icons/uv.png')} style={{width: 35, height:35,}} />
                        {selectedDistrict === 'Q. Cau Giay' && locationAData ? (
                        <Text style={styles.numPara}>{locationAData.uvIndex}</Text>
                        ) : selectedDistrict === 'Q. Thanh Xuan' && locationBData ? (
                        <Text style={styles.numPara}>{locationBData.uvIndex}</Text>  
                         ) : (
                        <Text>Loading...</Text>
                         )}
                        <Text style={styles.textPara}>UV</Text>
                    </View>
                    
                    <View style={{marginRight:10,...styles.mainContainer2}}>
                        <Image source={require('../assets/icons/co.png')} style={{width: 35, height:35,}} />
                        {selectedDistrict === 'Q. Cau Giay' && locationAData ? (
                        <Text style={styles.numPara}>{locationAData.CO}</Text>
                        ) : selectedDistrict === 'Q. Thanh Xuan' && locationBData ? (
                        <Text style={styles.numPara}>{locationBData.CO}</Text>  
                         ) : (
                        <Text>Loading...</Text>
                         )}
                        <Text style={styles.textPara}>CO</Text>
                    </View>
                    
                    <View style={{marginRight:10,...styles.mainContainer2}}>
                        <Image source={require('../assets/icons/warning.png')} style={{width: 40, height:40,}} />
                        <Text style={styles.numPara}>10 %</Text> 
                        <Text style={styles.textPara}>Warning</Text>
                    </View>
                </ScrollView>
            </View>
            
            {/*********************Footer******************************* */ }
            <View style={styles.footer}>
                <Text style={styles.weatherForecast}>Weather forecast</Text>
                <ScrollView horizontal={true} contentContainerStyle={{ alignItems: 'center' }}>
                    {weatherData.map((item, index) => (
                        <View key={index} style={styles.chooseDay}>
                            <Text style={styles.textWe}>{item.day}</Text>
                            <Text style={{ ...styles.textWe, fontSize: 12 }}>{item.date}</Text>
                            <Image source={item.icon} style={{ width: 40, height: 40 }} />
                            <Text style={styles.textWe}>{item.temp} °C</Text>
                            <Text style={styles.textWe}>{item.description}</Text>
                        </View>
                    ))}
                </ScrollView>

                <Text style={{color: '#EED5D2', fontWeight:'bold',marginHorizontal:30,marginTop:20, fontSize: 20}}>How do you feel today?</Text>
            </View>
        </View>
        </ImageBackground>
    )
}
export default Home

const styles = StyleSheet.create({
    textHeader: {
        marginTop: 25,
        fontSize: 20,
        fontWeight: "bold",
        paddingBottom: 10,
        color: "white",
    },
    iconHeader: {
        width: 20,
        height: 20,
    },
    //Header
    header: {
        flexDirection: 'row',
        marginHorizontal: 5,
        marginBottom: 25
    },
    leftHeader: {
        flex: 1
    },
    centerHeader: {
        flex: 2,
        alignItems: 'center',
    },

    //Container
    container1: {
        alignItems: 'center',
      },
    mainContainer1: {
        width: 370,
        height: 280,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 5,
        alignItems: 'center',
      },
    textContainer1: {
        paddingTop: 15,
        color: "white",
    },
    container2: {
        alignItems: 'center',
        marginVertical:10,
      },
    mainContainer2:{
        width: 95,
        height: 110,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numPara: {
        color: "white",
        fontWeight: "bold",
        marginBottom:5, 
        marginTop: 5,
        fontSize: 15,
    },
    textPara: {
        color: "white",
        fontWeight: "bold",
        fontWeight:"bold",
        fontSize: 16,
    },
    weatherForecast:{
        fontWeight:'bold',
        marginLeft: 20,
        marginTop:10, 
        fontSize: 18, 
        marginBottom: 10,
        color:'#FFFACD',
        fontStyle: 'italic',
    },
    //Footer
    footer: {
        width: 370,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        marginLeft: 10,
        marginTop: 10,
        borderRadius: 5,
        
    },
    chooseDay:{
        width: 100,
        height: 130,
       alignItems: 'center',
    },
    textWe: {
        color: "white",
        fontWeight:"bold",
        marginVertical:5,
        fontSize: 18,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },

    modalContainer: {
    width: '40%',  // 1/4 màn hình
    height: '100%',
    backgroundColor: 'white',
    padding: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    position: 'absolute',
    left: 0,  // Menu xuất hiện từ bên trái
    },

    menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
    menuIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    menuText: {
        fontSize: 18,
        color: '#333',
    },


    closeButton: {
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'red',
    fontSize: 16,
  },
  policyModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  policyContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  policyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  policyContent: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },

})