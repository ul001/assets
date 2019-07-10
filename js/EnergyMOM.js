$(function () {
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
        if (selectParam == "today") {
            showtimeForElectSum = tool.initDate("YMD", new Date());
            $("#date").val(showtimeForElectSum);
            roll.config.format = "YYYY-MM-DD";
        } else if (selectParam == "month") {
            showtimeForElectSum = tool.initDate("YM", new Date());
            $("#date").val(showtimeForElectSum);
            roll.config.format = "YYYY-MM";
        } else if (selectParam == "year") {
            showtimeForElectSum = tool.initDate("Y", new Date());
            $("#date").val(showtimeForElectSum);
            roll.config.format = "YYYY";
        }
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
        } else if (selectParam == "month") {
            time = $("#date").val().substring(0, 7);
            typeDA = "M";
        } else if (selectParam == "year") {
            time = $("#date").val().substring(0, 4);
            typeDA = "Y";
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
            var tableData;

            $.each(data, function (index, el) {
                if (selectParam == "today") {
                    time.push("昨日");
                    time.push("当日");
                    // datatime = el.fTime.substring(11, 16);
                    // time.push(el.fTime.substring(11, 16));
                    // showName = "日环比";
                } else if (selectParam == "month") {
                    time.push("上月");
                    time.push("当月");
                    // datatime = el.fTime.substring(6, 10);
                    // time.push(el.fTime.substring(6, 10));
                    // showName = "月环比";
                } else if (selectParam == "year") {
                    time.push("去年");
                    time.push("今年");
                    // datatime = el.fTime.substring(2, 7);
                    // time.push(el.fTime.substring(2, 7));
                    // showName = "年环比";
                }
                value.push(el.fBeforevalue);
                value.push(el.fDvalue);
                addvalue = el.fMomvalue;
                chainRatio = (el.fDvalue - el.fBeforevalue) / el.fBeforevalue;
                // if (el.fValue > max) {
                //     max = el.fValue;
                //     maxTime = el.fTime.substring(0, 16)
                // }
                // if (el.fValue < min) {
                //     min = el.fValue;
                //     minTime = el.fTime.substring(0, 16)
                // }
                // sum += el.fValue;
                // var dic1 = {
                //     "showData": showName,
                //     "value": el.fValue,
                //     "time": datatime
                // };
                // var dic2 = {

                // };
                // tableData.push(dic1);
                // tableData.push(dic2);
            });
            // var avg = (sum / data.length).toFixed(2);
            // showTable(tableData);
        }

        var line = echarts.init(document.getElementById('chartContain'));
        var option = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: name,
            },
            grid: { // 控制图的大小，调整下面这些值就可以，
                top: '18%',
                left: '8%',
                right: '3%',
                bottom: '28%',
            },
            xAxis: {
                type: 'category',
                data: time,
            },
            yAxis: {
                type: 'value',
                scale: true, //y轴自适应
            },
            toolbox: {
                left: 'right',
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {},
                }
            },
            dataZoom: [{
                startValue: time[0]
            }, {
                type: 'inside'
            }],
            calculable: true,
            series: [{
                name: name,
                data: value,
                type: 'bar'
            }]
        };
        line.setOption(option);
        // $(window).bind("resize",function(event) {
        //   line.resize();
        // });
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