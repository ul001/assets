$(function () {
//    var baseUrlFromAPP = "http://116.236.149.162:8090/SubstationWEBV2";
//    var tokenFromAPP = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjM2MjcxNzYsInVzZXJuYW1lIjoiYWRtaW4ifQ.6MQ7AdQdCC1VlppKNa4gdoUOEiJ6W4wWGQDhET27HZs";
//    var subidFromAPP = 10100001;
    // var trans = new TransformerMonitor();
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

    function getData(url, params, successCallback) {
        $.ajax({
            type: 'GET',
            url: url,
            data: params,
            headers: {
                Accept: "application/json; charset=utf-8",
                Authorization: tokenFromAPP
            },
            success: function (result) {
                successCallback(result.data);
            }
        });
    }
    var selectTrans;
    var info;
    var time = tool.initDate("YMD", new Date());
    $("#date").val(time);
    getListData();

    function getListData() {
        var url = baseUrlFromAPP + "/main/powerMonitoring/TransformerMonitor";
        var params = {
            fSubid: subidFromAPP,
            selectParams: "Uab,Ubc,Uca,S,P,Q,Pf,Ia,Ib,Ic,TempA,TempB,TempC,MD,MDTimeStamp"
        };
        getData(url, params, function (data) {
            info = data;
            generateTransStatus(data);
            generateChartLine(data);
        });
    }

    function getDateCurveData() {
        var url = baseUrlFromAPP + "/main/getCurveDataOfPowerAndTempABC";
        // var selectCode = $(".").attr('value');
        var params = {
            fTransid: selectTrans,
            fDate: $("#date").val()
        };
        getData(url, params, function (data) {
            generateChartLine(data);
        });
    }

    //配置变压器上部数据
    function generateTransStatus(data) {
        if (data.hasOwnProperty('TransformerStatus')){
            showTemperature(data.TransformerStatus);
            showCurrent(data.TransformerStatus);
            showPower(data.TransformerStatus);
            showVoltage(data.TransformerStatus);
        }
        if(data.hasOwnProperty('TransformerList')){
            showTransName(data.TransformerList);
        }
        selectTrans = data.fTransid;
    }

    //显示温度数据
    function showTemperature(temp) {
        if (temp == null) {
            $(".AphaseTemp").html("--");
            $(".BphaseTemp").html("--");
            $(".CphaseTemp").html("--");
        } else {

            if (temp.TempA != null)
                $(".AphaseTemp").html("A相绕组温度:" + temp.TempA);
            else
                $(".AphaseTemp").html("--");

            if (temp.TempB != null)
                $(".BphaseTemp").html("B相绕组温度:" + temp.TempB);
            else
                $(".BphaseTemp").html("--");

            if (temp.TempC != null)
                $(".CphaseTemp").html("C相绕组温度:" + temp.TempC);
            else
                $(".CphaseTemp").html("--");
        }
    }

    //显示电压数据
    function showVoltage(voltage) {
        if (voltage == null) {
            $(".Uab").html("--");
            $(".Ubc").html("--");
            $(".Uca").html("--");
        } else {

            if (voltage.Uab != null)
                $(".Uab").html("Uab线电压:" + voltage.Uab);
            else
                $(".Uab").eq(0).html("--");

            if (voltage.Ubc != null)
                $(".Ubc").html("Ubc线电压:" + voltage.Ubc);
            else
                $(".Ubc").html("--");

            if (voltage.Uca != null)
                $(".Uca").html("Uca线电压:" + voltage.Uca);
            else
                $(".Uca").html("--");
        }
    }

    //显示电流数据
    function showCurrent(current) {
        if (current == null) {
            $(".AphaseI").html("--");
            $(".BphaseI").html("--");
            $(".CphaseI").html("--");
        } else {

            if (current.Ia != null)
                $(".AphaseI").html("A相电流:" + current.Ia);
            else
                $(".AphaseI").html("--");

            if (current.Ib != null)
                $(".BphaseI").html("B相电流:" + current.Ib);
            else
                $(".BphaseI").html("--");

            if (current.Ic != null)
                $(".CphaseI").html("C相电流:" + current.Ic);
            else
                $(".CphaseI").html("--");
        }
    }

    //显示功率
    function showPower(capacity) {
        if (capacity == null) {
            $(".Ratedpower").html("--");
            $(".AP").html("--");
            $(".LF").html("--");
            $(".Fp").html("--");
            $(".Fq").html("--");
            $(".Pf").html("--");
            $(".MaxD").html("--");
            $(".MDTime").html("");
        } else {

            if (capacity.fInstalledcapacity != null)
                $(".Ratedpower").html("额定功率:" + capacity.fInstalledcapacity + "kVA");
            else
                $(".Ratedpower").html("--");

            if (capacity.S != null)
                $(".AP").html("视在功率:" + capacity.S);
            else
                $(".AP").html("--");

            if (capacity.loadFactor != null)
                $(".LF").html("负荷率:" + (capacity.loadFactor).toFixed(2) + "%");
            else
                $(".LF").html("--");

            if (capacity.P != null)
                $(".Fp").html("有功功率:" + capacity.P);
            else
                $(".Fp").html("--");
            if (capacity.Q != null)
                $(".Fq").html("无功功率:" + capacity.Q);
            else
                $(".Fq").html("--");
            if (capacity.PF != null)
                $(".Pf").html("功率因素:" + capacity.PF);
            else
                $(".Pf").html("--");
            if (capacity.MD != null)
                $(".MaxD").html("最大需量:" + capacity.MD);
            else
                $(".MaxD").html("--");
            if (capacity.MDTimeStamp != null) {
                var time = capacity.MDTimeStamp.substring(0, 16);
                $(".MDTime").html(time);
            } else {
                $(".MDTime").html("");
            }
        }
    }

    //配置图表
    function generateChartLine(data) {

        var time = [];
        var times = [];
        var timeTemp = [];

        var yesterDayfP = [],
            yesterDayfQ = [],
            yesterDayfS = [];

        var todayfP = [],
            todayfQ = [],
            todayfS = [];

        var seriesA = [],
            seriesB = [],
            seriesC = [];

        if (data.yesterdayPowerValue != null) {
            $.each(data.yesterdayPowerValue, function (key, val) {
                times.push(val.fCollecttime.substring(11, 16))
            });
            if (data.PowerValue != null) {
                $.each(data.PowerValue, function (key, val) {
                    time.push(val.fCollecttime.substring(11, 16));
                });
            }
            var times = times.length > time.length ? times : time;

            for (var i = 0; i < times.length; i++) {
                var index = 0;
                for (var j = 0; j < data.yesterdayPowerValue.length; j++) {
                    if (data.yesterdayPowerValue[j].fCollecttime.substring(11, 16) == times[i]) {
                        yesterDayfP.push(data.yesterdayPowerValue[j].fP);
                        yesterDayfQ.push(data.yesterdayPowerValue[j].fQ);
                        yesterDayfS.push(data.yesterdayPowerValue[j].fS);
                        index = 1;
                    }
                }
                if (index == 0) {
                    yesterDayfP.push(null);
                    yesterDayfQ.push(null);
                    yesterDayfS.push(null);
                }
            }
        }

        if (data.PowerValue != null) {
            for (var i = 0; i < times.length; i++) {
                var index = 0;
                for (var j = 0; j < data.PowerValue.length; j++) {
                    if (data.PowerValue[j].fCollecttime.substring(11, 16) == times[i]) {
                        todayfP.push(data.PowerValue[j].fP);
                        todayfQ.push(data.PowerValue[j].fQ);
                        todayfS.push(data.PowerValue[j].fS);
                        index = 1;
                    }
                }
                if (index == 0) {
                    todayfP.push(null);
                    todayfQ.push(null);
                    todayfS.push(null);
                }
            }
        }


        if (!data.hasOwnProperty('tempABC') || data.tempABC != null) {
            $.each(data.tempABC, function (key, val) {
                timeTemp.push(val.fCollecttime.substring(11, 16));
                seriesA.push(val.fTempa);
                seriesB.push(val.fTempb);
                seriesC.push(val.fTempc);
            });
        }
        //TODO：waring
        var transformerName = "变压器";
        var type = $(".s-select")[0].id;
        if (type == "NowPower") {
            var titlefS = transformerName + "  " + "视在功率";
            var seriesfS = [{
                    name: '当日',
                    type: 'line',
                    data: todayfS,
                    markPoint: {
                        symbol: 'circle',
                        symbolSize: 10,
                        data: [{
                                name: '最大值',
                                type: 'max',
                                label: {
                                    normal: {
                                        formatter: 'Max:{c}'
                                    }
                                }
                            },
                            {
                                name: '最小值',
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
                            name: '平均值',
                            type: 'average'
                        }]
                    }
                },
                {
                    name: '上日',
                    type: 'line',
                    data: yesterDayfS,
                    markPoint: {
                        symbol: 'circle',
                        symbolSize: 10,
                        data: [{
                                name: '最大值',
                                type: 'max',
                                label: {
                                    normal: {
                                        formatter: 'Max:{c}'
                                    }
                                }
                            },
                            {
                                name: '最小值',
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
                            name: '平均值',
                            type: 'average'
                        }]
                    }
                }
            ];
            var legendfS = {
                data: ['当日', '上日'],
                bottom: '2%'
            };
            var unitfS = 'kVA';
            initLine(seriesfS, legendfS, times, titlefS, unitfS);
        }
        if (type == "havePower") {
            var seriesfP = [{
                    name: '当日',
                    type: 'line',
                    data: todayfP,
                    markPoint: {
                        symbol: 'circle',
                        symbolSize: 10,
                        data: [{
                                name: '最大值',
                                type: 'max',
                                label: {
                                    normal: {
                                        formatter: 'Max:{c}'
                                    }
                                }
                            },
                            {
                                name: '最小值',
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
                            name: '平均值',
                            type: 'average'
                        }]
                    }
                },
                {
                    name: '上日',
                    type: 'line',
                    data: yesterDayfP,
                    markPoint: {
                        symbol: 'circle',
                        symbolSize: 10,
                        data: [{
                                name: '最大值',
                                type: 'max',
                                label: {
                                    normal: {
                                        formatter: 'Max:{c}'
                                    }
                                }
                            },
                            {
                                name: '最小值',
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
                            name: '平均值',
                            type: 'average'
                        }]
                    }
                }
            ];
            var legendfP = {
                data: ['当日', '上日'],
                bottom: '2%'
            };
            var titlefP = transformerName + "  " + "有功功率";
            var unitfP = 'kW';
            initLine(seriesfP, legendfP, times, titlefP, unitfP);
        }
        if (type == "NothingPower") {
            var seriesfQ = [{
                    name: '当日',
                    type: 'line',
                    data: todayfQ,
                    markPoint: {
                        symbol: 'circle',
                        symbolSize: 10,
                        data: [{
                                name: '最大值',
                                type: 'max',
                                label: {
                                    normal: {
                                        formatter: 'Max:{c}'
                                    }
                                }
                            },
                            {
                                name: '最小值',
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
                            name: '平均值',
                            type: 'average'
                        }]
                    }
                },
                {
                    name: '上日',
                    type: 'line',
                    data: yesterDayfQ,
                    markPoint: {
                        symbol: 'circle',
                        symbolSize: 10,
                        data: [{
                                name: '最大值',
                                type: 'max',
                                label: {
                                    normal: {
                                        formatter: 'Max:{c}'
                                    }
                                }
                            },
                            {
                                name: '最小值',
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
                            name: '平均值',
                            type: 'average'
                        }]
                    }
                }
            ];
            var legendfQ = {
                data: ['当日', '上日'],
                bottom: '2%'
            };
            var titlefQ = transformerName + "  " + "无功功率";
            var unitfQ = 'kVar';
            initLine(seriesfQ, legendfQ, times, titlefQ, unitfQ);
        }
        if (type == "tempLine") {
            var titleTem = transformerName + "  " + "绕阻温度";
            // var titleTem = $("#daycalendarBox").val() + "  " + transformerName + "  " + "绕阻温度";
            var seriesTem = [{
                    name: '温度A',
                    type: 'line',
                    data: seriesA,
                    markPoint: {
                        symbol: 'circle',
                        symbolSize: 10,
                        data: [{
                                name: '最大值',
                                type: 'max',
                                label: {
                                    normal: {
                                        formatter: 'Max:{c}'
                                    }
                                }
                            },
                            {
                                name: '最小值',
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
                            name: '平均值',
                            type: 'average'
                        }]
                    }
                },
                {
                    name: '温度B',
                    type: 'line',
                    data: seriesB,
                    markPoint: {
                        symbol: 'circle',
                        symbolSize: 10,
                        data: [{
                                name: '最大值',
                                type: 'max',
                                label: {
                                    normal: {
                                        formatter: 'Max:{c}'
                                    }
                                }
                            },
                            {
                                name: '最小值',
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
                            name: '平均值',
                            type: 'average'
                        }]
                    }
                },
                {
                    name: '温度C',
                    type: 'line',
                    data: seriesC,
                    markPoint: {
                        symbol: 'circle',
                        symbolSize: 10,
                        data: [{
                                name: '最大值',
                                type: 'max',
                                label: {
                                    normal: {
                                        formatter: 'Max:{c}'
                                    }
                                }
                            },
                            {
                                name: '最小值',
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
                            name: '平均值',
                            type: 'average'
                        }]
                    }
                }
            ];
            var legendTem = {
                data: ['温度A', '温度B', '温度C'],
                bottom: '2%'
            };
            var unitTem = '℃';
            initLine(seriesTem, legendTem, timeTemp, titleTem, unitTem);
        }
    }

    function initLine(series, legend, time, title, unit) {
        var line = echarts.init($("#powerChart").get(0), 'macarons');
        // var line = echarts.init($("#powerChart").get(0));
        var option = {
/*            title: {
                text: title,
                x: 'center'
            },*/
            tooltip: {
                trigger: 'axis'
            },
            legend: legend,
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
            grid: {
                left: '13%',
                right: '11%',
                top: '20%',
                bottom: '25%'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: time
            },
            yAxis: {
                name: unit,
                type: 'value',
                min: function (value) {
                    if (value.min <= 0) {
                        return (value.min + value.min * 0.2).toFixed(2);
                    } else {
                        return (value.min - value.min * 0.2).toFixed(2);
                    }
                },
                max: function (value) {
                    return (value.max + value.max * 0.1).toFixed(2);
                },
                axisLabel: {
                    formatter: '{value}'
                }
            },
            dataZoom: [{ // 这个dataZoom组件，默认控制x轴。
                type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
                start: 0, // 左边在 10% 的位置。
                end: 100, // 右边在 60% 的位置。
                height: 25,
                bottom: 38
            }],
            series: series
        };
        line.setOption(option);
    }

    function showTransName(transList) {
        if(transList.length>0){
            $("#transform").empty();
            $(transList).each(function(){
                var str = "";
                if(selectTrans==this.fTransid){
                    str="<li value='"+this.fTransid+"'><img src='image/transform-orange.png'/><p>"+this.fTransname+"</p></li>";
                }else{
                    str="<li value='"+this.fTransid+"'><img src='image/transform-grey.png'/><p>"+this.fTransname+"</p></li>";
                }
                $("#transform").append(str);
            });
            $("#transform li").click(function(){
                $(this).find("img").setAttribute("src","image/transform-orange.png");
                $(this).siblings.find("img").setAttribute("src","image/transform-grey.png");
                selectTrans=$(this).attr("value");
            });
        }
/*        var transformerName = $(".trans-select").text();
        if (transformerName == null || transformerName == "") {
            $(".Transformername").html("--");
        } else {
            $(".Transformername").html(transformerName);
        }*/
        // var time = Substation.ObjectOperation.dateTimeFormat("DATETIME", new Date());
        // $(".UPTime").html(time);
    }

    //点击有功、无功、视在的按钮
    $("#havePower").click(function () {
        $("#havePower").addClass("s-select").siblings('span').removeClass("s-select");
        generateChartLine(info);
    });
    $("#NothingPower").click(function () {
        $("#NothingPower").addClass("s-select").siblings('span').removeClass("s-select");
        generateChartLine(info);
    });
    $("#NowPower").click(function () {
        $("#NowPower").addClass("s-select").siblings('span').removeClass("s-select");
        generateChartLine(info);
    });
    $("#tempLine").click(function () {
        $("#tempLine").addClass("s-select").siblings('span').removeClass("s-select");
        generateChartLine(info);
    });
    $("#datePre").click(function () {
        var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
        var preDate = new Date(selectDate.getTime() - 24 * 60 * 60 * 1000);
        $("#date").val(preDate.getFullYear() + "-" + ((preDate.getMonth()) < 9 ? ("0" + (preDate.getMonth() + 1)) : (preDate.getMonth() + 1)) + "-" + (preDate.getDate() < 10 ? ("0" + preDate.getDate()) : (preDate.getDate())));
        getDateCurveData();
    });

    $("#dateNext").click(function () {
        var d = new Date();
        var nowDate = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate());
        var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
        if (selectDate < nowDate) {
            var nextDate = new Date(selectDate.getTime() + 24 * 60 * 60 * 1000);
            $("#date").val(nextDate.getFullYear() + "-" + ((nextDate.getMonth()) < 9 ? ("0" + (nextDate.getMonth() + 1)) : (nextDate.getMonth() + 1)) + "-" + (nextDate.getDate() < 10 ? ("0" + nextDate.getDate()) : (nextDate.getDate())));
            getDateCurveData();
        } else {
            return;
        }
    });

    new Rolldate({
        el: '#date',
        format: 'YYYY-MM-DD',
        beginYear: 2000,
        endYear: 2100,
        value: $("#date").val(),
        confirm: function (date) {
            var d = new Date(),
                d1 = new Date(date.replace(/\-/g, "\/")),
                d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()); //如果非'YYYY-MM-DD'格式，需要另做调整
            if (d1 > d2) {
                return false;
            } else {
                $("#date").val(date);
                getDateCurveData();
            }
        }
    });
});