$(function () {
    var baseUrlFromAPP="http://116.236.149.165:8090/SubstationWEBV2/v5";
    var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1OTM5MTYxMTUsInVzZXJuYW1lIjoiaGFoYWhhIn0.lLzdJwieIO-xMhob6PW06MRyzK4oCZVCfcs9196Iec8";
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

    let toast = new ToastClass(); //实例化toast对象

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
            $("#search").click();
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
    });

    $("#electric").click(function () {
        $(".category").show();
    });

    $(document).on('click', '#search', function () {
        var EnergyKind = "UnB";
        var selectParam = [];
        if (EnergyKind != "fFr") {
            var select = $(".btn.select");
            $.each(select, function (index, val) {
                selectParam.push($(val).attr("value"))
            })
        }
        var fCircuitid = currentSelectVode.merterId;
        var time = $("#date").val();
        var url = baseUrlFromAPP + "/powerMonitoring/ElectricData";
        var params = {
            fSubid: subidFromAPP,
            fCircuitid: fCircuitid,
            time: time,
            fPhase: selectParam.join("-"),
            EnergyKind: EnergyKind,
        }
        getData(url, params, function (data) {
            showCharts(data.CircuitValueByDate);
        });
    })


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
                if(result.code!="200"){
                    toast.show({
                        text: Substation.showCodeTips(result.code),
                        duration: 2000
                    });
                }
                successCallback(result.data);
            },
            error: function (jsonStr) {
                var strArr = baseUrlFromAPP.split("/");
                strArr = strArr.pop().pop();

                $.ajax({
                    url: "http://www.acrelcloud.cn/SubstationWEBV2/SubstationWEBV2/main/uploadExceptionLog",
                    type: "POST",
                    data: {
                        ip: ipAddress,
                        exceptionMessage: jsonStr
                    },
                    success: function (data) {

                    }
                });

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
        var name = [];
        var tableData = [];
        if (data.length > 0) {
            $.each(data, function (index, el) {
                if ($.inArray(el.fCollecttime.substring(11, 16), time) == -1) {
                    time.push(el.fCollecttime.substring(11, 16));
                }
                if (value.length == 0) {
                    name.push(el.fParamcode.substring(1));
                    value.push({
                        name: el.fParamcode.substring(1),
                        value: []
                    });
                    tableData.push({
                        name: el.fParamcode.substring(1) + "(%)",
                        sum: 0,
                        avg: 0,
                        max: [el.fParamvalue],
                        maxTime: [el.fCollecttime.substring(11, 16)],
                        min: [el.fParamvalue],
                        minTime: [el.fCollecttime.substring(11, 16)]
                    });
                }
                if ($.inArray(el.fParamcode.substring(1), name) != -1) {
                    value[$.inArray(el.fParamcode.substring(1), name)].value.push(el.fParamvalue);

                    var num = tableData[$.inArray(el.fParamcode.substring(1), name)].sum + el.fParamvalue;
                    var length = value[$.inArray(el.fParamcode.substring(1), name)].value.length;
                    var avg = (num / length).toFixed(2);
                    tableData[$.inArray(el.fParamcode.substring(1), name)].sum = num;
                    tableData[$.inArray(el.fParamcode.substring(1), name)].avg = avg;

                    if (el.fParamvalue > tableData[$.inArray(el.fParamcode.substring(1), name)].max) {
                        tableData[$.inArray(el.fParamcode.substring(1), name)].max = el.fParamvalue;
                        tableData[$.inArray(el.fParamcode.substring(1), name)].maxTime = el.fCollecttime.substring(11, 16);
                    }

                    if (el.fParamvalue < tableData[$.inArray(el.fParamcode.substring(1), name)].min) {
                        tableData[$.inArray(el.fParamcode.substring(1), name)].min = el.fParamvalue;
                        tableData[$.inArray(el.fParamcode.substring(1), name)].minTime = el.fCollecttime.substring(11, 16);
                    }
                } else {
                    name.push(el.fParamcode.substring(1));
                    value.push({
                        name: el.fParamcode.substring(1),
                        value: [el.fParamvalue]
                    });
                    tableData.push({
                        name: el.fParamcode.substring(1) + "(%)",
                        sum: el.fParamvalue,
                        avg: el.fParamvalue,
                        max: [el.fParamvalue],
                        maxTime: [el.fCollecttime.substring(11, 16)],
                        min: [el.fParamvalue],
                        minTime: [el.fCollecttime.substring(11, 16)]
                    })
                }
            });
        }

        showLine(name, time, value);
        showTable(tableData)
    }

    function showLine(name, time, value) {
        var series = [];
        $.each(value, function (index, el) {
            series.push({
                name: el.name,
                data: el.value,
                type: 'line',
                markPoint: {
                    symbol: 'circle',
                    symbolSize: 10,
                    data: [{
                            name: Operation['ui_maxval'],
                            type: 'max',
                            label: {
                                normal: {
                                    formatter: 'Max:{c}'
                                }
                            }
                        },
                        {
                            name: Operation['ui_minval'],
                            type: 'min',
                            label: {
                                normal: {
                                    formatter: 'Min:{c}'
                                }
                            }
                        }
                    ],
                    itemStyle: {
                        normal: {
                            label: {
                                position: 'top'
                            }
                        }
                    }
                },
                markLine: {
                    data: [{
                        name: Operation['ui_avgval'],
                        type: 'average'
                    }]
                }
            })
        });
        $("#chartContain").removeAttr('_echarts_instance_');
        var line = echarts.init(document.getElementById('chartContain'));
        var option = {
            color: ['#2EC7C9','#B6A2DE','#3CA4E4','#FFB980'],
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: name,
            },
            grid: { // 控制图的大小，调整下面这些值就可以，
                top: '18%',
                left: '10%',
                right: '10%',
                bottom: '29%',
            },
            xAxis: {
                type: 'category',
                data: time,
            },
            yAxis: {
                name: '%',
                type: 'value',
                scale: true, //y轴自适应
            },
            toolbox: {
                left: 'right',
                top: -6,
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
            calculable: true,
            series: series,
        };
        line.setOption(option);
    }

    function showTable(data) {
        var columns = [
            [{
                    field: "name",
                    title: Operation['ui_type'],
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
            data: data,
        })
    }

    $("#datePre").click(function () {
        var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
        var preDate = new Date(selectDate.getTime() - 24 * 60 * 60 * 1000);
        $("#date").val(preDate.getFullYear() + "-" + ((preDate.getMonth()) < 9 ? ("0" + (preDate.getMonth() + 1)) : (preDate.getMonth() + 1)) + "-" + (preDate.getDate() < 10 ? ("0" + preDate.getDate()) : (preDate.getDate())));
    });

    $("#dateNext").click(function () {
        var d = new Date();
        var nowDate = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate());
        var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
        if (selectDate < nowDate) {
            var nextDate = new Date(selectDate.getTime() + 24 * 60 * 60 * 1000);
            $("#date").val(nextDate.getFullYear() + "-" + ((nextDate.getMonth()) < 9 ? ("0" + (nextDate.getMonth() + 1)) : (nextDate.getMonth() + 1)) + "-" + (nextDate.getDate() < 10 ? ("0" + nextDate.getDate()) : (nextDate.getDate())));
        } else {
            return;
        }
    });


//初始化时间控件
    var calendar1 = new LCalendar();
    calendar1.init({
        'trigger': '#date',//标签id
        'type': 'date',//date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
        'minDate':'2000-1-1',//最小日期 注意：该值会覆盖标签内定义的日期范围
        'maxDate':'2050-1-1'//最大日期 注意：该值会覆盖标签内定义的日期范围
    });
    var time = tool.initDate("YMD", new Date());
    $("#date").val(time);
});