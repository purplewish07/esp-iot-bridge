set(sub_srcs "drivers/src/network_adapter.c")

set(drivers_include "drivers/include")

if(CONFIG_BRIDGE_DATA_FORWARDING_NETIF_SDIO)
    list(APPEND sub_srcs "drivers/src/sdio_slave_api.c")
endif()

if(CONFIG_BRIDGE_DATA_FORWARDING_NETIF_SPI)
    list(APPEND sub_srcs "drivers/src/spi_slave_api.c")
endif()

if(CONFIG_BRIDGE_BT_ENABLED)
    list(APPEND sub_srcs "drivers/src/slave_bt.c")
endif()

set(include_dirs "${include_dirs}" "${drivers_include}" PARENT_SCOPE)
set(srcs "${srcs}" "${sub_srcs}" PARENT_SCOPE)
