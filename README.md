# ESP-IOT-Bridge Solution

- [中文版](README_CN.md)

The ESP-IOT-Bridge solution framework is a complete project directory structure framework based on the ESP-IOT-Bridge components, which can be used by developers for reference.

The ESP-IOT Bridge scheme is mainly used to bridge various network interfaces in iot application scenarios, such as SPI, SDIO, USB, Wi Fi, Ethernet and other network interfaces. It can also be combined with other schemes to form more complex application scenarios, such as Wi Fi Mesh Lite, Rainmaker, etc. This solution is widely used in wireless hotspots, wired network cards, 4G Internet access and other fields. For more information, see [User_Guide.md](components/iot_bridge/User_Guide.md).

In the [examples](examples) directory, demos of some common application scenarios are implemented for users to quickly integrate into their own application projects.

- [examples/wifi_router](examples/wifi_router): The device based on the ESP-IOT-Bridge solution connects to the router through Wi-Fi or ethernet, and the smart device such as the phone can access the internet by connecting to the SoftAP hotspot provided by the ESP-IOT-Bridge device.