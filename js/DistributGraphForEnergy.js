let toast;
var baseUrlFromAPP = "http://116.236.149.165:8090/SubstationWEBV2/v5";
var tokenFromAPP = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTMxMDY5MTYsInVzZXJuYW1lIjoiYWRtaW4ifQ.g4mdKzkc6H8ZuYy1hFdyzbgmDfEVOtQMCBD6gfE5OJU";
var subidFromAPP = "10100001";
//iOS安卓基础传参
var u = navigator.userAgent,
    app = navigator.appVersion;
var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1; //安卓系统
var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios系统
//判断数组中是否包含某字符串
if (isIOS) {
    //ios系统的处理
    window.webkit.messageHandlers.iOS.postMessage(null);
    var storage = localStorage.getItem("accessToken");
    // storage = storage ? JSON.parse(storage):[];
    storage = JSON.parse(storage);
    baseUrlFromAPP = storage.baseurl;
    tokenFromAPP = storage.token;
    subidFromAPP = storage.fsubID;
} else {
    baseUrlFromAPP = android.getBaseUrl();
    tokenFromAPP = android.getToken();
    subidFromAPP = android.getfSubid();
}
var mqttClient = null;
var mqttTopic = "report/allpoints";
var MeterInfo = []; //仪表与回路关系数组
var unitList = []; //单位数组
var lastTime = null;

//判断是否从配电房跳转进来
// var pushtype = Substation.GetQueryString("pushType");
// if (pushtype == 1) {
//     $("#backBtn").css("display", "block");
// } else {
$("#backBtn").css("display", "none");
// }

