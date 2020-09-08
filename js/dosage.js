$(function () {
    var baseUrlFromAPP="http://116.236.149.165:8090/SubstationWEBV2/v5";
    var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDAwODgxMDYsInVzZXJuYW1lIjoiaGFoYWhhIn0.ITW5w6xOVnU2cRbw_JU-MkWfsn-MLHB1z25bVEuDWLg";
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

    //页面初始化加载当日数据
    let toast = new ToastClass();

    var currentSelectVode = {}; //选中节点

    initFirstNode(); //初始化第一个回路
    var isClick = 0;

    function initFirstNode() {
        var url = baseUrlFromAPP + "/getfCircuitidsList";
        var params = {
            fSubid: subidFromAPP,
        }
        getData(url, params, function (data) {
            setListData(data);
            initNetData(); //初始化
        });
    }

    $("#CircuitidsList").click(function () {
        var search = $("#CircuitidsInput").val();
        var url = baseUrlFromAPP + "/getfCircuitidsList";
        var params = {
            fSubid: subidFromAPP,
            search: search,
        }
        getData(url, params, function (data) {
            setListData(data);
        });
        isClick = 1;
    });

    $(document).on('click', '.clear', function () {
        $("#CircuitidsInput").val("");
        if (isClick == 1) {
            var url = baseUrlFromAPP + "/getfCircuitidsList";
            var params = {
                fSubid: subidFromAPP,
            }
            getData(url, params, function (data) {
                setListData(data);
            });
            isClick = 0;
        }
    });

    $(document).on('click', '.elec-btn .btn', function () {
        if ($(this).hasClass('select')) {
            $(this).removeClass('select');
        } else {
            $(this).addClass('select');
        }
    });

    $("#sideClick").click(function () {
        $(".tree").show();
        $("html,body").addClass("ban_body");
    });

    $(".cancel").click(function () {
        $(".tree").hide();
        $("html,body").removeClass("ban_body");
    });

    $("#confirm").click(function () {
        $(".tree").hide();
        $("html,body").removeClass("ban_body");
        $("#meter").html(currentSelectVode.merterName);
        var selectParam = $(".btn.select").val();
        networkData(selectParam);
    });

    function setListData(data) {
        $('#treeview').treeview({
            data: data,
            showIcon: true,
            showBorder: true,
            expandIcon: "glyphicon glyphicon-plus",
            collapseIcon: "glyphicon glyphicon-minus",
        });
        $('#treeview').treeview('selectNode', 0);
        currentSelectVode.merterId = $('#treeview').treeview('getSelected')[0].id;
        currentSelectVode.merterName = $('#treeview').treeview('getSelected')[0].text;
        $("#meter").html(currentSelectVode.merterName);
        $('#treeview').on('nodeSelected', function (event, node) {
            currentSelectVode.merterId = node.id;
            currentSelectVode.merterName = node.text;
        })
    }

    var startDate = tool.initDate("first", new Date());
    var endDate = tool.initDate("YMD", new Date());

    $(".startDate").val(startDate);
    $(".endDate").val(endDate);

    function initNetData() {
        var showMon = tool.initDate("YM", new Date());
        $("#showTime").html(showMon);
        networkData('sum');
    }

    //切换按钮
    // $("#selectType").change(function () {
    //     var select = $("#selectType").get(0);
    //     var type = select.options[select.selectedIndex].value; //获取被选中option的value
    //     networkData(type);
    // })
    $(document).on('click', '.ListH .btn', function () {
        var obj = $(this);
        $(this).addClass('select').siblings("button").removeClass('select');
        var selectParam = $(this).val();
        // var type = selectParam == "按电量" ? "sum" : "price";
        networkData(selectParam);

    });

    //网络请求 type：sum电量 price电费
    function networkData(type) {
        // $(".startDate").val(startDate);
        // $(".endDate").val(endDate);
        //开始时间不能大于截止时间
        // $("body").showLoading();
        startDate = $("#dateStart").val();
        endDate = $("#dateEnd").val();
        var nowDate = tool.initDate("YMDhm", new Date());
        if (startDate > endDate) {
            toast.show({
                text: Operation['ui_dateselecttip']+"！",
                duration: 2000
            });
            return;
        } else if (endDate > nowDate) {
            toast.show({
                text: Operation['ui_dateselecttip']+"！",
                duration: 2000
            });
            return;
        } else {
            $("#startDate").html(startDate);
            $("#endDate").html(endDate);
        }

        var url = baseUrlFromAPP + "/getMothJFPG";
        var params = {
            fSubid: subidFromAPP,
            fCircuitid: currentSelectVode.merterId,
            startTime: startDate,
            endTime: endDate
        }
        getData(url, params, function (data) {
            // $("body").hideLoading();
            showChartBar(data, type);
        });
    }

    function getData(url, params, successCallback) {
        toast.show({
            text: Operation['ui_loading'],
            loading: true
        });
        var token = tokenFromAPP;
        $.ajax({
            type: 'GET',
            url: url,
            data: params,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", token)
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
                successCallback(result.data);
            },
            error: function () {
                toast.show({
                    text: Operation['code_fail'],
                    duration: 2000
                });
            }
        })
    }

    //图表赋值初始化
    function showChartBar(data, type) {
        var time = [];
        var jian = [];
        var feng = [];
        var ping = [];
        var gu = [];
        var jPrice = [];
        var fPrice = [];
        var pPrice = [];
        var gPrice = [];
        var jBar = 0,
            fBar = 0,
            pBar = 0,
            gBar = 0;
        var jpBar = 0,
            fpBar = 0,
            ppBar = 0,
            gpBar = 0;
        var bar = [];
        var priceBar = [];
        var startYear = new Date().getFullYear();
        var startMon = new Date().getMonth() + 1;
        var monthDay = new Date(startYear, startMon, 0);
        var days = monthDay.getDate(); //获取开始日期当月天数
        if (startMon < 10) {
            startMon = '0' + startMon;
        }
        // for (var i = 1; i <= days; i++) {
        //     if (i < 10) {
        //         var day = '0' + i;
        //     } else {
        //         var day = i;
        //     }
        //     var t = startMon + "-" + day;
        //     time.push(t);
        //     jian.push(null);
        //     feng.push(null);
        //     ping.push(null);
        //     gu.push(null);
        //     jPrice.push(null);
        //     fPrice.push(null);
        //     pPrice.push(null);
        //     gPrice.push(null);
        // }
        $(data).each(function () {
            time.push(this.f_Date.substring(5));
            jian.push(null);
            feng.push(null);
            ping.push(null);
            gu.push(null);
            jPrice.push(null);
            fPrice.push(null);
            pPrice.push(null);
            gPrice.push(null);
        });
        $.each(data, function (key, val) {
            var t = val.f_Date.substring(5);
            for (var j = 0; j < time.length; j++) {
                if (time[j] == t) {
                    if (val.f_EpiJDayValue != undefined) {
                        jBar += parseFloat(val.f_EpiJDayValue);
                    }
                    if (val.f_EpiFDayValue != undefined) {
                        fBar += parseFloat(val.f_EpiFDayValue);
                    }
                    if (val.f_EpiPDayValue != undefined) {
                        pBar += parseFloat(val.f_EpiPDayValue);
                    }
                    if (val.f_EpiGDayValue != undefined) {
                        gBar += parseFloat(val.f_EpiGDayValue);
                    }
                    if (val.jSum != undefined) {
                        jpBar += parseFloat(val.jSum);
                    }
                    if (val.fSum != undefined) {
                        fpBar += parseFloat(val.fSum);
                    }
                    if (val.pSum != undefined) {
                        ppBar += parseFloat(val.pSum);
                    }
                    if (val.gSum != undefined) {
                        gpBar += parseFloat(val.gSum);
                    }

                    jian[j] = parseFloat(val.f_EpiJDayValue).toFixed(2);
                    feng[j] = parseFloat(val.f_EpiFDayValue).toFixed(2);
                    ping[j] = parseFloat(val.f_EpiPDayValue).toFixed(2);
                    gu[j] = parseFloat(val.f_EpiGDayValue).toFixed(2);
                    jPrice[j] = parseFloat(val.jSum).toFixed(2);
                    fPrice[j] = parseFloat(val.fSum).toFixed(2);
                    pPrice[j] = parseFloat(val.pSum).toFixed(2);
                    gPrice[j] = parseFloat(val.gSum).toFixed(2);
                }
            }
        });
        bar.push({
            value: jBar.toFixed(0),
            name: Operation['ui_jian']
        }, {
            value: fBar.toFixed(0),
            name: Operation['ui_feng']
        }, {
            value: pBar.toFixed(0),
            name: Operation['ui_ping']
        }, {
            value: gBar.toFixed(0),
            name: Operation['ui_gu']
        });
        priceBar.push({
            value: jpBar.toFixed(0),
            name: Operation['ui_jian']
        }, {
            value: fpBar.toFixed(0),
            name: Operation['ui_feng']
        }, {
            value: ppBar.toFixed(0),
            name: Operation['ui_ping']
        }, {
            value: gpBar.toFixed(0),
            name: Operation['ui_gu']
        });

        if (type == 'sum') {
            var sum = (fBar + pBar + gBar).toFixed(0);
            initBar($("#lineChart"), time, jian, feng, ping, gu, bar, sum, 'kW·h');
            // initPie($("#lineChart"), time, jian, feng, ping, gu, bar, sum, 'kW.h');
        }
        if (type == 'price') {
            var sum = (fpBar + ppBar + gpBar).toFixed(0);
            initBar($("#lineChart"), time, jPrice, fPrice, pPrice, gPrice, priceBar, sum, Operation['ui_yuan']);
            // initPie($("#lineChart"), time, jPrice, fPrice, pPrice, gPrice, priceBar, sum, '元');
        }
    }

    //绘图
    function initBar($container, time, j, f, p, g, barData, sum, y) {
        var bar = echarts.init(document.getElementById('chartDosage'));
        var option = {
            title: [{
                text: Operation['ui_donut'],
                subtext: y=="￥"?(Operation['ui_totalsum']+'：' + y + sum):(Operation['ui_totalsum']+'：' + sum + y),
                textStyle: {
                    fontWeight: 'small'
                },
                // textAlign: 'center',
                right: '10',
                top: 10
            }],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: [Operation['ui_jian'], Operation['ui_feng'], Operation['ui_ping'], Operation['ui_gu']],
                bottom: 50
            },
            grid: {
                top: '51%',
                left: '13%',
                right: '5%',
                bottom: '20%'
            },
            xAxis: {
                type: 'category',
                data: time
            },
            yAxis: {
                name: y,
                type: 'value'
            },
            toolbox: {
                left: 'right',
                top: '45%',
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    dataView: {
                        readOnly: true
                    },
                    restore: {}
                }
            },
            dataZoom: [{
                startValue: time[0]
            }, {
                type: 'inside'
            }],
            series: [{
                    name: Operation['ui_jian'],
                    type: 'bar',
                    stack: Operation['ui_consumeelecval'],
                    label: {
                        normal: {
                            show: false,
                            position: 'insideRight'
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#c23531'
                        }
                    },
                    data: j
                },
                {
                    name: Operation['ui_feng'],
                    type: 'bar',
                    stack: Operation['ui_consumeelecval'],
                    label: {
                        normal: {
                            show: false,
                            position: 'insideRight'
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#F36757'
                        }
                    },
                    data: f
                },
                {
                    name: Operation['ui_ping'],
                    type: 'bar',
                    stack: Operation['ui_consumeelecval'],
                    label: {
                        normal: {
                            show: false,
                            position: 'insideRight'
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#2EC3D9'
                        }
                    },
                    data: p
                },
                {
                    name: Operation['ui_gu'],
                    type: 'bar',
                    stack: Operation['ui_consumeelecval'],
                    label: {
                        normal: {
                            show: false,
                            position: 'insideRight'
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#92D401'
                        }
                    },
                    data: g
                },
                {
                    name: Operation['ui_proportion'],
                    type: 'pie',
                    radius: ['20%', '45%'],
                    center: ['50%', '25%'],
                    label: {
                        normal: {
                            position: 'inner',
                            formatter: function (data) {
                                return data.name + '\n' + data.value + '\n' + '(' + data.percent.toFixed(1) + '%)';
                            }
                        }
                    },
                    color: ['#c23531', '#F36757', '#2EC3D9', '#92D401'],
                    data: barData
                }
            ]
        };
        bar.setOption(option);

    }

    //初始化时间插件
    var calendar1 = new LCalendar();
    calendar1.init({
        'trigger': '#dateStart',//标签id
        'type': 'date',//date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
        'minDate':'2000-1-1',//最小日期 注意：该值会覆盖标签内定义的日期范围
        'maxDate':'2050-1-1'//最大日期 注意：该值会覆盖标签内定义的日期范围
    });

    $("#dateStart").on("input",function(){
        var selectParam = $(".btn.select").val();
        networkData(selectParam);
    });

    var calendar2 = new LCalendar();
    calendar2.init({
        'trigger': '#dateEnd',//标签id
        'type': 'date',//date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
        'minDate':'2000-1-1',//最小日期 注意：该值会覆盖标签内定义的日期范围
        'maxDate':'2050-1-1'//最大日期 注意：该值会覆盖标签内定义的日期范围
    });

    $("#dateEnd").on("input",function(){
        var selectParam = $(".btn.select").val();
        networkData(selectParam);
    });

//    new Rolldate({
//        el: '#dateStart',
//        format: 'YYYY-MM-DD',
//        beginYear: 2000,
//        endYear: 2100,
//        value: startDate,
//        confirm: function (date) {
//            var showMon = tool.initDate("YM", new Date());
//            $("#showTime").html(showMon);
//            $(".startDate").val(date);
//            // var select = $("#selectType").get(0);
//            // var type = select.options[select.selectedIndex].value; //获取被选中option的value
//            var selectParam = $(".btn.select").val();
//
//            networkData(selectParam);
//
//
//        }
//    });
//
//    new Rolldate({
//        el: '#dateEnd',
//        format: 'YYYY-MM-DD',
//        beginYear: 2000,
//        endYear: 2100,
//        value: endDate,
//        confirm: function (date) {
//            var showMon = tool.initDate("YM", new Date());
//            $("#showTime").html(showMon);
//            $(".endDate").val(date);
//            // var select = $("#selectType").get(0);
//            // var type = select.options[select.selectedIndex].value; //获取被选中option的value
//            var selectParam = $(".btn.select").val();
//
//            networkData(selectParam);
//
//        }
//    });
});