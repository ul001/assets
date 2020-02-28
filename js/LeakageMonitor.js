$(function () {
    var baseUrlFromAPP="http://116.236.149.165:8090/SubstationWEBV2/v4";
    var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODMxMTc3MDUsInVzZXJuYW1lIjoiaGFoYWhhIn0.eBLPpUsNBliLuGWgRvdPwqbumKroYGUjNn7bTZIKSA4";
    var subidFromAPP=10100001;
    //iOS安卓基础传参
    var u = navigator.userAgent,
        app = navigator.appVersion;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //安卓系统
    var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios系统
    //判断数组中是否包含某字符串
    if (isIOS) { //ios系统的处理
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

    let toast = new ToastClass(); //实例化toast对象

    getListDataFromNet();

    function getListDataFromNet() {
        toast.show({
            text: Operation['ui_loading'],
            loading: true
        });
        var url = baseUrlFromAPP + "/energySecurity/leakageMonitor";
        var params = {
            fSubid: subidFromAPP
        };
        $.ajax({
            type: 'GET',
            url: url,
            data: params,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", tokenFromAPP)
            },
            success: function (result) {
                if (result.code == "5000") {
                    var strArr = baseUrlFromAPP.split("/");
                    var ipAddress = strArr[0]+"//"+strArr[2];
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
                if(result.code != "200"){
                    toast.show({
                        text: Substation.showCodeTips(result.code),
                        duration: 2000
                    });
                }
                creatList(result.data.leakageCurrentValues);
            },
            error: function () {
                toast.show({
                    text: Operation['code_fail'],
                    duration: 2000
                });
            }
        })
    }

    function creatList(data) {
        $("#container").html('');
        var string = '';
        if (data.length > 0) {
            $.each(data, function (key, val) {
                var tempA = "--";
                var tempB = "--";
                var tempC = "--";
                var IVal = "--";
                var updateTime = "--";
                var timeVal = val.fUpdatetime;
                var startTime = new Date(timeVal.replace(/\-/g, "/"));
                var endTime = new Date();
                var ms = endTime.getTime() - startTime.getTime();
                var hourVal = ms / 1000 / 60 / 60;
                if (hourVal > 12) {} else {
                    if (val.fIl != undefined) {
                        IVal = val.fIl;
                    }
                    if (val.fTempa != undefined) {
                        tempA = val.fTempa;
                    }
                    if (val.fTempb != undefined) {
                        tempB = val.fTempb;
                    }
                    if (val.fTempc != undefined) {
                        tempC = val.fTempc;
                    }
                    updateTime = timeVal;
                }
                string = '<section>' +
                    '<div class="tempDiv">' +
                    '<div class="alarm">' +
                    '<img src="image/alarm-green.png"/>' +
                    '</div>' +
                    '<h3>' + val.fMeterName + '</h3>' +
                    '<div class="title">' +
                    '<p>'+Operation['ui_leakI']+'：</p><p>'+Operation['ui_cabtemp']+'：</p></div>' +
                    '<div class="data">' +
                    '<p>' + IVal + 'mA</p>' +
                    '<p>A:<span>' + tempA + '</span>℃</p>' +
                    '<p>B:<span>' + tempB + '</span>℃</p>' +
                    '<p>C:<span>' + tempC + '</span>℃</p>' +
                    '</div>' +
                    '<div class="timeClass"><p>' + updateTime + '</p></div>' +
                    '<button class="search tempBtn" type="button" name="' + val.fMeterName + '" value="' + val.fMetercode + '"> ' +
                    '<img class="searchBtn" src="image/search.png"/> ' +
                    Operation['ui_select']+'</button>' +
                    '</div>' +
                    '</section>';
                $("#container").append(string);
            });
        } else {
            window.location.href = "noData.html";
        }

        $(".tempBtn").unbind().click(function () {
            var F_MeterCode = $(this).attr("value");
            var F_MeterName = $(this).attr("name");
            localStorage.setItem("fMeterName", F_MeterName);
            location.href = "LeakageMonitor-modal.html?F_MeterCode=" + F_MeterCode;
        })
    }
});