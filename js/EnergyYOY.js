$(function () {
    //    var baseUrlFromAPP="http://116.236.149.162:8090/SubstationWEBV2";
    //    var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjQxNDMxODksInVzZXJuYW1lIjoiYWRtaW4ifQ.t7BbigTS38rYbKXSNWSu2ggIbuLn9nAEneQv_Gkze44";
    //    var subidFromAPP=10100001;
    //iOS安卓基础传参
    var u = navigator.userAgent,
        app = navigator.appVersion;
    var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1; //安卓系统
    var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios系统
    //判断数组中是否包含某字符串
    var baseUrlFromAPP;
    var tokenFromAPP;
    var subidFromAPP;
    if (isIOS) {
        //ios系统的处理
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
    let toast = new ToastClass(); //实例化toast对象
    initFirstNode(); //初始化第一个回路
    var isClick = 0;

    function initFirstNode() {
        var url = baseUrlFromAPP + "/main/getfCircuitidsList";
        var params = {
            fSubid: subidFromAPP
        };

        getData(url, params, function (data) {
            setListData(data);
            getURLData();
            // $("#search").click();
        });
    }

    $("#CircuitidsList").click(function () {
        var search = $("#CircuitidsInput").val();
        var url = baseUrlFromAPP + "/main/getfCircuitidsList";
        var params = {
            fSubid: subidFromAPP,
            search: search
        };
        getData(url, params, function (data) {
            setListData(data);
        });
        isClick = 1;
    });

    $(document).on("click", ".clear", function () {
        $("#CircuitidsInput").val("");
        if (isClick == 1) {
            var url = baseUrlFromAPP + "/main/getfCircuitidsList";
            var params = {
                fSubid: subidFromAPP
            };
            getData(url, params, function (data) {
                setListData(data);
            });
            isClick = 0;
        }
    });

    //配置时间
    var showtimeForElectSum = tool.initDate("YMD", new Date());

    $(document).on("click", ".elec-btn .btn", function () {
        var obj = $(this);
        $(this)
            .addClass("select")
            .siblings("button")
            .removeClass("select");
        var selectParam = $(this).attr("value");
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
        getURLData();
    });

    $("#electric").click(function () {
        $(".category").show();
    });

    // $(document).on('click', '#search', function () {
    //     var EnergyKind = $("#EnergyKind").attr('value');
    //     var selectParam = $(".btn.select").attr('value');
    //     if (EnergyKind == "fFr") {
    //         selectParam = ""
    //     }
    // var time;
    // var typeDA;
    // if (selectParam == "today") {
    //     time = $("#date").val();
    //     typeDA = "D";
    // } else if (selectParam == "month") {
    //     time = $("#date").val().substring(0, 7);
    //     typeDA = "M";
    // } else if (selectParam == "year") {
    //     time = $("#date").val().substring(0, 4);
    //     typeDA = "Y";
    // }
    //
    function getURLData() {

        var fCircuitid = currentSelectVode.merterId;
        var url = baseUrlFromAPP + "/main/powerAnalysis/getMoM";
        var params = {
            fSubid: subidFromAPP,
            fCircuitid: fCircuitid
            // time: time,
            // DA: typeDA
            // fPhase: selectParam,
            // EnergyKind: EnergyKind,
        };
        getData(url, params, function (data) {

            showCharts(data.monthValueListUpToNow);
        });
    }

    function getData(url, params, successCallback) {
        toast.show({
            text: '正在加载',
            loading: true
        });
        var token = tokenFromAPP;
        $.ajax({
            type: "GET",
            url: url,
            data: params,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", token);
            },
            success: function (result) {
                toast.hide();
                successCallback(result.data);
            },
            error: function () {
                toast.show({
                    text: '数据请求失败',
                    duration: 2000
                });
            }
        });
    }

    function setListData(data) {
        $("#treeview").treeview({
            data: data,
            showIcon: true,
            showBorder: true,
            expandIcon: "glyphicon glyphicon-plus",
            collapseIcon: "glyphicon glyphicon-minus"
        });
        $("#treeview").treeview("selectNode", 0);
        currentSelectVode.merterId = $("#treeview").treeview("getSelected")[0].id;
        currentSelectVode.merterName = $("#treeview").treeview(
            "getSelected"
        )[0].text;
        $("#meter").html(currentSelectVode.merterName);
        $("#treeview").on("nodeSelected", function (event, node) {
            currentSelectVode.merterId = node.id;
            currentSelectVode.merterName = node.text;
        });
    }

    $(document).on("click", ".category li", function () {
        var type = $(this)
            .children("label")
            .attr("value");
        var text = $(this)
            .children("label")
            .text();
        generateType(type);
        $("#EnergyKind").attr("value", type);
        $("#param").html(text);
        $("#myModal").modal("hide");
    });

    function generateType(type) {
        var List = [{
                id: "P",
                name: "有功功率",
                phase: [{
                        id: "fPa",
                        name: "A相"
                    },
                    {
                        id: "fPb",
                        name: "B相"
                    },
                    {
                        id: "fPc",
                        name: "C相"
                    }
                ]
            },
            {
                id: "I",
                name: "电流",
                phase: [{
                        id: "fIa",
                        name: "A相"
                    },
                    {
                        id: "fIb",
                        name: "B相"
                    },
                    {
                        id: "fIc",
                        name: "C相"
                    }
                ]
            },
            {
                id: "U",
                name: "相电压",
                phase: [{
                        id: "fUa",
                        name: "A相"
                    },
                    {
                        id: "fUb",
                        name: "B相"
                    },
                    {
                        id: "fUc",
                        name: "C相"
                    }
                ]
            },
            {
                id: "UL",
                name: "线电压",
                phase: [{
                        id: "fUab",
                        name: "Uab"
                    },
                    {
                        id: "fUbc",
                        name: "Ubc"
                    },
                    {
                        id: "fUca",
                        name: "Uca"
                    }
                ]
            },
            {
                id: "fFr",
                name: "频率"
            },
            {
                id: "Q",
                name: "无功功率",
                phase: [{
                        id: "fQa",
                        name: "A相"
                    },
                    {
                        id: "fQb",
                        name: "B相"
                    },
                    {
                        id: "fQc",
                        name: "C相"
                    }
                ]
            },
            {
                id: "S",
                name: "视在功率",
                phase: [{
                        id: "fSa",
                        name: "A相"
                    },
                    {
                        id: "fSb",
                        name: "B相"
                    },
                    {
                        id: "fSc",
                        name: "C相"
                    }
                ]
            }
        ];
        var arr = $.grep(List, function (obj) {
            return obj.id == type;
        });
        $("#EnergyContain").html("");
        if (arr[0].hasOwnProperty("phase")) {
            $.each(arr[0].phase, function (index, val) {
                var string =
                    '<button type="button" class="btn" value="' +
                    val.id +
                    '">' +
                    val.name +
                    "</button>";
                $("#EnergyContain").append(string);
            });
            $("#EnergyContain button:first").addClass("select");
        }
    }

    function showCharts(data) {
        var nowtime = [];
        var nowvalue = [];
        var pertime = [];
        var pervalue = [];
        var name = [];
        var tableData = [];
        var showName;
        var timearr = [
            "1月",
            "2月",
            "3月",
            "4月",
            "5月",
            "6月",
            "7月",
            "8月",
            "9月",
            "10月",
            "11月",
            "12月"
        ];
        if (data.length > 0) {
            var thisYear = 0;
            var lastYear = 0;
            var datatime;
            var circuitname = data[0].fCircuitname;
            name.push(circuitname);
            var selectParam = $(".btn.select").attr("value");
            var tableData;


            $.each(data, function (index, el) {

                // nowtime.push(el.fDate);
                // var predate = new Date(el.fDate); //根据字符串获得日期
                // var prestr = predate.getFullYear() - 1;
                // pertime.push(prestr);
                if (el.fDayvalue != undefined && el.pervalue != undefined) {
                    nowvalue.push(el.fDayvalue);
                    pervalue.push(el.pervalue);
                    var monthlyComparison = ((el.fDayvalue - el.pervalue) / el.pervalue * 100).toFixed(2) + "%";
                    thisYear += el.fDayvalue;
                    lastYear += el.pervalue;
                    var monthlySumComparison = ((thisYear - lastYear) / lastYear * 100).toFixed(2) + "%";
                    var dic = {
                        dayvalue: el.fDayvalue,
                        pervalue: el.pervalue,
                        time: timearr[index],
                        monthlycomparison: monthlyComparison,
                        monthlysumcomparison: monthlySumComparison
                    };
                    tableData.push(dic);
                }
            });

            showTable(tableData);
        }

        var line = echarts.init(document.getElementById("chartContain"));

        var option = {
            color: ['#8aedd5', '#93bc9e', '#cef1db', '#7fe579', '#a6d7c2',
                '#bef0bb', '#99e2vb', '#94f8a8', '#7de5b8', '#4dfb70'
            ],

            // title: {
            //     textStyle: {
            //         fontWeight: 'normal',
            //         color: '#008acd'
            //     }
            // },
            // dataRange: {
            //     itemWidth: 15,
            //     color: ['#5ab1ef', '#e0ffff']
            // },

            tooltip: {
                backgroundColor: 'rgba(50,50,50,0.5)',
                axisPointer: { // 鍧愭爣杞存寚绀哄櫒锛屽潗鏍囪酱瑙﹀彂鏈夋晥
                    type: 'line', // 榛樿涓虹洿绾匡紝鍙�変负锛�'line' | 'shadow'
                    lineStyle: { // 鐩寸嚎鎸囩ず鍣ㄦ牱寮忚缃�
                        color: '#008acd'
                    },
                    crossStyle: {
                        color: '#008acd'
                    },
                    shadowStyle: { // 闃村奖鎸囩ず鍣ㄦ牱寮忚缃�
                        color: 'rgba(200,200,200,0.2)'
                    }
                },
                trigger: "axis"
            },
            legend: {
                data: ["本期", "同期"]
            },
            grid: {
                // 控制图的大小，调整下面这些值就可以，
                top: "18%",
                left: "15%",
                right: "3%",
                bottom: "29%",
                borderColor: '#eee'
            },
            xAxis: {
                type: "category",
                data: timearr
            },
            yAxis: {
                type: "value",
                scale: true //y轴自适应
            },
            toolbox: {
                color: ['#1e90ff', '#1e90ff', '#1e90ff', '#1e90ff'],
                effectiveColor: '#ff4500',
                top: -6,
                left: "right",
                feature: {
                    dataZoom: {
                        yAxisIndex: "none"
                    },
                    dataView: {
                        readOnly: true
                    },
                    restore: {}
                }
            },
            dataZoom: [{
                    startValue: timearr[0]
                },
                {
                    type: "inside"
                }
            ],
            calculable: true,
            series: [{
                    name: "本期",
                    data: nowvalue,
                    type: "bar"
                },
                {
                    name: "同期",
                    data: pervalue,
                    type: "bar"
                }
            ]
        };
        line.setOption(option);
        // $(window).bind("resize",function(event) {
        //   line.resize();
        // });
    }

    function showTable(data) {
        // var dic = {
        //     dayvalue: el.fDayvalue,
        //     pervalue: el.pervalue,
        //     time: timearr,
        //     monthlycomparison: monthlyComparison,
        //     monthlysumcomparison: monthlySumComparison
        // };
        var columns = [{
                field: "time",
                title: "月份",
                align: "center"
            },
            {
                field: "dayvalue",
                title: "本期",
                align: "center"
            },
            {
                field: "pervalue",
                title: "同期",
                align: "center"
            },
            {
                field: "monthlycomparison",
                title: "同比(%)",
                align: "center"
            },
            {
                field: "monthlysumcomparison",
                title: "累计同比(%)",
                align: "center"
            }
        ];
        $("#tableContain").html("");
        $("#tableContain").html("<table id='table'></table>");
        $("#table").bootstrapTable({
            columns: columns,
            data: data
        });
    }

    var roll = new Rolldate({
        el: "#date",
        format: showtimeForElectSum.format,
        beginYear: 2000,
        endYear: 2100,
        value: showtimeForElectSum
    });
});