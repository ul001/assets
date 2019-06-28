$(function(){
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

    var currentSelectVode={};//选中节点
    initFirstNode();//初始化第一个回路
        var isClick = 0;
        function initFirstNode(){
          var url = baseUrlFromAPP+"/main/getfCircuitidsList";
          var params = {
                fSubid:subidFromAPP,
          }
          getData(url,params,function(data){
            setListData(data);
            $("#confirm").click();
          });
        }

        $("#CircuitidsList").click(function(){
            var search = $("#CircuitidsInput").val();
            var url = baseUrlFromAPP+"/main/getfCircuitidsList";
            var params = {
                  fSubid:subidFromAPP,
                  search:search,
            }
            getData(url,params,function(data){
              setListData(data);
            });
            isClick = 1;
        });

        $(document).on('click','.clear',function () {
            $("#CircuitidsInput").val("");
            if(isClick==1){
              var url = baseUrlFromAPP+"/main/getfCircuitidsList";
              var params = {
                    fSubid:subidFromAPP,
              }
              getData(url,params,function(data){
                setListData(data);
              });
              isClick = 0;
            }
        });

        $("#sideClick").click(function(){
           $(".tree").show();
        });

        $(".cancel").click(function(){
           $(".tree").hide();
        });

        $("#confirm").click(function(){
          $(".tree").hide();
          $("#meter").html(currentSelectVode.merterName);
          showData(currentSelectVode.merterId,$("#dateSelect").val());
        });

    function setListData(data){
	 	$('#treeview').treeview({
      		data: data,
      		showIcon:true,
      		showBorder:true,
      		expandIcon: "glyphicon glyphicon-plus",
        	collapseIcon: "glyphicon glyphicon-minus",
		});
    $('#treeview').treeview('selectNode',0);
    currentSelectVode.merterId = $('#treeview').treeview('getSelected')[0].id;
    currentSelectVode.merterName = $('#treeview').treeview('getSelected')[0].text;
    $("#meter").html(currentSelectVode.merterName);
    $('#treeview').on('nodeSelected',function(event,node){
      currentSelectVode.merterId = node.id;
      currentSelectVode.merterName = node.text;
    })
	};

    function getData(url,params,successCallback){
    $.ajax({
        type:'GET',
        url:url,
        data:params,
        beforeSend:function(request){
            request.setRequestHeader("Authorization",tokenFromAPP)
        },
        success:function(result){
            successCallback(result.data);
        }
    })
	};

    var date = new Date();
    $("#dateSelect").val(date.getFullYear()+"-"+((date.getMonth()+1)<10?("0"+(date.getMonth()+1)):(date.getMonth()+1)));
    new Rolldate({
				el: '#dateSelect',
				format: 'YYYY-MM',
				beginYear: 2000,
				endYear: 2100,
				confirm: function(date) {
				    var d = new Date(),
					d1 = new Date(date.replace(/\-/g, "\/")),
					d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/'); //如果非'YYYY-MM-DD'格式，需要另做调整
					if (d1 > d2) {
						return false;
					}else{
                    showData(currentSelectVode.merterId,date);
					}
                }
			});

	function showData(meterId,date){
            var data={
                fSubid:subidFromAPP,
                fCircuitid:meterId,
                timeStart:date+"-01 00:00:00",
                timeEnd:date+"-31 23:59:59"
            };
            $.ajax({
                type:'GET',
                url:baseUrlFromAPP+"/main/selectMaxMD",
                data:data,
                beforeSend:function(request){
                    request.setRequestHeader("Authorization",tokenFromAPP)
                },
                success:function(result){
                if(result.data[0]!=null){
                var myDate = result.data[0].f_MDMaxTime;
                     $(".max").html("<p>当月最大需量</p><h1><span id='maxVal'>"+result.data[0].f_MDMaxValue+"</span><span>KW</span></h1>"+
                          "<p id='timeP'>"+myDate.slice(0,myDate.indexOf("."))+"</p>");
                }else{
                    $(".max").html("<p>没有找到匹配的记录</p>")
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
                    url:baseUrl+"/main/getfCircuitidsList",
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