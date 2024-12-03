#include "sensorSound.h"

SensorSound::SensorSound(uint8_t pin) : _pin(pin) {
}

void SensorSound::begin() {
    pinMode(_pin, INPUT);  // Set the sensor pin as input
}

bool SensorSound::isSoundDetected() {
    int sensorValue = digitalRead(_pin);  // Read the value from the sound sensor
    return sensorValue == HIGH;  // Return true if sound is detected (HIGH state)
}
