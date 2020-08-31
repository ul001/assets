let toast;
var baseUrlFromAPP = "http://www.acrelcloud.cn/SubstationWEBV2/v5";
var tokenFromAPP = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1OTc2NTM4OTMsInVzZXJuYW1lIjoieG1weiJ9.l_M0rv6OsYFK5BlEJKESdPEAWxJVE8UwKJxCPIJB1uE";
var subidFromAPP = 10100001;
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
var refreshdata;
var mainUrl = baseUrlFromAPP.split("SubstationWEBV2")[0] + "SubstationWEBV2/main/getCurrentValue";
$(function () {
    toast = new ToastClass();
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
                    // if (val.meterParamValues[i].fUnitGroup == "U") {
                    //     if (fvalue >= 1000) {
                    //         valjoinunit = (fvalue / 1000).toFixed(2) + "kV";
                    //     }
                    // }
                    // map.set(paramCode.toLowerCase(), valjoinunit);
                    // switch (paramCode.toUpperCase()) {
                    //     case "SWITCH":
                    //     case "SWITCHON":
                    //         1 === fvalue ?
                    //             (group.children('g[name="off"]').hide(),
                    //                 group.children('g[name="on"]').show()) :
                    //             (group.children('g[name="on"]').hide(),
                    //                 group.children('g[name="off"]').show());
                    //         break;
                    //     case "SWITCHOFF":
                    //         0 === fvalue ?
                    //             (group.children('g[name="off"]').hide(),
                    //                 group.children('g[name="on"]').show()) :
                    //             (group.children('g[name="on"]').hide(),
                    //                 group.children('g[name="off"]').show());
                    //         break;
                    //     default:
                    // }
                    var flag = val.meterParamValues[i].fValue == undefined ? -1 : val.meterParamValues[i].fValue;
                    if (flag != -1) {
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

                $.each(group.children("g text"), function (index, element) {
                    try {
                        var m = element.attributes.name.textContent;
                        if (m == "" || m == undefined) {
                            return ture;
                        } else {
                            if (map.has(m.toLowerCase())) {
                                var v = map.get(m.toLowerCase());
                                var childName = "text[name='" + m + "']";
                                if (v == undefined) {
                                    group.children(childName).text("-");
                                } else {
                                    group.children(childName).text(map.get(m.toLowerCase()));
                                }
                            } else {
                                $(this).text("-");
                            }
                        }
                    } catch (err) {}
                });
                group.unbind("click").on("click", function () {
                    $("#modelShow").css("display", "flex");
                    detailData(val.fCircuitid, val.fCircuitname);
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

function getDataByAjax(url, params, successCallback) {
    toast.show({
        text: Operation['ui_loading'],
        loading: true
    });
    $.ajax({
        type: "GET",
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