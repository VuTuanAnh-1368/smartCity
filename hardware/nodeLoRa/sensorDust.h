#ifndef SDS011_H
#define SDS011_H

#include <Arduino.h>

class SDS011 {
public:
    SDS011(HardwareSerial* uart);           // Constructor to initialize the SDS011 with UART
    bool query_data();                      // Query for new measurement data
    float get_pm25();                       // Returns PM2.5 value
    float get_pm10();                       // Returns PM10 value
    bool wake();                            // Wakes up the sensor
    bool sleep();                           // Puts the sensor to sleep
    bool set_reporting_mode_query();        // Set the sensor to query mode
    bool is_packet_valid();                 // Returns true if the packet is valid

private:
    HardwareSerial* _uart;                  // UART interface
    float _pm25;                            // PM2.5 value
    float _pm10;                            // PM10 value
    bool _packet_status;                    // Packet validity status
    uint8_t _packet[10];                    // Buffer to store the packet

    void _send_command(uint8_t cmd, uint8_t mode, uint8_t param);
    bool _read_packet();                    // Reads the packet and processes it
};

#endif
