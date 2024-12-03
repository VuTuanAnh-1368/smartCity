// sensorUV.cpp
#include "sensorUV.h"

// Constructor
SensorUV::SensorUV(int pin) : _pin(pin) {}

// Initializes the sensor (e.g., setting up the pin)
void SensorUV::begin() {
    pinMode(_pin, INPUT);  // Set the sensor pin as input
}

// Reads the raw analog value from the sensor
int SensorUV::readRaw() {
    return analogRead(_pin);
}

// Reads and converts the sensor output to voltage
float SensorUV::readVoltage() {
    int analogValue = readRaw();
    // Convert the analog value to voltage (3.3V for ESP32, 12-bit ADC)
    return analogValue * (3.3 / 4095.0) / 6.1;
}

// Prints the analog value and voltage to the serial monitor
void SensorUV::printReadings() {
    int analogValue = readRaw();
    float voltage = readVoltage();

    Serial.print("Analog Value: ");
    Serial.print(analogValue);
    Serial.print(" | Voltage: ");
    Serial.print(voltage);
    Serial.println(" V");
}
// Calculates the UV index from the sensor's voltage output
float SensorUV::getUVIndex() {
    float voltage = readVoltage();

    // Assuming 1V corresponds to a UV index of 10 for scaling purposes.
    // Adjust the scaling factor based on your sensor's calibration or datasheet.
    float uvIndex = voltage * 10.0;
    return uvIndex;
}