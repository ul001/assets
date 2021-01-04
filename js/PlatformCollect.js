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
    var currentSelectVode = {}; //选中节点
    var SelectVode = {}; //选中机构节点
    //页面初始化加载当日数据
    var startDate = tool.initDate("YMD", new Date()) + " 00:00";
    var endDate = tool.initDate("YMDh", new Date()) + ":00";
    let toast = new ToastClass();
    $(".startDate").val(startDate);
    $(".endDate").val(endDate);

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

    //组织机构tree
    function setPlatformListData(data) {
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

    getUserInfo(); //初始化第一个回路
    var isClick = 0;

    function initFirstNode() {
        var url = mainBaseUrl + "/calc/getCalcItemTree";
        var params = {
            fCalcid: $("#customType").val()
        }
        getData(url, params, function (data) {
            setListData(data.tree);
            $("#search").click();
        });
    }

    $("#CircuitidsList").click(function () {
        var search = $("#CircuitidsInput").val();
        var url = mainBaseUrl + "/calc/getCalcItemTree";
        var params = {
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
                fCalcid: $("#customType").val(),
            }
            getData(url, params, function (data) {
                setListData(data.tree);
            });
            isClick = 0;
        }
    });

    $(document).on('click', '.elec-btn .btn', function () {
        if ($(this).hasClass('select')) {
            $(this).removeClass('select');
        } else {
            $(this).addClass('select');
        }
    });

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
    });

    $("#electric").click(function () {
        $(".category").show();
    });

    $("#PlatformsideClick").click(function () {
        $(".PlatformTree").show();
        $("html,body").addClass("ban_body");
    });

    $("#Platformconfirm").click(function () {
        $(".PlatformTree").hide();
        $("html,body").removeClass("ban_body");
        $("#Platformmeter").html(SelectVode.merterName);
        coaccountno = SelectVode.merterId;
        getSelectOption();
        // searchGetData();
    });
    $(document).on('click', '#search', function () {
        // var EnergyKind = $("#EnergyKind").attr('value');
        // var selectParam = $(".btn.select").attr('value');
        // if (EnergyKind == "fFr") {
        //     selectParam = ""
        // }
        //开始时间不能大于截止时间
        var nowDate = tool.initDate("YMDhm", new Date());
        startDate = $("#dateStart").val();
        endDate = $("#dateEnd").val();
        if (startDate > endDate) {
            toast.show({
                text: Operation['ui_dateselecttip'] + "！",
                duration: 2000
            });
            return;
        } else if (endDate > nowDate) {
            toast.show({
                text: Operation['ui_dateselecttip'] + "！",
                duration: 2000
            });
            return;
        } else {
            $("#dateStart").html(startDate);
            $("#dateEnd").html(endDate);
        }
        var fCircuitid = currentSelectVode.merterId;
        // var time = $("#date").val();
        var url = mainBaseUrl + "/calc/getPlatCustomCollect";
        var params = {
            // fSubid: subidFromAPP,
            // fCircuitids: fCircuitid,
            startTime: startDate + ":00",
            endTime: endDate + ":00",
            itemIds: fCircuitid,
            // time: time,
            // fPhase: selectParam,
            // EnergyKind: EnergyKind,
        }
        getDataByPost(url, params, function (data) {
            // showCharts(data.CircuitValueByDate);
            setListWithData(data);
        });
    })

    /*设置列表数据*/
    function setListWithData(data) {
        var listDom = document.getElementById("listUl");
        listDom.innerHTML = '';
        $(data).each(function (index, value) {
            var strName = this.F_ItemName;
            // $(data[index].origEnergyValues).each(function () {
            var startStr = "-";
            var endStr = "-";
            var consumeStr = "-";
            var ConsumeRateValue = "-";
            if (this.hasOwnProperty("StartValue")) {
                startStr = this.StartValue;
            }
            if (this.hasOwnProperty("EndValue")) {
                endStr = this.EndValue;
            }
            if (this.hasOwnProperty("ConsumeValue")) {
                consumeStr = this.ConsumeValue;
            }
            if (this.hasOwnProperty("ConsumeRateValue")) {
                ConsumeRateValue = this.ConsumeRateValue;
            }
            var str = "<div class=\"contain\">\n" +
                "        <h1>" + strName + "</h1>\n" +
                "        <div class=\"type\">\n" +
                "            <img src=\"image/start.png\"/>\n" +
                "            <p class=\"list1\">" + Operation['ui_startval'] + "</p>\n" +
                "            <p>" + startStr + "</p>\n" +
                "        </div>\n" +
                "        <div class=\"type\">\n" +
                "            <img src=\"image/stop.png\"/>\n" +
                "            <p class=\"list1\">" + Operation['ui_endval'] + "</p>\n" +
                "            <p>" + endStr + "</p>\n" +
                "        </div>\n" +
                "        <div class=\"type\">\n" +
                "            <img src=\"image/between.png\"/>\n" +
                "            <p class=\"list1\">" + Operation['ui_minusval'] + "</p>\n" +
                "            <p>" + consumeStr + "</p>\n" +
                "        </div>\n" +
                "        <div class=\"type\">\n" +
                "            <img src=\"image/between.png\"/>\n" +
                "            <p class=\"list1\">" + Operation['ui_rateminusval'] + "</p>\n" +
                "            <p>" + ConsumeRateValue + "</p>\n" +
                "        </div>\n" +
                "    </div>";
            var liDom = document.createElement("li");
            liDom.innerHTML = str;
            listDom.appendChild(liDom); //加在列表的后面,上拉加载
            // });
        });
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

    function getData(url, params, successCallback) {
        try {
            var token = tokenFromAPP;
            toast.show({
                text: Operation['ui_loading'],
                loading: true
            });
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
                    // mescroll.endSuccess(data.list.length);
                    successCallback(result.data);
                },
                error: function () {
                    toast.show({
                        text: Operation['code_fail'],
                        duration: 2000
                    });
                }
            })
        } catch (e) {
            //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
            // mescroll.endErr();


            errorCallback && errorCallback();
        }

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

    var time = tool.initDate("YMD", new Date());
    $("#date").val(time);

    /*    new Rolldate({
            el: '#date',
            format: 'YYYY-MM-DD',
            beginYear: 2000,
            endYear: 2100,
            value: time,
            // confirm: function(date) {
            //     var d = new Date(),
            //     d1 = new Date(date.replace(/\-/g, "\/")),
            //     d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()); //如果非'YYYY-MM-DD'格式，需要另做调整
            //     d3 = new Date($("#date").val().replace(/\-/g, "\/"));
            //     if (d1 > d2||d1<d3) {
            //         return false;
            //     };
            // }
        });*/
    //初始化时间插件
    var calendar1 = new LCalendar();
    calendar1.init({
        'trigger': '#dateStart', //标签id
        'type': 'datetime', //date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
        'minDate': '2000-1-1', //最小日期 注意：该值会覆盖标签内定义的日期范围
        'maxDate': '2050-1-1' //最大日期 注意：该值会覆盖标签内定义的日期范围
    });

    var calendar2 = new LCalendar();
    calendar2.init({
        'trigger': '#dateEnd', //标签id
        'type': 'datetime', //date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
        'minDate': '2000-1-1', //最小日期 注意：该值会覆盖标签内定义的日期范围
        'maxDate': '2050-1-1' //最大日期 注意：该值会覆盖标签内定义的日期范围
    });

    //    var startRoll = new Rolldate({
    //        el: '#dateStart',
    //        format: 'YYYY-MM-DD hh:mm',
    //        beginYear: 2000,
    //        endYear: 2100,
    //        value: startDate,
    //        minStep: 5,
    //        // confirm: function (date) {
    //        //     var d = new Date(),
    //        //         d1 = new Date(date.replace(/\-/g, "\/")),
    //        //         d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()); //如果非'YYYY-MM-DD'格式，需要另做调整
    //        //     d3 = new Date($("#dateEnd").val().replace(/\-/g, "\/"));
    //        //     if (d1 > d2 || d3 < d1) {
    //        //         return false;
    //        //     };
    //        // }
    //    });
    //
    //    var endRoll = new Rolldate({
    //        el: '#dateEnd',
    //        format: 'YYYY-MM-DD hh:mm',
    //        beginYear: 2000,
    //        endYear: 2100,
    //        value: endDate,
    //        minStep: 5,
    //        // confirm: function (date) {
    //        //     var d = new Date(),
    //        //         d1 = new Date(date.replace(/\-/g, "\/")),
    //        //         d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()); //如果非'YYYY-MM-DD'格式，需要另做调整
    //        //     d3 = new Date($("#dateStart").val().replace(/\-/g, "\/"));
    //        //     if (d1 > d2 || d1 < d3) {
    //        //         return false;
    //        //     };
    //        // }
    //    });
    //
    //    $("#startDate").click(function () {
    //        startRoll.show();
    //    });
    //    $("#endDate").click(function () {
    //        endRoll.show();
    //    });

});