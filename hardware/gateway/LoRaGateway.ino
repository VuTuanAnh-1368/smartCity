#include <SPI.h>
#include <LoRa.h>
#include <ArduinoJson.h>
#include "verifyNode.h"
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>
#include <queue>

/*******************************************************************************
 * Definitions for Message Types LoRa
 ******************************************************************************/
#define MSG_CONFIG "CONFIG"
#define MSG_ACK "ACK"
#define MSG_VALUE_REQUEST "RE_VALUE"
#define MSG_VALUE "VALUE"


/*******************************************************************************
 * Definitions for PIN LORA
 ******************************************************************************/
#define PIN_LORA_COPI   27
#define PIN_LORA_CIPO   19
#define PIN_LORA_SCK    5
#define PIN_LORA_CS     18
#define PIN_LORA_RST    23
#define PIN_LORA_DIO0   26
#define LORA_FREQUENCY  433E6

/*******************************************************************************
 * Definitions for connect wifi interface and firebase
 ******************************************************************************/
#define WIFI_SSID "P307"
#define WIFI_PASSWORD "vutuananh8386"
#define API_KEY "AIzaSyDbqbP8or_Btv5oPlveXia4-JRGrgMIIhk"
#define DATABASE_URL "https://smartcity-9bb3d-default-rtdb.asia-southeast1.firebasedatabase.app/"


/*******************************************************************************
 * Structures sensorData for queue
 ******************************************************************************/
struct SensorData {
  String location;
  float temperature;
  float humidity;
  float co;
  float pm25;
  float pm10;
  float uvIndex;
  int aqindex;
  int preAQI;
};

/*******************************************************************************
 * Code
 ******************************************************************************/

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false
bool isRequestValue = 0;

std::queue<SensorData> dataQueue;
unsigned long lastProcessTime = 0;


/*******************************************************************************
 * Setup function
 ******************************************************************************/
void setup() {
  Serial.begin (115200);
  while (!Serial);
  delay (1500);
  Serial.println ("LoRa Receiver");

  LoRa.setPins (PIN_LORA_CS, PIN_LORA_RST, PIN_LORA_DIO0);
  LoRa.setSPIFrequency (20000000);
  
  /** Config for LoRa */
  LoRa.setTxPower(20); // Cài đặt công suất phát là 20 dBm
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
  }


  /* Connect to Wi-Fi */
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Firebase API and Database URL setup
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Firebase sign-up
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase Sign-up Successful");
    signupOK = true;
  } else {
    Serial.printf("Firebase Sign-up Error: %s\n", config.signer.signupError.message.c_str());
  }

  // Callback for token generation status
  config.token_status_callback = tokenStatusCallback;
  
  // Initialize Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

/*******************************************************************************
 * Loop function
 ******************************************************************************/
void loop() {
    int packetSize = LoRa.parsePacket();
    if (packetSize) {
        String incoming = receivePacket();
        StaticJsonDocument<300> doc;
        deserializeJson(doc, incoming);
        String mac = doc["mac"];
        Serial.println(mac);
        if (isAllowedMAC(mac.c_str())) {
           String location = String(getLocation(mac.c_str()).c_str());
            if (doc["type"] == MSG_CONFIG) {
                // Handle configuration data
                Serial.println("Configuration received");
                sendACK(mac);
                delay(1000); // Simulate processing delay
                sendSensorDataRequest(mac);
            } else if (doc["type"] == MSG_VALUE) {
                // Handle sensor values

                float temp = doc["TEMP"];
                float hum = doc["HUM"];
                float co = doc["CO"];
                float pm25 = doc["PM25"];
                float pm10 = doc["PM10"];
                float uv = doc["UV"];
                int aqindex = doc["AQIndex"];
                int preAQI = doc["PreAQI"];
                
                Serial.println(location);
                enqueueData(location, temp, hum, co, pm25, pm10, uv, aqindex, preAQI);
            }
        } else {
            Serial.println("Unauthorized MAC address");
        }
    }

    processQueue(); 

}



/**
 * Enqueues sensor data into a queue for processing.
 *
 * This function creates a new SensorData object with the provided parameters and adds it to the dataQueue.
 *
 * @param location The location of the sensor data.
 * @param temperature The temperature value.
 * @param humidity The humidity value.
 * @param co The CO value.
 * @param pm25 The PM2.5 value.
 * @param pm10 The PM10 value.
 * @param uvIndex The UV index value.
 * @param aqindex The air quality index value.
 * @param preAQI The previous air quality index value.
 *
 * @return void
 */
void enqueueData(String location, float temperature, float humidity, float co, float pm25, float pm10, float uvIndex, int aqindex, int preAQI) {
  SensorData data = {location, temperature, humidity, co, pm25, pm10, uvIndex, aqindex, preAQI};
  dataQueue.push(data);
}



/**
 * Processes the sensor data queue and sends the data to Firebase every 10 seconds.
 *
 * This function checks if the time elapsed since the last processing is greater than or equal to 10 seconds.
 * If the condition is met, it retrieves the first sensor data from the queue, sends it to Firebase, and then removes it from the queue.
 *
 * @return void
 */