var refreshdata;
var mainUrl = baseUrlFromAPP.split("SubstationWEBV2")[0] + "SubstationWEBV2/main/getCurrentValue";
var webUrl = baseUrlFromAPP.split("SubstationWEBV2")[0] + "SubstationWEBV2/";
$(function () {
    toast = new ToastClass();
    initMqtt();
    getMeter();
    var url = baseUrlFromAPP + "/getAppSubimgInfo";
    var params = {
        fSubid: subidFromAPP
    };
    getDataByAjax(url, params, function (data) {
        showSVG(data.xmlContent);
        showList(data.list);
        showDataOnSVG(data.SvgInfo);
    });

    function showSVG(path) {
        $(".diagram").html("");
        $(".diagram").append(path);
        $('g[name="off"]').hide();
        //        $(".diagram").overscroll();
    }

    //返回按钮
    $("#backBtn").on("click", function () {
        window.history.back(-1);
    })

    //放大缩小
    $("#BigDom").on("click", function () {
        $(this).addClass("select");
        $("#SimDom").removeClass("select");
        adjustSVG($("svg"), 1);
    });
    $("#SimDom").on("click", function () {
        $(this).addClass("select");
        $("#BigDom").removeClass("select");
        adjustSVG($("svg"), -1);
    });

    function adjustSVG($svg, type) {
        var width = $svg.width();
        var height = $svg.height();
        switch (type) {
            case 1:
                $svg.width(width * 1.1);
                $svg.height(height * 1.1);
                break;
            case -1:
                $svg.width(width / 1.1);
                $svg.height(height / 1.1);
                break;
        }
    }

    function showList(data) {
        $("#subList").html("");
        if (data.length > 0) {
            $.each(data, function (index, el) {
                var string = "<option>" + el.fCustomname + "</option>";
                $("#subList").append(string);
            });
        }
    }

    $("#subList").change(function (event) {
        var fCustomname = $("#subList").val();
        var url = baseUrlFromAPP + "/getAppSubimgInfo";
        var params = {
            fSubid: subidFromAPP,
            fCustomname: fCustomname
        };
        getDataByAjax(url, params, function (data) {
            showSVG(data.xmlContent);
            showDataOnSVG(data.SvgInfo);
        });
    });

    function showDataOnSVG(data) {
        var map = new Map();
        var group;
        if (data.length > 0) {
            $.each(data, function (key, val) {
                group = $("#" + val.fCircuitid);
                for (i = 0; i < val.meterParamValues.length; i++) {
                    var paramCode = val.meterParamValues[i].fParamcode;
                    var fvalue = val.meterParamValues[i].fValue;
                    var valjoinunit = val.meterParamValues[i].fValuejoinunit;
                    var flag = val.meterParamValues[i].fValue == undefined ? -1 : val.meterParamValues[i].fValue;

                    if (val.meterParamValues[i].fUnitGroup == "DI") {
                        flag = parseInt(flag)
                        switch (paramCode.toUpperCase()) {
                            case "SWITCH":
                            case "SWITCHON":
                                if (flag !== -1) {
                                    $(group).find("g[name='offline']").hide();
                                    if (flag === 1) {
                                        $(group).find('g[name="off"]').hide();
                                        $(group).find('g[name="on"]').show()
                                    }
                                    if (flag === 0) {
                                        $(group).find('g[name="on"]').hide();
                                        $(group).find('g[name="off"]').show()
                                    }
                                } else {
                                    if ($(group).find("g[name='offline']").length > 0) {
                                        $(group).find("g[name='offline']").show();
                                        $(group).find('g[name="off"]').hide()
                                    } else {
                                        $(group).find('g[name="off"]').show()
                                    }
                                    $(group).find('g[name="on"]').hide();
                                }
                                break;
                            case "SWITCHOFF":
                                if (flag !== -1) {
                                    $(group).find("g[name='offline']").hide();
                                    if (flag === 1) {
                                        $(group).find('g[name="on"]').hide();
                                        $(group).find('g[name="off"]').show()
                                    }
                                    if (flag === 0) {
                                        $(group).find('g[name="off"]').hide();
                                        $(group).find('g[name="on"]').show()
                                    }
                                } else {
                                    if ($(group).find("g[name='offline']").length > 0) {
                                        $(group).find("g[name='offline']").show();
                                        $(group).find('g[name="on"]').hide()
                                    } else {
                                        $(group).find('g[name="on"]').show()
                                    }
                                    $(group).find('g[name="off"]').hide();
                                }
                                break;
                            default:
                                // 其他开关量
                                var offlineStr = paramCode + "/offline";
                                var onStr = paramCode + "/1";
                                var offStr = paramCode + "/0";

                                var lowerCase = paramCode.toLowerCase();
                                var upperCase = paramCode.toUpperCase();


                                var offlineStrLow = lowerCase + "/offline";
                                var onStrLow = lowerCase + "/1";
                                var offStrLow = lowerCase + "/0";


                                var offlineStrUp = upperCase + "/offline";
                                var onStrUp = upperCase + "/1";
                                var offStrUp = upperCase + "/0";

                                var on = undefined,
                                    off = undefined,
                                    offline = undefined;

                                if ($(group).find("g[name='" + onStr + "']").length > 0) {
                                    on = $(group).find("g[name='" + onStr + "']");
                                }
                                if ($(group).find("g[name='" + onStrLow + "']").length > 0) {
                                    on = $(group).find("g[name='" + onStrLow + "']");
                                }
                                if ($(group).find("g[name='" + onStrUp + "']").length > 0) {
                                    on = $(group).find("g[name='" + onStrUp + "']");
                                }

                                if ($(group).find("g[name='" + offStr + "']").length > 0) {
                                    off = $(group).find("g[name='" + offStr + "']");
                                }
                                if ($(group).find("g[name='" + offStrLow + "']").length > 0) {
                                    off = $(group).find("g[name='" + offStrLow + "']");
                                }
                                if ($(group).find("g[name='" + offStrUp + "']").length > 0) {
                                    off = $(group).find("g[name='" + offStrUp + "']");
                                }

                                if ($(group).find("g[name='" + offlineStr + "']").length > 0) {
                                    offline = $(group).find("g[name='" + offlineStr + "']");
                                }
                                if ($(group).find("g[name='" + offlineStrLow + "']").length > 0) {
                                    offline = $(group).find("g[name='" + offlineStrLow + "']");
                                }
                                if ($(group).find("g[name='" + offlineStrUp + "']").length > 0) {
                                    offline = $(group).find("g[name='" + offlineStrUp + "']");
                                }

                                if (flag !== -1) {
                                    if (flag === 0) {
                                        if (on) $(on).hide();
                                        if (off) $(off).show();
                                    }
                                    if (flag === 1) {
                                        if (on) $(on).show();
                                        if (off) $(off).hide();
                                    }

                                    if (offline) {
                                        $(offline).hide();
                                    }
                                } else {
                                    if (off) {
                                        $(offline).show();
                                        if (on) $(on).hide();
                                        if (off) $(off).hide();
                                    } else {
                                        if (on) $(on).hide();
                                        if (off) $(off).show();
                                    }
                                }
                        }
                    } else if (flag != -1) {
                        flag = parseInt(flag);
                        if (val.meterParamValues[i].fUnitGroup == "U") {
                            if (fvalue >= 1000) {
                                valjoinunit = (fvalue / 1000).toFixed(2) + "kV";
                            }
                        }
                        map.set(paramCode.toLowerCase(), valjoinunit);
                        switch (paramCode.toUpperCase()) {
                            case "SWITCH":
                            case "SWITCHON":
                                if (flag != -1) {
                                    group.children('g[name="offline"]').hide();
                                    if (flag == 1) {
                                        group.children('g[name="off"]').hide();
                                        group.children('g[name="on"]').show();
                                    }
                                    if (flag == 0) {
                                        group.children('g[name="on"]').hide();
                                        group.children('g[name="off"]').show();
                                    }
                                } else {
                                    if (group.children('g[name="offline"]').length > 0) {
                                        group.children('g[name="offline"]').show();
                                        group.children('g[name="off"]').hide();
                                    } else {
                                        group.children('g[name="off"]').show();
                                    }
                                    //                                    group.children('g[name="offline"]').show();
                                    //                                    group.children('g[name="off"]').hide();
                                    group.children('g[name="on"]').hide();
                                }
                                break;
                            case "SWITCHOFF":
                                if (flag != -1) {
                                    group.children('g[name="offline"]').hide();
                                    if (flag == 1) {
                                        group.children('g[name="off"]').show();
                                        group.children('g[name="on"]').hide();
                                    }
                                    if (flag == 0) {
                                        group.children('g[name="on"]').show();
                                        group.children('g[name="off"]').hide();
                                    }
                                } else {
                                    if (group.children('g[name="offline"]').length > 0) {
                                        group.children('g[name="offline"]').show();
                                        group.children('g[name="off"]').hide();
                                    } else {
                                        group.children('g[name="off"]').show();
                                    }
                                    //                                    group.children('g[name="offline"]').show();
                                    //                                    group.children('g[name="off"]').hide();
                                    group.children('g[name="on"]').hide();
                                }
                                break;
                            default:
                                //其他开关量
                                var hideStr, showStr;
                                var offlineStr = paramCode + "_offline";
                                var onStr = paramCode + "_on";
                                var offStr = paramCode + "_off";
                                if (flag != -1) {
                                    group.children('g[name="offline"]').hide();
                                    if (flag == 1) {
                                        hideStr = onStr;
                                        showStr = offStr;
                                    }
                                    if (flag == 0) {
                                        hideStr = offStr;
                                        showStr = onStr;
                                    }
                                    group.children("g[name='" + offlineStr + "']").hide();
                                    group.children("g[name='" + hideStr + "']").hide();
                                    group.children("g[name='" + showStr + "']").show();
                                } else {
                                    group.children("g[name='" + onStr + "']").hide();
                                    group.children("g[name='" + offStr + "']").hide();
                                    group.children("g[name='" + offlineStr + "']").show();
                                }
                        }
                    } else {

                    }
                }

                $.each(group.children('g text'), function (index, element) {
                    try {
                        var m = element.attributes.name.textContent;
                        if (map.has(m.toLowerCase())) {
                            var v = map.get(m.toLowerCase());
                            var childName = "text[name='" + m + "']";
                            group.children(childName).text(map.get(m.toLowerCase()));
                        }
                    } catch (err) {
                        // console.log(err);
                    }
                });

                // $.each(group.children("g text"), function (index, element) {
                //     try {
                //         var m = element.attributes.name.textContent;
                //         if (m == "" || m == undefined) {
                //             return ture;
                //         } else {
                //             if (map.has(m.toLowerCase())) {
                //                 var v = map.get(m.toLowerCase());
                //                 var childName = "text[name='" + m + "']";
                //                 if (v == undefined) {
                //                     group.children(childName).text("-");
                //                 } else {
                //                     group.children(childName).text(map.get(m.toLowerCase()));
                //                 }
                //             } else {
                //                 $(this).text("-");
                //             }
                //         }
                //     } catch (err) {}
                // });

                //添加开关量按钮事件
                addControlClick();
                group.unbind("click").on("click", function () {
                    if ($(this).attr("data-fun") == "light") {
                        //开关按钮事件过滤
                    } else {
                        $("#modelShow").css("display", "flex");
                        detailData(val.fCircuitid, val.fCircuitname);
                    }

                });
            });
        } else {
            $.each($("text"), function (index, element) {
                try {
                    var m = element.attributes.name.textContent;
                    if (m == "" || m == undefined) {
                        return ture;
                    } else {
                        $(this).text("-");
                    }
                } catch (err) {}
            });
        }
    }
    refreshdata = showDataOnSVG;
});

