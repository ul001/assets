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

    let toast = new ToastClass(); //实例化toast对象

    var currentSelectVode = {}; //选中节点
    initFirstNode(); //初始化第一个回路
    var isClick = 0;

    function initFirstNode() {
        var url = baseUrlFromAPP + "/getfCircuitidsList";
        var params = {
            fSubid: subidFromAPP,
        }
        getData(url, params, function (data) {
            setListData(data);
            $("#confirm").click();
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
        showData(currentSelectVode.merterId, $("#dateSelect").val());
    });

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
    };

    function getData(url, params, successCallback) {
        toast.show({
            text: Operation['ui_loading'],
            loading: true
        });
        $.ajax({
            type: 'GET',
            url: url,
            data: params,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", tokenFromAPP)
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
            error: function () {
                toast.show({
                    text: Operation['code_fail'],
                    duration: 2000
                });
            }
        })
    };

    //初始化时间控件
    var calendar1 = new LCalendar();
    calendar1.init({
        'trigger': '#dateSelect',//标签id
        'type': 'ym',//date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
        'minDate':'2000-1-1',//最小日期 注意：该值会覆盖标签内定义的日期范围
        'maxDate':'2050-1-1'//最大日期 注意：该值会覆盖标签内定义的日期范围
    });
    var date = new Date();
    $("#dateSelect").val(date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)));
    $("#dateSelect").on("input",function(){
        showData(currentSelectVode.merterId, $("#dateSelect").val());
    });
//    var roll = new Rolldate({
//        el: '#dateSelect',
//        format: 'YYYY-MM',
//        beginYear: 2000,
//        endYear: 2100,
//        confirm: function (date) {
//            var d = new Date(),
//                d1 = new Date(date.replace(/\-/g, "\/")),
//                d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/'); //如果非'YYYY-MM-DD'格式，需要另做调整
//            if (d1 > d2) {
//                return false;
//            } else {
//                showData(currentSelectVode.merterId, date);
//            }
//        }
//    });
//    $("#timeClick").click(function () {
//        roll.show();
//    });

    function showData(meterId, date) {
        var data = {
            fSubid: subidFromAPP,
            fCircuitid: meterId,
            timeStart: date + "-01 00:00:00",
            timeEnd: date + "-31 23:59:59"
        };
        toast.show({
            text: Operation['ui_loading'],
            loading: true
        });
        $.ajax({
            type: 'GET',
            url: baseUrlFromAPP + "/selectMaxMD",
            data: data,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", tokenFromAPP)
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
                if (result.data[0] != null) {
                    var myDate = result.data[0].f_MDMaxTime;
                    $(".max").html("<p>"+Operation['ui_monthmaxkw']+"</p><h1><span id='maxVal'>" + result.data[0].f_MDMaxValue + "</span><span>kW</span></h1>" +
                        "<p id='timeP'>" + myDate.slice(0, myDate.indexOf(".")) + "</p>");
                } else {
                    $(".max").html("<p></p><h1 id='noMatch'><span>"+Operation['ui_nodata']+"</span></h1><p id='timeP'></p>");
                }
            }
        });
    };
    /*function getCir(){
                var data={
                    fSubid:fSubid
                };
                $.ajax({
                    type:'GET',
                    url:baseUrl+"/getfCircuitidsList",
                    data:data,
                    beforeSend:function(request){
                        request.setRequestHeader("Authorization",token)
                    },
                    success:function(result){
                        getTreeCir(result.data);
                        getOption(array);
                        //console.log(array);
                    }
                });
    	}
    	var array=[];
    	function getTreeCir(json){
    	    $.each(json,function(key,value){
    	        array.push({id:value.id,text:value.text});
    	        if(value.hasOwnProperty("nodes")){
    	            if(value.nodes.length>0){
    	                getTreeCir(value.nodes);
    	            }
    	        }
    	    });
    	}
    	function getOption(arr){
    	    $("#selectCir").html("");
    	    $.each(arr,function(key,value){
    	        $("#selectCir").append("<option value='"+value.id+"'>"+value.text+"</option>");
    	    });
    	}*/
});
