#include "sensorDust.h"
#include <Arduino.h>

SDS011::SDS011(HardwareSerial* uart) {
    _uart = uart;
    _pm25 = 0.0;
    _pm10 = 0.0;
    _packet_status = false;
}

bool SDS011::query_data() {
    _send_command(0x04, 0x00, 0x00);  // Query command
    return _read_packet();
}

float SDS011::get_pm25() {
    return _pm25;
}

float SDS011::get_pm10() {
    return _pm10;
}

bool SDS011::wake() {
    _send_command(0x06, 0x01, 0x01);  // Wake command
    return _read_packet();
}

bool SDS011::sleep() {
    _send_command(0x06, 0x01, 0x00);  // Sleep command
    return _read_packet();
}

bool SDS011::set_reporting_mode_query() {
    _send_command(0x02, 0x01, 0x01);  // Set to query mode
    return _read_packet();
}

bool SDS011::is_packet_valid() {
    return _packet_status;
}

void SDS011::_send_command(uint8_t cmd, uint8_t mode, uint8_t param) {
    uint8_t buffer[19] = {0xAA, 0xB4, cmd, mode, param, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0xAB};
    buffer[15] = (cmd + mode + param + 0xFF + 0xFF) % 256;  // Checksum
    _uart->write(buffer, 19);
}

bool SDS011::_read_packet() {
    if (_uart->available() >= 10) {
        for (int i = 0; i < 10; i++) {
            _packet[i] = _uart->read();
        }

        // Check the header and tail of the packet
        if (_packet[0] == 0xAA && _packet[9] == 0xAB) {
            // Extract PM2.5 and PM10 values
            _pm25 = (_packet[2] + (_packet[3] << 8)) / 10.0;  // PM2.5
            _pm10 = (_packet[4] + (_packet[5] << 8)) / 10.0;  // PM10

            // Verify the checksum
            uint8_t checksum = 0;
            for (int i = 2; i < 8; i++) {
                checksum += _packet[i];
            }

            _packet_status = (checksum == _packet[8]);
            return _packet_status;
        }
    }

    _packet_status = false;
    return false;
}
