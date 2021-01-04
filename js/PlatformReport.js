$(function () {
    var baseUrlFromAPP = "http://116.236.149.165:8090/SubstationWEBV2/v5";
    var tokenFromAPP = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTAzMzE5MjMsInVzZXJuYW1lIjoibmFuYXlhIn0.hosLohg5Yt_XDmoWMD2dsIl8FMPTwF_6r8RdWXTSAj8";
    var subidFromAPP = 10100001;
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

    var mainBaseUrl = baseUrlFromAPP.split("SubstationWEBV2")[0] + "SubstationWEBV2";

    var optionData = [];
    var treeData = [];
    // 组织机构id
    var coaccountno = "";
    // 组织机构
    // http://116.236.149.165:8090/SubstationWEBV2/authority/getCompanyListBypId
    // .data arr
    //获取个人组织机构
    //http://116.236.149.165:8090/SubstationWEBV2/main/getUserInfo
    //.data dic
    // fApppicturename: "7d06ad9a5c954e99afd63d6b55686c7f.jpeg"
    // fCoName: "平台机构"
    // fCoaccountno: "1"
    // fHeadlogoname: ""
    // fLoginname: "admin"
    // fPicturename: "133bfa4826624d71b7707a0eb9012e4f.jpg"
    // fRoleid: "46"
    // fUserid: 1
    // f_PartnerLoginName: "0001"
    // f_State: "0"
    // userEmail: "1346622652@qq.com"
    // userName: "平台超管11"
    // userPhone: "15261866165"
    //http://116.236.149.165:8090/SubstationWEBV2/calc/getPlatListCalcbyuser?fSubid=-9999999&fCoaccountno=1
    //calcbyuserList: [{fCalcid: "-999999901", fSubid: -9999999, fCalcname: "平台测试报表", fCoaccountno: "4", fConame: "A代理商"},…]
    // http://116.236.149.165:8090/SubstationWEBV2/calc/getCalcItemTree?fCalcid=-999999901
    //tree: [{id: "-99999990101", text: "1234", fParentitemName: "无", nodes: []},…]

    function getUserInfo() {
        getData(mainBaseUrl + "/main/getUserInfo", {
            fSubid: subidFromAPP
        }, function (data) {
            coaccountno = data.fCoaccountno;
            $("#Platformmeter").html(data.fCoName);
            getCoaccList();
            getSelectOption();
        });
    }

    //获取组织机构
    function getCoaccList() {
        getData(baseUrlFromAPP + "/getCompanyTreeV5", {}, function (data) {
            if (data && data.length > 0) {
                setPlatformListData(data);
            }
        });
    }

    //获取select
    function getSelectOption() {
        getData(mainBaseUrl + "/calc/getPlatListCalcbyuser", {
            fSubid: "-9999999",
            fCoaccountno: coaccountno
        }, function (data) {
            optionData = data.calcbyuserList;
            // treeData = data.tree;
            $("#customType").empty();
            $(optionData).each(function (i, val) {
                $("#customType").append(`<option value="${val.fCalcid}">${val.fCalcname}</option>`);
            });
            $("#customType option:first").prop("selected", "selected");
            $("#customType").change(function () {
                initFirstNode();
            });
            initFirstNode();

            // searchGetData();
        });
    }

    var SelectVode = {}; //选中机构节点
    var currentSelectVode = {}; //选中节点

    let toast = new ToastClass();
    getUserInfo();
    var isClick = 0;

    //二层树
    function initFirstNode() {
        var url = mainBaseUrl + "/calc/getCalcItemTree";
        var params = {
            // fSubid: subidFromAPP,
            fCalcid: $("#customType").val(),
        }
        // $("body").showLoading();
        getData(url, params, function (data) {
            setListData(data.tree);

            searchGetData();
        });
    }

    $("#CircuitidsList").click(function () {
        var search = $("#CircuitidsInput").val();
        var url = mainBaseUrl + "/calc/getCalcItemTree";
        var params = {
            // fSubid: subidFromAPP,
            fCalcid: $("#customType").val(),
            search: search,
        }
        getData(url, params, function (data) {
            setListData(data.tree);

        });
        isClick = 1;
    });

    $(document).on('click', '.clear', function () {
        $("#CircuitidsInput").val("");
        if (isClick == 1) {
            var url = mainBaseUrl + "/calc/getCalcItemTree";
            var params = {
                // fSubid: subidFromAPP,
                fCalcid: $("#customType").val(),
            }
            getData(url, params, function (data) {
                setListData(data.tree);

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
            initDateInput("date");
            showtimeForElectSum = tool.initDate("YMD", new Date());
            $("#date").val(showtimeForElectSum);
        } else if (selectParam == "month") {
            initDateInput("ym");
            showtimeForElectSum = tool.initDate("YM", new Date());
            $("#date").val(showtimeForElectSum);
        } else if (selectParam == "year") {
            initDateInput("y");
            showtimeForElectSum = tool.initDate("Y", new Date());
            $("#date").val(showtimeForElectSum);
        }
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
        } else if (type == "year") {
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
        }
    }

    $("#sideClick").click(function () {
        $(".tree").show();
        $("html,body").addClass("ban_body");
    });

    $(".cancel").click(function () {
        $(".tree").hide();
        $(".PlatformTree").hide();
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

    //
    $("#PlatformsideClick").click(function () {
        $(".PlatformTree").show();
        $("html,body").addClass("ban_body");
    });

    $("#Platformconfirm").click(function () {
        $(".PlatformTree").hide();
        $("html,body").removeClass("ban_body");
        $("#Platformmeter").html(SelectVode.merterName);
        searchGetData();
    });

    // $(document).on('click', '#search', function () {
    //     var EnergyKind = $("#EnergyKind").attr('value');
    //     var selectParam = $(".btn.select").attr('value');
    //     if (EnergyKind == "fFr") {
    //         selectParam = ""
    //     }
    //     var time;
    //     var typeDA;
    //     if (selectParam == "today") {
    //         time = $("#date").val();
    //         typeDA = "D";
    //     } else if (selectParam == "month") {
    //         time = $("#date").val().substring(0, 7);
    //         typeDA = "M";
    //     } else if (selectParam == "year") {
    //         time = $("#date").val().substring(0, 4);
    //         typeDA = "Y";
    //     }
    //     var fCircuitid = currentSelectVode.merterId;

    //     var url = baseUrlFromAPP + "/powerAnalysis/EnergyReport";
    //     var params = {
    //         fSubid: subidFromAPP,
    //         fCircuitids: fCircuitid,
    //         time: time,
    //         DA: typeDA
    //         // fPhase: selectParam,
    //         // EnergyKind: EnergyKind,
    //     }
    //     getData(url, params, function (data) {
    //         showCharts(data.EnergyReport);
    //     });
    // })

    function getLastDay(year, month) {
        var new_year = year; //取当前的年份
        var new_month = month++; //取下一个月的第一天，方便计算（最后一天不固定）
        if (month > 12) {
            new_month -= 12; //月份减
            new_year++; //年份增
        }
        var new_date = new Date(new_year, new_month, 1); //取当年当月中的第一天
        return (new Date(new_date.getTime() - 1000 * 60 * 60 * 24)).getDate(); //获取当月最后一天日期
    }

    function searchGetData() {
        var selectParam = $(".btn.select").attr('value');
        var startTime;
        var endTime;
        var typeDA;
        if (selectParam == "today") {
            startTime = $("#date").val() + " 00:00:00";
            endTime = $("#date").val() + " 23:59:59";
            typeDA = "D";
        } else if (selectParam == "month") {
            startTime = $("#date").val().substring(0, 7) + "-01";
            //            endTime = $("#date").val().substring(0, 7)+"-31";
            var lastDay = getLastDay($("#date").val().substring(0, 4), $("#date").val().substring(5, 7));
            endTime = $("#date").val().substring(0, 7) + "-" + lastDay;
            typeDA = "M";
        } else if (selectParam == "year") {
            startTime = $("#date").val().substring(0, 4) + "-01-01";
            endTime = $("#date").val().substring(0, 4) + "-12-31";
            typeDA = "Y";
        }
        var fCircuitid = currentSelectVode.merterId;
        if (fCircuitid == undefined || fCircuitid == null || fCircuitid == "") {
            return;
        }
        var url = mainBaseUrl + "/calc/getCalcmeterDetailDataList";
        var params = {
            // fSubid: subidFromAPP,
            itemIds: fCircuitid,
            startTime: startTime,
            endTime: endTime,
            type: typeDA,
            fCalcid: $("#customType").val(),
            // fPhase: selectParam,
            // EnergyKind: EnergyKind,
        };
        getDataByPost(url, params, function (data) {
            // $("body").hideLoading();
            $("#chartContain").empty();
            $("#tableContain").empty();
            showCharts(data.calcmeterDetailList);
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
                    var ipAddress = strArr[0] + "//" + strArr[2];

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
                if (result.code != "200") {
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

    function getDataByPost(url, params, successCallback) {
        toast.show({
            text: Operation['ui_loading'],
            loading: true
        });
        var token = tokenFromAPP;
        $.ajax({
            type: 'POST',
            url: url,
            data: params,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", token)
            },
            success: function (result) {
                if (result.code == "5000") {
                    var strArr = baseUrlFromAPP.split("/");
                    var ipAddress = strArr[0] + "//" + strArr[2];

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
                if (result.code != "200") {
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
        try {
            $("#meter").empty();
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
            });
        } catch (e) {
            currentSelectVode.merterId = "";
        };
    }

    //组织机构tree
    function setPlatformListData(data) {
        // bindState: false
        // fAddress: "1"
        // fBindrole: 0
        // fBindtime: "2020-12-24 09:00:22"
        // fCoaccountno: "123"
        // fCode: "1-5"
        // fCompanylimittime: "2020-08-28 23:59:59"
        // fConame: "测试组织机构"
        // fCreditcode: ""
        // fPatentid: "1"
        // fYsappkey: "111"
        // fYsappsecret: ""
        // id: "123"
        // name: "测试组织机构"
        // pId: "1"
        try {
            $("#Platformmeter").empty();
            $('#platformtreeview').treeview({
                data: data,
                showIcon: true,
                showBorder: true,
                expandIcon: "glyphicon glyphicon-plus",
                collapseIcon: "glyphicon glyphicon-minus",
            });
            $('#platformtreeview').treeview('selectNode', 0);
            SelectVode.merterId = $('#platformtreeview').treeview('getSelected')[0].id;
            SelectVode.merterName = $('#platformtreeview').treeview('getSelected')[0].text;
            $("#Platformmeter").html(SelectVode.merterName);
            $('#platformtreeview').on('nodeSelected', function (event, node) {
                SelectVode.merterId = node.id;
                SelectVode.merterName = node.text;
            });
        } catch (e) {
            SelectVode.merterId = "";
        };
    }

    function showCharts(data) {
        var time = [];
        var value = [];
        var name = [];
        var tableData = [];
        if (data != undefined && data.length > 0) {
            var sum = 0;
            var max = data[0].fStarthour;
            var min = data[0].fStarthour;
            var maxTime = data[0].fStarthour.substring(0, 16);
            var minTime = data[0].fStarthour.substring(0, 16);
            var datatime;
            var circuitname = data[0].fCircuitname;
            name.push(circuitname);

            var selectParam = $(".btn.select").attr('value');
            var tableData;
            $.each(data, function (index, el) {
                if (el.fStarthour == "undefined" || el.fStarthour == null || el.fStarthour == "") {
                    return true;
                }
                if (selectParam == "today") {
                    datatime = el.fStarthour.substring(11, 16);
                    time.push(el.fStarthour.substring(11, 16));
                } else if (selectParam == "month") {
                    datatime = el.fStarthour.substring(5, 10);
                    time.push(el.fStarthour.substring(5, 10));
                } else if (selectParam == "year") {
                    datatime = el.fStarthour.substring(2, 7);
                    time.push(el.fStarthour.substring(2, 7));
                }
                value.push(el.fHourvalue);
                if (el.fHourvalue > max) {
                    max = el.fHourvalue;
                    maxTime = el.fStarthour.substring(0, 16);
                }
                if (el.fHourvalue < min) {
                    min = el.fHourvalue;
                    minTime = el.fStarthour.substring(0, 16);
                }
                sum += el.fHourvalue;
                var dic = {
                    "value": el.fHourvalue,
                    "time": datatime
                };
                tableData.push(dic);
            });
            var avg = (sum / data.length).toFixed(2);
            tableData.push({
                "value": sum.toFixed(2),
                "time": Operation['ui_summary']
            });
        }
        showTable(tableData);
        $('#chartContain').removeAttr("_echarts_instance_");
        var line = echarts.init($('#chartContain').get(0));
        var option = {
            tooltip: {
                trigger: 'axis'
            },
            /*            legend: {
                            data: name,
                        },*/
            grid: { // 控制图的大小，调整下面这些值就可以，
                top: '18%',
                left: '15%',
                right: '6%',
                bottom: '28%',
            },
            xAxis: {
                type: 'category',
                data: time,
            },
            yAxis: {
                name: 'kW·h',
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
                startValue: time[0]
            }, {
                type: 'inside'
            }],
            calculable: true,
            series: [{
                name: name,
                data: value,
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: '#64BC78',
                    }
                }
            }]
        };
        line.clear();
        line.setOption(option, true);
        // $(window).bind("resize",function(event) {
        //   line.resize();
        // });
    }

    function showTable(data) {
        var selectParam = $(".btn.select").attr('value');
        var showName = "";
        if (selectParam == "today") {
            showName = Operation['ui_dayreport'];
        } else if (selectParam == "month") {
            showName = Operation['ui_monthreport'];
        } else if (selectParam == "year") {
            showName = Operation['ui_yearreport'];
        }
        var columns = [{
                field: "time",
                title: showName,
                align: "center"
            },
            {
                field: "value",
                title: Operation['ui_elecval'] + "(" + Operation['ui_unit'] + "：kW·h)",
                align: "center"
            }
        ]
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
        'trigger': '#date', //标签id
        'type': 'date', //date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
        'minDate': '2000-1-1', //最小日期 注意：该值会覆盖标签内定义的日期范围
        'maxDate': '2050-1-1' //最大日期 注意：该值会覆盖标签内定义的日期范围
    });
    $("#date").val(showtimeForElectSum);
    $("#date").on("input", function () {
        searchGetData();
    });

    function initDateInput(type) {
        $("#date").remove();
        $("#datePre").after(`<input readonly type="text" id="date">`);
        calendar1 = new LCalendar();
        calendar1.init({
            'trigger': '#date', //标签id
            'type': type, //date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
            'minDate': '2000-1-1', //最小日期 注意：该值会覆盖标签内定义的日期范围
            'maxDate': '2050-1-1' //最大日期 注意：该值会覆盖标签内定义的日期范围
        });
        $("#date").on("input", function () {
            searchGetData();
        });
    }

});