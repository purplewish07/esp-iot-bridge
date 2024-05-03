var isSend = false;
var isShowWifi = false;
var wifiList = [];
var timeoutNum = 0;
var Ajax = {
    get: function (e, d) {
        var f;
        if (window.XMLHttpRequest) {
            f = new XMLHttpRequest()
        } else {
            if (window.ActiveObject) {
                f = new ActiveXobject("Microsoft.XMLHTTP")
            }
        }
        f.open("GET", e, true);
        f.onreadystatechange = function () {
            if (f.readyState == 4) {
                console.log(f.status);
                if (f.status == 200 || f.status == 304) {
                    d.call(this, f.responseText)
                } else {
                    showMessage(getPrompt("requestFailed"), 1000);
                    hideLoading("msg-load")
                }
            }
        };
        f.send()
    },
    post: function (e, g, h) {
        showLoading();
        var f;
        if (window.XMLHttpRequest) {
            f = new XMLHttpRequest()
        } else {
            if (window.ActiveObject) {
                f = new ActiveXobject("Microsoft.XMLHTTP")
            }
        }
        f.open("POST", e, true);
        f.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
        f.onreadystatechange = function () {
            if (f.readyState == 4) {
                if (f.status == 200 || f.status == 304) {
                    h.call(this, f.responseText)
                } else {
                    hideLoading("msg-load");
                    showMessage(getPrompt("connectFailed"), 2000)
                }
            }
        };
        f.send(g)
    },
    postFile: function (e, g, h) {
        showLoading();
        var f;
        if (window.XMLHttpRequest) {
            f = new XMLHttpRequest()
        } else {
            if (window.ActiveObject) {
                f = new ActiveXobject("Microsoft.XMLHTTP")
            }
        }
        f.open("POST", e, true);
        f.setRequestHeader("Content-Type", "application/octet-stream;charset=UTF-8");
        f.onreadystatechange = function () {
            if (f.readyState == 4) {
                if (f.status == 200 || f.status == 304) {
                    h.call(this, f.responseText)
                } else {
                    hideLoading("msg-load");
                    showConfirm(getPrompt("prompt"), getPrompt("otaFailed"), getPrompt("confirm"))
                }
            }
        };
        f.send(g)
    }
};
const constHtmlLang = [{
    zh: "Wi-Fi Access Point",
    en: "Wi-Fi Access Point",
    id: "esp-iot-bridge-ap-link",
    type: "text"
}, {
    zh: "設備配網",
    en: "Wi-Fi",
    id: "esp-iot-bridge-link",
    type: "text"
}, {
    zh: "OTA 升級",
    en: "OTA",
    id: "esp-ota-link",
    type: "text"
}, {
    zh: "歡迎使用 ESP-IoT-Bridge 配網",
    en: "Welcome to ESP-IoT-Bridge Web",
    id: "welcome-wrap",
    type: "text"
}, {
    zh: "請輸入 AP_SSID",
    en: "AP_SSID",
    id: "ap_ssid",
    type: "input"
}, {
    zh: "請輸入 AP_PASSWORD",
    en: "AP_PASSWORD",
    id: "ap_password",
    type: "input"
}, {
    zh: "設定",
    en: "Setup",
    id: "setup-ap",
    type: "text"
}, {
    zh: "請輸入 SSID",
    en: "SSID",
    id: "ssid",
    type: "input"
}, {
    zh: "請輸入 PASSWORD",
    en: "PASSWORD",
    id: "password",
    type: "input"
}, {
    zh: "開始配網",
    en: "Connect",
    id: "start-connect",
    type: "text"
}, {
    zh: "注意：",
    en: "Note: ",
    id: "note-text",
    type: "text"
}, {
    zh: "配網手機作為待接入熱點時，瀏覽器可能收不到配網結果",
    en: "Please note that if your target AP is the hotspot of the device which opens the web pages, you may not receive the Wi-Fi connection result.",
    id: "note-desc",
    type: "text"
}, {
    zh: "請選擇新版本固件，然後點擊升級按鈕進行升級：",
    en: "Please select a new firmware and click the “OTA upgrade” button to start the upgrade: ",
    id: "ota-title",
    type: "text"
}, {
    zh: "瀏覽",
    en: "Browse",
    id: "file-btn",
    type: "text"
}, {
    zh: "固件升級",
    en: "OTA upgrade",
    id: "start-upgrade",
    type: "text"
}, {
    zh: "當前 app 固件版本：",
    en: "Current app version: ",
    id: "cur-version",
    type: "text"
}, {
    zh: "固件版本：",
    en: "Firmware version: ",
    id: "at-version",
    type: "text"
}, ];
const constPromptInfo = {
    prompt: {
        zh: "提示",
        en: "Prompt"
    },
    confirm: {
        zh: "確定",
        en: "OK"
    },
    cancel: {
        zh: "取消",
        en: "Cancel"
    },
    requestFailed: {
        zh: "數據請求失敗",
        en: "Data request failed"
    },
    connectFailed: {
        zh: "配網失敗, 請重試",
        en: "Connection failed"
    },
    connectTimeout: {
        zh: "配網超時, 請重試",
        en: "Connection timeout"
    },
    connectSuc: {
        zh: "配網成功",
        en: "Connection succeeded"
    },
    upgradeFailed: {
        zh: "升級失敗，請稍後重試",
        en: "Upgrade failed. Please try again later."
    },
    enterSsid: {
        zh: "請輸入 SSID",
        en: "Please enter SSID"
    },
    ssidError: {
        zh: "輸入 SSID 過長，請保持在32個字節之內",
        en: "The SSID is too long. Please keep it within 32 bytes"
    },
    passwordError: {
        zh: "輸入 Password 過長，請保持在64個字節之內",
        en: "Password is too long. Please keep it within 64 bytes"
    },
    closedWeb: {
        zh: '配網成功， <span id="timeout-info" class="timeout-info">5</span> 秒後自動關閉網頁',
        en: 'Connection succeeded, This page will be closed in <span id="timeout-info" class="timeout-info">5</span> seconds.'
    },
    wifiList: {
        zh: "Wi-Fi 列表",
        en: "Wi-Fi List"
    },
    refresh: {
        zh: "刷新",
        en: "Refresh"
    },
    getWifiFailed: {
        zh: "獲取 Wi-Fi 列表失敗",
        en: "Failed to get Wi-Fi AP list"
    },
    noData: {
        zh: "暫無數據",
        en: "No data available"
    },
    selectFile: {
        zh: "請選擇文件",
        en: "Please select file"
    },
    formatError: {
        zh: "選擇的文件格式有誤",
        en: "Incorrect file format"
    },
    fileLarge: {
        zh: "選擇的文件過大，請選擇小於 2MB 的文件",
        en: "File is too large. Please select a file less than 2MB."
    },
    getVersionFailed: {
        zh: "獲取固件版本失敗",
        en: "Failed to get firmware version"
    },
    otaSuc: {
        zh: "升級成功",
        en: "OTA Succeeded"
    },
    otaFailed: {
        zh: "升級失敗，請稍後重試",
        en: "OTA Failed"
    },
};
var curLangeage = "en";
loadLanguage();

