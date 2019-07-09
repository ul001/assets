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




    var info;
    var params = {
        fSubid:10100001,
        pageNo:1,
        pageSize:"",
        startDate:"2019-07-09 00:00:00",
        endDate:"2019-07-09 23:59:59"
    };
    var url = location.search;
    if (url.indexOf("?") != -1) {
        var string = url.substring(1);
        var array = string.split("&");
        $.each(array, function (index, val) {
            var row = val.split("=");
            params[row[0]] = row[1];
        });
    }

    tool.getDataByAjax("http://116.236.149.162:8090/SubstationWEBV2/main/getTempABCResultHistoryList", params, function (data) {
        info = data;
        showChart(data.list);
    });

    function showChart(data) {
        var time=[];
        var tempA=[];
        var tempB=[];
        var tempC=[];
        if(data.length>0){
            $.each(data,function (index,val) {
                time.push(val.f_CollectTime.substring(11,16));
                tempA.push(val.f_TempA);
                tempB.push(val.f_TempB);
                tempC.push(val.f_TempC);
            })
        }
        var option = {
            tooltip : {
                trigger : 'axis'
            },
            legend : {
                data : ['温度A','温度B','温度C']
            },
            grid:{
                left:'5%',
                right:'3%',
                top:'5%',
                bottom:'8%'
            },
            toolbox : {
                show : true,
                feature : {
                    saveAsImage:{
                        type:'png',
                        show:true,
                        title:'保存为图片'
                    },
                    magicType : {
                        show : true,
                        type : [ 'line', 'bar' ]
                    },
                    restore : {
                        show : true
                    }
                }
            },
            calculable : true,
            xAxis : [ {
                data :time
            }],
            yAxis : [ {
                type:'value',
                scale:true,
            } ],
            series : [ {
                name : '温度A',
                type : 'line',
                data : tempA
            }, {
                name : '温度B',
                type : 'line',
                data : tempB
            },{
                name : '温度C',
                type : 'line',
                data : tempC
            } ]
        };
        $("#contain").html("");
        $("#contain").removeAttr('_echarts_instance_');
        myChart = echarts.init($("#contain").get(0),'macarons');
        myChart.setOption(option);
    }

    function showTable(data){
        var tableData=[];
        if(data.length>0){
            $.each(data,function (index,val) {
                var row ={};
                row.time = val.f_CollectTime.substring(11,16);
                row.tempA = val.f_TempA;
                row.tempB = val.f_TempB;
                row.tempC = val.f_TempC;
                tableData.push(row);
            })
        }
        var columns = [
            [{field : 'time', title : '采集时间', valign:'middle', align : 'center', rowspan : 2},
                {title : '温度(℃)', valign : "middle", align : 'center', colspan : 3}],
            [{field : 'tempA', title : 'A', valign : "middle", align : 'center'},
                {field : 'tempB', title : 'B', valign : "middle", align : 'center'},
                {field : 'tempC', title : 'C', valign : "middle", align : 'center'}]
        ];
        $("#contain").html("");
        $("#contain").html("<table id='table'></table>");
        var height = $("#contain").height();
        $("#table").bootstrapTable({
            columns: columns,
            data: tableData,
            height:height
        })
    }

    $("#showTable").click(function () {
        showTable(info.list);
    });

    $("#showChart").click(function () {
        showChart(info.list);
    });

    $("#return").click(function () {
        location.href = "cableTemperature.html";
    })


});