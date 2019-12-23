$(function() {
    // var baseUrlFromAPP = "http://116.236.149.165:8090/SubstationWEBV2/v4";
    // var tokenFromAPP = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1Nzc2ODQzMjcsInVzZXJuYW1lIjoiaGFoYWhhIn0.leVb9Crja_XFXT03AHSLngGlrBfb0QxQuQDIAMbMxLM";
    // var subidFromAPP = 10100001;
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

    let toast = new ToastClass(); //实例化toast对象

    function getData(url, params, successCallback) {
        toast.show({ text: '正在加载', loading: true });
        $.ajax({
            type: 'GET',
            url: url,
            data: params,
            headers: {
                Accept: "application/json; charset=utf-8",
                Authorization: tokenFromAPP
            },
            success: function(result) {
                toast.hide();
                successCallback(result.data);
            },
            error: function() {
                toast.show({ text: '数据请求失败', duration: 2000 });
            }
        });
    }

    var time = tool.initDate("YMD", new Date());
    $("#date").val(time);
    getListData();

    function getListData() {
        var url = baseUrlFromAPP + "/getTempHumi";
        var params = {
            fSubid: subidFromAPP
        };
        getData(url, params, function(data) {
            if (data.TempHumiObList != null) {
                if (data.TempHumiObList.length > 0) {
                    $("#cardList").empty();
                    $(data.TempHumiObList).each(function() {
                        var tempVal = "--";
                        var humiVal = "--";
                        if (this.temp != undefined && this.temp != null) {
                            tempVal = parseFloat(this.temp).toFixed(1);
                        }
                        if (this.humi != undefined && this.humi != null) {
                            humiVal = parseFloat(this.humi).toFixed(1);
                        }
                        $("#cardList").append('<section class="sectionCard" value="' + this.f_MeterCode + '">' +
                            '<p>' + this.f_MeterName + '</p>' +
                            '<img src="image/wsd.png"/>' +
                            '<p>温度：' + tempVal + this.tempUnit + '</p>' +
                            '<p>湿度：' + humiVal + this.humiUnit + '</p></section>');
                    });
                    $("#cardList section:first").addClass("sectionSelect");
                    $(".sectionCard").on("click", function() {
                        $(this).addClass("sectionSelect").siblings().removeClass("sectionSelect");
                        $("#date").val(time);
                        getChartData();
                    });
                    getChartData();
                }
            }
        });
    }

    function getChartData() {
        var chartData = {};
        var time = [];
        var temp = [];
        var humi = [];
        var selectCode = $(".sectionSelect").attr('value');
        var url = baseUrlFromAPP + "/getTempHumi";
        var params = {
            fSubid: subidFromAPP,
            fMetercode: selectCode,
            time: $("#date").val()
        };
        getData(url, params, function(data) {
            if (data.FTempFHumidityByDate != null) {
                if (data.FTempFHumidityByDate.length > 0) {
                    $(data.FTempFHumidityByDate).each(function() {
                        time.push(this.fCollecttime.substring(11, 16));
                        temp.push(this.fTemp);
                        humi.push(this.fHumidity);
                    });
                }
            }
            chartData = {
                times: time,
                temps: temp,
                humis: humi
            };
            setChart(chartData);
        });
    }

    function initLineAnal(value, time, name, unit) {
        var option = {
            tooltip: {
                trigger: 'axis'
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
                bottom: 8
            }],
            grid: {
                left: '13%',
                right: '11%',
                top: '20%',
                bottom: '28%'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: time,
            },
            yAxis: {
                type: 'value',
                scale: true,
                axisLabel: {
                    formatter: '{value}' + unit
                }
            },
            series: [{
                name: name,
                type: 'line',
                data: value,
                color: ["#2EC6C9"],
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
            }]
        };
        return option;
    }

    function setChart(chartData) {
        var option = initLineAnal(chartData.temps, chartData.times, "温度", "°C");
        var option2 = initLineAnal(chartData.humis, chartData.times, "湿度", "%");
        var myChart = echarts.init($("#tempChart").get(0));
        myChart.setOption(option);
        var myChart2 = echarts.init($("#humiChart").get(0));
        myChart2.setOption(option2);
    };

    $("#datePre").click(function() {
        var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
        var preDate = new Date(selectDate.getTime() - 24 * 60 * 60 * 1000);
        $("#date").val(preDate.getFullYear() + "-" + ((preDate.getMonth()) < 9 ? ("0" + (preDate.getMonth() + 1)) : (preDate.getMonth() + 1)) + "-" + (preDate.getDate() < 10 ? ("0" + preDate.getDate()) : (preDate.getDate())));
        getChartData();
    });

    $("#dateNext").click(function() {
        var d = new Date();
        var nowDate = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate());
        var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
        if (selectDate < nowDate) {
            var nextDate = new Date(selectDate.getTime() + 24 * 60 * 60 * 1000);
            $("#date").val(nextDate.getFullYear() + "-" + ((nextDate.getMonth()) < 9 ? ("0" + (nextDate.getMonth() + 1)) : (nextDate.getMonth() + 1)) + "-" + (nextDate.getDate() < 10 ? ("0" + nextDate.getDate()) : (nextDate.getDate())));
            getChartData();
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
        confirm: function(date) {
            var d = new Date(),
                d1 = new Date(date.replace(/\-/g, "\/")),
                d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()); //如果非'YYYY-MM-DD'格式，需要另做调整
            if (d1 > d2) {
                return false;
            } else {
                $("#date").val(date);
                getChartData();
            }
        }
    });
});