void processQueue() {
  if (millis() - lastProcessTime >= 10000) { // Every 10 seconds
    lastProcessTime = millis();
    if (!dataQueue.empty()) {
      SensorData data = dataQueue.front(); // Retrieve the first element from the queue
      sendFirebase(data.location, data.temperature, data.humidity, data.co, data.pm25, data.pm10, data.uvIndex, data.aqindex, data.preAQI);
      dataQueue.pop(); // Remove the sent element from the queue
    }
  }
}


/**
 * Receives a LoRa packet and extracts the incoming message.
 *
 * This function continuously reads data from the LoRa module until no more data is available.
 * It then appends each received character to the 'incoming' string.
 *
 * @return A string containing the incoming LoRa message.
 */
String receivePacket() {
    String incoming = "";
    while (LoRa.available()) {
        incoming += (char)LoRa.read();
    }
    return incoming;
}


/**
 * Sends an acknowledgment (ACK) message to the specified MAC address.
 *
 * This function constructs an acknowledgment message using the provided MAC address and sends it over the LoRa module.
 * The message is formatted as a JSON object with the "type" field set to MSG_ACK and the "mac" field set to the provided MAC address.
 * The JSON object is then serialized into a string and sent over the LoRa module.
 *
 * @param mac The MAC address of the node to send the acknowledgment to.
 *
 * @return void
 */
void sendACK(const String& mac) {
    StaticJsonDocument<64> ackDoc;
    ackDoc["type"] = MSG_ACK;
    ackDoc["mac"] = mac;
    String ackMessage;
    serializeJson(ackDoc, ackMessage);
    LoRa.beginPacket();
    LoRa.print(ackMessage);
    LoRa.endPacket();
    Serial.println("ACK sent to: " + mac);
}


/**
 * Sends a sensor data request message to the specified MAC address.
 *
 * This function constructs a sensor data request message using the provided MAC address and sends it over the LoRa module.
 * The message is formatted as a JSON object with the "type" field set to MSG_VALUE_REQUEST and the "mac" field set to the provided MAC address.
 * The JSON object is then serialized into a string and sent over the LoRa module.
 *
 * @param mac The MAC address of the node to send the sensor data request to.
 *
 * @return void
 */
void sendSensorDataRequest(const String& mac) {
  StaticJsonDocument<64> reqDoc;
  reqDoc["type"] = MSG_VALUE_REQUEST;
  reqDoc["mac"] = mac;
  String reqMessage;
  serializeJson(reqDoc, reqMessage);
  LoRa.beginPacket();
  LoRa.println(reqMessage);
  LoRa.endPacket();
}


/**
 * Sends sensor data to Firebase for a specific location.
 *
 * This function checks if the Firebase client is ready and the signup process is successful.
 * It then rounds the sensor data to two decimal places and constructs the Firebase paths based on the location.
 * The function sends the sensor data to Firebase for the specific location by setting the corresponding values in the database.
 *
 * @param location The location of the sensor data.
 * @param temperature The temperature value.
 * @param humidity The humidity value.
 * @param co The CO value.
 * @param pm25 The PM2.5 value.
 * @param pm10 The PM10 value.
 * @param uvIndex The UV index value.
 * @param aqindex The air quality index value.
 * @param preAQI The previous air quality index value.
 *
 * @return void
 */
void sendFirebase(String location, float temperature, float humidity, float co, float pm25, 
                  float pm10, float uvIndex, int aqindex, int preAQI) {
  if (Firebase.ready() && signupOK) {
    sendDataPrevMillis = millis();

    temperature = round(temperature * 100.0) / 100.0;
    humidity = round(humidity * 100.0) / 100.0;
    co = round(co * 100.0) / 100.0;
    pm25 = round(pm25 * 100.0) / 100.0;
    pm10 = round(pm10 * 100.0) / 100.0;
    uvIndex = round(uvIndex * 100.0) / 100.0;

    // Create Firebase paths based on the location
    String pathTemperature = "smartcity/" + location + "/temperature";
    String pathHumidity = "smartcity/" + location + "/humidity";
    String pathCO = "smartcity/" + location + "/CO";
    String pathPM25 = "smartcity/" + location + "/PM25";
    String pathPM10 = "smartcity/" + location + "/PM10";
    String pathUVIndex = "smartcity/" + location + "/uvIndex";
    String pathAQI = "smartcity/" + location + "/AQI";
    String pathPreAQI = "smartcity/" + location + "/PreAQI";

    // Send sensor data to Firebase for the specific location
    if (Firebase.RTDB.setFloat(&fbdo, pathTemperature.c_str(), temperature) &&
        Firebase.RTDB.setFloat(&fbdo, pathHumidity.c_str(), humidity) &&
        Firebase.RTDB.setFloat(&fbdo, pathCO.c_str(), co) &&
        Firebase.RTDB.setFloat(&fbdo, pathPM25.c_str(), pm25) &&
        Firebase.RTDB.setFloat(&fbdo, pathPM10.c_str(), pm10) &&
        Firebase.RTDB.setFloat(&fbdo, pathUVIndex.c_str(), uvIndex) &&
        Firebase.RTDB.setInt(&fbdo, pathAQI.c_str(), aqindex) &&
        Firebase.RTDB.setInt(&fbdo, pathPreAQI.c_str(), preAQI)) {
      Serial.println(location + " Data Sent Successfully");
    } else {
      Serial.println(location + " Data Failed to Send");
      Serial.println("REASON: " + fbdo.errorReason());
    }
  }
}
