/*
 * SPDX-FileCopyrightText: 2021-2022 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include "nvs.h"
#include "nvs_flash.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "esp_netif.h"
#include "esp_timer.h"
#include "esp_system.h"
#include "esp_event.h"

#include "esp_bridge.h"
#if defined(CONFIG_APP_BRIDGE_USE_WEB_SERVER)
#include "web_server.h"
#endif
#include "iot_button.h"
#if defined(CONFIG_APP_BRIDGE_USE_WIFI_PROVISIONING_OVER_BLE)
#include "wifi_prov_mgr.h"
#endif

#define BUTTON_NUM            1
#define BUTTON_SW1            CONFIG_APP_GPIO_BUTTON_SW1
#define BUTTON_PRESS_TIME     5000000
#define BUTTON_REPEAT_TIME    5

static const char *TAG = "main";
static button_handle_t g_btns[BUTTON_NUM] = { 0 };
static bool button_long_press = false;
static esp_timer_handle_t restart_timer;

static esp_err_t esp_storage_init(void)
{
    esp_err_t ret = nvs_flash_init();

    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        // NVS partition was truncated and needs to be erased
        // Retry nvs_flash_init
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }

    return ret;
}

static void button_press_up_cb(void *hardware_data, void *usr_data)
{
    ESP_LOGI(TAG, "BTN: BUTTON_PRESS_UP");

    if (button_long_press) {
        ESP_ERROR_CHECK(esp_timer_stop(restart_timer));
        button_long_press = false;
    }
}

static void button_press_repeat_cb(void *hardware_data, void *usr_data)
{
    uint8_t press_repeat = iot_button_get_repeat((button_handle_t)hardware_data);
    ESP_LOGI(TAG, "BTN: BUTTON_PRESS_REPEAT[%d]", press_repeat);
}

static void button_long_press_start_cb(void *hardware_data, void *usr_data)
{
    ESP_LOGI(TAG, "BTN: BUTTON_LONG_PRESS_START");
    button_long_press = true;
    ESP_ERROR_CHECK(esp_timer_start_once(restart_timer, BUTTON_PRESS_TIME));
}

static void restart_timer_callback(void *arg)
{
    ESP_LOGI(TAG, "Restore factory settings");
    nvs_flash_erase();
    esp_restart();
}

static void esp_bridge_create_button(void)
{
    const esp_timer_create_args_t restart_timer_args = {
        .callback = &restart_timer_callback,
        .name = "restart"
    };
    ESP_ERROR_CHECK(esp_timer_create(&restart_timer_args, &restart_timer));

    button_config_t cfg = {
        .type = BUTTON_TYPE_GPIO,
        .gpio_button_config = {
            .gpio_num = BUTTON_SW1,
            .active_level = 0,
        },
    };
    g_btns[0] = iot_button_create(&cfg);
    iot_button_register_cb(g_btns[0], BUTTON_PRESS_UP, button_press_up_cb, 0);
    iot_button_register_cb(g_btns[0], BUTTON_PRESS_REPEAT, button_press_repeat_cb, 0);
    iot_button_register_cb(g_btns[0], BUTTON_LONG_PRESS_START, button_long_press_start_cb, 0);
}

//prepare
static void button_press_up_cb(void *hardware_data, void *usr_data)
{
    ESP_LOGI(TAG, "BTN: BUTTON_PRESS_UP");

    if (button_long_press) {
        ESP_ERROR_CHECK(esp_timer_stop(restart_timer));
        button_long_press = false;

        // Delete AP SSID and password from NVS
        nvs_handle_t nvs_handle;
        esp_err_t err = nvs_open("storage", NVS_READWRITE, &nvs_handle);
        if (err == ESP_OK) {
            err = nvs_erase_key(nvs_handle, "ap_ssid");
            if (err != ESP_OK) {
                ESP_LOGE(TAG, "Error deleting AP SSID from NVS");
            }
            err = nvs_erase_key(nvs_handle, "ap_password");
            if (err != ESP_OK) {
                ESP_LOGE(TAG, "Error deleting AP password from NVS");
            }
            nvs_commit(nvs_handle);
            nvs_close(nvs_handle);
        } else {
            ESP_LOGE(TAG, "Error opening NVS");
        }

        ESP_LOGI(TAG, "Restarting the device...");
        esp_restart();
    }
}


void app_main(void)
{
    esp_log_level_set("*", ESP_LOG_INFO);

    esp_storage_init();

    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    esp_bridge_create_all_netif();

#if defined(CONFIG_BRIDGE_DATA_FORWARDING_NETIF_SOFTAP)
    nvs_handle_t nvs_handle;
    esp_err_t err = nvs_open("storage", NVS_READONLY, &nvs_handle);
    wifi_ap_config_t ap_config = { 0 }; // 新建一个结构体保存AP的SSID和密码

    if (err == ESP_OK) {
        size_t ssid_size = sizeof(ap_config.ssid);
        err = nvs_get_str(nvs_handle, "ap_ssid", (char *)ap_config.ssid, &ssid_size);
        if (err == ESP_OK) {
            size_t password_size = sizeof(ap_config.password);
            err = nvs_get_str(nvs_handle, "ap_password", (char *)ap_config.password, &password_size);
        }
        nvs_close(nvs_handle);
    }

    if (err != ESP_OK) {
        // 如果无法从NVS中获取，使用默认值
        strcpy((char *)ap_config.ssid, CONFIG_BRIDGE_SOFTAP_SSID);
        strcpy((char *)ap_config.password, CONFIG_BRIDGE_SOFTAP_PASSWORD);
    }
    // 不管是否成功获取NVS值，只需调用一次 esp_bridge_wifi_set
    esp_bridge_wifi_set(WIFI_MODE_AP, (const char *)ap_config.ssid, (const char *)ap_config.password, NULL);
    // esp_bridge_wifi_set(WIFI_MODE_AP, CONFIG_BRIDGE_SOFTAP_SSID, CONFIG_BRIDGE_SOFTAP_PASSWORD, NULL);
#endif
#if defined(CONFIG_BRIDGE_EXTERNAL_NETIF_STATION)
    esp_wifi_connect();
#endif
    esp_bridge_create_button();

    

#if defined(CONFIG_APP_BRIDGE_USE_WEB_SERVER)
    StartWebServer();
#endif /* CONFIG_APP_BRIDGE_USE_WEB_SERVER */
#if defined(CONFIG_APP_BRIDGE_USE_WIFI_PROVISIONING_OVER_BLE)
    esp_bridge_wifi_prov_mgr();
#endif /* CONFIG_APP_BRIDGE_USE_WIFI_PROVISIONING_OVER_BLE */
}
