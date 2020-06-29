$(function () {
    var baseUrlFromAPP="http://116.236.149.165:8090/SubstationWEBV2/v5";
    var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1OTM5MTYxMTUsInVzZXJuYW1lIjoiaGFoYWhhIn0.lLzdJwieIO-xMhob6PW06MRyzK4oCZVCfcs9196Iec8";
    var subidFromAPP=10100001;
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

    var currentSelectVode = {}; //选中节点
    let toast = new ToastClass(); //实例化toast对象
    initFirstNode(); //初始化第一个回路
    var isClick = 0;

    function initFirstNode() {
        var url = baseUrlFromAPP + "/getfCircuitidsList";
        var params = {
            fSubid: subidFromAPP
        };

        getData(url, params, function (data) {
            setListData(data);
            getURLData();
            // $("#search").click();
        });
    }

    $("#CircuitidsList").click(function () {
        var search = $("#CircuitidsInput").val();
        var url = baseUrlFromAPP + "/getfCircuitidsList";
        var params = {
            fSubid: subidFromAPP,
            search: search
        };
        getData(url, params, function (data) {
            setListData(data);
        });
        isClick = 1;
    });

    $(document).on("click", ".clear", function () {
        $("#CircuitidsInput").val("");
        if (isClick == 1) {
            var url = baseUrlFromAPP + "/getfCircuitidsList";
            var params = {
                fSubid: subidFromAPP
            };
            getData(url, params, function (data) {
                setListData(data);
            });
            isClick = 0;
        }
    });

    //配置时间
    var showtimeForElectSum = tool.initDate("YMD", new Date());

    $(document).on("click", ".elec-btn .btn", function () {
        var obj = $(this);
        $(this)
            .addClass("select")
            .siblings("button")
            .removeClass("select");
        var selectParam = $(this).attr("value");
        if (selectParam == "today") {
            showtimeForElectSum = tool.initDate("YMD", new Date());
            $("#date").val(showtimeForElectSum);
            roll.config.format = "YYYY-MM-DD";
        } else if (selectParam == "month") {
            showtimeForElectSum = tool.initDate("YM", new Date());
            $("#date").val(showtimeForElectSum);
            roll.config.format = "YYYY-MM";
        } else if (selectParam == "year") {
            showtimeForElectSum = tool.initDate("Y", new Date());
            $("#date").val(showtimeForElectSum);
            roll.config.format = "YYYY";
        }
        roll.value = showtimeForElectSum;
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
        getURLData();
    });

    $("#electric").click(function () {
        $(".category").show();
    });

    function getURLData() {

        var fCircuitid = currentSelectVode.merterId;
        var url = baseUrlFromAPP + "/powerAnalysis/getMoM";
        var params = {
            fSubid: subidFromAPP,
            fCircuitid: fCircuitid
            // time: time,
            // DA: typeDA
            // fPhase: selectParam,
            // EnergyKind: EnergyKind,
        };
        getData(url, params, function (data) {

            showCharts(data.monthValueListUpToNow);
        });
    }

    function getData(url, params, successCallback) {
        toast.show({
            text: Operation['ui_loading'],
            loading: true
        });
        var token = tokenFromAPP;
        $.ajax({
            type: "GET",
            url: url,
            data: params,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", token);
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
        });
    }

    function setListData(data) {
        $("#treeview").treeview({
            data: data,
            showIcon: true,
            showBorder: true,
            expandIcon: "glyphicon glyphicon-plus",
            collapseIcon: "glyphicon glyphicon-minus"
        });
        $("#treeview").treeview("selectNode", 0);
        currentSelectVode.merterId = $("#treeview").treeview("getSelected")[0].id;
        currentSelectVode.merterName = $("#treeview").treeview(
            "getSelected"
        )[0].text;
        $("#meter").html(currentSelectVode.merterName);
        $("#treeview").on("nodeSelected", function (event, node) {
            currentSelectVode.merterId = node.id;
            currentSelectVode.merterName = node.text;
        });
    }

    function showCharts(data) {
        // var nowtime = [];
        var nowvalue = [];
        // var pertime = [];
        var pervalue = [];
        var name = [];
        var tableData = [];
        var showName;
        var timearr = [
            "1月",
            "2月",
            "3月",
            "4月",
            "5月",
            "6月",
            "7月",
            "8月",
            "9月",
            "10月",
            "11月",
            "12月"
        ];
        if (data.length > 0) {
            $.each(timearr, function () {
                nowvalue.push("-");
                pervalue.push("-");
            });
            var thisYear = 0;
            var lastYear = 0;
            var datatime;
            var circuitname = data[0].fCircuitname;
            name.push(circuitname);
            var selectParam = $(".btn.select").attr("value");
            var tableData;


            $.each(data, function (index, el) {

                // nowtime.push(el.fDate);
                // var predate = new Date(el.fDate); //根据字符串获得日期
                // var prestr = predate.getFullYear() - 1;
                // pertime.push(prestr);
                var thisMonth = el.fDate.split("-")[1];
                if (el.fDayvalue != undefined) {
                    nowvalue[thisMonth - 1] = el.fDayvalue;
                }
                if (el.pervalue != undefined) {
                    pervalue[thisMonth - 1] = el.pervalue;
                }
                var monthlyComparison = "-";
                var monthlySumComparison = "-";
                if (el.fDayvalue != undefined && el.pervalue != undefined) {
                    /*                    nowvalue.push(el.fDayvalue);
                                        pervalue.push(el.pervalue);*/
                    monthlyComparison = ((el.fDayvalue - el.pervalue) / el.pervalue * 100).toFixed(2) + "%";
                    thisYear += el.fDayvalue;
                    lastYear += el.pervalue;
                    monthlySumComparison = ((thisYear - lastYear) / lastYear * 100).toFixed(2) + "%";
                }
                var dic = {
                    dayvalue: el.fDayvalue,
                    pervalue: el.pervalue,
                    time: timearr[thisMonth - 1],
                    monthlycomparison: monthlyComparison,
                    monthlysumcomparison: monthlySumComparison
                };
                tableData.push(dic);
            });
            showTable(tableData);
        }

        var line = echarts.init(document.getElementById("chartContain"));

        var option = {
            color: ['#8aedd5', '#93bc9e', '#cef1db', '#7fe579', '#a6d7c2',
                '#bef0bb', '#99e2vb', '#94f8a8', '#7de5b8', '#4dfb70'
            ],

            // title: {
            //     textStyle: {
            //         fontWeight: 'normal',
            //         color: '#008acd'
            //     }
            // },
            // dataRange: {
            //     itemWidth: 15,
            //     color: ['#5ab1ef', '#e0ffff']
            // },

            tooltip: {
                backgroundColor: 'rgba(50,50,50,0.5)',
                axisPointer: { // 鍧愭爣杞存寚绀哄櫒锛屽潗鏍囪酱瑙﹀彂鏈夋晥
                    type: 'line', // 榛樿涓虹洿绾匡紝鍙�変负锛�'line' | 'shadow'
                    lineStyle: { // 鐩寸嚎鎸囩ず鍣ㄦ牱寮忚缃�
                        color: '#008acd'
                    },
                    crossStyle: {
                        color: '#008acd'
                    },
                    shadowStyle: { // 闃村奖鎸囩ず鍣ㄦ牱寮忚缃�
                        color: 'rgba(200,200,200,0.2)'
                    }
                },
                trigger: "axis"
            },
            legend: {
                data: [Operation['ui_theperiod'], Operation['ui_sameperiod']]
            },
            grid: {
                // 控制图的大小，调整下面这些值就可以，
                top: "18%",
                left: "15%",
                right: "3%",
                bottom: "29%",
                borderColor: '#eee'
            },
            xAxis: {
                type: "category",
                data: timearr
            },
            yAxis: {
                type: "value",
                scale: true //y轴自适应
            },
            toolbox: {
                color: ['#1e90ff', '#1e90ff', '#1e90ff', '#1e90ff'],
                effectiveColor: '#ff4500',
                top: -6,
                left: "right",
                feature: {
                    dataZoom: {
                        yAxisIndex: "none"
                    },
                    dataView: {
                        readOnly: true
                    },
                    restore: {}
                }
            },
            dataZoom: [{
                    startValue: timearr[0]
                },
                {
                    type: "inside"
                }
            ],
            calculable: true,
            series: [{
                    name: Operation['ui_theperiod'],
                    data: nowvalue,
                    type: "bar"
                },
                {
                    name: Operation['ui_sameperiod'],
                    data: pervalue,
                    type: "bar"
                }
            ]
        };
        line.setOption(option);
        // $(window).bind("resize",function(event) {
        //   line.resize();
        // });
    }

    function showTable(data) {
        // var dic = {
        //     dayvalue: el.fDayvalue,
        //     pervalue: el.pervalue,
        //     time: timearr,
        //     monthlycomparison: monthlyComparison,
        //     monthlysumcomparison: monthlySumComparison
        // };
        var columns = [{
                field: "time",
                title: Operation['ui_month'],
                align: "center"
            },
            {
                field: "dayvalue",
                title: Operation['ui_theperiod'],
                align: "center"
            },
            {
                field: "pervalue",
                title: Operation['ui_sameperiod'],
                align: "center"
            },
            {
                field: "monthlycomparison",
                title: Operation['ui_samepercent']+"(%)",
                align: "center"
            },
            {
                field: "monthlysumcomparison",
                title: Operation['ui_totalsamepercent']+"(%)",
                align: "center"
            }
        ];
        $("#tableContain").html("");
        $("#tableContain").html("<table id='table'></table>");
        $("#table").bootstrapTable({
            columns: columns,
            data: data
        });
    }

    var roll = new Rolldate({
        el: "#date",
        format: showtimeForElectSum.format,
        beginYear: 2000,
        endYear: 2100,
        value: showtimeForElectSum
    });
});