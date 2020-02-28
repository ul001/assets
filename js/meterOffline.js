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
        $("#meterId").on("click", function () {
            var _this = this;
            setTimeout(function () {
                _this.scrollIntoViewIfNeeded();
            }, 200);
        });
    }

    let toast = new ToastClass(); //实例化toast对象

    //创建MeScroll对象
    var mescroll = new MeScroll("mescroll", {
        // down: {
        //     auto: false, //是否在初始化完毕之后自动执行下拉回调callback; 默认true
        //     callback: downCallback //下拉刷新的回调
        // },
        up: {
            auto: true, //是否在初始化时以上拉加载的方式自动加载第一页数据; 默认false
            callback: upCallback, //上拉回调,此处可简写; 相当于 callback: function (page) { upCallback(page); }
            empty: {
                tip: Operation['ui_nodata'], //提示
            },
            clearEmptyId: "listUl" //相当于同时设置了clearId和empty.warpId; 简化写法;默认null
        }
    });

    /*初始化*/
    var YandM; //Year and Month
    var today; //今天
    var lastDay; //最后一天
    var date = new Date();

    //页面初始化加载当日数据
    var startDate = tool.initDate("YMD", new Date());;
    var endDate = tool.initDate("YMD", new Date());;
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
    // function downCallback() {
    //     mescroll.resetUpScroll();
    //     //联网加载数据
    //     getListDataFromNet(1, 20, function (data) {
    //         //联网成功的回调,隐藏下拉刷新的状态
    //         mescroll.endSuccess();
    //         //设置列表数据
    //         setListData(data, "refresh");
    //     }, function () {
    //         //联网失败的回调,隐藏下拉刷新的状态
    //         mescroll.endErr();
    //     });
    // }

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
            var str = "<div class=\"container\">\n" +
                "                <h1 class=\"limit-length\">" + this.f_DeviceName + "</h1>\n" +
                "                <div class=\"type\">\n" +
                "                    <img src=\"image/yblx.png\"/>\n" +
                "                    <p class=\"list\">"+Operation['ui_deviceid']+"</p>\n" +
                "                    <p>" + this.f_DeviceCode + "</p>\n" +
                "                    <p class=\"list\">" + this.f_StartTime.split(".")[0] + "</p>\n" +
                "                </div>\n" +
                "            </div>";
            var liDom = document.createElement("li");
            liDom.innerHTML = str;
            listDom.appendChild(liDom); //加在列表的后面,上拉加载
        });
    }


    function getListDataFromNet(pageNum, pageSize, successCallback, errorCallback) {
        //开始时间不能大于截止时间
        if (startDate > endDate) {
            toast.show({
                text: Operation['ui_dateselecttip']+"！",
                duration: 2000
            });
            return;
        } else {
            $("#startDate").html(startDate);
            $("#endDate").html(endDate);
        }
        //        var fAlarmtype = $("#alermType").val();//类型
        var fDeviceCode = $("#meterId").val(); //设备编号

        var params = {
            fSubid: subidFromAPP,
            startDate: startDate + " 00:00:00",
            endDate: endDate + " 23:59:59",
            fDevicecode: fDeviceCode,
            fAlarmtype: 1,
            pageNo: pageNum,
            pageSize: pageSize
        }

        try {
            $.ajax({
                type: 'GET',
                url: baseUrlFromAPP + "/eventLog/PlatformRunLog",
                data: params,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", tokenFromAPP)
                },
                success: function (result) {
                    if(result.code != "200"){
                        toast.show({
                            text: Substation.showCodeTips(result.code),
                            duration: 2000
                        });
                    }
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
    });
    $(".cancel").click(function () {
        $(".selectcontain").hide();
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
            if (month <= 9) {
                YandM = year + '-' + '0' + month;
            }
            if (month >= 10) {
                YandM = year + '-' + month;
            }
        }
    }

    //初始化时间插件

    var startRoll = new Rolldate({
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

    var endRoll = new Rolldate({
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

    $("#startDiv").click(function () {
        startRoll.show();
    });

    $("#endDiv").click(function () {
        endRoll.show();
    });
});