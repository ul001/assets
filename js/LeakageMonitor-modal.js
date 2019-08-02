$(function () {
//     var baseUrlFromAPP="http://116.236.149.162:8090/SubstationWEBV2";
//     var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjQyMzE3NzMsInVzZXJuYW1lIjoiYWRtaW4ifQ.pfgcsrczhtQN9jwzgeM568npgMAUVsca-cd1AJoc6_s";
//     var subidFromAPP=10100001;
    //iOS安卓基础传参
     var u = navigator.userAgent,
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
     }

    let toast = new ToastClass();//实例化toast对象

    var choise = 1;
    var info = null;
    var f_MeterCode = tool.getUrlParam("F_MeterCode");
    var fMeterName = localStorage.getItem("fMeterName");
    $("#titleP").text(fMeterName);

    function setData() {
        toast.show({text:'正在加载',loading: true});
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
                toast.hide();
                if (result.data.leakageCurrentAndTempValues.length > 0) {
                    info = result.data.leakageCurrentAndTempValues[0];
                }
                if (choise == 1) {
                    showChart(info);
                } else {
                    showTable(info);
                }
            },
            error:function (){
                toast.show({text: '数据请求失败',duration: 2000});
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
            tooltip: {
                trigger: 'axis'
            },
            toolbox:{
                show:true,
                orient:'horizontal',
                top:-6,
                feature:{
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    dataView: {readOnly: true},
                    restore: {}
                }
            },
            dataZoom: [{   // 这个dataZoom组件，默认控制x轴。
                type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
                start: 0,      // 左边在 10% 的位置。
                end: 100,         // 右边在 60% 的位置。
                height:25,
                bottom:8
            }],
            grid:{
                left:'13%',
                right:'11%',
                top:'20%',
                bottom:'25%'
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
                name: '漏电流',
                type: 'line',
                data: leakageIs
            }]
        };
        var option2 = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                top:12,
                data: ['温度A', '温度B', '温度C']
            },
            toolbox:{
                show:true,
                orient:'horizontal',
                top:-6,
                feature:{
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    dataView: {readOnly: true},
                    restore: {}
                }
            },
            dataZoom: [{   // 这个dataZoom组件，默认控制x轴。
                type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
                start: 0,      // 左边在 10% 的位置。
                end: 100,         // 右边在 60% 的位置。
                height:25,
                bottom:8
            }],
            grid:{
                left:'13%',
                right:'11%',
                top:'20%',
                bottom:'25%'
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
                name: '温度A',
                type: 'line',
                data: tempA
            }, {
                name: '温度B',
                type: 'line',
                data: tempB
            }, {
                name: '温度C',
                type: 'line',
                data: tempC
            }]
        };
        $(".chart").html('<div class="mainBox"><div id="elecTitle"><img src="image/elec-sb.png"/>漏电流(mA)</div>'+
                          '<div id="elecChart"></div></div>'+
                          '<div class="mainBox"><div id="tempTitle"><img src="image/temp-sb.png"/>温度(°C)</div>'+
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
                    title: '采集时间',
                    valign: 'middle',
                    align: 'center',
                    colspan: 1,
                    rowspan: 2
                },
                {
                    field: 'leakageI',
                    title: '漏电流(mA)',
                    valign: 'middle',
                    align: 'center',
                    colspan: 1,
                    rowspan: 2
                },
                {
                    title: '线缆温度(℃)',
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

    var time = tool.initDate("YMD", new Date());
    $("#date").val(time);

    new Rolldate({
        el: '#date',
        format: 'YYYY-MM-DD',
        beginYear: 2000,
        endYear: 2100,
        value: $("#date").val(),
        confirm: function (date) {
            var d = new Date();
            d1 = new Date(date.replace(/\-/g, "\/"));
            d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()); //如果非'YYYY-MM-DD'格式，需要另做调整
            if (d1 > d2) {
                return false;
            };
            $("#date").val(date);
            setData();
        }
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