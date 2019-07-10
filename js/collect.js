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
    //页面初始化加载当日数据
    var startDate = tool.initDate("YMDh", new Date()) + ":00";
    var endDate = tool.initDate("YMDh", new Date()) + ":00";

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

    $(document).on('click', '.elec-btn .btn', function () {
        if ($(this).hasClass('select')) {
            $(this).removeClass('select');
        } else {
            $(this).addClass('select');
        }
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
            alert("开始时间不能大于结束时间，请选择正确的查询时间！");
            return;
        } else if (endDate > nowDate) {
            alert("结束时间不能大于当前时间，请选择正确的查询时间！");
            return;
        } else {
            $("#startDate").html(startDate);
            $("#endDate").html(endDate);
        }
        var fCircuitid = currentSelectVode.merterId;
        // var time = $("#date").val();
        var url = baseUrlFromAPP + "/main/app/powerAnalysis/ConsumeEnergyReport";
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
                var str = strName + "<br>" + "[起始数值：" + this.fStartvalue + " 截止数值：" + this.fEndvalue +
                    " 差值：" + this.fConsumevalue + "]"
                var liDom = document.createElement("li");
                liDom.innerHTML = str;
                listDom.appendChild(liDom); //加在列表的后面,上拉加载
            });
        });
    }

    function getData(url, params, successCallback) {
        try {
            var token = tokenFromAPP;
            $.ajax({
                type: 'GET',
                url: url,
                data: params,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", token)
                },
                success: function (result) {
                    // mescroll.endSuccess(data.list.length);
                    successCallback(result.data);
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
        if (data.length > 0) {
            var sum = 0;
            var max = data[0].fParamvalue;
            var min = data[0].fParamvalue;
            var maxTime;
            var minTime;
            var type = data[0].fParamcode.substring(1);
            name.push(type);
            $.each(data, function (index, el) {
                time.push(el.fCollecttime.substring(11, 16));
                value.push(el.fParamvalue);
                if (el.fParamvalue > max) {
                    max = el.fParamvalue;
                    maxTime = el.fCollecttime.substring(0, 16)
                }
                if (el.fParamvalue < min) {
                    min = el.fParamvalue;
                    minTime = el.fCollecttime.substring(0, 16)
                }
                sum += el.fParamvalue;
            });
            var avg = (sum / data.length).toFixed(2);
            var tableData = [{
                "type": type,
                "max": max,
                "maxTime": maxTime,
                "min": min,
                "minTime": minTime,
                "avg": avg
            }];
            showTable(tableData);
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
                top: '8%',
                left: '8%',
                right: '3%',
                bottom: '12%',
            },
            xAxis: {
                type: 'category',
                data: time,
            },
            yAxis: {
                type: 'value',
                scale: true, //y轴自适应
            },
            calculable: true,
            series: [{
                name: name,
                data: value,
                type: 'line'
            }]
        };
        line.setOption(option);
        // $(window).bind("resize",function(event) {
        //   line.resize();
        // });
    }

    function showTable(data) {
        var columns = [{
                field: "type",
                title: "类型",
                align: "center"
            },
            {
                field: "max",
                title: "最大值",
                align: "center"
            },
            {
                field: "maxTime",
                title: "发生时间",
                align: "center"
            },
            {
                field: "min",
                title: "最小值",
                align: "center"
            },
            {
                field: "minTime",
                title: "发生时间",
                align: "center"
            },
            {
                field: "avg",
                title: "平均值",
                align: "center"
            },
        ]
        $("#tableContain").html("");
        $("#tableContain").html("<table id='table'></table>");
        $("#table").bootstrapTable({
            columns: columns,
            data: data,
        })
    }


    var time = tool.initDate("YMD", new Date());
    $("#date").val(time);

    new Rolldate({
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
    });
    //初始化时间插件

    new Rolldate({
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

    new Rolldate({
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

});