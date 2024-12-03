#include <SPI.h>
#include <LoRa.h>
#include <ArduinoJson.h>
#include "sensorDHT22.h"
#include "sensorSound.h"
#include "sensorUV.h"
#include "sensorMQ7.h"
#include "sensorDust.h"
#include "AQI.h"
#include "kalman.h"
#include "model.h"

/*******************************************************************************
 * Definitions For LoRa
 ******************************************************************************/
#define PIN_LORA_COPI   23
#define PIN_LORA_CIPO   19
#define PIN_LORA_SCK    18
#define PIN_LORA_CS     5
#define PIN_LORA_RST    2
#define PIN_LORA_DIO0   4
#define LORA_FREQUENCY  433E6


/*******************************************************************************
 * Definitions for Message LoRa configuration
 ******************************************************************************/
#define MSG_CONFIG "CONFIG"
#define MSG_ACK "ACK"
#define MSG_VALUE_REQUEST "RE_VALUE"
#define MSG_VALUE "VALUE"

/*******************************************************************************
 * Definitions for pin Sensors
 ******************************************************************************/
#define DHT_PIN 25
#define DHT_TYPE DHT22
#define MQ7_SENSOR_PIN 34
#define uvSensorPin 35
#define SIZE_ARR 12
#define WAKE_INTERVAL 15 * 60 * 1000000

#define WINDOW_SIZE 10 /* Fillter for window size */

SensorDHT22 dhtSensor(DHT_PIN, DHT_TYPE);
SensorUV uvSensor(uvSensorPin);
//======================================================================//
 //const String nodeMAC = "FC:B4:67:73:A4:40";  // This node's MAC address Node 2:; A0:A3:B3:AB:7E:34
 const String nodeMAC = "A0:A3:B3:AB:7E:34";
//======================================================================//
//////////// Lora
//======================================================================//
unsigned long lastConfigAttempt = 0;
unsigned long timeSendValue = 0;
bool configConfirmed = false;
bool requestValue = false;

//======================================================================//
//////////// Data
//======================================================================//
float temp = 0;
float hum = 0;
float uv = 0;
RTC_DATA_ATTR float pm25[SIZE_ARR] = {0};
RTC_DATA_ATTR float pm10[SIZE_ARR] = {0}; 
float co_reading = 0; 
float aqi_pm25 = 0;
float aqi_pm10 = 0;
float aqi_co = 0;
float aqindex = 0;
int aqiPredict = 50;
RTC_DATA_ATTR int count = 0;
float aqi_his[3] = {0};
int sendCount;

float tempBuffer[WINDOW_SIZE];  
float humBuffer[WINDOW_SIZE];  
int index = 0;              
bool bufferFull = false;

/* Define Kalman Filter instance for UV sensor */
KalmanFilter uvKalman;
/* Define Kalman Filter instance for CO sensor */
KalmanFilter coKalman;


// Initialize UART for SDS011 communication (ESP32/ESP8266)
HardwareSerial sdsSerial(1);  // UART1 for ESP32 (TX=17, RX=16)
// Create an instance of the SDS011 class
SDS011 sds011(&sdsSerial);

void setup() {
  Serial.begin (115200);

  initLoRa();
  sendConfigPacket();
  // Start DHT22
  dhtSensor.begin();
  initDust();
  // Start CO
  MQ7_init(MQ7_SENSOR_PIN);
  // Initialize the UV sensor
  uvSensor.begin();
  lastConfigAttempt = millis();
  timeSendValue = 0;
  sendCount = 0;
}

//======================================================================//

