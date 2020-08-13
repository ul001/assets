$(function () {
    var baseUrlFromAPP = "http://116.236.149.165:8090/SubstationWEBV2/v5";
    var tokenFromAPP = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1OTM5MTYxMTUsInVzZXJuYW1lIjoiaGFoYWhhIn0.lLzdJwieIO-xMhob6PW06MRyzK4oCZVCfcs9196Iec8";
    var subidFromAPP = 10100001;
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

    var currentSelectVode = {}; //选中节点

    let toast = new ToastClass();
    initFirstNode(); //初始化第一个回路
    var isClick = 0;

    function initFirstNode() {
        var url = baseUrlFromAPP + "/getfCircuitidsList";
        var params = {
            fSubid: subidFromAPP,
        }
        // $("body").showLoading();
        getData(url, params, function (data) {
            setListData(data);
            searchGetData();
            // $("#search").click();
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

    //配置时间
    var showtimeForElectSum = tool.initDate("YM", new Date());

    $(document).on('click', '.elec-btn .btn', function () {
        var obj = $(this);
        $(this).addClass('select').siblings("button").removeClass('select');
        var selectParam = $(this).attr('value');
        if (selectParam == "today") {
            initDateInput("date");
            showtimeForElectSum = tool.initDate("YMD", new Date());
            $("#date").val(showtimeForElectSum);
        } else if (selectParam == "month") {
            initDateInput("ym");
            showtimeForElectSum = tool.initDate("YM", new Date());
            $("#date").val(showtimeForElectSum);
        } else if (selectParam == "year") {
            initDateInput("y");
            showtimeForElectSum = tool.initDate("Y", new Date());
            $("#date").val(showtimeForElectSum);
        }
        initQuick(selectParam);
        searchGetData();
        // $("#search").click();
    });
    //配置时间
    var selectReport = $(".elec-btn .select").attr('value');
    initQuick(selectReport);

    function initQuick(type) {
        $("#datePre").unbind("click");
        $("#dateNext").unbind("click");
        if (type == "today") {
            $("#datePre").click(function () {
                var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
                var preDate = new Date(selectDate.getTime() - 24 * 60 * 60 * 1000);
                $("#date").val(preDate.getFullYear() + "-" + ((preDate.getMonth()) < 9 ? ("0" + (preDate.getMonth() + 1)) : (preDate.getMonth() + 1)) + "-" + (preDate.getDate() < 10 ? ("0" + preDate.getDate()) : (preDate.getDate())));
                searchGetData();
            });
            $("#dateNext").click(function () {
                var d = new Date();
                var nowDate = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate());
                var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
                if (selectDate < nowDate) {
                    var nextDate = new Date(selectDate.getTime() + 24 * 60 * 60 * 1000);
                    $("#date").val(nextDate.getFullYear() + "-" + ((nextDate.getMonth()) < 9 ? ("0" + (nextDate.getMonth() + 1)) : (nextDate.getMonth() + 1)) + "-" + (nextDate.getDate() < 10 ? ("0" + nextDate.getDate()) : (nextDate.getDate())));
                    searchGetData();
                } else {
                    return;
                }
            });
        } else if (type == "month") {
            $("#datePre").click(function () {
                var selectDate = new Date(($("#date").val() + "-01").replace(/\-/g, "\/"));
                var preDate = new Date(selectDate.setMonth(selectDate.getMonth() - 1));
                $("#date").val(preDate.getFullYear() + "-" + ((preDate.getMonth()) < 9 ? ("0" + (preDate.getMonth() + 1)) : (preDate.getMonth() + 1)));
                searchGetData();
            });
            $("#dateNext").click(function () {
                var d = new Date();
                var nowDate = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + '01');
                var selectDate = new Date(($("#date").val() + "-01").replace(/\-/g, "\/"));
                if (selectDate < nowDate) {
                    var nextDate = new Date(selectDate.setMonth(selectDate.getMonth() + 1));
                    $("#date").val(nextDate.getFullYear() + "-" + ((nextDate.getMonth()) < 9 ? ("0" + (nextDate.getMonth() + 1)) : (nextDate.getMonth() + 1)));
                    searchGetData();
                } else {
                    return;
                }
            });
        } else if (type == "year") {
            $("#datePre").click(function () {
                var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
                var preDate = new Date(selectDate.setFullYear(selectDate.getFullYear() - 1));
                $("#date").val(preDate.getFullYear());
                searchGetData();
            });
            $("#dateNext").click(function () {
                var d = new Date();
                var nowDate = new Date((d.getFullYear() + "-01-01").replace(/\-/g, "\/"));
                var selectDate = new Date(($("#date").val() + "-01" + "-01").replace(/\-/g, "\/"));
                if (selectDate < nowDate) {
                    var nextDate = new Date(selectDate.setFullYear(selectDate.getFullYear() + 1));
                    $("#date").val(nextDate.getFullYear());
                    searchGetData();
                } else {
                    return;
                }
            });
        }
    }

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
        searchGetData();
    });

    $("#electric").click(function () {
        $(".category").show();
    });


    // $(document).on('click', '#search', function () {
    //     var EnergyKind = $("#EnergyKind").attr('value');
    //     var selectParam = $(".btn.select").attr('value');
    //     if (EnergyKind == "fFr") {
    //         selectParam = ""
    //     }
    //     var time;
    //     var typeDA;
    //     if (selectParam == "today") {
    //         time = $("#date").val();
    //         typeDA = "D";
    //     } else if (selectParam == "month") {
    //         time = $("#date").val().substring(0, 7);
    //         typeDA = "M";
    //     } else if (selectParam == "year") {
    //         time = $("#date").val().substring(0, 4);
    //         typeDA = "Y";
    //     }
    //     var fCircuitid = currentSelectVode.merterId;

    //     var url = baseUrlFromAPP + "/powerAnalysis/EnergyReport";
    //     var params = {
    //         fSubid: subidFromAPP,
    //         fCircuitids: fCircuitid,
    //         time: time,
    //         DA: typeDA
    //         // fPhase: selectParam,
    //         // EnergyKind: EnergyKind,
    //     }
    //     getData(url, params, function (data) {
    //         showCharts(data.EnergyReport);
    //     });
    // })
    function searchGetData() {
        // $("body").showLoading();
        var EnergyKind = $("#EnergyKind").attr('value');
        var selectParam = $(".btn.select").attr('value');
        if (EnergyKind == "fFr") {
            selectParam = ""
        }
        var time;
        var typeDA;
        var startTime;
        var endTime;
        if (selectParam == "today") {
            time = $("#date").val();
            typeDA = "D";
        } else if (selectParam == "month") {
            time = $("#date").val().substring(0, 7);
            typeDA = "M";
            var selectDate = new Date(($("#date").val() + "-01").replace(/\-/g, "\/"));
            var nextMonth = new Date(selectDate.setMonth(selectDate.getMonth() + 1));
            var lastDate = new Date(nextMonth - (1000 * 60 * 60 * 24));
            startTime = time + "-01";
            endTime = time + "-" + (lastDate.getDate() < 10 ? ("0" + lastDate.getDate()) : (lastDate.getDate()));
            // startTime = 
        } else if (selectParam == "year") {
            time = $("#date").val().substring(0, 4);
            typeDA = "Y";
            startTime = time + "-01-01";
            endTime = time + "-12-31";
        }
        var fCircuitid = currentSelectVode.merterId;
        //临时web接口
        var baseWebUrl = "";
        if (baseUrlFromAPP.search("v5") != -1) {
            baseWebUrl = baseUrlFromAPP.replace("v5", "main");
        } else if (baseUrlFromAPP.search("v4") != -1) {
            baseWebUrl = baseUrlFromAPP.replace("v4", "main");
        }
        var url = baseWebUrl + "/AveragePowerReport";
        var params = {
            fSubid: subidFromAPP,
            fCircuitid: fCircuitid,
            timeStart: startTime,
            timeEnd: endTime,
            DA: typeDA
        }
        getData(url, params, function (data) {
            // $("body").hideLoading();
            showCharts(data);
        });
    };

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
            error: function (data) {
                toast.show({
                    text: Operation['code_fail'],
                    duration: 2000
                });
            }
        })
    }

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

    function showCharts(data) {

        var time = [];
        var value = [];
        var epi = [];
        var eql = [];
        var pf = [];
        var epe = [];
        var eqc = [];
        var name = [];
        var tableData = [];
        if (data.list.length > 0) {

            var tableData;
            $.each(data.list, function (index, el) {
                if (el.f_Date == "undefined" || el.f_Date == null || el.f_Date == "") {
                    return true;
                }

                var dic = {
                    "eqc": el.eqc,
                    "epe": el.epe,
                    "pf": el.pf,
                    "eql": el.eql,
                    "epi": el.epi,
                    "time": el.f_Date
                };
                tableData.push(dic);
            });
            var total = data.total;
            tableData.push({
                "eqc": total.eqc,
                "epe": total.epe,
                "pf": total.pf,
                "eql": total.eql,
                "epi": total.epi,
                "time": Operation['ui_summary']
            });
        }
        showTable(tableData);
        // var line = echarts.init(document.getElementById('chartContain'));
        // var option = {
        //     tooltip: {
        //         trigger: 'axis'
        //     },
        //     /*            legend: {
        //                     data: name,
        //                 },*/
        //     grid: { // 控制图的大小，调整下面这些值就可以，
        //         top: '18%',
        //         left: '15%',
        //         right: '6%',
        //         bottom: '28%',
        //     },
        //     xAxis: {
        //         type: 'category',
        //         data: time,
        //     },
        //     yAxis: {
        //         name: 'kW·h',
        //         type: 'value',
        //         scale: true, //y轴自适应
        //     },
        //     toolbox: {
        //         left: 'right',
        //         feature: {
        //             dataZoom: {
        //                 yAxisIndex: 'none'
        //             },
        //             dataView: {
        //                 readOnly: true
        //             },
        //             restore: {}
        //         }
        //     },
        //     dataZoom: [{
        //         startValue: time[0]
        //     }, {
        //         type: 'inside'
        //     }],
        //     calculable: true,
        //     series: [{
        //         name: name,
        //         data: value,
        //         type: 'bar',
        //         itemStyle: {
        //             normal: {
        //                 color: '#64BC78',
        //             }
        //         }
        //     }]
        // };
        // line.setOption(option, true);
        // $(window).bind("resize",function(event) {
        //   line.resize();
        // });
    }

    function showTable(data) {
        // var selectParam = $(".btn.select").attr('value');
        // var showName = "";
        // if (selectParam == "today") {
        //     showName = Operation['ui_dayreport'];
        // } else if (selectParam == "month") {
        //     showName = Operation['ui_monthreport'];
        // } else if (selectParam == "year") {
        //     showName = Operation['ui_yearreport'];
        // }
        var columns = [{
                field: "time",
                title: Operation['ui_date'],
                align: "center"
            },
            {
                field: "epi",
                title: Operation['ui_eqi'],
                align: "center"
            }, {
                field: "epe",
                title: Operation['ui_epe'],
                align: "center"
            }, {
                field: "eql",
                title: Operation['ui_eql'],
                align: "center"
            }, {
                field: "eqc",
                title: Operation['ui_eqc'],
                align: "center"
            }, {
                field: "pf",
                title: Operation['ui_avgpf'],
                align: "center"
            }
        ]
        $("#tableContain").html("");
        $("#tableContain").html("<table id='table'></table>");
        $("#table").bootstrapTable({
            columns: columns,
            data: data,
        });
    }

    //初始化时间控件
    var calendar1 = new LCalendar();
    calendar1.init({
        'trigger': '#date', //标签id
        'type': 'date', //date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
        'minDate': '2000-1-1', //最小日期 注意：该值会覆盖标签内定义的日期范围
        'maxDate': '2050-1-1' //最大日期 注意：该值会覆盖标签内定义的日期范围
    });
    $("#date").val(showtimeForElectSum);
    $("#date").on("input", function () {
        searchGetData();
    });

    function initDateInput(type) {
        $("#date").remove();
        $("#datePre").after(`<input readonly type="text" id="date">`);
        calendar1 = new LCalendar();
        calendar1.init({
            'trigger': '#date', //标签id
            'type': type, //date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
            'minDate': '2000-1-1', //最小日期 注意：该值会覆盖标签内定义的日期范围
            'maxDate': '2050-1-1' //最大日期 注意：该值会覆盖标签内定义的日期范围
        });
        $("#date").on("input", function () {
            searchGetData();
        });
    }

});