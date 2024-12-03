#ifndef SENSOR_SOUND_H
#define SENSOR_SOUND_H

#include <Arduino.h>

class SensorSound {
public:
    SensorSound(uint8_t pin);  // Constructor to initialize the sensor pin
    void begin();              // Method to initialize the pin
    bool isSoundDetected();    // Method to detect sound (returns true if sound is detected)

private:
    uint8_t _pin;  // Pin where the sound sensor is connected
};

#endif // SENSOR_SOUND_H
