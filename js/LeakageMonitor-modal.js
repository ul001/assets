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

    var choise = 1;
    var info = null;
    var f_MeterCode = tool.getUrlParam("F_MeterCode");
    var fMeterName = localStorage.getItem("fMeterName");
    $("#titleP").text(fMeterName);

    function setData() {
        toast.show({
            text: Operation['ui_loading'],
            loading: true
        });
        var params = {
            fSubid: subidFromAPP,
            fMetercode: f_MeterCode,
            time: $("#date").val()
        };
        $.ajax({
            type: 'GET',
            url: baseUrlFromAPP + "/energySecurity/leakageCurrentAndTemp",
            data: params,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", tokenFromAPP)
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
                if (result.data.leakageCurrentAndTempValues.length > 0) {
                    info = result.data.leakageCurrentAndTempValues[0];
                }
                if (choise == 1) {
                    showChart(info);
                } else {
                    showTable(info);
                }
            },
            error: function () {
                toast.show({
                    text: Operation['code_fail'],
                    duration: 2000
                });
            }
        });
    }

    function showChart(data) {
        var time = [];
        var leakageIs = [];
        var time2 = [];
        var tempA = [];
        var tempB = [];
        var tempC = [];
        if (data != null) {
            var IValues = data.origCurrentValues;
            var EValues = data.origEnvironmentValues;
            $.each(IValues, function (index, val) {
                time.push(val.fCollecttime.substring(11, 16));
                leakageIs.push(val.fIl);
            });
            $.each(EValues, function (index, val) {
                time2.push(val.fCollecttime.substring(11, 16));
                tempA.push(val.fTempa);
                tempB.push(val.fTempb);
                tempC.push(val.fTempc);
            });
        }
        var option = {
            color: ['#2EC7C9','#B6A2DE','#3CA4E4','#FFB980'],
            tooltip: {
                trigger: 'axis'
            },
            toolbox: {
                show: true,
                orient: 'horizontal',
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
            dataZoom: [{ // 这个dataZoom组件，默认控制x轴。
                type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
                start: 0, // 左边在 10% 的位置。
                end: 100, // 右边在 60% 的位置。
                height: 25,
                bottom: 8
            }],
            grid: {
                left: '13%',
                right: '11%',
                top: '20%',
                bottom: '25%'
            },
            calculable: true,
            xAxis: [{
                data: time
            }],
            yAxis: [{
                type: 'value',
                scale: true,
            }],
            series: [{
                name: Operation['ui_leakI'],
                type: 'line',
                data: leakageIs
            }]
        };
        var option2 = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                top: 12,
                data: [Operation['ui_temp']+'A', Operation['ui_temp']+'B', Operation['ui_temp']+'C']
            },
            toolbox: {
                show: true,
                orient: 'horizontal',
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
            dataZoom: [{ // 这个dataZoom组件，默认控制x轴。
                type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
                start: 0, // 左边在 10% 的位置。
                end: 100, // 右边在 60% 的位置。
                height: 25,
                bottom: 8
            }],
            grid: {
                left: '13%',
                right: '11%',
                top: '20%',
                bottom: '25%'
            },
            calculable: true,
            xAxis: [{
                data: time2
            }],
            yAxis: [{
                type: 'value',
                scale: true,
            }],
            series: [{
                name: Operation['ui_temp']+'A',
                type: 'line',
                data: tempA
            }, {
                name: Operation['ui_temp']+'B',
                type: 'line',
                data: tempB
            }, {
                name: Operation['ui_temp']+'C',
                type: 'line',
                data: tempC
            }]
        };
        $(".chart").html('<div class="mainBox"><div id="elecTitle"><img src="image/elec-sb.png"/>'+Operation['ui_leakI']+'(mA)</div>' +
            '<div id="elecChart"></div></div>' +
            '<div class="mainBox"><div id="tempTitle"><img src="image/temp-sb.png"/>'+Operation['ui_temp']+'(°C)</div>' +
            '<div id="tempChart"></div></div>');
        $("#elecChart").removeAttr('_echarts_instance_');
        $("#tempChart").removeAttr('_echarts_instance_');
        myChart = echarts.init($("#elecChart").get(0), 'macarons');
        myChart.setOption(option);
        myChart2 = echarts.init($("#tempChart").get(0), 'macarons');
        myChart2.setOption(option2);
    }

    function showTable(data) {
        var tableData = [];
        var time = [];
        var leakageI = [];
        var tempA = [];
        var tempB = [];
        var tempC = [];
        if (data != null) {
            $.each(data.origCurrentValues, function (index, val) {
                time.push(val.fCollecttime.substring(11, 16));
                leakageI.push(val.fIl);
            });
            $.each(data.origEnvironmentValues, function (index, val) {
                tempA.push(val.fTempa);
                tempB.push(val.fTempb);
                tempC.push(val.fTempc);
            });

            for (var i = 0; i < time.length; i++) {
                tableData.push({
                    time: time[i],
                    leakageI: leakageI[i],
                    tempA: tempA[i],
                    tempB: tempB[i],
                    tempC: tempC[i]
                });
            }
        }
        var columns = [
            [{
                    field: 'time',
                    title: Operation['ui_collecttime'],
                    valign: 'middle',
                    align: 'center',
                    colspan: 1,
                    rowspan: 2
                },
                {
                    field: 'leakageI',
                    title: Operation['ui_leakI']+'(mA)',
                    valign: 'middle',
                    align: 'center',
                    colspan: 1,
                    rowspan: 2
                },
                {
                    title: Operation['ui_cabtemp']+'(℃)',
                    valign: "middle",
                    align: 'center',
                    colspan: 3,
                    rowspan: 1
                }
            ],
            [{
                    field: 'tempA',
                    title: 'A',
                    valign: "middle",
                    align: 'center'
                },
                {
                    field: 'tempB',
                    title: 'B',
                    valign: "middle",
                    align: 'center'
                },
                {
                    field: 'tempC',
                    title: 'C',
                    valign: "middle",
                    align: 'center'
                }
            ]
        ];
        $(".chart").html("");
        $(".chart").html("<table id='table'></table>");
        $("#table").bootstrapTable({
            columns: columns,
            data: tableData,
            height: 300
        });
    }

    $("#showTable").click(function () {
        choise = 2;
        $("#showTable").addClass("select");
        $("#showChart").removeClass("select");
        showTable(info);
    });

    $("#showChart").click(function () {
        choise = 1;
        $("#showChart").addClass("select");
        $("#showTable").removeClass("select");
        showChart(info);
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
    $("#date").on("input",function(){
        setData();
    });

    $("#datePre").click(function () {
        var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
        var preDate = new Date(selectDate.getTime() - 24 * 60 * 60 * 1000);
        $("#date").val(preDate.getFullYear() + "-" + ((preDate.getMonth()) < 9 ? ("0" + (preDate.getMonth() + 1)) : (preDate.getMonth() + 1)) + "-" + (preDate.getDate() < 10 ? ("0" + preDate.getDate()) : (preDate.getDate())));
        setData();
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
        setData();
    });

    setData();
});