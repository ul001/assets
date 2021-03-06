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

    let toast = new ToastClass();
    var choise = 1;
    var info = null;
    var f_MeterCode = tool.getUrlParam("F_MeterCode");

    function setData() {
        var params = {
            fSubid: subidFromAPP,
            pageNo: 1,
            pageSize: 1000,
            F_MeterCode: f_MeterCode,
            startDate: $("#date").val() + " 00:00:00",
            endDate: $("#date").val() + " 23:59:59"
        };
        toast.show({
            text: Operation['ui_loading'],
            loading: true
        });
        $.ajax({
            type: 'GET',
            url: baseUrlFromAPP + "/getTempABCResultHistoryList",
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
                info = result.data;
                $("#titleP").text(info.list[0].f_MeterName);
                if (choise == 1) {
                    showChart(info.list);
                } else {
                    showTable(info.list);
                }
            },
            error: function () {
                toast.show({
                    text: Operation['code_fail'],
                    duration: 2000
                });
            }
        })
    }

    function showChart(data) {
        var time = [];
        var tempA = [];
        var tempB = [];
        var tempC = [];
        if (data.length > 0) {
            $.each(data, function (index, val) {
                time.push(val.f_CollectTime.substring(11, 16));
                tempA.push(val.f_TempA);
                tempB.push(val.f_TempB);
                tempC.push(val.f_TempC);
            })
        }
        var option = {
            color: ['#2EC7C9','#B6A2DE','#3CA4E4','#FFB980'],
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                top: 11,
                data: [Operation['ui_temp']+'A', Operation['ui_temp']+'B', Operation['ui_temp']+'C']
            },
            grid: {
                left: '13%',
                right: '11%',
                top: '15%',
                bottom: '20%'
            },
            toolbox: {
                show: true,
                orient: 'horizontal',
                top: -6,
                feature: {
                    dataView: {
                        readOnly: true
                    },
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {}
                }
            },
            dataZoom: [{ // 这个dataZoom组件，默认控制x轴。
                type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
                start: 0, // 左边在 10% 的位置。
                end: 100, // 右边在 60% 的位置。
                height: 25,
                bottom: 10
            }],
            calculable: true,
            xAxis: [{
                data: time
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
        $(".chart").html('<div class="mainBox"><div id="tempTitle">'+Operation['ui_cabtemp']+'(℃)</div><div id="tempChart"></div></div>');
        $("#tempChart").removeAttr('_echarts_instance_');
        myChart = echarts.init($("#tempChart").get(0), 'macarons');
        myChart.setOption(option);
    }

    function showTable(data) {
        var tableData = [];
        if (data.length > 0) {
            $.each(data, function (index, val) {
                var row = {};
                row.time = val.f_CollectTime.substring(11, 16);
                row.tempA = val.f_TempA;
                row.tempB = val.f_TempB;
                row.tempC = val.f_TempC;
                tableData.push(row);
            })
        }
        var columns = [
            [{
                    field: 'time',
                    title: Operation['ui_collecttime'],
                    valign: 'middle',
                    align: 'center',
                    rowspan: 2
                },
                {
                    title: Operation['ui_temp']+'(℃)',
                    valign: "middle",
                    align: 'center',
                    colspan: 3
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
        $(".chart").html("<table id='table'></table>");
        $("#table").bootstrapTable({
            columns: columns,
            data: tableData,
            height: 250
        })
    }

    $("#showTable").click(function () {
        choise = 2;
        showTable(info.list);
        $(this).addClass('select').siblings("button").removeClass('select');

    });

    $("#showChart").click(function () {
        choise = 1;
        showChart(info.list);
        $(this).addClass('select').siblings("button").removeClass('select');

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