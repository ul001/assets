$(function () {
    //iOS安卓基础传参
    var u = navigator.userAgent,
        app = navigator.appVersion;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //安卓系统
    var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios系统
    //判断数组中是否包含某字符串
    var baseUrlFromAPP;
    var tokenFromAPP;
    var subidFromAPP;
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

    var currentSelectVode = {}; //选中节点

    initFirstNode(); //初始化第一个回路
    function initFirstNode() {
        var url = baseUrlFromAPP + "/main/getfCircuitidsList";
        var params = {
            fSubid: subidFromAPP,
        }
        getData(url, params, function (data) {

        });
    }

    $("#btnClick").click(function () {
        // $(".tree").show();
        // window.location.href = 'cableTemperature-modal.html';
        // plus.webview.close(this, "auto");
        var param = getUrlParams();
        console.log(param);
        window.history.go(-1);
        // closeme();
    });

    function closeme() {
        var ws = plus.webview.currentWebview();
        plus.webview.close(ws);
    }

    $("#sideClick").click(function () {
        // $(".tree").show();
        window.location.href = 'cableTemperature-modal.html?key1="loaction"';
    });

    function getUrlParams(params) {
        var urlObj = {};
        if (!window.location.search) {
            return false;
        }
        var urlParams = window.location.search.substring(1);
        var urlArr = urlParams.split('&');
        for (var i = 0; i < urlArr.length; i++) {
            var urlArrItem = urlArr[i].split('=');
            urlObj[urlArrItem[0]] = urlArrItem[1]
        }
        // 判断是否有参数
        if (arguments.length >= 1) {
            return urlObj[params]
        }
        return urlObj;
    }

    $(document).on('click', '#search', function () {
        var EnergyKind = $("#EnergyKind").attr('value');
        var selectParam = $(".btn.select").attr('value');
        if (EnergyKind == "fFr") {
            selectParam = ""
        }
        var time;
        var typeDA;
        if (selectParam == "today") {
            time = $("#date").val();
            typeDA = "D";
        } else if (selectParam == "month") {
            time = $("#date").val().substring(0, 7);
            typeDA = "M";
        } else if (selectParam == "year") {
            time = $("#date").val().substring(0, 4);
            typeDA = "Y";
        }
        var fCircuitid = currentSelectVode.merterId;

        var url = baseUrlFromAPP + "/main/app/powerAnalysis/EnergyReport";
        var params = {
            fSubid: subidFromAPP,
            fCircuitids: fCircuitid,
            time: time,
            DA: typeDA
            // fPhase: selectParam,
            // EnergyKind: EnergyKind,
        }
        getData(url, params, function (data) {
            showCharts(data.EnergyReport);
        });
    })


    function getData(url, params, successCallback) {
        var token = tokenFromAPP;
        $.ajax({
            type: 'GET',
            url: url,
            data: params,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", token)
            },
            success: function (result) {
                successCallback(result.data);
            }
        })
    }


});