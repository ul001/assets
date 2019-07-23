$(function () {
//    var baseUrlFromAPP = "http://116.236.149.162:8090/SubstationWEBV2";
//    var tokenFromAPP = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjQxNDMxODksInVzZXJuYW1lIjoiYWRtaW4ifQ.t7BbigTS38rYbKXSNWSu2ggIbuLn9nAEneQv_Gkze44";
//    var subidFromAPP = 10100001;
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

    //页面初始化加载当日数据

    var startDate = tool.initDate("first", new Date());
    var endDate = tool.initDate("YMD", new Date());

    $(".startDate").val(startDate);
    $(".endDate").val(endDate);

    initNetData(); //初始化

    function initNetData() {
        var showMon = tool.initDate("YM", new Date());
        $("#showTime").html(showMon);
        networkData('sum');
    }

    //切换按钮
    // $("#selectType").change(function () {
    //     var select = $("#selectType").get(0);
    //     var type = select.options[select.selectedIndex].value; //获取被选中option的value
    //     networkData(type);
    // })
    $(document).on('click', '.ListH .btn', function () {
        var obj = $(this);
        $(this).addClass('select').siblings("button").removeClass('select');
        var selectParam = $(this).val();
        // var type = selectParam == "按电量" ? "sum" : "price";
        networkData(selectParam);

    });

    //网络请求 type：sum电量 price电费
    function networkData(type) {
        // $(".startDate").val(startDate);
        // $(".endDate").val(endDate);
        //开始时间不能大于截止时间
        var nowDate = tool.initDate("YMDhm", new Date());
        if (startDate > endDate) {
            alert("开始时间不能大于结束时间，请选择正确的查询时间！");
            return;
        } else if (endDate > nowDate) {
            alert("结束时间不能大于当前时间，请选择正确的查询时间！");
            return;
        } else {
            $("#startDate").html(startDate);
            $("#endDate").html(endDate);
        }
        startDate = $("#dateStart").val();
        endDate = $("#dateEnd").val();

        var url = baseUrlFromAPP + "/main/getMothJFPG";
        var params = {
            fSubid: subidFromAPP,
            startTime: startDate,
            endTime: endDate
        }
        getData(url, params, function (data) {
            showChartBar(data, type);
        });
    }

    function getData(url, params, successCallback) {
        var token = tokenFromAPP;
        $.ajax({
            type: 'GET',
            url: url,
            data: params,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", token)
            },
            success: function (result) {
                successCallback(result.data);
            }
        })
    }

    //图表赋值初始化
    function showChartBar(data, type) {
        var time = [];
        var jian = [];
        var feng = [];
        var ping = [];
        var gu = [];
        var jPrice = [];
        var fPrice = [];
        var pPrice = [];
        var gPrice = [];
        var jBar = 0,
            fBar = 0,
            pBar = 0,
            gBar = 0;
        var jpBar = 0,
            fpBar = 0,
            ppBar = 0,
            gpBar = 0;
        var bar = [];
        var priceBar = [];
        var startYear = new Date().getFullYear();
        var startMon = new Date().getMonth() + 1;
        var monthDay = new Date(startYear, startMon, 0);
        var days = monthDay.getDate(); //获取开始日期当月天数
        if (startMon < 10) {
            startMon = '0' + startMon;
        }
        // for (var i = 1; i <= days; i++) {
        //     if (i < 10) {
        //         var day = '0' + i;
        //     } else {
        //         var day = i;
        //     }
        //     var t = startMon + "-" + day;
        //     time.push(t);
        //     jian.push(null);
        //     feng.push(null);
        //     ping.push(null);
        //     gu.push(null);
        //     jPrice.push(null);
        //     fPrice.push(null);
        //     pPrice.push(null);
        //     gPrice.push(null);
        // }
        $(data).each(function () {
            time.push(this.f_Date.substring(5));
            jian.push(null);
            feng.push(null);
            ping.push(null);
            gu.push(null);
            jPrice.push(null);
            fPrice.push(null);
            pPrice.push(null);
            gPrice.push(null);
        });
        $.each(data, function (key, val) {
            var t = val.f_Date.substring(5);
            for (var j = 0; j < time.length; j++) {
                if (time[j] == t) {
                    if (val.f_EpiJDayValue != undefined) {
                        jBar += parseFloat(val.f_EpiJDayValue);
                    }
                    if (val.f_EpiFDayValue != undefined) {
                        fBar += parseFloat(val.f_EpiFDayValue);
                    }
                    if (val.f_EpiPDayValue != undefined) {
                        pBar += parseFloat(val.f_EpiPDayValue);
                    }
                    if (val.f_EpiGDayValue != undefined) {
                        gBar += parseFloat(val.f_EpiGDayValue);
                    }
                    if (val.jSum != undefined) {
                        jpBar += parseFloat(val.jSum);
                    }
                    if (val.fSum != undefined) {
                        fpBar += parseFloat(val.fSum);
                    }
                    if (val.pSum != undefined) {
                        ppBar += parseFloat(val.pSum);
                    }
                    if (val.gSum != undefined) {
                        gpBar += parseFloat(val.gSum);
                    }

                    jian[j] = parseFloat(val.f_EpiJDayValue).toFixed(2);
                    feng[j] = parseFloat(val.f_EpiFDayValue).toFixed(2);
                    ping[j] = parseFloat(val.f_EpiPDayValue).toFixed(2);
                    gu[j] = parseFloat(val.f_EpiGDayValue).toFixed(2);
                    jPrice[j] = parseFloat(val.jSum).toFixed(2);
                    fPrice[j] = parseFloat(val.fSum).toFixed(2);
                    pPrice[j] = parseFloat(val.pSum).toFixed(2);
                    gPrice[j] = parseFloat(val.gSum).toFixed(2);
                }
            }
        });
        bar.push({
            value: jBar.toFixed(0),
            name: '尖'
        }, {
            value: fBar.toFixed(0),
            name: '峰'
        }, {
            value: pBar.toFixed(0),
            name: '平'
        }, {
            value: gBar.toFixed(0),
            name: '谷'
        });
        priceBar.push({
            value: jpBar.toFixed(0),
            name: '尖'
        }, {
            value: fpBar.toFixed(0),
            name: '峰'
        }, {
            value: ppBar.toFixed(0),
            name: '平'
        }, {
            value: gpBar.toFixed(0),
            name: '谷'
        });

        if (type == 'sum') {
            var sum = (fBar + pBar + gBar).toFixed(0);
            initBar($("#lineChart"), time, jian, feng, ping, gu, bar, sum, 'kW.h');
            // initPie($("#lineChart"), time, jian, feng, ping, gu, bar, sum, 'kW.h');
        }
        if (type == 'price') {
            var sum = (fpBar + ppBar + gpBar).toFixed(0);
            initBar($("#lineChart"), time, jPrice, fPrice, pPrice, gPrice, priceBar, sum, '元');
            // initPie($("#lineChart"), time, jPrice, fPrice, pPrice, gPrice, priceBar, sum, '元');
        }
    }

    //绘图
    function initBar($container, time, j, f, p, g, barData, sum, y) {
        var bar = echarts.init(document.getElementById('chartDosage'));
        var option = {
            title: [{
                text: '当月占比环形图',
                subtext: '总计：' + sum + y,
                textStyle: {
                    fontWeight: 'small'
                },
                textAlign: 'center',
                right: '-10%',
                top: 10
            }],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['尖', '峰', '平', '谷'],
                bottom: 50
            },
            grid: {
                top: '51%',
                left: '13%',
                right: '5%',
                bottom: '20%'
            },
            xAxis: {
                type: 'category',
                data: time
            },
            yAxis: {
                name: y,
                type: 'value'
            },
            toolbox: {
                left: 'right',
                top: '45%',
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    dataView: {readOnly: true},
                    restore: {}
                }
            },
            dataZoom: [{
                startValue: time[0]
            }, {
                type: 'inside'
            }],
            series: [{
                    name: '尖',
                    type: 'bar',
                    stack: '用电量',
                    label: {
                        normal: {
                            show: false,
                            position: 'insideRight'
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#c23531'
                        }
                    },
                    data: j
                },
                {
                    name: '峰',
                    type: 'bar',
                    stack: '用电量',
                    label: {
                        normal: {
                            show: false,
                            position: 'insideRight'
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#F36757'
                        }
                    },
                    data: f
                },
                {
                    name: '平',
                    type: 'bar',
                    stack: '用电量',
                    label: {
                        normal: {
                            show: false,
                            position: 'insideRight'
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#2EC3D9'
                        }
                    },
                    data: p
                },
                {
                    name: '谷',
                    type: 'bar',
                    stack: '用电量',
                    label: {
                        normal: {
                            show: false,
                            position: 'insideRight'
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#92D401'
                        }
                    },
                    data: g
                },
                {
                    name: "当月占比",
                    type: 'pie',
                    radius: ['20%', '45%'],
                    center: ['50%', '25%'],
                    label: {
                        normal: {
                            position: 'inner',
                            formatter: function (data) {
                                return data.name + '\n' + data.value + '\n' + '(' + data.percent.toFixed(1) + '%)';
                            }
                        }
                    },
                    color: ['#c23531', '#F36757', '#2EC3D9', '#92D401'],
                    data: barData
                }
            ]
        };
        bar.setOption(option);

    }

    //初始化时间插件

    new Rolldate({
        el: '#dateStart',
        format: 'YYYY-MM-DD',
        beginYear: 2000,
        endYear: 2100,
        value: startDate,
        confirm: function (date) {
            var showMon = tool.initDate("YM", new Date());
            $("#showTime").html(showMon);
            $(".startDate").val(date);
            // var select = $("#selectType").get(0);
            // var type = select.options[select.selectedIndex].value; //获取被选中option的value
            var selectParam = $(".btn.select").val();

            networkData(selectParam);


        }
    });

    new Rolldate({
        el: '#dateEnd',
        format: 'YYYY-MM-DD',
        beginYear: 2000,
        endYear: 2100,
        value: endDate,
        confirm: function (date) {
            var showMon = tool.initDate("YM", new Date());
            $("#showTime").html(showMon);
            $(".endDate").val(date);
            // var select = $("#selectType").get(0);
            // var type = select.options[select.selectedIndex].value; //获取被选中option的value
            var selectParam = $(".btn.select").val();

            networkData(selectParam);

        }
    });
});