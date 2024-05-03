- [中文版](README_CN.md)

# ESP-IoT-Bridge Solution

The ESP-IoT-Bridge solution framework is a complete project directory structure framework based on the IoT-Bridge components, which can be used by developers for reference.

ESP-IoT-Bridge solution is mainly for the connection and communication between various network interfaces realized by IoT application scenarios, such as interconnection between SPI, SDIO, USB, Wi-Fi, Ethernet and other network interfaces, and can be combined with other solutions to form more complex application scenarios, such as Wi-Fi Mesh Lite, Rainmaker, etc. This solution is widely used in wireless hotspots, wired network cards, 4G Internet access and other fields. For more information, see [User_Guide.md](components/iot_bridge/User_Guide.md).

In the [examples](examples) directory, demos of some common application scenarios are implemented for users to quickly integrate into their own application projects.

- [examples/wifi_router](examples/wifi_router): The device based on the ESP-IoT-Bridge solution connects to the router through Wi-Fi or ethernet, and the smart device such as the phone can access the internet by connecting to the SoftAP hotspot provided by the ESP-IoT-Bridge device.
- [examples/wireless_nic](examples/wireless_nic)：ESP-IoT-Bridge device can be connected to the PC or MCU through multiple network interfaces (USB/ETH/SPI/SDIO). Once connected, the PC or MCU will have an additional network card. These devices can access the Internet after configuring the network.
- [examples/wired_nic](examples/wired_nic)：ESP-IoT-Bridge device can connect to the network by plugging the Ethernet cable into the LAN port of router. PC or MCU can connect with the ESP-IoT-Bridge device through multiple interfaces (USB/SPI/SDIO) to gain internet access.
- [examples/4g_hotspot](examples/4g_hotspot): ESP-IoT-Bridge device can be equipped with a mobile network module with a SIM card and then convert the cellular network into a Wi-Fi signal. The surrounding smart devices can connect to the hotspot from the ESP-IoT-Bridge device to gain Internet access.
- [examples/4g_nic](examples/4g_nic)：ESP-IoT-Bridge device can be equipped with a mobile network module with a SIM card. After the network module is connected to the Internet, the PC or MCU can be connected to it through the network interface (ETH/SPI/SDIO) to gain Internet access.

# 編譯環境 ESP-IDF 5.0
https://github.com/espressif/idf-installer/releases/download/offline-5.0.4/esp-idf-tools-setup-offline-5.0.4.exe

# 安裝ESP-IDF後 打開桌面的 ESP-IDF 5.0 CMD
cd 到此目錄\wifi_router
## 下編譯指令
idf.py build 

## 編譯完成後 下指令燒錄(請檢查USB Port號碼)
idf.py -p COM4 flash

搜尋AP SSID
ESP_Bridge_XXXXXX 密碼預設為123456
web設定頁面 192.168.4.1

有兩個設定頁面(畫面上方選擇/手機板為下方)
1.WiFi Access Point  (設定AP SSID/PASSWD)
2.WiFi (橋接其他WIFI 網路)

按壓boot (GPIO0) 7秒可重置設定