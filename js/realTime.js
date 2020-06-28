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

    var currentSelectVode = {}; //选中节点

    let toast = new ToastClass();
    initFirstNode(); //初始化第一个回路
    var isClick = 0;

    function initFirstNode() {
        var url = baseUrlFromAPP + "/getfCircuitidsList";
        var params = {
            fSubid: subidFromAPP,
        }
        // $("body").showLoading();
        getData(url, params, function (data) {
            setListData(data);
            searchGetData();
            // $("#search").click();
        });
    }

    $("#CircuitidsList").click(function () {
        var search = $("#CircuitidsInput").val();
        var url = baseUrlFromAPP + "/getfCircuitidsList";
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
            var url = baseUrlFromAPP + "/getfCircuitidsList";
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
            initDateInput('date');
            showtimeForElectSum = tool.initDate("YMD", new Date());
            $("#date").val(showtimeForElectSum);
        } else if (selectParam == "month") {
            initDateInput('ym');
            showtimeForElectSum = tool.initDate("YM", new Date());
            $("#date").val(showtimeForElectSum);
        }/* else if (selectParam == "year") {
            showtimeForElectSum = tool.initDate("Y", new Date());
            $("#date").val(showtimeForElectSum);
            roll.config.format = "YYYY";
        }*/
        initQuick(selectParam);
        searchGetData();
        // $("#search").click();
    });
    //配置时间
    var selectReport = $(".elec-btn .select").attr('value');
    initQuick(selectReport);

    function initQuick(type) {
        $("#datePre").unbind("click");
        $("#dateNext").unbind("click");
        if (type == "today") {
            $("#datePre").click(function () {
                var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
                var preDate = new Date(selectDate.getTime() - 24 * 60 * 60 * 1000);
                $("#date").val(preDate.getFullYear() + "-" + ((preDate.getMonth()) < 9 ? ("0" + (preDate.getMonth() + 1)) : (preDate.getMonth() + 1)) + "-" + (preDate.getDate() < 10 ? ("0" + preDate.getDate()) : (preDate.getDate())));
                searchGetData();
            });
            $("#dateNext").click(function () {
                var d = new Date();
                var nowDate = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate());
                var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
                if (selectDate < nowDate) {
                    var nextDate = new Date(selectDate.getTime() + 24 * 60 * 60 * 1000);
                    $("#date").val(nextDate.getFullYear() + "-" + ((nextDate.getMonth()) < 9 ? ("0" + (nextDate.getMonth() + 1)) : (nextDate.getMonth() + 1)) + "-" + (nextDate.getDate() < 10 ? ("0" + nextDate.getDate()) : (nextDate.getDate())));
                    searchGetData();
                } else {
                    return;
                }
            });
        } else if (type == "month") {
            $("#datePre").click(function () {
                var selectDate = new Date(($("#date").val() + "-01").replace(/\-/g, "\/"));
                var preDate = new Date(selectDate.setMonth(selectDate.getMonth() - 1));
                $("#date").val(preDate.getFullYear() + "-" + ((preDate.getMonth()) < 9 ? ("0" + (preDate.getMonth() + 1)) : (preDate.getMonth() + 1)));
                searchGetData();
            });
            $("#dateNext").click(function () {
                var d = new Date();
                var nowDate = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + '01');
                var selectDate = new Date(($("#date").val() + "-01").replace(/\-/g, "\/"));
                if (selectDate < nowDate) {
                    var nextDate = new Date(selectDate.setMonth(selectDate.getMonth() + 1));
                    $("#date").val(nextDate.getFullYear() + "-" + ((nextDate.getMonth()) < 9 ? ("0" + (nextDate.getMonth() + 1)) : (nextDate.getMonth() + 1)));
                    searchGetData();
                } else {
                    return;
                }
            });
        }/* else if (type == "year") {
            $("#datePre").click(function () {
                var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
                var preDate = new Date(selectDate.setFullYear(selectDate.getFullYear() - 1));
                $("#date").val(preDate.getFullYear());
                searchGetData();
            });
            $("#dateNext").click(function () {
                var d = new Date();
                var nowDate = new Date((d.getFullYear() + "-01-01").replace(/\-/g, "\/"));
                var selectDate = new Date(($("#date").val() + "-01" + "-01").replace(/\-/g, "\/"));
                if (selectDate < nowDate) {
                    var nextDate = new Date(selectDate.setFullYear(selectDate.getFullYear() + 1));
                    $("#date").val(nextDate.getFullYear());
                    searchGetData();
                } else {
                    return;
                }
            });
        }*/
    }

    $("#sideClick").click(function () {
        $(".tree").show();
        $("html,body").addClass("ban_body");
    });

    $(".cancel").click(function () {
        $(".tree").hide();
        $("html,body").removeClass("ban_body");
    });

    $("#confirm").click(function () {
        $(".tree").hide();
        $("html,body").removeClass("ban_body");
        $("#meter").html(currentSelectVode.merterName);
        searchGetData();
    });

    $("#electric").click(function () {
        $(".category").show();
    });

    function searchGetData() {
        var selectParam = $(".btn.select").attr('value');
        var typeDA;
        var startTime;
        var endTime;
        var typeDA;
        if (selectParam == "today") {
            startTime = $("#date").val().substring(0,10)+" 00:00:00";
            endTime = $("#date").val().substring(0,10)+" 23:59:59";
            typeDA = "";
        } else if (selectParam == "month") {
            var selectDate = new Date(($("#date").val() + "-01").replace(/\-/g, "\/"));
            var nextMonth = new Date(selectDate.setMonth(selectDate.getMonth() + 1));
            var lastDate = new Date(nextMonth-(1000*60*60*24));
            startTime = $("#date").val()+ "-01 00:00:00";
            endTime = lastDate.getFullYear() + "-" + ((lastDate.getMonth()) < 9 ? ("0" + (lastDate.getMonth() + 1)) : (lastDate.getMonth() + 1)) + "-" + (lastDate.getDate() < 10 ? ("0" + lastDate.getDate()) : (lastDate.getDate()))+" 23:59:59";
            typeDA = "M";
        }
        var fCircuitid = currentSelectVode.merterId;

        var url = baseUrlFromAPP + "/getRealTimeMDList";
        var params = {
            fSubId: subidFromAPP,
            fCircuitId: fCircuitid,
            fStartTime:startTime,
            fEndTime:endTime,
        };
        if(typeDA!=""){
            params['fPeriod'] = typeDA;
        }
        getData(url, params, function (data) {
            showCharts(data.tRdMDList);
        });
    };

    function getData(url, params, successCallback) {
        toast.show({
            text: Operation['ui_loading'],
            loading: true
        });
        var token = tokenFromAPP;
        $.ajax({
            type: 'GET',
            url: url,
            data: params,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", token)
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
            error: function (data) {
                toast.show({
                    text: Operation['code_fail'],
                    duration: 2000
                });
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

    function showCharts(data) {
        var time = [];
        var value = [];
        var name = [];
        var tableData = [];
        if (data.length > 0) {
            var sum = 0;
            var max = data[0].fMdvalue;
            var min = data[0].fMdvalue;
            var maxTime = data[0].fCollecttime.substring(0, 16);
            var minTime = data[0].fCollecttime.substring(0, 16);
            var datatime;
            var circuitname = data[0].fCircuitname;
            name.push(circuitname);

            var selectParam = $(".btn.select").attr('value');
            $.each(data, function (index, el) {
                if (el.fCollecttime == "undefined" || el.fCollecttime == null || el.fCollecttime == "") {
                    return true;
                }
                value.push(el.fMdvalue);
                if (el.fMdvalue > max) {
                    max = el.fMdvalue;
                    maxTime = el.fCollecttime.substring(0, 16);
                }
                if (el.fMdvalue < min) {
                    min = el.fMdvalue;
                    minTime = el.fCollecttime.substring(0, 16);
                }
                if (selectParam == "today") {
                    datatime = el.fCollecttime.substring(11, 16);
                    time.push(el.fCollecttime.substring(11, 16));
                } else if (selectParam == "month") {
                    datatime = el.fCollecttime.substring(5, 10);
                    time.push(el.fCollecttime.substring(5, 10));
                }/* else if (selectParam == "year") {
                    datatime = el.fCollecttime.substring(2, 7);
                    time.push(el.fCollecttime.substring(2, 7));
                }*/
                sum += el.fMdvalue;
            });
            var avg = (sum / data.length).toFixed(2);
            if (selectParam == "today") {
                maxTime = maxTime.substring(11,16);
                minTime = minTime.substring(11,16);
            } else if (selectParam == "month") {
                maxTime = maxTime.substring(5,10);
                minTime = minTime.substring(5,10);
            }
            tableData.push({
                name: "需量(kW)",
                sum: sum.toFixed(2),
                avg: avg,
                max: max,
                maxTime: maxTime,
                min: min,
                minTime: minTime
            });
        }
        showTable(tableData);
        var line = echarts.init(document.getElementById('chartContain'));
        var option = {
            color: ['#2EC7C9','#B6A2DE','#3CA4E4','#FFB980'],
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                show:false
            },
            grid: { // 控制图的大小，调整下面这些值就可以，
                top: '20%',
                left: '40px',
                right: '38px',
                bottom: '28%',
            },
            xAxis: {
                type: 'category',
                data: time,
            },
            yAxis: {
                name: 'kW',
                type: 'value',
                scale: true, //y轴自适应
            },
            toolbox: {
                left: 'right',
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
            dataZoom: [{
                type: 'inside'
            },
            {
                type:'slider'
            }],
            series: [{
                name: name,
                data: value,
                type: 'line',
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
        line.setOption(option, true);
        // $(window).bind("resize",function(event) {
        //   line.resize();
        // });
    }

    function showTable(data) {
        var columns = [
            [{
                    field: "name",
                    title: Operation['ui_type'],
                    align: "center",
                    valign: "middle",
                    align: "center",
                    colspan: 1,
                    rowspan: 2
                },
                {
                    field: "maxVT",
                    title: Operation['ui_maxval'],
                    valign: "middle",
                    align: "center",
                    colspan: 2,
                    rowspan: 1
                },
                {
                    field: "minVT",
                    title: Operation['ui_minval'],
                    valign: "middle",
                    align: "center",
                    colspan: 2,
                    rowspan: 1
                },
                {
                    field: "avg",
                    title: Operation['ui_avgval'],
                    valign: "middle",
                    align: "center",
                    colspan: 1,
                    rowspan: 2
                }
            ],
            [{
                    field: "max",
                    title: Operation['ui_val'],
                    valign: "middle",
                    align: "center"
                },
                {
                    field: "maxTime",
                    title: Operation['ui_time'],
                    valign: "middle",
                    align: "center"
                },
                {
                    field: "min",
                    title: Operation['ui_val'],
                    valign: "middle",
                    align: "center"
                },
                {
                    field: "minTime",
                    title: Operation['ui_time'],
                    align: "center"
                }
            ]
        ];
        $("#tableContain").html("");
        $("#tableContain").html("<table id='table'></table>");
        $("#table").bootstrapTable({
            columns: columns,
            data: data,
        });
    }

    //初始化时间控件
    var calendar1 = new LCalendar();
    calendar1.init({
        'trigger': '#date',//标签id
        'type': 'date',//date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
        'minDate':'2000-1-1',//最小日期 注意：该值会覆盖标签内定义的日期范围
        'maxDate':'2050-1-1'//最大日期 注意：该值会覆盖标签内定义的日期范围
    });
    $("#date").val(showtimeForElectSum);
    $("#date").on("input",function(){
        searchGetData();
    });

    function initDateInput(type){
        $("#date").remove();
        $("#datePre").after(`<input readonly type="text" id="date">`);
        calendar1 = new LCalendar();
        calendar1.init({
            'trigger': '#date',//标签id
            'type': type,//date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
            'minDate':'2000-1-1',//最小日期 注意：该值会覆盖标签内定义的日期范围
            'maxDate':'2050-1-1'//最大日期 注意：该值会覆盖标签内定义的日期范围
        });
        $("#date").on("input",function(){
            searchGetData();
        });
    }

//    var roll = new Rolldate({
//        el: '#date',
//        format: showtimeForElectSum.format,
//        beginYear: 2000,
//        endYear: 2100,
//        value: showtimeForElectSum,
//        confirm: function (data) {
//            $("#date").val(data);
//            searchGetData();
//        }
//    });

});