function loadLanguage() {
    var c = navigator.language || navigator.userLanguage;
    c = c.substr(0, 2);
    if (c == "zh") {
        curLangeage = "zh"
    } else {
        curLangeage = "en"
    }
    for (var a = 0; a < constHtmlLang.length; a++) {
        var b = constHtmlLang[a];
        if (b.type == "input") {
            setInputByLang(b.id, b[curLangeage]);
            continue
        }
        setTextByLang(b.id, b[curLangeage])
    }
}

function setTextByLang(b, a) {
    var e = document.getElementById(b);
    if (e) {
        e.innerText = a
    } else {
        console.log('Unable to find target element.');
    }
}

function setInputByLang(b, a) {
    document.getElementById(b).setAttribute("placeholder", a)
}

function getPrompt(a) {
    return constPromptInfo[a][curLangeage]
}
window.onbeforeunload = function () {
    if (isSend) {
        try {
            if (!navigator.sendBeacon) {
                return
            }
            var c = "received=1";
            navigator.sendBeacon("http://192.168.4.1/getresult", c)
        } catch (d) {
            console.log(d)
        }
    }
};

function getData() {
    Ajax.get("/getstainfo", function (c) {
        c = JSON.parse(c);
        console.log(c);
        try {
            document.getElementById("ap_ssid").value = c.ap_ssid;
            document.getElementById("ap_password").value = c.ap_password;
            document.getElementById("ssid").value = c.sta_ssid;
            document.getElementById("password").value = c.sta_password;
            document.getElementById("message").value = c.message
        } catch (d) {}
    })
}

