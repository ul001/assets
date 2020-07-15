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

var Communication = (function(){

	function _communication(){

		this.getData = function(url,params){
			getByAjax(url,params);
		};

		function getByAjax(url,params){
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
		}

		function showTable(data){
			var columns=[
				{field:"GateWay",title:Operation['ui_meter_gateway'],valign:'middle',align:'center',class:'i18n'},
				{field:"Serial",title:Operation['ui_meter_COM'],valign:'middle',align:'center',class:'i18n'},
				{field:"MeterAddr",title:Operation['ui_meter_address'],valign:'middle',align:'center',class:'i18n'},
				{field:"Metername",title:Operation['ui_meter_name'],valign:'middle',align:'center',class:'i18n'},
				{field:"comStatus",title:Operation['ui_meter_status'],valign:'middle',align:'center',class:'i18n'},
				{field:"OffTime",title:Operation['ui_meter_offtime'],valign:'middle',align:'center',class:'i18n'},
				{field:"fLastcollecttime",title:Operation['ui_meter_collecttime'],valign:'middle',align:'center',class:'i18n'},
				{field:"TotalTime",title:Operation['ui_meter_sumtime'],valign:'middle',align:'center',class:'i18n'}
			];

			var tableRows=[];
			var rowSpanArr=[];
			var totalCount=0;
			var serialSpanArr=[];
			var serialCount=0;

			if(data.MeterUseInfoList!=null)
				$.each(data.MeterUseInfoList.gateways, function(key, val) {

                    var preGatewayId = "";
                    var preSerialName = "";

					$.each(val.meterUseInfos, function(index, value) {

						var row={};
						row.GateWay = value.fGatewayname;
						row.Serial = value.fSerialport;
						row.MeterAddr=value.fMeteraddr;
						row.Metername=value.fMetername;
						row.fLastcollecttime = value.fLastcollecttime;
						/********合并单元格Start*********************/

						if(preGatewayId !== value.fGatewayid){
							rowSpanArr.push({index:totalCount,length:1});
							preGatewayId = value.fGatewayid;
						}else{
							rowSpanArr[rowSpanArr.length-1].length +=1;
						}

						if(value.fSerialport!==""){
                            if(preSerialName !== value.fSerialport){
                                serialSpanArr.push({index:serialCount,length:1});
                                preSerialName=value.fSerialport;
                            }else{
                                serialSpanArr[serialSpanArr.length-1].length +=1;
                            }
						}else {
                            serialSpanArr.push({index:serialCount,length:1});
						}


						totalCount++;
						serialCount++;
						/********合并单元格END*********************/

						if(value.fIsdisconnnect)
							row.comStatus="<span><img src='image/state-red.png'></span>";
						else
							row.comStatus="<span><img src='image/state.png'></span>";

						if(value.fDisconnecttime === undefined){
							row.OffTime = "--";
						}else{
							row.OffTime =value.fDisconnecttime;
						}

						if(value.fLostContactTimeUpToNow === undefined){
							row.TotalTime = "--";
						}else{
							row.TotalTime =value.fLostContactTimeUpToNow;
						}
						tableRows.push(row);
					});
				});

			$("#tab-content").html("<table></table>");
			$("#tab-content").height($('.comm-h').height());
			generateTable($("#tab-content>table"),columns,tableRows);

			// 合并单元格
			$.each(rowSpanArr, function(key, val) {
				if(val.length >1){
					$("#tab-content table").bootstrapTable('mergeCells',{
						index:val.index,
						field:"GateWay",
						rowspan:val.length
					});

				}
			});

			$.each(serialSpanArr, function(key, val) {
				$("#tab-content table").bootstrapTable('mergeCells',{
					index:val.index,
					field:"Serial",
					rowspan:val.length
				});
			});
			/********合并单元格END*********************/
		}

	}

	return _communication;

})();

jQuery(document).ready(function($) {
	var communication = new Communication();

    $("#search").bind('search',function(){
        var text = $("#search").val();
        var disConnect = $("#Disconnect").prop('checked');
        communication.getData("/main/runningStatus/CommunicationStatus","fSubid="+subidFromAPP
            +"&fIsdisconnnect="+(disConnect?1:0)+"&fMeterName="+encodeURI(text));
    });

    $(document).on("click", ".clear", function () {
        $("#search").val("");
        communication.getData("/main/runningStatus/CommunicationStatus","fSubid="+subidFromAPP);
    });

    communication.getData("/main/runningStatus/CommunicationStatus","fSubid="+subidFromAPP);

	$("#Disconnect").change(function(event) {
        var text = $("#search").val();
        var disConnect = $(this).prop('checked');
        communication.getData("/main/runningStatus/CommunicationStatus","fSubid="+subidFromAPP+"&fIsdisconnnect="+(disConnect?1:0)+"&fMeterName="+encodeURI(text));
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
            height:(document.body.clientHeight-70),
        });
    }
    window.onresize=function (ev) {
        $table.bootstrapTable("resetView");
    }
}