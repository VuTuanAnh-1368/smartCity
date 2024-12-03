#ifndef VERIFY_NODE_H
#define VERIFY_NODE_H

#include <string>
#include <vector>
#include <map>

#define MAC_NODE1 "FC:B4:67:73:A4:40"
#define MAC_NODE2 "A0:A3:B3:AB:7E:34"

// Allowed MAC addresses
extern std::vector<std::string> allowedMACs;

// Function to check if a MAC address is allowed
bool isAllowedMAC(const std::string& mac);
std::string getLocation(const std::string& mac);

#endif // VERIFY_NODE_H
