$(function () {
    var baseUrlFromAPP="http://116.236.149.162:8090/SubstationWEBV2";
    var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjM1MzczMTAsInVzZXJuYW1lIjoiYWRtaW4ifQ.ty4m082uqMhF_j846hQ-dVCiYOdepOWdDIr7UiV9eTI";
    var subidFromAPP=10100001;
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

    //创建MeScroll对象
    var mescroll = new MeScroll("mescroll", {
        down: {
            auto: false, //是否在初始化完毕之后自动执行下拉回调callback; 默认true
            callback: downCallback //下拉刷新的回调
        },
        up: {
            auto: true, //是否在初始化时以上拉加载的方式自动加载第一页数据; 默认false
            callback: upCallback, //上拉回调,此处可简写; 相当于 callback: function (page) { upCallback(page); }
            empty: {
                tip: "暂无相关数据", //提示
            },
            clearEmptyId: "container" //相当于同时设置了clearId和empty.warpId; 简化写法;默认null
        }
    });
    /*下拉刷新的回调 */
    function downCallback() {
        mescroll.resetUpScroll();
        //联网加载数据
        getListDataFromNet(1, 20, function (data) {
            //联网成功的回调,隐藏下拉刷新的状态
            mescroll.endSuccess();
            //设置列表数据
            creatList(data.list);
        }, function () {
            //联网失败的回调,隐藏下拉刷新的状态
            mescroll.endErr();
        });
    }

    /*上拉加载的回调 page = {num:1, size:10}; num:当前页 从1开始, size:每页数据条数 */
    function upCallback(page) {
        getListDataFromNet(page.num, page.size, function (data) {
            //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
            mescroll.endSuccess(data.list.length); //传参:数据的总数; mescroll会自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;
            //设置列表数据
            creatList(data.list);
        }, function () {
            //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
            mescroll.endErr();
        });
    }


    function getListDataFromNet(num,page,successCallback,errorCallback){
        var url = baseUrlFromAPP+"/main/getTempABCResult";
        var params = {
            fSubid: subidFromAPP,
            pageNo:num,
            pageSize:page
        };
        $.ajax({
            type: 'GET',
            url:url,
            data: params,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", tokenFromAPP)
            },
            success: function (result) {
                successCallback && successCallback(result.data);
            },
            error:function () {
                errorCallback && errorCallback();
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
                if (val.a != undefined) {
                    tempA = val.a;
                }
                if (val.b != undefined) {
                    tempB = val.b;
                }
                if (val.c != undefined) {
                    tempC = val.c;
                }

                string = '<section>' +
                    '<div class="tempDiv">' +
                    '<h3>' + val.f_MeterName + '</h3>' +
                    '<div class="tempNum">' +
                    '<p>A:<span>' + tempA + '</span>℃</p>' +
                    '<p>B:<span>' + tempB + '</span>℃</p>' +
                    '<p>C:<span>' + tempC + '</span>℃</p>' +
                    '</div>' +
                    '<button class="search tempBtn" type="button" value="' + val.f_MeterCode + '">查 询</button>' +
                    '</div>' +
                    '</section>';
                $("#container").append(string);
            });
        }

        $(".tempBtn").click(function () {
            var F_MeterCode = $(this).attr("value");
            location.href="cableTemperature-modal.html?F_MeterCode="+F_MeterCode;
        })
    }
});