function getStatus() {
    if (timeoutNum > 40) {
        hideLoading("msg-load");
        showMessage(getPrompt("connectTimeout"), 2000);
        return false
    }
    timeoutNum++;
    Ajax.get("/getstainfo", function (b) {
        b = JSON.parse(b);
        console.log(b);
        document.getElementById("message").value = b.message;
        if (b.state == 1) {
            getResult()
        } else {
            if (b.state == 0) {
                setTimeout(function () {
                    getStatus()
                }, 1000)
            } else {
                hideLoading("msg-load");
                showMessage(getPrompt("connectFailed"), 2000)
            }
        }
    })
}

function getResult() {
    var b = "received=1";
    Ajax.post("/getresult", b, function (a) {
        isSend = false;
        hideLoading("msg-load");
        showTimeout()
    })
}

function postApData() {
    var f = document.getElementById("ap_ssid").value;
    var e = document.getElementById("ap_password").value;
    if (f == "" || f == null) {
        showMessage(getPrompt("enterSsid"), 1000);
        return false
    }
    if (f.length > 32) {
        showMessage(getPrompt("ssidError"), 1000);
        return false
    }
    if (e.length > 64) {
        showMessage(getPrompt("passwordError"), 1000);
        return false
    }
    var d = "ap_ssid=" + f + "&ap_password=" + e;
    Ajax.post("/setapinfo", d, function (a) {
        a = JSON.parse(a);
        isSend = true;
        console.log(a);
        showMessage("Saving AP configuration and Restarting the device...", 5000);
        setTimeout(function () {
            location.reload();
        }, 5000);
    })
}

function postData() {
    timeoutNum = 0;
    var f = document.getElementById("ssid").value;
    var e = document.getElementById("password").value;
    if (f == "" || f == null) {
        showMessage(getPrompt("enterSsid"), 1000);
        return false
    }
    if (f.length > 32) {
        showMessage(getPrompt("ssidError"), 1000);
        return false
    }
    if (e.length > 64) {
        showMessage(getPrompt("passwordError"), 1000);
        return false
    }
    var d = "sta_ssid=" + f + "&sta_password=" + e;
    Ajax.post("/setstainfo", d, function (a) {
        a = JSON.parse(a);
        isSend = true;
        console.log(a);
        if (a.state == 0) {
            setTimeout(function () {
                getStatus()
            }, 1000)
        } else {
            hideLoading("msg-load");
            showMessage(getPrompt("connectFailed"), 2000)
        }
    })
}

function showMessage(f, h) {
    var e = document.getElementById("body-wrap");
    var g = document.createElement("div");
    g.innerHTML = '<div class="content">' + f + "</div>";
    g.setAttribute("class", "msg");
    e.appendChild(g);
    if (h) {
        setTimeout(function () {
            e.removeChild(g)
        }, h)
    }
}

function showTimeout() {
    hideLoading("msg-load");
    var h = document.getElementById("body-wrap");
    var f = document.createElement("div");
    f.innerHTML = '<div id="timeoutId" class="content-time">' + getPrompt("closedWeb") + "</div>";
    f.setAttribute("class", "msg");
    h.appendChild(f);
    var g = 5;
    var e = setInterval(function () {
        g--;
        document.getElementById("timeout-info").innerText = g;
        if (g < 0) {
            h.removeChild(f);
            closeWindow();
            clearInterval(e)
        }
    }, 1000)
}

function closeWindow() {
    window.open("about:blank", "_self").close()
}

function showLoading() {
    var c = document.getElementById("body-wrap");
    var d = document.createElement("div");
    d.innerHTML = '<div class="load"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>';
    d.setAttribute("class", "msg");
    d.setAttribute("id", "msg-load");
    c.appendChild(d)
}

function showConfirm(h, i, j) {
    var g = document.getElementById("body-wrap");
    var e = document.createElement("div");
    e.innerHTML = '<div class="mask"></div><div class="content"><div class="header">' + h + '</div><div class="content-info">' + i + '</div><div onclick="removeConfirm()" class="footer-btn"><button>' + j + "</button></div></div>";
    e.setAttribute("class", "msg-confirm");
    e.setAttribute("id", "msg-confirm");
    g.appendChild(e)
}

function removeConfirm() {
    document.getElementById("body-wrap").removeChild(document.getElementById("msg-confirm"))
}

function hideLoading(d) {
    var c = document.getElementById(d);
    if (c) {
        c.setAttribute("class", "msg hide");
        document.getElementById("body-wrap").removeChild(c)
    }
}
var isMobile = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 768) <= 768;
window.onresize = function () {
    isMobile = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 768) <= 768
};

