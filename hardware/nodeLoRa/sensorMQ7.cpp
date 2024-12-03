#include "sensorMQ7.h"
#include <Arduino.h>  // Include the Arduino library for functions like pinMode, analogRead, etc.

static int analogPin;  // Define the pin to be used for the MQ7 sensor

// Function to initialize the sensor pin
void MQ7_init(int pin) {
    analogPin = pin;
    pinMode(analogPin, INPUT);  // Set the pin as an input
}

// Function to read the raw sensor value
int MQ7_readRaw() {
    return analogRead(analogPin);  // Read the analog value
}

// Function to calculate the PPM based on the raw value
float MQ7_getPPM(int MQ7Raw) {
    float RvRo = MQ7Raw * (MQ7_VOLTAGE_REF / MQ7_ADC_RESOLUTION);  // Convert the raw value to voltage
    float MQ7ppm = 3.027 * exp(1.0698 * (RvRo));  // Calculate the CO concentration in PPM
    return MQ7ppm;
}

// Function to convert PPM to mg/m^3
float MQ7_convertPPMtoMg(float ppm) {
    return ppm * (28.01 / 24.45);  // Convert PPM to mg/m^3
}
