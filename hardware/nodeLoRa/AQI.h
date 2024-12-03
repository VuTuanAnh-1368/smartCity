#ifndef AQI_H
#define AQI_H

#include <Arduino.h>

// Breakpoints for CO and PM2.5
const float co_breakpoints[5][4] = {
    {0, 10000, 0, 50},
    {10000, 30000, 50, 100},
    {30000, 45000, 100, 150},
    {45000, 60000, 150, 200},
    {60000, 90000, 200, 300}
};

const float pm25_breakpoints[6][4] = {
    {0, 25, 0, 50},
    {25, 50, 50, 100},
    {50, 80, 100, 150},
    {80, 150, 150, 200},
    {150, 250, 200, 300},
    {250, 350, 300, 400}
};

const float pm10_breakpoints[6][4] = {
    {0, 50, 0, 50},
    {50, 150, 50, 100},
    {150, 250, 100, 150},
    {250, 350, 150, 200},
    {350, 420, 200, 300},
    {420, 500, 300, 400}
};

// Function to calculate AQI
float calculate_aqi(float C, float bp_low, float bp_high, float I_low, float I_high);

// Function to get AQI for specific pollutant
float get_aqi(float C, String pollutant);

// Function to calculate Nowcast
float calculate_nowcast(float data[], int data_size);

#endif
