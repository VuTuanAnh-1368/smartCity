#include "AQI.h"

// Function to calculate AQI based on concentration
float calculate_aqi(float C, float bp_low, float bp_high, float I_low, float I_high) {
    return ((I_high - I_low) / (bp_high - bp_low)) * (C - bp_low) + I_low;
}

// Function to determine which breakpoints to use and calculate AQI
float get_aqi(float C, String pollutant) {
    if (pollutant == "CO") {
        for (int i = 0; i < 5; i++) {
            if (C >= co_breakpoints[i][0] && C <= co_breakpoints[i][1]) {
                return calculate_aqi(C, co_breakpoints[i][0], co_breakpoints[i][1], co_breakpoints[i][2], co_breakpoints[i][3]);
            }
        }
    } else if (pollutant == "PM25") {
        for (int i = 0; i < 6; i++) {
            if (C >= pm25_breakpoints[i][0] && C <= pm25_breakpoints[i][1]) {
                return calculate_aqi(C, pm25_breakpoints[i][0], pm25_breakpoints[i][1], pm25_breakpoints[i][2], pm25_breakpoints[i][3]);
            }
        }
    }

    else if (pollutant == "PM10") {
        for (int i = 0; i < 6; i++) {
            if (C >= pm10_breakpoints[i][0] && C <= pm10_breakpoints[i][1]) {
                return calculate_aqi(C, pm10_breakpoints[i][0], pm10_breakpoints[i][1], pm10_breakpoints[i][2], pm10_breakpoints[i][3]);
            }
        }
    }
    return NAN;  // Return NaN if the concentration is out of range
}

// Function to calculate Nowcast for PM2.5
float calculate_nowcast(float data[], int data_size) {
    if (data_size < 12) {
        return NAN;  // Not enough data
    }

    // Select the last 12 values including the current hour
    float recent_data[12];
    for (int i = 0; i < 12; i++) {
        recent_data[i] = data[data_size - i - 1];
    }

    float C_max = recent_data[0];
    float C_min = recent_data[0];
    for (int i = 1; i < 12; i++) {
        if (recent_data[i] > C_max) C_max = recent_data[i];
        if (recent_data[i] < C_min) C_min = recent_data[i];
    }

    // Avoid division by zero
    float w = (C_min == 0) ? 1 : (C_min / C_max);
    if (w <= 0.5) w = 0.5;

    // Calculate weights in reverse order
    float weights[12];
    float total_weight = 0;
    float weighted_sum = 0;
    for (int i = 0; i < 12; i++) {
        weights[i] = pow(w, i);
        total_weight += weights[i];
        weighted_sum += weights[i] * recent_data[i];
    }

    return weighted_sum / total_weight;
}
