#include "verifyNode.h"

std::vector<std::string> allowedMACs = {MAC_NODE1, MAC_NODE2, "CC:23:F3:8D:EF:34"};

std::map<std::string, std::string> macToLocation = {
    {std::string(MAC_NODE1), "locationA"},
    {std::string(MAC_NODE2), "locationB"},
    {"CC:23:F3:8D:EF:34", "locationC"}
};

bool isAllowedMAC(const std::string& mac) {
    for (const auto& allowedMAC : allowedMACs) {
        if (mac == allowedMAC) {
            return true;
        }
    }
    return false;
}

std::string getLocation(const std::string& mac) {
    if (isAllowedMAC(mac)) {
        return macToLocation[mac]; // Trả về location tương ứng
    } else {
        return ""; // Trả về chuỗi rỗng nếu MAC không hợp lệ
    }
}