function getaprecord() {
    showLoading();
    console.log("getaprecord");
    Ajax.get("/getaprecord", function (c) {
        c = JSON.parse(c);
        console.log(c);
        try {
            if (c.state == 0) {
                wifiList = c.aplist;
                initWifiList(wifiList, null);
                hideLoading("msg-load")
            } else {
                showMessage(getPrompt("getWifiFailed"), 2000)
            }
        } catch (d) {
            showMessage(getPrompt("getWifiFailed"), 2000)
        }
    })
}

function initWifiList(x, r) {
    removeWifiList();
    var s = document.createElement("div");
    s.setAttribute("id", "wifi-list-wrap");
    s.setAttribute("class", "wifi-list-wrap");
    if (isMobile) {
        var q = document.createElement("div");
        q.setAttribute("class", "mask");
        q.setAttribute("id", "mask");
        q.onclick = function () {
            removeWifiList()
        };
        s.appendChild(q)
    }
    var y = document.createElement("ul");
    var v = "";
    var t = document.getElementById("ssid").value;
    console.log(t);
    for (var u = 0; u < x.length; u++) {
        var p = x[u];
        if (r && p.ssid.indexOf(r) == -1) {
            continue
        }
        var z = "";
        if (t == p.ssid) {
            z = "active"
        }
        v += '<li data-value="' + p.ssid + '" onclick="selectCurWifi(event)" class="d-flex d-a-i ' + z + '"><span class="selected"></span>' + p.ssid;
        if (p.auth_mode && p.auth_mode != 0) {
            v += '<span class="lock-img"><svg class="icon" width="12px" height="12px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M800.421 436.525H736.76V287.852c0-124.507-100.762-225.757-224.732-225.757-123.98 0-224.857 101.25-224.857 225.766v148.662h-63.593c-30.667 0-55.532 24.952-55.532 55.752v407.048c0 30.848 24.865 55.82 55.532 55.82h576.9c30.667 0 55.465-24.97 55.465-55.82V492.275c0-30.802-24.855-55.752-55.532-55.752zM543.203 706.409v88.88a7.354 7.354 0 0 1-7.282 7.325h-47.733a7.373 7.373 0 0 1-7.334-7.322V706.41c-22.423-11.518-37.953-34.602-37.953-61.659 0-38.288 30.945-69.425 69.07-69.425 38.183 0 69.138 31.136 69.138 69.415 0.057 27.067-15.473 50.152-37.905 61.659z m107.311-269.884H373.525V291.539c0-76.691 62.196-139.146 138.552-139.146 76.366 0 138.447 62.454 138.447 139.146v144.986z" fill="#666666" ></path></svg></span>'
        }
        v += "</li>"
    }
    if (v == "") {
        v = '<li class="no-data">' + getPrompt("noData") + "</li>"
    }
    y.innerHTML = v;
    if (isMobile) {
        var w = document.createElement("div");
        w.setAttribute("class", "content");
        var n = document.createElement("div");
        n.innerHTML = "<h3>" + getPrompt("wifiList") + '<span onclick="getaprecord()" id="refresh" class="refresh">' + getPrompt("refresh") + "</span></h3>";
        var o = document.createElement("div");
        o.setAttribute("class", "cancel-wrap");
        o.setAttribute("id", "cancel-wrap");
        o.innerHTML = getPrompt("cancel");
        o.onclick = function () {
            removeWifiList()
        };
        w.appendChild(n);
        w.appendChild(y);
        w.appendChild(o);
        s.appendChild(w);
        document.getElementById("body-wrap").appendChild(s);
        return
    }
    s.appendChild(y);
    document.getElementById("ssid-wrap").appendChild(s)
}

function selectCurWifi(b) {
    console.log(b.target.dataset.value);
    isShowWifi = false;
    document.getElementById("ssid").value = b.target.dataset.value;
    removeWifiList()
}

