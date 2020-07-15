var baseUrlFromAPP="http://116.236.149.165:8090/SubstationWEBV2/v5";
var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1OTQ4NjAzNjgsInVzZXJuYW1lIjoiaGFoYWhhIn0.iMVkIYSprWvO_t_jt7eFVNzcIc9dvMu5_7oTK1nXYzc";
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
var mainBaseUrl = baseUrlFromAPP.split("SubstationWEBV2")[0]+"SubstationWEBV2";

let toast = new ToastClass();
var GatewayCommnunicateStatus = (function(){

	function _gatewayStatus(){

		this.getData = function(url,params){
            toast.show({
                text: Operation['ui_loading'],
                loading: true
            });
            var token = tokenFromAPP;
            $.ajax({
                type: 'GET',
                url: mainBaseUrl+url,
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
                    showTable(result.data);
                },
                error: function (data) {
                    toast.show({
                        text: Operation['code_fail'],
                        duration: 2000
                    });
                }
            });
		};

		function showTable(data){
			var columns=[
				{field:"gatewayId",title:Operation['ui_gate_id'],valign:'middle',align:'center'},
				{field:"Gatename",title:Operation['ui_gate_name'],valign:'middle',align:'center'},
				{field:"Gatetype",title:Operation['ui_gate_type'],valign:'middle',align:'center'},
				{field:"Lastuptime",title:Operation['ui_gate_uptime'],valign:'middle',align:'center'},
				{field:"fLastcollecttime",title:Operation['ui_gate_collecttime'],valign:'middle',align:'center'},
				{field:"Linkstate",title:Operation['ui_gate_status'],valign:'middle',align:'center'}
			];

			var tableRows=[];

			$.each(data.gatewayStatusList, function(key, val) {
				var row ={};
				row.fSubstation = val.fSubname;
				row.gatewayId = val.fGatewayid;
				row.Gatename = val.fGatewayname;
				row.Gatetype = val.fGatewaymodel;
				row.Lastuptime = val.fLastupdatetime;
				row.fLastcollecttime = val.fLastcollecttime;
				if(val.fIsdisconnnect)
					row.Linkstate = "<span><img src='image/state-red.png'></span>";
				else
					row.Linkstate = "<span><img src='image/state.png'></span>";

				tableRows.push(row);
			});

			$("#tab-content").html("<table></table>");
			$("#tab-content").height($('.comm-h').height());
			generateTable($("#tab-content>table"),columns,tableRows);
		}
	}

	return _gatewayStatus;

})();

jQuery(document).ready(function($) {
	var gatewayStatus = new GatewayCommnunicateStatus();

	gatewayStatus.getData("/main/runningStatus/GatewayCommunicateStatus",{fSubid:subidFromAPP});

	$("#Disconnect").change(function(event) {
        var disConnect = $("#Disconnect").prop('checked');
        gatewayStatus.getData("/main/runningStatus/GatewayCommunicateStatus","fSubid="+subidFromAPP+"&fOnlydisconnect="+(disConnect===true?1:0));
	});

});

function generateTable($table, columns, data, isPagenation, pageSize, cardView, pageList,height) {
            var size = 50;
            var view = false;
            if (pageSize === null || pageSize === undefined) {
                size = 50;
            } else {
                size = pageSize;
            }

            if (pageList === null || pageList === undefined) {
                pageList = [10, 25, 50, 100, 'All']
            }

            if (isPagenation) {
                if ($table.get(0).id === "eventTable")//报警模态框表格
                    $table.bootstrapTable({
                        height:height,
                        striped: true,
                        classes: 'table',
                        pagination: true,
                        cardView: view,
                        pageSize: size,
                        columns: columns,
                        pageList: pageList,
                        rowStyle: function (row, index) {
                            if (row.isRed) {
                                var style = {
                                    css: {
                                        color: "black"
                                    }
                                };
                                return style;
                            } else {
                                var style = {
                                    css: {
                                        color: "red"
                                    }
                                };
                                return style;
                            }
                        },
                        data: data
                    });
                else
                    $table.bootstrapTable({
                        height:height,
                        striped: true,
                        classes: 'table table-border table-striped',
                        sidePagination: 'client',
                        sortOrder:'desc',
                        pagination: true,
                        cardView: view,
                        pageSize: size,
                        columns: columns,
                        pageList: pageList,
                        data: data
                    });

            } else {
                $table.bootstrapTable({
                    columns: columns,
                    data: data,
                    height:(window.innerHeight-70),
                });
            }
            window.onresize=function (ev) {
                $table.bootstrapTable("resetView");
            }
        }