var tableData = [];

function detailData(cirid, cirname) {
    var cirData;
    $("#fCircuitname").text(cirname);
    getDataByAjax(mainUrl, {
        fCircuitid: cirid
    }, function (data) {
        cirData = data;
        $(".nav-tabs li").unbind("click").click(function () {
            tableData = [];
            $(this).addClass("active").siblings().removeClass("active");
            var paramCode = $(this).attr("id");
            $.each(cirData, function (i, val) {
                switch (paramCode) {
                    case "U":
                        if (val.fParamCode.toUpperCase().substring(0, 1) == "U") {
                            var paramName = val.fParamCode + "(V)";
                            pushData(val, paramName);
                        }
                        break;
                    case "I":
                        if (val.fParamCode.toUpperCase().substring(0, 1) == "I") {
                            var paramName = val.fParamCode + "(A)";
                            pushData(val, paramName);
                        }
                        break;
                    case "P":
                        if (val.fParamCode.toUpperCase() == "P" || val.fParamCode.toUpperCase() == "Q" || val.fParamCode.toUpperCase() == "S") {
                            var paramName = val.fParamCode + "(kW)";
                            pushData(val, paramName);
                        }
                        if (val.fParamCode.toUpperCase() == "PF") {
                            var paramName = val.fParamCode;
                            pushData(val, paramName);
                        }
                        break;
                    case "E":
                        if (val.fParamCode.toUpperCase() == "EPI") {
                            var paramName = val.fParamCode + "(kW·h)";
                            pushData(val, paramName);
                        }
                        break;
                    case "UB":
                        if (val.fParamCode.toUpperCase() == "VUB" || val.fParamCode.toUpperCase() == "CUB") {
                            var paramName = val.fParamCode + "(%)";
                            pushData(val, paramName);
                        }
                        break;
                    case "Max":
                        if (val.fParamCode.toUpperCase() == "MD") {
                            var paramName = val.fParamCode + "(kW)";
                            pushData(val, paramName);
                        }
                        break;
                }
            });
            showTable(tableData);
        });

        $(".nav-tabs li")[0].click();
    });
}