void loop() {
    if (!configConfirmed && millis() - lastConfigAttempt > 5000) { // Resend timeout
    sendConfigPacket();
    lastConfigAttempt = millis();
    }

    int packetSize = LoRa.parsePacket();
    if (packetSize && !requestValue) {
        String incoming = receivePacket();
        Serial.println(incoming);
        StaticJsonDocument<200> doc;
        deserializeJson(doc, incoming);
        String messageType = doc["type"];
        if (messageType == MSG_ACK && doc["mac"] == nodeMAC) {
            configConfirmed = true;
        }
        if (messageType == MSG_VALUE_REQUEST && configConfirmed && doc["mac"] == nodeMAC) {
          requestValue = true;
        }
    }

    if (requestValue && millis() - timeSendValue > 10000) {
      sensorUV();
      sensorDHT22();
      sensorMQ7();
      sensorDust();
      maxAQI();
      his_AQI();
      aqiPredict = predict(aqi_his);
   
      timeSendValue = millis();
      sendSensorValues();
      sendCount ++;
    }

    if (sendCount > 20) {
      esp_sleep_enable_timer_wakeup(WAKE_INTERVAL);
      esp_deep_sleep_start();
    }

}


bool initLoRa() {
  while (!Serial);
  delay (1500);
  Serial.println ("LoRa Sender");

  LoRa.setPins (PIN_LORA_CS, PIN_LORA_RST, PIN_LORA_DIO0);
  LoRa.setSPIFrequency (10000000);
  // Thiết lập các thông số để tối ưu hóa khoảng cách truyền
  LoRa.setTxPower(17); // Cài đặt công suất phát là 17 dBm
  LoRa.setSpreadingFactor(12); // Cài đặt Spreading Factor là 12
  LoRa.setSignalBandwidth(125E3); // Băng thông 125 kHz
  LoRa.setCodingRate4(5); // Coding Rate 4/5

  if (!LoRa.begin (LORA_FREQUENCY)) {
    Serial.println ("Starting LoRa failed!");
    while (1);
  }
  else {
    Serial.print ("LoRa initialized with frequency ");
    Serial.println (LORA_FREQUENCY);
    return true;
  }
}

bool checkLoRaConnection() {
  if (!LoRa.begin(LORA_FREQUENCY)) {
    Serial.println("Reconnecting LoRa...");
    delay(1000); // Cho phép một khoảng thời gian ngắn trước khi thử lại
    return initLoRa(); // Thử khởi động lại LoRa
  }
  return true; // Nếu LoRa đã sẵn sàng
}

void initDust() {
  // Start UART1 for SDS011
  sdsSerial.begin(9600, SERIAL_8N1, 16, 17); 
  delay(1000);  // Give some time for sensor to boot
  sds011.wake();  // Wake the sensor and set reporting mode to query
  delay(3000);  // Allow the sensor to stabilize after waking
  sds011.set_reporting_mode_query();
}

void sendConfigPacket() {
    StaticJsonDocument<200> doc;
    doc["type"] = MSG_CONFIG;
    doc["mac"] = nodeMAC;
    doc["config"] = "S1:T1;S2:T2";
    String message;
    serializeJson(doc, message);
    Serial.println("Sending: " + message);
    LoRa.beginPacket();
    LoRa.print(message);
    LoRa.endPacket();
}

void sendSensorValues() {
    StaticJsonDocument<300> doc;
    doc["type"] = MSG_VALUE;
    doc["mac"] = nodeMAC;
    doc["TEMP"] = temp;
    doc["HUM"] = hum;
    doc["CO"] = co_reading;
    doc["PM25"] = pm25[count - 1];
    doc["PM10"] = pm10[count - 1];
    doc["UV"] = uv;
    doc["AQIndex"] = aqindex;
    doc["PreAQI"] = aqiPredict;
    String message;
    serializeJson(doc, message);
    Serial.println(message);
    LoRa.beginPacket();
    LoRa.print(message);
    LoRa.endPacket();
}

String receivePacket() {
    String incoming = "";
    while (LoRa.available()) {
        incoming += (char)LoRa.read();
    }
    return incoming;
}
//======================================================================//


void initFilter() {
  for (int i = 0; i < WINDOW_SIZE; i++) {
    tempBuffer[i] = 0.0;
    humBuffer[i] = 0.0;
  }
}

