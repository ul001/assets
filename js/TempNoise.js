$(function () {
    var baseUrlFromAPP="http://116.236.149.165:8090/SubstationWEBV2/v5";
    var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODgyMjkwNTksInVzZXJuYW1lIjoiaGFoYWhhIn0.0rPtex1A_IXCvgvGqb6XNLBrZJaVJCl-lYPxbRJsxq0";
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

    function getData(url, params, successCallback) {
        toast.show({
            text: Operation['ui_loading'],
            loading: true
        });
        $.ajax({
            type: 'GET',
            url: url,
            data: params,
            headers: {
                Accept: "application/json; charset=utf-8",
                Authorization: tokenFromAPP
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

    var time = tool.initDate("YMD", new Date());
    $("#date").val(time);
    getListData();

    function getListData() {
        var url = baseUrlFromAPP + "/getNoise";
        var params = {
            fSubid: subidFromAPP
        };
        getData(url, params, function (data) {
            if (data.noiseList != null) {
                if (data.noiseList.length > 0) {
                    $("#cardList").empty();
                    $(data.noiseList).each(function () {
                        var noiseVal = "--";
                        if (this.noise != undefined && this.noise != null) {
                            noiseVal = parseFloat(this.noise).toFixed(1);
                        }
                        $("#cardList").append('<section class="sectionCard" value="' + this.f_MeterCode + '">' +
                            '<p>' + this.f_MeterName + '</p>' +
                            '<img src="image/noisepic.png"/>' +
                            '<p>'+Operation['ui_noise']+':' + noiseVal + this.noiseUnit + '</p></section>');
                    });
                    $("#cardList section:first").addClass("sectionSelect");
                    $(".sectionCard").on("click", function () {
                        $(this).addClass("sectionSelect").siblings().removeClass("sectionSelect");
//                        $("#date").val(time);
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
        var noise = [];
        var selectCode = $(".sectionSelect").attr('value');
        var url = baseUrlFromAPP + "/getNoise";
        var params = {
            fSubid: subidFromAPP,
            fMetercode: selectCode,
            time: $("#date").val()
        };
        getData(url, params, function (data) {
            if (data.FNoiseByDate != null) {
                if (data.FNoiseByDate.length > 0) {
                    $(data.FNoiseByDate).each(function () {
                        time.push(this.fCollecttime.substring(11, 16));
                        noise.push(this.fNoise);
                    });
                }
            }
            chartData = {
                times: time,
                noises: noise,
            };
            setChart(chartData);
        });
    }

    function initLineAnal(value, time, name, unit) {
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
                left: '12%',
                right: '12%',
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
                    formatter: '{value}'
                },
                name:unit,
            },
            series: [{
                name: name,
                type: 'line',
                data: value,
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
            }]
        };
        return option;
    }

    function setChart(chartData) {
        var option = initLineAnal(chartData.noises, chartData.times, Operation['ui_noise'], "dB");
        var myChart = echarts.init($("#noiseChart").get(0));
        myChart.setOption(option);
    };

    $("#datePre").click(function () {
        var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
        var preDate = new Date(selectDate.getTime() - 24 * 60 * 60 * 1000);
        $("#date").val(preDate.getFullYear() + "-" + ((preDate.getMonth()) < 9 ? ("0" + (preDate.getMonth() + 1)) : (preDate.getMonth() + 1)) + "-" + (preDate.getDate() < 10 ? ("0" + preDate.getDate()) : (preDate.getDate())));
        getChartData();
    });

    $("#dateNext").click(function () {
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
        confirm: function (date) {
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