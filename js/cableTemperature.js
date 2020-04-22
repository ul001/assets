$(function () {
    var baseUrlFromAPP="http://116.236.149.165:8090/SubstationWEBV2/v4";
    var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODgwMzU2NzgsInVzZXJuYW1lIjoiaGFoYWhhIn0.ZjupNziTSkDFXdBPvyBAinlDTgKAos7B_6Aig6peg3o";
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
    } else if(isAndroid){
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
        var url = baseUrlFromAPP + "/getTempABCResult";
        var params = {
            fSubid: subidFromAPP,
            // pageNo:num,
            // pageSize:page
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
                creatList(result.data.list);
            },
            error: function () {
                toast.show({
                    text: Operation['code_fail'],
                    duration: 2000
                });
            }
        })
    }
    var f_MeterCode;

    function creatList(data) {
        $("#container").html('');
        var string = '';
        if (data.length > 0) {
            $.each(data, function (key, val) {
                var tempA = "--";
                var tempB = "--";
                var tempC = "--";
                var tempN = "--";
                var updateTime = "--";
                var timeVal = val.timeA.substring(0, 19);
                var startTime = new Date(timeVal.replace(/\-/g, "/"));
                var endTime = new Date();
                var ms = endTime.getTime() - startTime.getTime();
                var hourVal = ms / 1000 / 60 / 60;
                if (hourVal > 12) {} else {
                    if (val.a != undefined) {
                        tempA = val.a;
                    }
                    if (val.b != undefined) {
                        tempB = val.b;
                    }
                    if (val.c != undefined) {
                        tempC = val.c;
                    }
                    if (val.n != undefined) {
                        tempN = val.n;
                    }
                    updateTime = timeVal;
                }
                string = '<section>' +
                    '<div class="tempDiv">' +
                    '<h3>' + val.f_MeterName + '</h3>' +
                    '<div class="tempNum">' +
                    '<img src="image/temp.png"/>' +
                    '<p>A:<span>' + tempA + '</span>℃</p>' +
                    '<p>B:<span>' + tempB + '</span>℃</p>' +
                    '<p>C:<span>' + tempC + '</span>℃</p>' +
                    '<p>N:<span>' + tempN + '</span>℃</p>' +
                    '</div>' +
                    '<div class="timeClass"><p>' + updateTime + '</p></div>' +
                    '<button class="search tempBtn" type="button" value="' + val.f_MeterCode + '"> ' +
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
            location.href = "cableTemperature-modal.html?F_MeterCode=" + F_MeterCode;
        })
    }
});