void updateFilter(float newTemp, float newHum, float &filteredTemp, float &filteredHum) {
  tempBuffer[index] = newTemp;
  humBuffer[index] = newHum;

  index++;
  if (index >= WINDOW_SIZE) {
    index = 0;
    bufferFull = true;  
  }

  int count = bufferFull ? WINDOW_SIZE : index; 
  float tempSum = 0.0;
  float humSum = 0.0;

  for (int i = 0; i < count; i++) {
    tempSum += tempBuffer[i];
    humSum += humBuffer[i];
  }

  filteredTemp = tempSum / count;
  filteredHum = humSum / count;
}


void sensorDHT22() {
  temp = dhtSensor.readTemperature();
  hum = dhtSensor.readHumidity();
  float filteredTemp, filteredHum;
  updateFilter(temp, hum, filteredTemp, filteredHum);
  temp = filteredTemp;
  hum = filteredHum;
}

void sensorMQ7() {

  static bool isInitialized = false;
    if (!isInitialized) {
        kalman_init(&coKalman, 1.0, 1.0, 0.01); // mea_e = 1.0, est_e = 1.0, q = 0.01
        isInitialized = true;
    }

  int rawValue = MQ7_readRaw();   // Read the raw sensor value
  float ppmValue = MQ7_getPPM(rawValue);   // Calculate CO concentration in PPM
  float filteredPPM = kalman_update(&coKalman, ppmValue);
  co_reading = MQ7_convertPPMtoMg(filteredPPM);  // Convert PPM to mg/m^3 * 1000 = ug\m3
  aqi_co = get_aqi(co_reading, "CO");
}

void shiftLeft(float arr[], int size) {
    for (int i = 0; i < size - 1; i++) {
        arr[i] = arr[i + 1];
    }
}

void sensorDust() {
  if (sds011.query_data()) {
    if (count != 12) {
      pm25[count] = sds011.get_pm25();
      pm10[count] = sds011.get_pm10();
      count ++;
    }
    else {
      shiftLeft(pm25, SIZE_ARR);
      shiftLeft(pm10, SIZE_ARR);
      pm25[11] = sds011.get_pm25();
      pm10[11] = sds011.get_pm10();

      float nowcast_pm25 = calculate_nowcast(pm25, count);
      float nowcast_pm10 = calculate_nowcast(pm10, count);
      if (!isnan(nowcast_pm25)) {
        aqi_pm25 = get_aqi(nowcast_pm25, "PM25");
        Serial.println(aqi_pm25);
      } else {
        Serial.println("Not enough data to calculate Nowcast.");
      }

      if (!isnan(nowcast_pm10)) {
        aqi_pm10 = get_aqi(nowcast_pm10, "PM10");
      } else {
        Serial.println("Not enough data to calculate Nowcast.");
      }

    }

  } else {
        Serial.println("Failed to read data from sensor.");
        initDust();
  }
}

void maxAQI() {
  if (aqi_co > aqi_pm25) {
    if (aqi_co > aqi_pm10) {
      aqindex = aqi_co;
    }
    else {
      aqindex = aqi_pm10;
    }
  }
  else {
    if (aqi_pm25 > aqi_pm10) {
      aqindex = aqi_pm25;
    }
    else {
      aqindex = aqi_pm10;
    }
  }

}


void sensorUV() {

  static bool isInitialized = false;
    if (!isInitialized) {
        kalman_init(&uvKalman, 1.0, 1.0, 0.01);
        isInitialized = true;
    }

    // Read the raw UV index value
    float uvRaw = uvSensor.getUVIndex();

    // Update the Kalman Filter with the raw UV index value
    float uv = kalman_update(&uvKalman, uvRaw);
}


void his_AQI() {
    for (int i = 2; i > 0; i--) {
        aqi_his[i] = aqi_his[i - 1];
    }
    aqi_his[0] = aqindex;
}

