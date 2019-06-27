$(function () {
    var currentSelectVode = {}; //选中节点

    initFirstNode(); //初始化第一个回路
    function initFirstNode() {
        var url = "http://116.236.149.162:8090/SubstationWEBV2/main/getfCircuitidsList";
        var params = {
            fSubid: "10100001",
        }
        getData(url, params, function (data) {
            setListData(data);
            $("#search").click();
        });
    }

    $(document).on('click', '.elec-btn .btn', function () {
        var obj = $(this);
        $(this).addClass('select').siblings("button").removeClass('select');

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
        if (selectParam == "today") {
            time = $("#date").val();
        } else if (selectParam == "month") {
            time = $("#date").val().substring(0, 10);
        } else if (selectParam == "year") {
            time = $("#date").val().substring(0, 4);
        }
        var fCircuitid = currentSelectVode.merterId;

        var url = "http://116.236.149.162:8090/SubstationWEBV2/main/app/powerMonitoring/ElectricReport";
        var params = {
            fSubid: "10100001",
            fCircuitid: fCircuitid,
            time: time,
            // fPhase: selectParam,
            // EnergyKind: EnergyKind,
        }
        getData(url, params, function (data) {
            showCharts(data.circuitUIPQPfEpis);
        });
    })


    function getData(url, params, successCallback) {
        var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjE4MTI5MzEsInVzZXJuYW1lIjoiYWRtaW4ifQ.cuKoTES-GcXasOHnZM3mn_zBnAz7boVJApY7bctubTA";
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
        if (data.length > 0) {
            var sum = 0;
            var max = data[0].fIa;
            var min = data[0].fIa;
            var maxTime;
            var minTime;
            // var type = data[0].fParamcode.substring(1);
            // name.push(type);
            $.each(data, function (index, el) {
                time.push(el.fCollecttime.substring(11, 16));
                value.push(el.fIa);
                if (el.fIa > max) {
                    max = el.fIa;
                    maxTime = el.fCollecttime.substring(0, 16)
                }
                if (el.fIa < min) {
                    min = el.fIa;
                    minTime = el.fCollecttime.substring(0, 16)
                }
                sum += el.fIa;
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
});