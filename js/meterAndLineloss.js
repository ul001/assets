$(function () {
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

    //配置时间
    var showtimeForElectSum = tool.initDate("YM", new Date());
    $("#date").val(showtimeForElectSum);
    initQuick();

    function initQuick() {
        $("#datePre").unbind("click");
        $("#dateNext").unbind("click");
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
    }

    searchGetData();
    function searchGetData() {
        var url = mainBaseUrl + "/main/powerAnalysis/EnergyLineLoss";
        var params = {
            fSubId: subidFromAPP,
            time:$("#date").val()+"-01",
        };
        getData(url, params, function (data) {
            showTable(data);
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
            error: function (data) {
                toast.show({
                    text: Operation['code_fail'],
                    duration: 2000
                });
            }
        });
    }

    //初始化时间控件
    var calendar1 = new LCalendar();
    calendar1.init({
        'trigger': '#date',//标签id
        'type': 'date',//date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
        'minDate':'2000-1-1',//最小日期 注意：该值会覆盖标签内定义的日期范围
        'maxDate':'2050-1-1'//最大日期 注意：该值会覆盖标签内定义的日期范围
    });
    $("#date").val(showtimeForElectSum);
    $("#date").on("input",function(){
        searchGetData();
    });

    function initDateInput(type){
        $("#date").remove();
        $("#datePre").after(`<input readonly type="text" id="date">`);
        calendar1 = new LCalendar();
        calendar1.init({
            'trigger': '#date',//标签id
            'type': type,//date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
            'minDate':'2000-1-1',//最小日期 注意：该值会覆盖标签内定义的日期范围
            'maxDate':'2050-1-1'//最大日期 注意：该值会覆盖标签内定义的日期范围
        });
        $("#date").on("input",function(){
            searchGetData();
        });
    }

    function showTable(data){
            $("#tab-content").html('');

            if(data===undefined || data.TransCircuitEnergyValue===undefined){
                return;
            }

			var columns=[
			{field:"transformer",title:"变压器名称"},
			{field:"typeName",title:"类型名称"},
			{field:"meterName",title:"回路名称"},
			{field:"value",title:"值"}
			];

			var tableRows=[];
			var rowLengthArr=[];
			var currentCircuitsLength=0;
			var circutLength = 0;

			var inValueSum = 0;
			var outValueSum = 0;

			$.each(data.TransCircuitEnergyValue, function(key, val) {
				$.each(val.circuits, function(index, value) {
					if(value.fIsincoming===true){
                        inValueSum += value.energyDayResults[0].fDayvalue;
					}else{
                        outValueSum +=value.energyDayResults[0].fDayvalue;
					}
				});
			});

            //构建数组
            var array = {"fTransname":"变压器汇总",
						"fTransid":'xxxtotal',
						"circuits":[
							{"fCircuitid":"xxxin",
							"fCircuitname":"进线合计",
							"fIsincoming":true,
							"energyDayResults":[
								{"fDayvalue":inValueSum}
								]
							},
							{"fCircuitid":"xxxout",
							"fCircuitname":"出线合计",
							"fIsincoming":false,
							"energyDayResults":[
								{"fDayvalue":outValueSum}
								]
							}
						]
            		};
            data.TransCircuitEnergyValue.push(array);

			$.each(data.TransCircuitEnergyValue,function(key,val){
				var inValue=0;
				var outValue=0;

				rowLengthArr.push({length:val.circuits.length+3,rowIndex:currentCircuitsLength});


				val.fTransid==="xxxtotal"? currentCircuitsLength+= val.circuits.length+2: currentCircuitsLength += val.circuits.length+3;

				var halfRows=[];//2017-09-13 修改bug：多个变压器时，进线顺序不在最上面的bug
				var inNum = 0;
				var outNum = 0;

				$.each(val.circuits, function(index, value) {
					var row={};
					row.transformer=val.fTransname;
					if(value.fIsincoming===true){
						if(value.fCircuitid==="xxxin"){
                            row.typeName="进线合计";
                            row.meterName = "";
						}else {
                            row.typeName ="进线";
                            row.enType=1;//2017-09-13
                            row.cid = value.fCircuitid;
                            row.meterName = value.fCircuitname;
						}
						row.value = value.energyDayResults[0].fDayvalue;
						inValue += value.energyDayResults[0].fDayvalue;
                        inNum++;
                    }
					if(value.fIsincoming===false){
						if(value.fCircuitid==="xxxout"){
                            row.typeName = "出线合计";
                            row.meterName = "";
						}else {
                            row.typeName = "出线";
                            row.enType=2;//2017-09-13
                            row.cid = value.fCircuitid;
                            row.meterName = value.fCircuitname;
						}
						row.value=value.energyDayResults[0].fDayvalue;
						outValue +=value.energyDayResults[0].fDayvalue;
                        outValueSum +=value.energyDayResults[0].fDayvalue;
                        outNum++;
					}

					value.fCircuitid==="xxxout" ? "" : halfRows.push(row);//2018-06-20
				});
                rowLengthArr[key].inLen = inNum;
                rowLengthArr[key].inrowIndex = 0+circutLength;
                rowLengthArr[key].outLen = outNum;
                rowLengthArr[key].outrowIndex = inNum+circutLength;
                val.fTransid==="xxxtotal"? circutLength+= inNum+outNum+2: circutLength += inNum+outNum+3;


				halfRows.sort(sortCombine);//2017-09-13
				//2017-09-13
				$.each(halfRows, function(key, val) {
					tableRows.push(val);
				});

				var outTypeName="出线总和";
				var diffType="差值";
				var lossType="损耗";

				if(val.fTransid ==="xxxtotal"){
					outTypeName="出线合计";
					diffType="累计差值";
					lossType="累计损耗";
				}

				tableRows.push({transformer:val.fTransname,typeName:outTypeName,meterName:'',value:outValue.toFixed(2)});
				tableRows.push({transformer:val.fTransname,typeName:diffType,meterName:'',value:(inValue-outValue).toFixed(2)});
				if(inValue === 0 || inValue === 0.00){
					tableRows.push({transformer:val.fTransname,typeName:lossType,meterName:'',value:'--'+"%"});
				}else{
					tableRows.push({transformer:val.fTransname,typeName:lossType,meterName:'',value:((inValue-outValue)/inValue*100).toFixed(2)+"%"});
				}
			});

			function sortCombine(a,b){
				var aValue = parseInt(a.enType+a.cid.substring(a.cid.length-3));
				var bValue = parseInt(b.enType+b.cid.substring(b.cid.length-3));
				return aValue -bValue;
			}

			$("#tab-content").html('<table data-show-header="false"></table>');

			if(tableRows.length*40>=$("#tab-content").height())
				$("#tab-content>table").height($("#tab-content").height());
			else
				$("#tab-content>table").height(tableRows.length*40);

			generateTable($("#tab-content>table"),columns,tableRows);

			$.each(rowLengthArr, function(index, val) {
				$("#tab-content table").bootstrapTable('mergeCells',{
					index:val.rowIndex,
					field:"transformer",
					rowspan:val.length
				});

				if(val.inLen>0){
                    $("#tab-content table").bootstrapTable('mergeCells',{
                        index:val.inrowIndex,
                        field:"typeName",
                        rowspan:val.inLen
                    });
				}

				if(val.outLen>0){
                    $("#tab-content table").bootstrapTable('mergeCells',{
                        index:val.outrowIndex,
                        field:"typeName",
                        rowspan:val.outLen
                    });
				}

                $("#tab-content table").bootstrapTable('mergeCells',{
                    index:val.inrowIndex+val.inLen+val.outLen,
                    field:"typeName",
                    colspan:2
                });
                $("#tab-content table").bootstrapTable('mergeCells',{
                    index:val.inrowIndex+val.inLen+val.outLen+1,
                    field:"typeName",
                    colspan:2
                });
                $("#tab-content table").bootstrapTable('mergeCells',{
                    index:val.inrowIndex+val.inLen+val.outLen+2,
                    field:"typeName",
                    colspan:2
                });
			});

			$("#tab-content table").bootstrapTable('mergeCells',{
				index:tableRows.length-4,
				field:"typeName",
				colspan:2
			});

            $("#tab-content table").bootstrapTable('mergeCells',{
                index:tableRows.length-3,
                field:"typeName",
                colspan:2
            });
		}

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
//                    height:height,
//                    striped: true,
//                    editable:true,//行内编辑
//                    sidePagination: 'client',//分页
//                    sortOrder:'desc',
//                    classes: 'table table-striped',
                    columns: columns,
                    data: data
                });
            }
            window.onresize=function (ev) {
                $table.bootstrapTable("resetView");
            }
        }
});