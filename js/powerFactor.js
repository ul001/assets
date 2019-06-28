$(function(){
    var currentSelectVode={};//选中节点

    initFirstNode();//初始化第一个回路
    var isClick = 0;
    function initFirstNode(){
      var url = "http://116.236.149.162:8090/SubstationWEBV2/main/getfCircuitidsList";
      var params = {
            fSubid:"10100001",
      }
      getData(url,params,function(data){
        setListData(data);
        $("#search").click();
      });
    }

    $("#CircuitidsList").click(function(){
        var search = $("#CircuitidsInput").val();
        var url = "http://116.236.149.162:8090/SubstationWEBV2/main/getfCircuitidsList";
        var params = {
              fSubid:"10100001",
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
          var url = "http://116.236.149.162:8090/SubstationWEBV2/main/getfCircuitidsList";
          var params = {
                fSubid:"10100001",
          }
          getData(url,params,function(data){
            setListData(data);
          });
          isClick = 0;
        }
    });

  	$(document).on('click','.elec-btn .btn',function () {
      if($(this).hasClass('select')){
        $(this).removeClass('select');
      }else{
        $(this).addClass('select');
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
    });

    $("#electric").click(function(){
       $(".category").show();
    });

    $(document).on('click','#search',function () {
      var EnergyKind = $("#EnergyKind").attr('value');
      var selectParam=[];
      if(EnergyKind!="fFr"){
        var select = $(".btn.select");
        $.each(select,function(index,val){
          selectParam.push($(val).attr("value"))
        })
      }
      var fCircuitid = currentSelectVode.merterId;
      var time = $("#date").val();
      var url = "http://116.236.149.162:8090/SubstationWEBV2/main/app/powerMonitoring/ElectricData";
      var params = {
            fSubid:"10100001",
            fCircuitid:fCircuitid,
            time:time,
            fPhase:selectParam.join("-"),
            EnergyKind:EnergyKind,
      }
      getData(url,params,function(data){
        showCharts(data.CircuitValueByDate);
      });
    })


	function getData(url,params,successCallback){
    var token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjE4OTgwMDcsInVzZXJuYW1lIjoiYWRtaW4ifQ.Iylar5Wf4KzXEekRWZT2ZdkkwePbUmugVu1VY3Nm-jE";
    $.ajax({
        type:'GET',
        url:url,
        data:params,
        beforeSend:function(request){
            request.setRequestHeader("Authorization",token)
        },
        success:function(result){
            successCallback(result.data);
        }
    })
	}

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
	}

/*  $(document).on("click",".category li",function(){
    var type = $(this).children('label').attr("value");
    var text = $(this).children('label').text();
    generateType(type);
    $("#EnergyKind").attr("value",type);
    $("#param").html(text);
    $("#myModal").modal("hide");
  })*/

  function generateType(type){
    var List = [
      {
        "id":"PF","name":"功率因数",
        "phase":[{"id":"fPf","name":"总"},{"id":"fPfa","name":"A相"},{"id":"fPfb","name":"B相"},{"id":"fPfc","name":"C相"}]
      }
    ]
    var arr = $.grep(List,function(obj){
      return obj.id == type;
    })
    $("#EnergyContain").html("");
    if(arr[0].hasOwnProperty('phase')){
      $.each(arr[0].phase,function(index,val){
        var string = '<button type="button" class="btn" value="'+val.id+'">'+val.name+'</button>';
        $("#EnergyContain").append(string);
      })
      $("#EnergyContain button:first").addClass('select');
    }
  }

  function showCharts(data){
    var time = [];
    var value = [];
    var name=[];
    var tableData =[];
    if(data.length>0){
      $.each(data,function(index, el) {
        if($.inArray(el.fCollecttime.substring(11,16),time)==-1){
          time.push(el.fCollecttime.substring(11,16));
        }
        if(value.length==0){
          name.push(el.fParamcode.substring(1));
          value.push({name:el.fParamcode.substring(1),value:[]});
          tableData.push({name:el.fParamcode.substring(1),sum:0,avg:0,max:[el.fParamvalue],maxTime:[el.fCollecttime.substring(0,16)],min:[el.fParamvalue],minTime:[el.fCollecttime.substring(0,16)]});
        }
        if($.inArray(el.fParamcode.substring(1),name)!=-1){
          value[$.inArray(el.fParamcode.substring(1),name)].value.push(el.fParamvalue);

          var num = tableData[$.inArray(el.fParamcode.substring(1),name)].sum + el.fParamvalue;
          var length = value[$.inArray(el.fParamcode.substring(1),name)].value.length;
          var avg = (num/length).toFixed(2);
          tableData[$.inArray(el.fParamcode.substring(1),name)].sum=num;
          tableData[$.inArray(el.fParamcode.substring(1),name)].avg=avg;

          if(el.fParamvalue>tableData[$.inArray(el.fParamcode.substring(1),name)].max){
             tableData[$.inArray(el.fParamcode.substring(1),name)].max=el.fParamvalue;
             tableData[$.inArray(el.fParamcode.substring(1),name)].maxTime=el.fCollecttime.substring(0,16);
          }

          if(el.fParamvalue<tableData[$.inArray(el.fParamcode.substring(1),name)].min){
             tableData[$.inArray(el.fParamcode.substring(1),name)].min=el.fParamvalue;
             tableData[$.inArray(el.fParamcode.substring(1),name)].minTime=el.fCollecttime.substring(0,16);
          }
        }else{
          name.push(el.fParamcode.substring(1));
          value.push({name:el.fParamcode.substring(1),value:[el.fParamvalue]});
          tableData.push({name:el.fParamcode.substring(1),sum:el.fParamvalue,avg:el.fParamvalue,max:[el.fParamvalue],maxTime:[el.fCollecttime.substring(0,16)],min:[el.fParamvalue],minTime:[el.fCollecttime.substring(0,16)]})
        }
      });
    }

    showLine(name,time,value);
    showTable(tableData)
  }

  function showLine(name,time,value){
    var series=[];
    $.each(value,function(index, el) {
      series.push({
            name:el.name,
            data: el.value,
            type: 'line',
        })
    });
    $("#chartContain").removeAttr('_echarts_instance_');
    var line =  echarts.init(document.getElementById('chartContain'));
    var option = {
        tooltip : {
            trigger: 'axis'
        },
        legend:{
          data:name,
        },
        grid: { // 控制图的大小，调整下面这些值就可以，
          top:'8%',
          left:'8%',
          right:'3%',
          bottom:'12%',
       },
        xAxis: {
            type: 'category',
            data: time,
        },
        yAxis: {
            type: 'value',
            scale:true,//y轴自适应
        },
        calculable : true,
        series: series,
      };
      line.setOption(option);
  }

  function  showTable(data){
    var columns = [
      {field:"name",title:"类型",align:"center"},
      {field:"max",title:"最大值",align:"center"},
      {field:"maxTime",title:"发生时间",align:"center"},
      {field:"min",title:"最小值",align:"center"},
      {field:"minTime",title:"发生时间",align:"center"},
      {field:"avg",title:"平均值",align:"center"},
    ]
    $("#tableContain").html("");
    $("#tableContain").html("<table id='table'></table>");
    $("#table").bootstrapTable({
      columns:columns,
      data:data,
    })
  }


  var time = tool.initDate("YMD",new Date());
  $("#date").val(time);

   new Rolldate({
        el: '#date',
        format: 'YYYY-MM-DD',
        beginYear: 2000,
        endYear: 2100,
        value:time,
         confirm: function(date) {
             var d = new Date(),
             d1 = new Date(date.replace(/\-/g, "\/")),
             d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()); //如果非'YYYY-MM-DD'格式，需要另做调整
             if (d1 > d2) {
                 return false;
             };
         }
    });
});