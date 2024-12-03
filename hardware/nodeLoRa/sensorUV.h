// sensorUV.h
#ifndef SENSORUV_H
#define SENSORUV_H

#include <Arduino.h>

class SensorUV {
public:
    // Constructor
    SensorUV(int pin);

    // Initializes the sensor (e.g., setting up the pin)
    void begin();

    // Reads the raw analog value from the sensor
    int readRaw();

    // Reads and converts the sensor output to voltage
    float readVoltage();

    // Prints the analog value and voltage to the serial monitor
    void printReadings();
    float getUVIndex();

private:
    int _pin;  // The pin connected to the sensor's output
};

#endif
