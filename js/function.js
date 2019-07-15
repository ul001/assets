$(function () {
    var baseUrlFromAPP="http://116.236.149.162:8090/SubstationWEBV2";
    var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjMyMDkwMDksInVzZXJuYW1lIjoiYWRtaW4ifQ.D0vpMFoRFyGiWAJEMmoCPi9aALenyEcJbFJKH-PnMm8";
    var subidFromAPP=10100001;
    //iOS安卓基础传参
    /*var u = navigator.userAgent,
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
        $("#meterName,#paramName").on("focus",function(){
                var _this = this;
                setTimeout(function(){
                    _this.scrollIntoViewIfNeeded();
                },200);
        });
    }*/

    //创建MeScroll对象
    var mescroll = new MeScroll("mescroll", {

        up: {
            // 只需要配置上拉刷新部分， mescrol会默认开启下拉刷新，并重置当前页为第一页，然后调用up.callback()
            auto: true, //是否在初始化时以上拉加载的方式自动加载第一页数据; 默认false
            callback: upCallback, //上拉回调,此处可简写; 相当于 callback: function (page) { upCallback(page); }
            empty: {
                tip: "暂无相关数据", //提示
            },
            clearEmptyId: "listUl", //相当于同时设置了clearId和empty.warpId; 简化写法;默认null
            lazyLoad: {
                use: true // 是否开启懒加载,默认false
            }
        }
    });

    /*初始化*/
    var YandM; //Year and Month
    var today; //今天
    var lastDay; //最后一天
    var date = new Date();

    //页面初始化加载当日数据
    var startDate = tool.initDate("YMD", new Date());
    var endDate = tool.initDate("YMD", new Date());
    $(".startDate").val(startDate);
    $(".endDate").val(endDate);

    //点击当日、昨日、当月、上月按钮，日期改变
    $(document).on('click', '.selectcontain .btn', function () {
        $(this).addClass('select').siblings('button').removeClass('select');
        var btnId = $('.btn.select').attr("id");
        switch (btnId) {
            case "today":
                startDate = tool.initDate("YMD", new Date());
                endDate = tool.initDate("YMD", new Date());
                break;
            case "yesterday":
                startDate = tool.initDate("yesteray", new Date());
                endDate = tool.initDate("yesteray", new Date());
                break;
            case "thisMon":
                startDate = tool.initDate("first", new Date());
                endDate = tool.initDate("YMD", new Date());
                break;
            case "lastMon":
                lastMon();
                startDate = YandM + "-" + "01";
                endDate = YandM + "-" + lastDay;
                break;
        }
        $("#dateStart").val(startDate);
        $("#dateEnd").val(endDate);
    });

    //点击查询按钮
    $(document).on('click', '.search', function () {
        startDate = $("#dateStart").val();
        endDate = $("#dateEnd").val();
        $(".selectcontain").hide();
        mescroll.resetUpScroll();
    });

    /*下拉刷新的回调 */


    /*上拉加载的回调 page = {num:1, size:10}; num:当前页 从1开始, size:每页数据条数 */
    function upCallback(page) {
        getListDataFromNet(page.num, page.size, function (data) {
            //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
            mescroll.endSuccess(data.list.length); //传参:数据的总数; mescroll会自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;
            //设置列表数据
            setListData(data, "normal");
        }, function () {
            //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
            mescroll.endErr();
        });
    }

    /*设置列表数据*/
    function setListData(data, type) {
        var listDom = document.getElementById("listUl");

        if (type == "refresh") {
            listDom.innerHTML = '';
        }
        $(data.list).each(function () {
            var str = this.fStarttime + "<br>" + "[类型：" + this.fAlarmtype + " 仪表名称：" + this.fMetername +
                " 参数名称：" + this.fParamname + "][报警值：" + this.fValue + " 限定值：" + this.fLimitvalue + "]"
            var liDom = document.createElement("li");
            liDom.innerHTML = str;
            listDom.appendChild(liDom); //加在列表的后面,上拉加载
        });
    }


    function getListDataFromNet(pageNum, pageSize, successCallback, errorCallback) {
        //开始时间不能大于截止时间
        if (startDate > endDate) {
            $("#startDate").html("请选择正确的查询时间！");
            return;
        } else {
            $("#startDate").html(startDate);
            $("#endDate").html(endDate);
        }
        var fAlarmtype = $("#alermType").val(); //类型
        var fMetername = $("#meterName").val(); //仪表名称
        var fParamname = $("#paramName").val(); //参数名称

        var params = {
            fSubid: subidFromAPP,
            startDate: startDate+" 00:00:00",
            endDate: endDate+" 23:59:59",
            fMetername: fMetername,
            fParamname: fParamname,
            pageNo: pageNum,
            pageSize: pageSize
        }

        if (fAlarmtype != "全部") {
            params.fAlarmtype = fAlarmtype;
        }

        try {
            $.ajax({
                type: 'GET',
                url: baseUrlFromAPP + "/main/app/eventLog/OverLimitEvent",
                data: params,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", tokenFromAPP)
                },
                success: function (result) {
                    successCallback && successCallback(result.data);
                }
            })
        } catch (e) {
            errorCallback && errorCallback();
        }
    }
    //当日、昨日、当月、上月
    $(document).on('click', '.selectcontain .btn', function () {
        $(this).addClass('select').siblings('button').removeClass('select');
    });

    //侧边栏
    $("#select").click(function () {
        $(".selectcontain").show();
        // jsToOcFunction1();
    });

    $(".cancel").click(function () {
        $(".selectcontain").hide();
        // jsToOcFunction2();
    });

    $(document).on('click', '.cancel', function () {
        $(".selectcontain").hide();
    });

    $(".date").on('change', function () {
        $('.btn').removeClass('select');
    })

    function lastMon() { //需考虑1月的上一月为去年12月
        var year = date.getFullYear();
        var month = date.getMonth();
        if (month == 0) {
            year = year - 1;
            var day = new Date(year, 12, 0);
            lastDay = day.getDate();
            YandM = year + '-' + '12';
        } else {
            var day = new Date(year, month, 0);
            lastDay = day.getDate(); //获取某月最后一天
            if (month < 9) {
                YandM = year + '-' + '0' + month;
            }
            if (month >= 10) {
                YandM = year + '-' + month;
            }
        }
    }

    //初始化时间插件

    new Rolldate({
        el: '#dateStart',
        format: 'YYYY-MM-DD',
        beginYear: 2000,
        endYear: 2100,
        value: startDate,
        confirm: function (date) {
            var d = new Date(),
                d1 = new Date(date.replace(/\-/g, "\/")),
                d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()); //如果非'YYYY-MM-DD'格式，需要另做调整
            d3 = new Date($("#dateEnd").val().replace(/\-/g, "\/"));
            if (d1 > d2 || d3 < d1) {
                return false;
            };
            $(".btn").removeClass("select");
        }
    });

    new Rolldate({
        el: '#dateEnd',
        format: 'YYYY-MM-DD',
        beginYear: 2000,
        endYear: 2100,
        value: endDate,
        confirm: function (date) {
            var d = new Date(),
                d1 = new Date(date.replace(/\-/g, "\/")),
                d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()); //如果非'YYYY-MM-DD'格式，需要另做调整
            d3 = new Date($("#dateStart").val().replace(/\-/g, "\/"));
            if (d1 > d2 || d1 < d3) {
                return false;
            };
            $(".btn").removeClass("select");
        }
    });

    function jsToOcFunction1() {
        window.webkit.messageHandlers.jsToOcNoPrams.postMessage({});
    }

    function jsToOcFunction2() {
        window.webkit.messageHandlers.jsToOcWithPrams.postMessage({});
    }
});