function initShowList() {
    document.getElementById("show-wifi-list").onclick = function (b) {
        console.log(isShowWifi);
        isShowWifi = !isShowWifi;
        console.log(isShowWifi);
        if (isShowWifi) {
            getaprecord()
        } else {
            removeWifiList()
        }
        document.getElementById("ssid").focus();
        window.event ? window.event.cancelBubble = true : b.stopPropagation()
    };
    document.getElementById("ssid").onclick = function (b) {
        window.event ? window.event.cancelBubble = true : b.stopPropagation()
    };
    document.getElementById("body-wrap").onclick = function (b) {
        if (!isMobile) {
            isShowWifi = false;
            removeWifiList()
        }
    };
    document.getElementById("ssid").oninput = function () {
        console.log("oninput");
        console.log(isShowWifi);
        console.log(isMobile);
        if (isShowWifi && !isMobile) {
            var b = document.getElementById("wifi-list-wrap");
            console.log(b);
            if (b) {
                console.log(this.value);
                document.getElementById("ssid-wrap").removeChild(b);
                initWifiList(wifiList, this.value)
            }
        }
    }
}

function removeWifiList() {
    if (isMobile) {
        isShowWifi = false
    }
    var b = document.getElementById("wifi-list-wrap");
    if (b) {
        document.getElementById(isMobile ? "body-wrap" : "ssid-wrap").removeChild(b);
        b = document.getElementById("wifi-list-wrap");
        if (b) {
            removeWifiList()
        }
    }
}

function fileChange(e) {
    var c = e.files;
    if (c && c.length > 0) {
        c = c[0];
        var d = c.name.toLowerCase();
        if (d.indexOf(".bin") != (d.length - 4)) {
            document.getElementById("file-info").value = "";
            showMessage(getPrompt("formatError"), 2000);
            return
        }
        if (c.size >= 2097152) {
            document.getElementById("file-info").value = "";
            showMessage(getPrompt("fileLarge"), 2000);
            return
        }
        document.getElementById("file-name").value = d;
        console.log(document.getElementById("file-info").files)
    }
}

function getotainfo() {
    showLoading();
    Ajax.get("/getotainfo", function (c) {
        c = JSON.parse(c);
        console.log(c);
        try {
            if (c.state == 0) {
                document.getElementById("version-wrap").innerText = c["fw_version"];
                document.getElementById("at-core-wrap").innerText = c["at_core_version"];
                hideLoading("msg-load")
            } else {
                showMessage(getPrompt("getVersionFailed"), 2000)
            }
        } catch (d) {
            showMessage(getPrompt("getVersionFailed"), 2000)
        }
    })
}

function postOta() {
    timeoutNum = 0;
    var b = document.getElementById("file-info").files;
    if (b && b.length > 0) {
        b = b[0];
        Ajax.postFile("/setotadata", b, function (a) {
            a = JSON.parse(a);
            console.log(a);
            hideLoading("msg-load");
            if (a.state == 0) {
                showConfirm(getPrompt("prompt"), getPrompt("otaSuc"), getPrompt("confirm"))
            } else {
                showConfirm(getPrompt("prompt"), getPrompt("otaFailed"), getPrompt("confirm"))
            }
        })
    } else {
        showMessage(getPrompt("selectFile"), 2000)
    }
}

function getEthernetIP() {
    Ajax.get("/getethinfo", function(response) {
        var data = JSON.parse(response);
        if (data && data.ip) {
            document.getElementById("eth-ip").innerText = data.ip;
        } else {
            document.getElementById("eth-ip").innerText = "Failed to retrieve IP";
        }
    });
}

getData();
initShowList();

window.onload = function() {
    getEthernetIP(); // Call the function on page load
}

function selectMenu(c, d) {
    document.getElementById(c).classList.remove("hide");
    d.classList.add("active");
    if (c == "esp-iot-bridge-wrap") {
        document.getElementById("esp-iot-bridge-ap-wrap").classList.add("hide");
        document.getElementById("esp-iot-bridge-ap-link").classList.remove("active"); /*document.getElementById("esp-ota-wrap").classList.add("hide");document.getElementById("esp-ota-link").classList.remove("active");*/
        getData()
    } else if (c == "esp-iot-bridge-ap-wrap") {
        document.getElementById("esp-iot-bridge-wrap").classList.add("hide");
        document.getElementById("esp-iot-bridge-link").classList.remove("active"); /*document.getElementById("esp-ota-wrap").classList.add("hide");document.getElementById("esp-ota-link").classList.remove("active");*/
        getData()
    } else {
        /*document.getElementById("esp-iot-bridge-ap-wrap").classList.add("hide");document.getElementById("esp-iot-bridge-ap-link").classList.remove("active");document.getElementById("esp-iot-bridge-wrap").classList.add("hide");document.getElementById("esp-iot-bridge-link").classList.remove("active");getotainfo()*/ }
};