function pushData(val, paramCode) {
    var row = {};
    row.Paramname = paramCode;
    if (val.fValue != undefined && val.fValue != null) {
        row.fValue = parseFloat(val.fValue).toFixed(2);
    }
    if (val.min != undefined && val.min != null) {
        row.min = parseFloat(val.min).toFixed(2);
    }
    if (val.max != undefined && val.max != null) {
        row.max = parseFloat(val.max).toFixed(2);
    }
    if (val.minTime != undefined && val.minTime != null) {
        row.minTime = val.minTime.substring(5, 16);
    }
    if (val.maxTime != undefined && val.maxTime != null) {
        row.maxTime = val.maxTime.substring(5, 16);
    }
    if (val.avg != undefined && val.avg != null) {
        row.avg = parseFloat(val.avg).toFixed(2);
    }
    tableData.push(row);
}

function closeModel() {
    $("#modelShow").css("display", "none");
}

function showTable(data) {
    var columns = [
        [{
                field: "Paramname",
                title: Operation['ui_paramname'],
                align: "center",
                valign: "middle",
                align: "center",
                colspan: 1,
                rowspan: 2
            },
            {
                field: "fValue",
                title: Operation['ui_newValue'],
                align: "center",
                valign: "middle",
                align: "center",
                colspan: 1,
                rowspan: 2
            },
            {
                field: "maxVT",
                title: Operation['ui_maxval'],
                valign: "middle",
                align: "center",
                colspan: 2,
                rowspan: 1
            },
            {
                field: "minVT",
                title: Operation['ui_minval'],
                valign: "middle",
                align: "center",
                colspan: 2,
                rowspan: 1
            },
            {
                field: "avg",
                title: Operation['ui_avgval'],
                valign: "middle",
                align: "center",
                colspan: 1,
                rowspan: 2
            }
        ],
        [{
                field: "max",
                title: Operation['ui_val'],
                valign: "middle",
                align: "center"
            },
            {
                field: "maxTime",
                title: Operation['ui_time'],
                valign: "middle",
                align: "center"
            },
            {
                field: "min",
                title: Operation['ui_val'],
                valign: "middle",
                align: "center"
            },
            {
                field: "minTime",
                title: Operation['ui_time'],
                align: "center"
            }
        ]
    ];
    $("#detailTable").empty();
    $("#detailTable").html("<table id='table'></table>");
    $("#table").bootstrapTable({
        columns: columns,
        data: data,
    })
};

