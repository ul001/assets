$(function () {
    var baseUrlFromAPP = "http://116.236.149.165:8090/SubstationWEBV2/v5";
    var tokenFromAPP = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1OTM5MTYxMTUsInVzZXJuYW1lIjoiaGFoYWhhIn0.lLzdJwieIO-xMhob6PW06MRyzK4oCZVCfcs9196Iec8";
    var subidFromAPP = 10100001;
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
    let toast = new ToastClass();
    initFirstNode(); //初始化第一个回路
    var isClick = 0;

    function initFirstNode() {
        var url = baseUrlFromAPP + "/getfCircuitidsList";
        var params = {
            fSubid: subidFromAPP
        };
        getData(url, params, function (data) {
            setListData(data);
            $("#search").click();
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
    });

    $(document).on("click", "#search", function () {
        var EnergyKind = $("#energySelect").val();

        var fCircuitid = currentSelectVode.merterId;
        var time = $("#date").val();

        //临时web接口
        var baseWebUrl = "";
        if (baseUrlFromAPP.search("v5") != -1) {
            baseWebUrl = baseUrlFromAPP.replace("v5", "main");
        } else if (baseUrlFromAPP.search("v4") != -1) {
            baseWebUrl = baseUrlFromAPP.replace("v4", "main");
        }
        var url = baseWebUrl + "/powerMonitoring/ElectricReportNew";

        var params = {
            fSubid: subidFromAPP,
            fCircuitid: fCircuitid,
            time: time,
        };
        // if (EnergyKind == "Voltage2") {
        //     params.selectParam = "Voltage";
        // }

        getData(url, params, function (data) {
            showCharts(data);
        });
    });

    function showCharts(data) {

        var tableData = [];
        var totalEpi = 0;
        if (data.circuitUIPQPfEpis.length > 0) {
            var tableData;
            $.each(data.circuitUIPQPfEpis, function (index, el) {
                if (el.fCircuitname == "undefined" || el.fCircuitname == null || el.fCircuitname == "") {
                    return true;
                }
                if (el.fCollecttime == "undefined" || el.fCollecttime == null || el.fCollecttime == "") {
                    return true;
                }
                var epi = parseInt(el.fEpi);
                if (epi > 0) {
                    totalEpi += epi;
                }
                var collecttime = el.fCollecttime ? el.fCollecttime.substring(11, 16) : "-";
                var EPI = el.fEpi ? el.fEpi : "-";

                var dic = {
                    "fCircuitname": el.fCircuitname,
                    "fCollecttime": collecttime,
                    "fUa": el.fUa,
                    "fUb": el.fUb,
                    "fUc": el.fUc,
                    "fUab": el.fUab,
                    "fUbc": el.fUbc,
                    "fUca": el.fUca,
                    "fIa": el.fIa,
                    "fIb": el.fIb,
                    "fIc": el.fIc,
                    "fP": el.fP,
                    "fQ": el.fQ,
                    "fPf": el.fPf,
                    "fEpi": el.fEpi
                };

                tableData.push(dic);
            });
            // var total = data.total;
            // tableData.push({
            //     "eqc": total.eqc,
            //     "epe": total.epe,
            //     "pf": total.pf,
            //     "eql": total.eql,
            //     "epi": total.epi,
            //     "time": Operation['ui_summary']
            // });
        }
        var dic = {
            "fCircuitname": '总用电',
            "fCollecttime": '总用电',
            "fUa": '-',
            "fUb": '-',
            "fUc": '-',
            "fUab": '-',
            "fUbc": '-',
            "fUca": '-',
            "fIa": '-',
            "fIb": '-',
            "fIc": '-',
            "fP": '-',
            "fQ": '-',
            "fPf": '-',
            "fEpi": totalEpi ? totalEpi : '-'
        };
        tableData.push(dic);
        showTable(tableData);
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

    function showTable(data) {
        var columns = [];
        var energySelect = $("#energySelect").val();
        if (energySelect == 'Voltage') {
            columns = [{
                    field: "fCollecttime",
                    title: Operation['ui_time'],
                    align: "center"
                }, {
                    field: "fEpi",
                    title: '有功电能(kWh)',
                    align: "center"
                },
                {
                    field: "fUa",
                    title: 'A相电压(V)',
                    align: "center"
                }, {
                    field: "fUb",
                    title: 'B相电压(V)',
                    align: "center"
                }, {
                    field: "fUc",
                    title: 'C相电压(V)',
                    align: "center"
                }, {
                    field: "fIa",
                    title: 'A相电流(A)',
                    align: "center"
                }, {
                    field: "fIb",
                    title: 'B相电流(A)',
                    align: "center"
                }, {
                    field: "fIc",
                    title: 'C相电流(A)',
                    align: "center"
                }, {
                    field: "fP",
                    title: '总有功功率(kW)',
                    align: "center"
                }, {
                    field: "fQ",
                    title: '总无功功率(kVar)',
                    align: "center"
                }, {
                    field: "fPf",
                    title: '总功率因数',
                    align: "center"
                }
            ];
        } else if (energySelect == 'Voltage2') {
            columns = [{
                field: "fCollecttime",
                title: Operation['ui_time'],
                align: "center"
            }, {
                field: "fEpi",
                title: '有功电能(kWh)',
                align: "center"
            }, {
                field: "fUab",
                title: 'AB线电压(V)',
                align: "center"
            }, {
                field: "fUbc",
                title: 'BC线电压(V)',
                align: "center"
            }, {
                field: "fUca",
                title: 'CA线电压(V)',
                align: "center"
            }, {
                field: "fIa",
                title: 'A相电流(A)',
                align: "center"
            }, {
                field: "fIb",
                title: 'B相电流(A)',
                align: "center"
            }, {
                field: "fIc",
                title: 'C相电流(A)',
                align: "center"
            }, {
                field: "fP",
                title: '总有功功率(kW)',
                align: "center"
            }, {
                field: "fQ",
                title: '总无功功率(kVar)',
                align: "center"
            }, {
                field: "fPf",
                title: '总功率因数',
                align: "center"
            }];
        } else {
            columns = [{
                    field: "fCollecttime",
                    title: Operation['ui_time'],
                    align: "center"
                }, {
                    field: "fEpi",
                    title: '有功电能(kWh)',
                    align: "center"
                },
                {
                    field: "fUa",
                    title: 'A相电压(V)',
                    align: "center"
                }, {
                    field: "fUb",
                    title: 'B相电压(V)',
                    align: "center"
                }, {
                    field: "fUc",
                    title: 'C相电压(V)',
                    align: "center"
                }, {
                    field: "fUab",
                    title: 'AB线电压(V)',
                    align: "center"
                }, {
                    field: "fUbc",
                    title: 'BC线电压(V)',
                    align: "center"
                }, {
                    field: "fUca",
                    title: 'CA线电压(V)',
                    align: "center"
                }, {
                    field: "fIa",
                    title: 'A相电流(A)',
                    align: "center"
                }, {
                    field: "fIb",
                    title: 'B相电流(A)',
                    align: "center"
                }, {
                    field: "fIc",
                    title: 'C相电流(A)',
                    align: "center"
                }, {
                    field: "fP",
                    title: '总有功功率(kW)',
                    align: "center"
                }, {
                    field: "fQ",
                    title: '总无功功率(kVar)',
                    align: "center"
                }, {
                    field: "fPf",
                    title: '总功率因数',
                    align: "center"
                }
            ];

        }
        $("#tableContain").html("");
        $("#tableContain").html("<table id='table'></table>");
        $("#table").bootstrapTable({
            columns: columns,
            data: data
        });
    }



    var showtimeForElectSum = tool.initDate("YMD", new Date());

    $("#date").val(showtimeForElectSum);
    //初始化时间控件
    var calendar1 = new LCalendar();
    calendar1.init({
        'trigger': '#date', //标签id
        'type': 'date', //date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
        'minDate': '2000-1-1', //最小日期 注意：该值会覆盖标签内定义的日期范围
        'maxDate': '2050-1-1' //最大日期 注意：该值会覆盖标签内定义的日期范围
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
    }


    initQuick("day");

    function initQuick(type) {
        $("#datePre").unbind("click");
        $("#dateNext").unbind("click");
        if (type == "day") {
            $("#datePre").click(function () {
                var selectDate = new Date(
                    $("#date")
                    .val()
                    .replace(/\-/g, "/")
                );
                var preDate = new Date(selectDate.getTime() - 24 * 60 * 60 * 1000);
                $("#date").val(
                    preDate.getFullYear() +
                    "-" +
                    (preDate.getMonth() < 9 ?
                        "0" + (preDate.getMonth() + 1) :
                        preDate.getMonth() + 1) +
                    "-" +
                    (preDate.getDate() < 10 ?
                        "0" + preDate.getDate() :
                        preDate.getDate())
                );
            });
            $("#dateNext").click(function () {
                var d = new Date();
                var nowDate = new Date(
                    d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate()
                );
                var selectDate = new Date(
                    $("#date")
                    .val()
                    .replace(/\-/g, "/")
                );
                if (selectDate < nowDate) {
                    var nextDate = new Date(selectDate.getTime() + 24 * 60 * 60 * 1000);
                    $("#date").val(
                        nextDate.getFullYear() +
                        "-" +
                        (nextDate.getMonth() < 9 ?
                            "0" + (nextDate.getMonth() + 1) :
                            nextDate.getMonth() + 1) +
                        "-" +
                        (nextDate.getDate() < 10 ?
                            "0" + nextDate.getDate() :
                            nextDate.getDate())
                    );
                } else {
                    return;
                }
            });
        } else if (type == "month") {
            $("#datePre").click(function () {
                var selectDate = new Date(
                    ($("#date").val() + "-01").replace(/\-/g, "/")
                );
                var preDate = new Date(selectDate.setMonth(selectDate.getMonth() - 1));
                $("#date").val(
                    preDate.getFullYear() +
                    "-" +
                    (preDate.getMonth() < 9 ?
                        "0" + (preDate.getMonth() + 1) :
                        preDate.getMonth() + 1)
                );
            });
            $("#dateNext").click(function () {
                var d = new Date();
                var nowDate = new Date(
                    d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + "01"
                );
                var selectDate = new Date(
                    ($("#date").val() + "-01").replace(/\-/g, "/")
                );
                if (selectDate < nowDate) {
                    var nextDate = new Date(
                        selectDate.setMonth(selectDate.getMonth() + 1)
                    );
                    $("#date").val(
                        nextDate.getFullYear() +
                        "-" +
                        (nextDate.getMonth() < 9 ?
                            "0" + (nextDate.getMonth() + 1) :
                            nextDate.getMonth() + 1)
                    );
                } else {
                    return;
                }
            });
        }
    }
});