$(function () {
//    var baseUrlFromAPP="http://116.236.149.162:8090/SubstationWEBV2";
//    var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjM1MzczMTAsInVzZXJuYW1lIjoiYWRtaW4ifQ.ty4m082uqMhF_j846hQ-dVCiYOdepOWdDIr7UiV9eTI";
//    var subidFromAPP=10100001;

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

    var currentSelectVode = {}; //选中节点


    initFirstNode(); //初始化第一个回路
    var isClick = 0;

    function initFirstNode() {
        var url = baseUrlFromAPP + "/main/getfCircuitidsList";
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
        var url = baseUrlFromAPP + "/main/getfCircuitidsList";
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
            var url = baseUrlFromAPP + "/main/getfCircuitidsList";
            var params = {
                fSubid: subidFromAPP,
            }
            getData(url, params, function (data) {
                setListData(data);
            });
            isClick = 0;
        }
    });

    //配置时间
    var showtimeForElectSum = tool.initDate("YMD", new Date());

    $(document).on('click', '.elec-btn .btn', function () {
        var obj = $(this);
        $(this).addClass('select').siblings("button").removeClass('select');
        var selectParam = $(this).attr('value');
        // if (selectParam == "today") {
        showtimeForElectSum = tool.initDate("YMD", new Date());
        $("#date").val(showtimeForElectSum);
        roll.config.format = "YYYY-MM-DD";
        // } else if (selectParam == "month") {
        //     showtimeForElectSum = tool.initDate("YM", new Date());
        //     $("#date").val(showtimeForElectSum);
        //     roll.config.format = "YYYY-MM";
        // } else if (selectParam == "year") {
        //     showtimeForElectSum = tool.initDate("Y", new Date());
        //     $("#date").val(showtimeForElectSum);
        //     roll.config.format = "YYYY";
        // }
        roll.value = showtimeForElectSum;
    });

    $("#sideClick").click(function () {
        $(".tree").show();
    });

    $(".cancel").click(function () {
        $(".tree").hide();
    });

    $("#confirm").click(function () {
        $(".tree").hide();
        $("#meter").html(currentSelectVode.merterName);
    });

    $("#electric").click(function () {
        $(".category").show();
    });


    $(document).on('click', '#search', function () {
        var EnergyKind = $("#EnergyKind").attr('value');
        var selectParam = $(".btn.select").attr('value');
        if (EnergyKind == "fFr") {
            selectParam = ""
        }
        var time;
        var typeDA;
        if (selectParam == "today") {
            time = $("#date").val();
            typeDA = "D";
        } else if (selectParam == "week") {
            time = $("#date").val();
            // time = $("#date").val().substring(0, 7);
            typeDA = "W";
        } else if (selectParam == "month") {
            time = $("#date").val();
            // time = $("#date").val().substring(0, 4);
            typeDA = "M";
        }
        var fCircuitid = currentSelectVode.merterId;

        var url = baseUrlFromAPP + "/main/energyReportMOM";
        var params = {
            fSubid: subidFromAPP,
            fCircuitids: fCircuitid,
            time: time,
            DA: typeDA
            // fPhase: selectParam,
            // EnergyKind: EnergyKind,
        }
        getData(url, params, function (data) {
            showCharts(data.EnergyReportDate);
        });
    })


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

    $(document).on("click", ".category li", function () {
        var type = $(this).children('label').attr("value");
        var text = $(this).children('label').text();
        generateType(type);
        $("#EnergyKind").attr("value", type);
        $("#param").html(text);
        $("#myModal").modal("hide");
    })

    function generateType(type) {
        var List = [{
                "id": "P",
                "name": "有功功率",
                "phase": [{
                    "id": "fPa",
                    "name": "A相"
                }, {
                    "id": "fPb",
                    "name": "B相"
                }, {
                    "id": "fPc",
                    "name": "C相"
                }]
            },
            {
                "id": "I",
                "name": "电流",
                "phase": [{
                    "id": "fIa",
                    "name": "A相"
                }, {
                    "id": "fIb",
                    "name": "B相"
                }, {
                    "id": "fIc",
                    "name": "C相"
                }]
            },
            {
                "id": "U",
                "name": "相电压",
                "phase": [{
                    "id": "fUa",
                    "name": "A相"
                }, {
                    "id": "fUb",
                    "name": "B相"
                }, {
                    "id": "fUc",
                    "name": "C相"
                }]
            },
            {
                "id": "UL",
                "name": "线电压",
                "phase": [{
                    "id": "fUab",
                    "name": "Uab"
                }, {
                    "id": "fUbc",
                    "name": "Ubc"
                }, {
                    "id": "fUca",
                    "name": "Uca"
                }]
            },
            {
                "id": "fFr",
                "name": "频率",
            },
            {
                "id": "Q",
                "name": "无功功率",
                "phase": [{
                    "id": "fQa",
                    "name": "A相"
                }, {
                    "id": "fQb",
                    "name": "B相"
                }, {
                    "id": "fQc",
                    "name": "C相"
                }]
            },
            {
                "id": "S",
                "name": "视在功率",
                "phase": [{
                    "id": "fSa",
                    "name": "A相"
                }, {
                    "id": "fSb",
                    "name": "B相"
                }, {
                    "id": "fSc",
                    "name": "C相"
                }]
            },
        ]
        var arr = $.grep(List, function (obj) {
            return obj.id == type;
        })
        $("#EnergyContain").html("");
        if (arr[0].hasOwnProperty('phase')) {
            $.each(arr[0].phase, function (index, val) {
                var string = '<button type="button" class="btn" value="' + val.id + '">' + val.name + '</button>';
                $("#EnergyContain").append(string);
            })
            $("#EnergyContain button:first").addClass('select');
        }
    }

    function showCharts(data) {
        var time = [];
        var value = [];
        var name = [];
        var tableData = [];
        var befValue = [];
        var nowValue = [];
        var addvalue;
        var chainRatio;
        var showName;
        if (data.length > 0) {
            var sum = 0;
            var max = data[0].fIa;
            var min = data[0].fIa;
            var maxTime;
            var minTime;
            var datatime;
            var circuitname = data[0].fCircuitname;
            name.push(circuitname);

            var selectParam = $(".btn.select").attr('value');
            var todayStr;
            var yesterdayStr;

            $.each(data, function (index, el) {
                if (selectParam == "today") {
                    time.push("昨日");
                    time.push("当日");
                    todayStr = "当日用电：";
                    yesterdayStr = "昨日用电：";

                } else if (selectParam == "month") {
                    time.push("上月");
                    time.push("当月");
                    todayStr = "当月用电：";
                    yesterdayStr = "上月用电：";

                } else if (selectParam == "week") {
                    time.push("上周");
                    time.push("本周");
                    todayStr = "本周用电：";
                    yesterdayStr = "上周用电：";
                }
                value.push(el.fBeforevalue);
                value.push(el.fNextvalue);
                befValue.push(el.fBeforevalue);
                nowValue.push(el.fNextvalue);
                addvalue = el.fDvalue;
//                chainRatio = (el.fDvalue - el.fBeforevalue) / el.fBeforevalue * 100;

                $("#todayElectconSump").html(todayStr+"<br/><span class='Num'>"+el.fNextvalue+"kW·h</span>");
                $("#yesterdayElectconSump").html(yesterdayStr+"<br/><span class='Num'>"+el.fBeforevalue+"kW·h</span>");
                $("#addValue").html(addvalue);
                $("#chainRatio").html(el.fMomvalue+"%");
            });

        }

        var line = echarts.init(document.getElementById('chartContain'));
        var option = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: time,
            },
            grid: { // 控制图的大小，调整下面这些值就可以，
                top: '18%',
                left: '11%',
                right: '6%',
                bottom: '20%',
            },
            yAxis: {
                type: 'category',
                data: name,
                axisLine: {
                    show: false
                },
                axisLabel: {
                    interval: 'auto',
                    rotate: 90
                    // show: false
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                scale: true, //y轴自适应
            },
            xAxis: {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
                // boundaryGap: [0, 0.01]
            },
            // toolbox: {
            //     left: 'right',
            //     feature: {
            //         dataZoom: {
            //             yAxisIndex: 'none'
            //         },
            //         restore: {},
            //     }
            // },
            // dataZoom: [{
            //     startValue: time[0]
            // }, {
            //     type: 'inside'
            // }],
            calculable: true,
            series: [{
                name: time[0],
                data: befValue,
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: 'orange',
                        // borderRadius: 5,
                        // label: {
                        //     show: true,
                        //     position: 'left',
                        //     formatter: '{b}'
                        // }
                    }
                },
            }, {
                name: time[1],
                data: nowValue,
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: 'green',
                        // borderRadius: 5,
                        // label: {
                        //     show: true,
                        //     position: 'left',
                        //     formatter: '{b}'
                        // }
                    }
                },
            }]
        };
        line.setOption(option);


    }

    function showTable(data) {
        var columns = [{
                field: "time",
                title: data[0].showData,
                align: "center"
            },
            {
                field: "value",
                title: "电量(单位：kW.h)",
                align: "center"
            }
        ]
        $("#tableContain").html("");
        $("#tableContain").html("<table id='table'></table>");
        $("#table").bootstrapTable({
            columns: columns,
            data: data,
        })
    }

    var roll = new Rolldate({
        el: '#date',
        format: showtimeForElectSum.format,
        beginYear: 2000,
        endYear: 2100,
        value: showtimeForElectSum,
    });

});