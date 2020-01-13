$(function () {
    // var baseUrlFromAPP = "http://116.236.149.165:8090/SubstationWEBV2/v4";
    // var tokenFromAPP = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NzczMjcxNDUsInVzZXJuYW1lIjoiaGFoYWhhIn0.nJ3QuAFYNiHDBxvdoIQOjrPQWq5Vy7Uo490k5HVmv1U";
    // var subidFromAPP = 10100001;
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

    let toast = new ToastClass(); //实例化toast对象

    // //创建MeScroll对象
    // var mescroll = new MeScroll("mescroll", {
    //     down: {
    //         auto: false, //是否在初始化完毕之后自动执行下拉回调callback; 默认true
    //         callback: downCallback //下拉刷新的回调
    //     },
    //     up: {
    //         auto: true, //是否在初始化时以上拉加载的方式自动加载第一页数据; 默认false
    //         callback: upCallback, //上拉回调,此处可简写; 相当于 callback: function (page) { upCallback(page); }
    //         empty: {
    //             tip: "暂无相关数据", //提示
    //         },
    //         clearEmptyId: "container" //相当于同时设置了clearId和empty.warpId; 简化写法;默认null
    //     }
    // });

    // /*下拉刷新的回调 */
    // function downCallback() {
    //     mescroll.resetUpScroll();
    //     //联网加载数据
    //     getListDataFromNet(1, 20, function (data) {
    //         //联网成功的回调,隐藏下拉刷新的状态
    //         mescroll.endSuccess();
    //         //设置列表数据
    //         creatList(data.leakageCurrentValues);
    //     }, function () {
    //         //联网失败的回调,隐藏下拉刷新的状态
    //         mescroll.endErr();
    //     });
    // }

    // /*上拉加载的回调 page = {num:1, size:10}; num:当前页 从1开始, size:每页数据条数 */
    // function upCallback(page) {
    //     getListDataFromNet(page.num, page.size, function (data) {
    //         //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
    //         mescroll.endSuccess(data.leakageCurrentValues.length); //传参:数据的总数; mescroll会自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;
    //         //设置列表数据
    //         creatList(data.leakageCurrentValues);
    //     }, function () {
    //         //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
    //         mescroll.endErr();
    //     });
    // }
    getListDataFromNet();

    function getListDataFromNet() {
        toast.show({
            text: '正在加载',
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
                    strArr.pop();
                    var ipAddress = strArr.join("/");
                    $.ajax({
                        url: ipAddress + "/main/uploadExceptionLog",
                        type: "POST",
                        data: {
                            ip: ipAddress,
                            exceptionMessage: data.data.stackTrace
                        },
                        success: function (data) {

                        }
                    });
                }
                toast.hide();
                creatList(result.data.leakageCurrentValues);
            },
            error: function () {
                toast.show({
                    text: '数据请求失败',
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
                    '<p>漏电流：</p><p>线缆温度：</p></div>' +
                    '<div class="data">' +
                    '<p>' + IVal + 'mA</p>' +
                    '<p>A:<span>' + tempA + '</span>℃</p>' +
                    '<p>B:<span>' + tempB + '</span>℃</p>' +
                    '<p>C:<span>' + tempC + '</span>℃</p>' +
                    '</div>' +
                    '<div class="timeClass"><p>' + updateTime + '</p></div>' +
                    '<button class="search tempBtn" type="button" name="' + val.fMeterName + '" value="' + val.fMetercode + '"> ' +
                    '<img class="searchBtn" src="image/search.png"/> ' +
                    '查询</button>' +
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