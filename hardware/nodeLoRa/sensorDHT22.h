
#ifndef SENSOR_DHT22_H
#define SENSOR_DHT22_H

#include <DHT.h>

class SensorDHT22 {
public:
    SensorDHT22(uint8_t pin, uint8_t type);
    void begin();
    float readTemperature(bool isFahrenheit = false);
    float readHumidity();
    float getUVIndex();

private:
    uint8_t _pin;
    uint8_t _type;
    DHT _dht;
};

#endif /* SENSOR_DHT22_H */