function refreshDiagramData() {
    var url = baseUrlFromAPP + "/getAppSubimgInfo";
    var params = {
        fSubid: subidFromAPP
    };
    getDataByAjax(url, params, function (data) {
        refreshdata(data.SvgInfo);
    });
}

function getDataByAjax(url, params, successCallback, method) {
    toast.show({
        text: Operation['ui_loading'],
        loading: true
    });
    if (method == null) {
        method = "GET";
    }
    $.ajax({
        type: method,
        url: url,
        data: params,
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", tokenFromAPP);
        },
        success: function (result) {
            if (result.code == "5000") {
                var strArr = baseUrlFromAPP.split("/");
                var ipAddress = strArr[0] + "//" + strArr[2];
                $.ajax({
                    url: "http://www.acrelcloud.cn/SubstationWEBV2/main/uploadExceptionLog",
                    type: "POST",
                    data: {
                        ip: ipAddress,
                        exceptionMessage: JSON.stringify(result.data.stackTrace)
                    },
                    success: function (data) {

                    }
                });
            }
            toast.hide();
            if (result.code != "200") {
                toast.show({
                    text: Substation.showCodeTips(result.code),
                    duration: 2000
                });
            }
            successCallback(result.data);
        },
        error: function () {
            toast.show({
                text: Operation['code_fail'],
                duration: 2000
            });
        }
    });
}

