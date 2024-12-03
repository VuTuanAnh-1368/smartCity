#ifndef LINEAR_REGRESSION_MODEL_H
#define LINEAR_REGRESSION_MODEL_H

float coefficients[] = {1.12462003, -0.14437236, -0.02107856};
float intercept = 3.511364;

float predict(float features[]) {
    float result = intercept;
    for (int i = 0; i < sizeof(coefficients) / sizeof(coefficients[0]); i++) {
        result += coefficients[i] * features[i];
    }
    return result;
}

#endif // LINEAR_REGRESSION_MODEL_H
