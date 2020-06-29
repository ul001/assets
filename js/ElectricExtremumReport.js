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
        var selectVal = $(".elec-btn .select").attr("value");
        var url = baseUrlFromAPP + "/elecMaxMinAvgValue";
        if (selectVal == "month") {
            time = time + "-01";
        }
        var params = {
            fSubid: subidFromAPP,
            fCircuitids: fCircuitid,
            time: time,
            selectType: selectVal,
            selectParam: EnergyKind
        };
        if (EnergyKind == "Voltage2") {
            params.selectParam = "Voltage";
        }

        getData(url, params, function (data) {
            switch (EnergyKind) {
                case "P":
                    generateType(EnergyKind, data.P);
                    break;
                case "I":
                    generateType(EnergyKind, data.I);
                    break;
                case "Voltage":
                    generateType(EnergyKind, data.Voltage);
                    break;
                case "Voltage2":
                    params.selectParam = "Voltage";
                    generateType(EnergyKind, data.Voltage);
                    break;
                case "UnBalance":
                    generateType(EnergyKind, data.UnBalance);
                    break;
                case "UHR":
                    generateType(EnergyKind, data.UHR);
                    break;
                case "IHR":
                    generateType(EnergyKind, data.IHR);
                    break;
            }
        });
    });

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

    function setTableData(arr, list) {
        var listVal = list[0];
        var tableData = [];
        var selectVal = $(".elec-btn .select").attr("value");
        var changeUnit = -1;
        if (list[0].fUaminvalue != undefined) {
            changeUnit = 0;
            if (list[0].fUaminvalue >= 1000) {
                changeUnit = 1;
            }
        }
        $.each(list, function (key, obj) {
            $.each(arr, function (key1, obj1) {
                if (selectVal == "day") {
                    if (changeUnit == 1) {
                        tableData.push({
                            paramName: obj1.name + "(kV)",
                            avg: (obj[obj1.id + "avg"] / 1000).toFixed(2),
                            max: (obj[obj1.id + "maxvalue"] / 1000).toFixed(2),
                            maxTime: obj[obj1.id + "maxtime"].substring(11, 16),
                            min: (obj[obj1.id + "minvalue"] / 1000).toFixed(2),
                            minTime: obj[obj1.id + "mintime"].substring(11, 16)
                        });
                    } else if (changeUnit == 0) {
                        tableData.push({
                            paramName: obj1.name + "(V)",
                            avg: obj[obj1.id + "avg"],
                            max: obj[obj1.id + "maxvalue"],
                            maxTime: obj[obj1.id + "maxtime"].substring(11, 16),
                            min: obj[obj1.id + "minvalue"],
                            minTime: obj[obj1.id + "mintime"].substring(11, 16)
                        });
                    } else {
                        tableData.push({
                            paramName: obj1.name,
                            avg: obj[obj1.id + "avg"],
                            max: obj[obj1.id + "maxvalue"],
                            maxTime: obj[obj1.id + "maxtime"].substring(11, 16),
                            min: obj[obj1.id + "minvalue"],
                            minTime: obj[obj1.id + "mintime"].substring(11, 16)
                        });
                    }
                } else if (selectVal == "month") {
                    if (changeUnit == 1) {
                        tableData.push({
                            paramName: obj1.name + "(kV)",
                            avg: (obj[obj1.id + "avg"] / 1000).toFixed(2),
                            max: (obj[obj1.id + "maxvalue"] / 1000).toFixed(2),
                            maxTime: obj[obj1.id + "maxtimeS"].substring(8, 10) +
                                "日" +
                                obj[obj1.id + "maxtimeS"].substring(10, 16),
                            min: (obj[obj1.id + "minvalue"] / 1000).toFixed(2),
                            minTime: obj[obj1.id + "mintimeS"].substring(8, 10) +
                                "日" +
                                obj[obj1.id + "mintimeS"].substring(10, 16)
                        });
                    } else if (changeUnit == 0) {
                        tableData.push({
                            paramName: obj1.name + "(V)",
                            avg: obj[obj1.id + "avg"],
                            max: obj[obj1.id + "maxvalue"],
                            maxTime: obj[obj1.id + "maxtimeS"].substring(8, 10) +
                                "日" +
                                obj[obj1.id + "maxtimeS"].substring(10, 16),
                            min: obj[obj1.id + "minvalue"],
                            minTime: obj[obj1.id + "mintimeS"].substring(8, 10) +
                                "日" +
                                obj[obj1.id + "mintimeS"].substring(10, 16)
                        });
                    } else {
                        tableData.push({
                            paramName: obj1.name,
                            avg: obj[obj1.id + "avg"],
                            max: obj[obj1.id + "maxvalue"],
                            maxTime: obj[obj1.id + "maxtimeS"].substring(8, 10) +
                                "日" +
                                obj[obj1.id + "maxtimeS"].substring(10, 16),
                            min: obj[obj1.id + "minvalue"],
                            minTime: obj[obj1.id + "mintimeS"].substring(8, 10) +
                                "日" +
                                obj[obj1.id + "mintimeS"].substring(10, 16)
                        });
                    }
                }
            });
        });
        showTable(tableData);
    }

    function generateType(type, list) {
        var paramList = [{
                id: "P",
                name: Operation['ui_power'],
                phase: [{
                        id: "fP",
                        name: Operation['ui_activepower']+"(kW)"
                    },
                    {
                        id: "fQ",
                        name: Operation['ui_reactivepower']+"(kVar)"
                    },
                    {
                        id: "fS",
                        name: Operation['ui_apparentpower']+"(kVA)"
                    },
                    {
                        id: "fPf",
                        name: Operation['ui_pf']
                    }
                ]
            },
            {
                id: "I",
                name: Operation['ui_i'],
                phase: [{
                        id: "fIa",
                        name: Operation['ui_a']+Operation['ui_i']+"(A)"
                    },
                    {
                        id: "fIb",
                        name: Operation['ui_b']+Operation['ui_i']+"(A)"
                    },
                    {
                        id: "fIc",
                        name: Operation['ui_c']+Operation['ui_i']+"(A)"
                    }
                ]
            },
            {
                id: "Voltage",
                name: Operation['ui_u'],
                phase: [{
                        id: "fUa",
                        name: "A"+Operation['ui_u']
                    },
                    {
                        id: "fUb",
                        name: "B"+Operation['ui_u']
                    },
                    {
                        id: "fUc",
                        name: "C"+Operation['ui_u']
                    }
                ]
            },
            {
                id: "Voltage2",
                name: Operation['ui_ul'],
                phase: [{
                        id: "fUab",
                        name: "AB"+Operation['ui_ul']
                    },
                    {
                        id: "fUbc",
                        name: "BC"+Operation['ui_ul']
                    },
                    {
                        id: "fUca",
                        name: "CA"+Operation['ui_ul']
                    }
                ]
            },
            {
                id: "UnBalance",
                name: Operation['ui_unbalance'],
                phase: [{
                        id: "fVub",
                        name: Operation['ui_uub']+"(%)"
                    },
                    {
                        id: "fCub",
                        name: Operation['ui_cub']+"(%)"
                    }
                ]
            },
            {
                id: "UHR",
                name: Operation['ui_uharm'],
                phase: [{
                        id: "fUahr",
                        name: Operation['ui_uahr']+"(%)"
                    },
                    {
                        id: "fUbhr",
                        name: Operation['ui_ubhr']+"(%)"
                    },
                    {
                        id: "fUchr",
                        name: Operation['ui_uchr']+"(%)"
                    }
                ]
            },
            {
                id: "IHR",
                name: Operation['ui_Iharm'],
                phase: [{
                        id: "fIahr",
                        name: Operation['ui_iahr']+"(%)"
                    },
                    {
                        id: "fIbhr",
                        name: Operation['ui_ibhr']+"(%)"
                    },
                    {
                        id: "fIchr",
                        name: Operation['ui_ichr']+"(%)"
                    }
                ]
            }
        ];
        var arr = $.grep(paramList, function (obj) {
            return obj.id == type;
        });
        setTableData(arr[0].phase, list);
    }

    function showTable(data) {
        var columns = [
            [{
                    field: "paramName",
                    title: Operation['ui_paramname'],
                    align: "center",
                    valign: "middle",
                    align: "center",
                    colspan: 1,
                    rowspan: 2
                },
                {
                    field: "maxVT",
                    title: Operation['ui_maxval'],
                    valign: "middle",
                    align: "center",
                    colspan: 2,
                    rowspan: 1
                },
                {
                    field: "minVT",
                    title: Operation['ui_minval'],
                    valign: "middle",
                    align: "center",
                    colspan: 2,
                    rowspan: 1
                },
                {
                    field: "avg",
                    title: Operation['ui_avgval'],
                    valign: "middle",
                    align: "center",
                    colspan: 1,
                    rowspan: 2
                }
            ],
            [{
                    field: "max",
                    title: Operation['ui_val'],
                    valign: "middle",
                    align: "center"
                },
                {
                    field: "maxTime",
                    title: Operation['ui_time'],
                    valign: "middle",
                    align: "center"
                },
                {
                    field: "min",
                    title: Operation['ui_val'],
                    valign: "middle",
                    align: "center"
                },
                {
                    field: "minTime",
                    title: Operation['ui_time'],
                    align: "center"
                }
            ]
        ];
        $("#tableContain").html("");
        $("#tableContain").html("<table id='table'></table>");
        $("#table").bootstrapTable({
            columns: columns,
            data: data
        });
    }

    var showtimeForElectSum = tool.initDate("YMD", new Date());
    $(document).on("click", ".elec-btn .btn", function () {
        var obj = $(this);
        $(this)
            .addClass("select")
            .siblings("button")
            .removeClass("select");
        var selectParam = $(this).attr("value");
        if (selectParam == "day") {
            initDateInput("date");
            showtimeForElectSum = tool.initDate("YMD", new Date());
            $("#date").val(showtimeForElectSum);
            $("#preVal").text(Operation['ui_perday']);
            $("#nextVal").text(Operation['ui_nextday']);
        } else if (selectParam == "month") {
            initDateInput("ym");
            showtimeForElectSum = tool.initDate("YM", new Date());
            $("#date").val(showtimeForElectSum);
            $("#preVal").text(Operation['ui_lastmonth']);
            $("#nextVal").text(Operation['ui_nextmonth']);
        }
        initQuick(selectParam);
    });
    $("#date").val(showtimeForElectSum);
    //初始化时间控件
    var calendar1 = new LCalendar();
    calendar1.init({
        'trigger': '#date',//标签id
        'type': 'date',//date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
        'minDate':'2000-1-1',//最小日期 注意：该值会覆盖标签内定义的日期范围
        'maxDate':'2050-1-1'//最大日期 注意：该值会覆盖标签内定义的日期范围
    });

    function initDateInput(type){
        $("#date").remove();
        $("#datePre").after(`<input readonly type="text" id="date">`);
        calendar1 = new LCalendar();
        calendar1.init({
            'trigger': '#date',//标签id
            'type': type,//date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
            'minDate':'2000-1-1',//最小日期 注意：该值会覆盖标签内定义的日期范围
            'maxDate':'2050-1-1'//最大日期 注意：该值会覆盖标签内定义的日期范围
        });
    }

    var selectReport = $(".elec-btn .select").attr("value");
    initQuick(selectReport);

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