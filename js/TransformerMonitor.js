$(function () {
   // var baseUrlFromAPP = "http://www.acrelcloud.cn/SubstationWEBV2/v3";
   // var tokenFromAPP = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NzU5Mzg3NTYsInVzZXJuYW1lIjoieG1weiJ9.pqP7RSasT_AJRwDQgkDBJXbtHurK2yYneU-zZb6Vv8k";
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

    let toast = new ToastClass();//实例化toast对象

    function upperJSONKey(jsonobj) {
      for (var key in jsonobj) {
        if (jsonobj[key.toUpperCase()] != jsonobj[key]) {
          jsonobj[key.toUpperCase()] = jsonobj[key];
          delete jsonobj[key];
        }
      }
      return jsonobj;
    }

    function getData(url, params, successCallback) {
        toast.show({text:'正在加载',loading: true});
        $.ajax({
            type: 'GET',
            url: url,
            data: params,
            headers: {
                Accept: "application/json; charset=utf-8",
                Authorization: tokenFromAPP
            },
            success: function (result) {
                toast.hide();
                successCallback(result.data);
            },
            error:function (){
                toast.show({text: '数据请求失败',duration: 2000});
            }
        });
    }

    getTransList();

    function getTransList(){
        var url = baseUrlFromAPP+"/powerMonitoring/transformerList";
        var params = {fSubid:subidFromAPP};
        getData(url,params,function(data){
            if(data.hasOwnProperty("TransformerList")){
                showTransNames(data.TransformerList);
            }
        });
    }

    function showTransNames(transList) {
        if(transList.length>0){
            $(".s-ctn").empty();
            $(transList).each(function(){
                $(".s-ctn").append("<div class='trans' value='"+this.fTransid+"'><img/><p>"+this.fTransname+"</p></div>");
            });
            $(".trans").click(function(){
                $(this).addClass("select").siblings().removeClass("select");
                getListData();
            });
            $(".trans:first").click();
        }
    }

    var info;
    var time = tool.initDate("YMD", new Date());
    $("#date").val(time);

    function getListData() {
        var url = baseUrlFromAPP + "/powerMonitoring/transformerStatus";
        var selectTrans = $(".trans.select").attr("value");
        var params = {
            fSubid: subidFromAPP,
            fTransid: selectTrans,
            selectParams: "Uab,Ubc,Uca,S,P,Q,Pf,Ia,Ib,Ic,TempA,TempB,TempC,MD,MDTimeStamp"
        };
        getData(url, params, function (data) {
            generateTransStatus(data);
            getDateCurveData();
        });
    }

    function getDateCurveData() {
        var url = baseUrlFromAPP + "/getCurveDataOfPowerAndTempABC";
        var selectTrans = $(".trans.select").attr("value");
        var params = {
            fTransid: selectTrans,
            fDate: $("#date").val()
        };
        getData(url, params, function (data) {
            info = data;
            generateChartLine(data);
        });
    }

    //配置变压器状态
    function generateTransStatus(data) {
        if (data.hasOwnProperty('TransformerStatus')){
            var transStatus = upperJSONKey(data.TransformerStatus);
            showTemperature(transStatus);
            showCurrent(transStatus);
            showPower(transStatus);
            showVoltage(transStatus);
        }
    }

    //显示温度数据
    function showTemperature(temp) {
        if (temp == null) {
            $(".AphaseTemp").html("--");
            $(".BphaseTemp").html("--");
            $(".CphaseTemp").html("--");
        } else {

            if (temp.TEMPA != null)
                $(".AphaseTemp").html(temp.TEMPA);
            else
                $(".AphaseTemp").html("--");

            if (temp.TEMPB != null)
                $(".BphaseTemp").html(temp.TEMPB);
            else
                $(".BphaseTemp").html("--");

            if (temp.TEMPC != null)
                $(".CphaseTemp").html(temp.TEMPC);
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
           var UStrA = voltage.UAB;
           if (UStrA != null){
               if(UStrA.substr(-2,2).toUpperCase()=="KV"){
                  $(".Uab").html(voltage.UAB);
                  $(".Ubc").html(voltage.UBC);
                  $(".Uca").html(voltage.UCA);
               }else{
                  var numa = UStrA.substring(0,UStrA.length-1);
                  if(numa>1000){
                     var numb = voltage.UBC.substring(0,voltage.UBC.length-1);
                     var numc = voltage.UCA.substring(0,voltage.UCA.length-1);
                     var unit = UStrA.substr(UStrA.length-1,1);
                     $(".Uab").html((numa/1000).toFixed(2)+unit);
                     $(".Ubc").html((numb/1000).toFixed(2)+unit);
                     $(".Uca").html((numc/1000).toFixed(2)+unit);
                  }else{
                     $(".Uab").html(voltage.UAB);
                     $(".Ubc").html(voltage.UBC);
                     $(".Uca").html(voltage.UCA);
                  }
               }
           }else{
               $(".Uab").html("--");
               $(".Ubc").html("--");
               $(".Uca").html("--");
           }
        }
    }

    //显示电流数据
    function showCurrent(current) {
        if (current == null) {
            $(".AphaseI").html("--");
            $(".BphaseI").html("--");
            $(".CphaseI").html("--");
        } else {

            if (current.IA != null)
                $(".AphaseI").html(current.IA);
            else
                $(".AphaseI").html("--");

            if (current.IB != null)
                $(".BphaseI").html(current.IB);
            else
                $(".BphaseI").html("--");

            if (current.IC != null)
                $(".CphaseI").html(current.IC);
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

            if (capacity.FINSTALLEDCAPACITY != null)
                $(".Ratedpower").html(capacity.FINSTALLEDCAPACITY + "kVA");
            else
                $(".Ratedpower").html("--");

            if (capacity.S != null)
                $(".AP").html(capacity.S);
            else
                $(".AP").html("--");

            if (capacity.LOADFACTOR != null)
                $(".LF").html((capacity.LOADFACTOR).toFixed(2) + "%");
            else
                $(".LF").html("--");

            if (capacity.P != null)
                $(".Fp").html(capacity.P);
            else
                $(".Fp").html("--");
            if (capacity.Q != null)
                $(".Fq").html(capacity.Q);
            else
                $(".Fq").html("--");
            if (capacity.PF != null)
                $(".Pf").html(capacity.PF);
            else
                $(".Pf").html("--");
            if (capacity.MD != null)
                $(".MaxD").html(capacity.MD);
            else
                $(".MaxD").html("--");
            if (capacity.MDTIMESTAMP != null) {
                var time = capacity.MDTIMESTAMP.substring(0, 16);
                $(".MDTime").html(time);
            } else {
                $(".MDTime").html("");
            }
        }
    }

    //配置图表
    function generateChartLine(dataObject) {

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

        if (dataObject.yesterdayPowerValue != null) {
            $.each(dataObject.yesterdayPowerValue, function (key, val) {
                times.push(val.fCollecttime.substring(11, 16))
            });
        }
        if (dataObject.PowerValue != null) {
            $.each(dataObject.PowerValue, function (key, val) {
                time.push(val.fCollecttime.substring(11, 16));
            });
        }
        var times = times.length > time.length ? times : time;

        for (var i = 0; i < times.length; i++) {
            var index = 0;
            for (var j = 0; j < dataObject.yesterdayPowerValue.length; j++) {
                if (dataObject.yesterdayPowerValue[j].fCollecttime.substring(11, 16) == times[i]) {
                    yesterDayfP.push(dataObject.yesterdayPowerValue[j].fP);
                    yesterDayfQ.push(dataObject.yesterdayPowerValue[j].fQ);
                    yesterDayfS.push(dataObject.yesterdayPowerValue[j].fS);
                    index = 1;
                }
            }
            if (index == 0) {
                yesterDayfP.push(null);
                yesterDayfQ.push(null);
                yesterDayfS.push(null);
            }
        }

        if (dataObject.PowerValue != null) {
            for (var i = 0; i < times.length; i++) {
                var index = 0;
                for (var j = 0; j < dataObject.PowerValue.length; j++) {
                    if (dataObject.PowerValue[j].fCollecttime.substring(11, 16) == times[i]) {
                        todayfP.push(dataObject.PowerValue[j].fP);
                        todayfQ.push(dataObject.PowerValue[j].fQ);
                        todayfS.push(dataObject.PowerValue[j].fS);
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


        if (!dataObject.hasOwnProperty('tempABC') || dataObject.tempABC != null) {
            $.each(dataObject.tempABC, function (key, val) {
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
        else if (type == "havePower") {
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
        else if (type == "NothingPower") {
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
        else if (type == "tempLine") {
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
        $(".chart").html('<div id="powerChart" class="showDIV"></div>');
        var line = echarts.init(document.getElementById('powerChart'));
        // var line = echarts.init($("#powerChart").get(0));
        var option = {
/*            title: {
                text: title,
                x: 'center'
            },*/
            color: ['#B6A2DE','#2EC7C9','#3CA4E4'],
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
                top: '16%',
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

    //点击有功、无功、视在的按钮
    $("#havePower").click(function () {
        $("#havePower").addClass("s-select").siblings('span').removeClass("s-select");
        getDateCurveData();
    });
    $("#NothingPower").click(function () {
        $("#NothingPower").addClass("s-select").siblings('span').removeClass("s-select");
        getDateCurveData();
    });
    $("#NowPower").click(function () {
        $("#NowPower").addClass("s-select").siblings('span').removeClass("s-select");
        getDateCurveData();
    });
    $("#tempLine").click(function () {
        $("#tempLine").addClass("s-select").siblings('span').removeClass("s-select");
        getDateCurveData();
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