function postFormDataByAjax(url, params, successCallback) {
    toast.show({
        text: Operation['ui_loading'],
        loading: true
    });
    $.ajax({
        type: "POST",
        url: url,
        data: params,
        dataType: "JSON",
        cache: false,
        processData: false,
        contentType: false,
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", tokenFromAPP);
        },
        success: function (result) {
            if (result.code == "5000") {
                var strArr = baseUrlFromAPP.split("/");
                var ipAddress = strArr[0] + "//" + strArr[2];
                $.ajax({
                    url: "http://www.acrelcloud.cn/SubstationWEBV2/main/uploadExceptionLog",
                    type: "POST",
                    data: {
                        ip: ipAddress,
                        exceptionMessage: JSON.stringify(result.data.stackTrace)
                    },
                    success: function (data) {

                    }
                });
            }
            toast.hide();
            if (result.code != "200") {
                toast.show({
                    text: Substation.showCodeTips(result.code),
                    duration: 2000
                });
            }
            successCallback(result.data);
        },
        error: function () {
            toast.show({
                text: Operation['code_fail'],
                duration: 2000
            });
        }
    });
}

function getMeter() {
    MeterInfo = [];
    unitList = [];
    getDataByAjax(webUrl + "sys/getCircuitInfo", "fSubId=" + subidFromAPP, function (data) {
        if (data.res && data.res.length > 0) {
            data.res.forEach(function (i) {
                if (i.fMetercode) {
                    MeterInfo.push({
                        fMetercode: i.fMetercode,
                        fCircuitid: i.fCircuitid
                    })
                }
            })
        }
    });
    getDataByAjax(webUrl + "main/getParamList", '', function (data) {
        unitList = data.result
    }, 'POST');
}

