$(function () {
    var baseUrlFromAPP="http://116.236.149.165:8090/SubstationWEBV2/v4";
    var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODMxMTc3MDUsInVzZXJuYW1lIjoiaGFoYWhhIn0.eBLPpUsNBliLuGWgRvdPwqbumKroYGUjNn7bTZIKSA4";
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
    //页面初始化加载当日数据
    var startDate = tool.initDate("YMD", new Date()) + " 00:00";
    var endDate = tool.initDate("YMDh", new Date()) + ":00";
    let toast = new ToastClass();
    $(".startDate").val(startDate);
    $(".endDate").val(endDate);

    //创建MeScroll对象
    // var mescroll = new MeScroll("mescroll", {
    //     down: {
    //         auto: false, //是否在初始化完毕之后自动执行下拉回调callback; 默认true
    //         callback: downCallback //下拉刷新的回调
    //     },
    //     up: {
    //         auto: true, //是否在初始化时以上拉加载的方式自动加载第一页数据; 默认false
    //         callback: upCallback, //上拉回调,此处可简写; 相当于 callback: function (page) { upCallback(page); }
    //         empty: {
    //             tip: "暂无相关数据", //提示
    //         },
    //         clearEmptyId: "listUl" //相当于同时设置了clearId和empty.warpId; 简化写法;默认null
    //     }
    // });

    initFirstNode(); //初始化第一个回路
    var isClick = 0;

    function initFirstNode() {
        var url = baseUrlFromAPP + "/getfCircuitidsList";
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
                text: Operation['ui_dateselecttip']+"！",
                duration: 2000
            });
            return;
        } else if (endDate > nowDate) {
            toast.show({
                text: Operation['ui_dateselecttip']+"！",
                duration: 2000
            });
            return;
        } else {
            $("#dateStart").html(startDate);
            $("#dateEnd").html(endDate);
        }
        var fCircuitid = currentSelectVode.merterId;
        // var time = $("#date").val();
        var url = baseUrlFromAPP + "/powerAnalysis/ConsumeEnergyReport";
        var params = {
            fSubid: subidFromAPP,
            fCircuitids: fCircuitid,
            startTime: startDate + ":00",
            endTime: endDate + ":00"
            // time: time,
            // fPhase: selectParam,
            // EnergyKind: EnergyKind,
        }
        getData(url, params, function (data) {
            // showCharts(data.CircuitValueByDate);
            setListWithData(data);
        });
    })

    /*设置列表数据*/
    function setListWithData(data) {
        var listDom = document.getElementById("listUl");
        listDom.innerHTML = '';
        $(data).each(function (index, value) {
            var strName = this.fCircuitname;
            $(data[index].origEnergyValues).each(function () {
                var startStr = "-";
                var endStr = "-";
                var consumeStr = "-";
                if (this.hasOwnProperty("fStartvalue")) {
                    startStr = this.fStartvalue;
                }
                if (this.hasOwnProperty("fEndvalue")) {
                    endStr = this.fEndvalue;
                }
                if (this.hasOwnProperty("fConsumevalue")) {
                    consumeStr = this.fConsumevalue;
                }
                var str = "<div class=\"contain\">\n" +
                    "        <h1>" + strName + "</h1>\n" +
                    "        <div class=\"type\">\n" +
                    "            <img src=\"image/start.png\"/>\n" +
                    "            <p class=\"list1\">"+Operation['ui_startval']+"</p>\n" +
                    "            <p>" + startStr + "</p>\n" +
                    "        </div>\n" +
                    "        <div class=\"type\">\n" +
                    "            <img src=\"image/stop.png\"/>\n" +
                    "            <p class=\"list1\">"+Operation['ui_endval']+"</p>\n" +
                    "            <p>" + endStr + "</p>\n" +
                    "        </div>\n" +
                    "        <div class=\"type\">\n" +
                    "            <img src=\"image/between.png\"/>\n" +
                    "            <p class=\"list1\">"+Operation['ui_minusval']+"</p>\n" +
                    "            <p>" + consumeStr + "</p>\n" +
                    "        </div>\n" +
                    "    </div>";
                var liDom = document.createElement("li");
                liDom.innerHTML = str;
                listDom.appendChild(liDom); //加在列表的后面,上拉加载
            });
        });
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

    var startRoll = new Rolldate({
        el: '#dateStart',
        format: 'YYYY-MM-DD hh:mm',
        beginYear: 2000,
        endYear: 2100,
        value: startDate,
        minStep: 5,
        // confirm: function (date) {
        //     var d = new Date(),
        //         d1 = new Date(date.replace(/\-/g, "\/")),
        //         d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()); //如果非'YYYY-MM-DD'格式，需要另做调整
        //     d3 = new Date($("#dateEnd").val().replace(/\-/g, "\/"));
        //     if (d1 > d2 || d3 < d1) {
        //         return false;
        //     };
        // }
    });

    var endRoll = new Rolldate({
        el: '#dateEnd',
        format: 'YYYY-MM-DD hh:mm',
        beginYear: 2000,
        endYear: 2100,
        value: endDate,
        minStep: 5,
        // confirm: function (date) {
        //     var d = new Date(),
        //         d1 = new Date(date.replace(/\-/g, "\/")),
        //         d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()); //如果非'YYYY-MM-DD'格式，需要另做调整
        //     d3 = new Date($("#dateStart").val().replace(/\-/g, "\/"));
        //     if (d1 > d2 || d1 < d3) {
        //         return false;
        //     };
        // }
    });

    $("#startDate").click(function () {
        startRoll.show();
    });
    $("#endDate").click(function () {
        endRoll.show();
    });

});