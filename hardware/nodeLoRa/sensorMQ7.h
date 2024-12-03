
#ifndef SENSOR_MQ7_H
#define SENSOR_MQ7_H

// Define any other constants or macros, if needed
#define MQ7_VOLTAGE_REF 3.3
#define MQ7_ADC_RESOLUTION 4095

// Function declarations
void MQ7_init(int pin);
int MQ7_readRaw();
float MQ7_getPPM(int MQ7Raw);
float MQ7_convertPPMtoMg(float ppm);

#endif  // SENSOR_MQ7_H