function initMqtt() {
    getDataByAjax(webUrl + "sys/startOpenMqtt", '', function (data) {
        if (data) {
            mqttClient = MyMqttClient.getClient();
            mqttSubscribe();
            mqttClient.on('message', function (topic, message) {
                // console.log(new Date().getTime());
                var info = JSON.parse(message.toString())
                // console.log(topic, info)
                if (topic == mqttTopic + "/" + subidFromAPP) {
                    var time = info.time
                    if (info.meter && info.meter.length > 0) {
                        info.meter.forEach(function (val) {
                            var circuit = MeterInfo.filter(function (value) {
                                return value.fMetercode === val.id
                            })

                            if (circuit.length > 0) {
                                var fCircuitid = circuit[0].fCircuitid

                                // if (topic==mqttTopic+"/p/"+_this.subId){
                                //     if(fCircuitid===_this.loadSelect){
                                //         setLine(val,time);
                                //     }
                                // }
                                setPicData(val, time, fCircuitid);
                            }
                        })
                    }
                    // console.log(new Date().getTime());
                }

                function setPicData(meterValue, time, fCircuitid) {
                    var map = new Map();
                    var group = $('body').find("#" + fCircuitid);
                    // if (lastTime != null) {
                    //     // 如果本次时间小于上一次时间，则return
                    //     if (lastTime > time) {
                    //         return
                    //     } else {
                    //         lastTime = time;
                    //     }
                    // } else {
                    //     lastTime = time;
                    // }
                    if (group.length > 0 && meterValue.values) {
                        $.each(meterValue.values, function (paramCode, fValue) {
                            switch (paramCode.toUpperCase()) {
                                case "SWITCH":
                                case "SWITCHON":
                                    $(group).find("g[name='offline']").hide();
                                    if (fValue == 1) {
                                        $(group).find('g[name="off"]').hide();
                                        $(group).find('g[name="on"]').show()
                                    } else if (fValue == 0) {
                                        $(group).find('g[name="on"]').hide();
                                        $(group).find('g[name="off"]').show()
                                    } else {
                                        $(group).find("g[name='offline']").show();
                                    }
                                    break;
                                case "SWITCHOFF":
                                    $(group).find("g[name='offline']").hide();
                                    if (fValue == 1) {
                                        $(group).find('g[name="on"]').hide();
                                        $(group).find('g[name="off"]').show()
                                    } else if (fValue == 0) {
                                        $(group).find('g[name="off"]').hide();
                                        $(group).find('g[name="on"]').show()
                                    } else {
                                        $(group).find("g[name='offline']").show();
                                    }
                                    break;
                                default:
                                    // 其他开关量
                                    if (fValue == 0 || fValue == 1) {
                                        // console.log(paramCode+":"+fValue);
                                        var offlineStr = paramCode + "/offline";
                                        var onStr = paramCode + "/1";
                                        var offStr = paramCode + "/0";

                                        var lowerCase = paramCode.toLowerCase();
                                        var upperCase = paramCode.toUpperCase();


                                        var offlineStrLow = lowerCase + "/offline";
                                        var onStrLow = lowerCase + "/1";
                                        var offStrLow = lowerCase + "/0";


                                        var offlineStrUp = upperCase + "/offline";
                                        var onStrUp = upperCase + "/1";
                                        var offStrUp = upperCase + "/0";

                                        var on = undefined,
                                            off = undefined,
                                            offline = undefined;
                                        if ($(group).find("g[name='" + onStr + "']").length > 0) {
                                            on = $(group).find("g[name='" + onStr + "']");
                                        }
                                        if ($(group).find("g[name='" + onStrLow + "']").length > 0) {
                                            on = $(group).find("g[name='" + onStrLow + "']");
                                        }
                                        if ($(group).find("g[name='" + onStrUp + "']").length > 0) {
                                            on = $(group).find("g[name='" + onStrUp + "']");
                                        }

                                        if ($(group).find("g[name='" + offStr + "']").length > 0) {
                                            off = $(group).find("g[name='" + offStr + "']");
                                        }
                                        if ($(group).find("g[name='" + offStrLow + "']").length > 0) {
                                            off = $(group).find("g[name='" + offStrLow + "']");
                                        }
                                        if ($(group).find("g[name='" + offStrUp + "']").length > 0) {
                                            off = $(group).find("g[name='" + offStrUp + "']");
                                        }

                                        if ($(group).find("g[name='" + offlineStr + "']").length > 0) {
                                            offline = $(group).find("g[name='" + offlineStr + "']");
                                        }
                                        if ($(group).find("g[name='" + offlineStrLow + "']").length > 0) {
                                            offline = $(group).find("g[name='" + offlineStrLow + "']");
                                        }
                                        if ($(group).find("g[name='" + offlineStrUp + "']").length > 0) {
                                            offline = $(group).find("g[name='" + offlineStrUp + "']");
                                        }
                                        if (offline) $(offline).hide();
                                        if (fValue == 0) {
                                            if (on) $(on).hide();
                                            if (off) $(off).show();
                                        } else if (fValue == 1) {
                                            if (on) $(on).show();
                                            if (off) $(off).hide();
                                        } else {
                                            if (offline) $(offline).show();
                                        }
                                    }
                                    if (paramCode === 'Ua' || paramCode === 'Ub' || paramCode === 'Uc' || paramCode === 'Uab' || paramCode === 'Ubc' || paramCode === 'Uca') {
                                        if (parseFloat(fValue) > 1000) {
                                            fValue = (parseFloat(fValue) / 1000).toFixed(2) + 'kV';
                                        } else {
                                            fValue = parseFloat(fValue).toFixed(2) + 'V'
                                        }
                                    } else {
                                        fValue = parseFloat(fValue).toFixed(2)
                                    }
                                    map.set(paramCode.toLowerCase(), fValue);
                            }
                        });
                        $.each(group.children('g text'), function (index, element) {
                            try {
                                var name = element.attributes.name
                                if (name) {
                                    var m = name.textContent;
                                    if (map.has(m.toLowerCase())) {
                                        var unitArr = []

                                        var childName = "text[name='" + m + "']";

                                        if (m.toLowerCase().substr(0, 1) !== 'u') {
                                            unitArr = unitList.filter(function (u) {
                                                return u.fParamcode.toLowerCase() === m.toLowerCase()
                                            })
                                        }

                                        var value = map.get(m.toLowerCase())

                                        if (unitArr.length > 0) {
                                            value += unitArr[0].fUnitcode
                                        }

                                        group.children(childName).text(value);
                                    }
                                }
                            } catch (err) {
                                // console.log(err);
                            }
                        });

                        // $.each(meterValue.values, function (paramCode, fValue) {
                        //     if (paramCode.substr(0, 1) === 'U') {
                        //         if (parseFloat(fValue) > 1000) {
                        //             fValue = (parseFloat(fValue) / 1000).toFixed(2) + 'kV';
                        //         } else {
                        //             fValue = parseFloat(fValue).toFixed(2) + 'V'
                        //         }
                        //     } else {
                        //         fValue = parseFloat(fValue).toFixed(2)
                        //     }
                        //     map.set(paramCode.toLowerCase(), fValue);
                        // })
                        // $.each(group.children('g text'), function (index, element) {
                        //     try {
                        //         var name = element.attributes.name
                        //         if (name) {
                        //             var m = name.textContent;
                        //             if (map.has(m.toLowerCase())) {
                        //                 var unitArr = []

                        //                 var childName = "text[name='" + m + "']";

                        //                 if (m.toLowerCase().substr(0, 1) !== 'u') {
                        //                     unitArr = unitList.filter(function (u) {
                        //                         return u.fParamcode.toLowerCase() === m.toLowerCase()
                        //                     })
                        //                 }

                        //                 var value = map.get(m.toLowerCase())

                        //                 if (unitArr.length > 0) {
                        //                     value += unitArr[0].fUnitcode
                        //                 }

                        //                 group.children(childName).text(value);
                        //             }
                        //         }
                        //     } catch (err) {
                        //         console.log(err);
                        //     }
                        // });
                    }
                }
            })
        } else {
            // if(this.timeOut1!==undefined){
            //     clearTimeout(_this.timeOut1)
            //     clearTimeout(_this.timeOut2)
            // }
            // this.timeOut1 = setTimeout(function () {
            //     refreshXml();
            // },2000);
        }
    });
};

