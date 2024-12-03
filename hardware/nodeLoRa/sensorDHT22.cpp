// sensorDHT22.cpp
#include "sensorDHT22.h"

SensorDHT22::SensorDHT22(uint8_t pin, uint8_t type) : _pin(pin), _type(type), _dht(pin, type) {
}

void SensorDHT22::begin() {
    _dht.begin();
}

float SensorDHT22::readTemperature(bool isFahrenheit) {
    if (isFahrenheit) {
        return _dht.readTemperature(true);
    } else {
        return _dht.readTemperature();
    }
}

float SensorDHT22::readHumidity() {
    return _dht.readHumidity();
}