function mqttSubscribe(lastSubid) {
    if (mqttClient != null) {
        if (mqttClient.connected) {
            onReceiveMessage();
        } else {
            mqttClient.on('connect', function (e) {
                onReceiveMessage();
            });
        }
    }

    function onReceiveMessage() {
        // 取消订阅
        mqttClient.unsubscribe(mqttTopic + '/' + lastSubid, function (e) {
            // console.log('取消订阅')
        })

        mqttClient.subscribe(mqttTopic + "/" + subidFromAPP, function (e) {
            // console.log('订阅成功');
        })
    }
};

function addControlClick() {
    $("[data-fun]").unbind("click");
    $("[data-value]").each(function (i, obj) {
        // $($(obj).find("[name='fan/on']")[0]).hide().siblings().show();
        $(obj).off("click").on("click", function () {
            var cirGroup = $(obj).parents("[data-fun]")[0];
            var noClick = $(cirGroup).attr("disabled");
            if (noClick == "disabled") {
                alert("请勿频繁操作。");
                return;
            } else {
                $(cirGroup).attr("disabled", "disabled");
                setTimeout(function () {
                    $(cirGroup).removeAttr("disabled");
                }, 5000);
            }
            var cir = $(cirGroup).attr("id");
            var circuit = MeterInfo.filter(function (value) {
                return value.fCircuitid === cir;
            });
            if (circuit.length > 0) {
                var fMeterCode = circuit[0].fMetercode;
                var funcid = $(cirGroup).data("fun");
                var funValue = $(obj).data("value");
                var format = new FormData();
                format.append("fSubid", subidFromAPP);
                format.append("fMetercode", fMeterCode);
                format.append("fFuncid", funcid);
                format.append("fValue", funValue);
                postFormDataByAjax(webUrl + "main/sendOneControlDemandHTTP", format, function (data) {
                    if (data.code === 200) {
                        // alert(data.a, "", "", {
                        //     type: 'success'
                        // });
                        toast.show({
                            text: data.a,
                            duration: 2000
                        });
                    } else {
                        toast.show({
                            text: data.a,
                            duration: 2000
                        });
                    }
                });
            }
        }).css("cursor", "pointer");
    });
}