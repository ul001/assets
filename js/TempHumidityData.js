$(function () {
//     var baseUrlFromAPP="http://116.236.149.162:8090/SubstationWEBV2";
//     var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjM1MzczMTAsInVzZXJuYW1lIjoiYWRtaW4ifQ.ty4m082uqMhF_j846hQ-dVCiYOdepOWdDIr7UiV9eTI";
//     var subidFromAPP=10100001;
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

      function getData(url,params,successCallback) {
        $.ajax({
          type: 'GET',
          url: url,
          data: params,
          headers: {
            Accept: "application/json; charset=utf-8",
            Authorization:tokenFromAPP
          },
          success: function (result) {
            successCallback(result.data);
          }
        });
      }

      var time = tool.initDate("YMD", new Date());
      $("#date").val(time);
      getListData();

      function getListData(){
        var url = baseUrlFromAPP+"/main/app/getTempHumi";
        var params ={
            fSubid:subidFromAPP
        };
        getData(url,params,function(data){
            if(data.TempHumiObList!=null){
                if(data.TempHumiObList.length>0){
                    $("#cardList").empty();
                    $(data.TempHumiObList).each(function(){
                        $("#cardList").append('<section class="sectionCard" value="'+this.f_MeterCode+'">'+
                                            '<p>'+this.f_MeterName+'</p>'+
                                            '<img src="image/big-greenbell.png"/>'+
                                            '<p>温度：'+parseFloat(this.temp).toFixed(1)+this.tempUnit+'</p>'+
                                            '<p>湿度：'+parseFloat(this.humi).toFixed(1)+this.humiUnit+'</p></section>');
                    });
                    $("#cardList section:first").addClass("sectionSelect");
                    $(".sectionCard").on("click",function(){
                      $(this).addClass("sectionSelect").siblings().removeClass("sectionSelect");
                      $("#date").val(time);
                      getChartData();
                    });
                    getChartData();
                }
            }
        });
      }

      function getChartData(){
        var chartData={};
        var time = [];
        var temp = [];
        var humi = [];
        var selectCode = $(".sectionSelect").attr('value');
        var url = baseUrlFromAPP+"/main/app/getTempHumi";
        var params={
            fSubid:subidFromAPP,
            fMetercode:selectCode,
            time:$("#date").val()
        };
        getData(url,params,function(data){
            if(data.FTempFHumidityByDate!=null){
                if(data.FTempFHumidityByDate.length>0){
                    $(data.FTempFHumidityByDate).each(function(){
                        time.push(this.fCollecttime.substring(11,16));
                        temp.push(this.fTemp);
                        humi.push(this.fHumidity);
                    });
                    chartData = {times:time,temps:temp,humis:humi};
                    setChart(chartData);
                }
            }
        });
      }

      function setChart(chartData){
        var option={
            tooltip: {trigger: 'axis'},
            title: {
                text: '温度'
            },
            grid:{
                left:'10%',
                right:'3%',
                top:'15%',
                bottom:'20%'
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
            dataZoom: [{   // 这个dataZoom组件，默认控制x轴。
            type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
            start: 0,      // 左边在 10% 的位置。
            end: 100         // 右边在 60% 的位置。
            }],
            legend: {
                data:['温度']
            },
            calculable: true,
            xAxis: {
                type: 'category',
                data: chartData.times
            },
            yAxis: {
                type:'value',
                scale:true,
            },
            series: [{
                name: '温度',
                type: 'line',
                data: chartData.temps,
                markLine : {
        　　　　　　 data : [
        　　　　　　　　{type : 'average', name: '平均值'}
        　　　　　　 ]
                },
                markPoint:{
                    data:[
                        {type : 'max', name: '最大值'},
                        {type : 'min', name: '最小值'}
                    ]
                }
            }]
        };
        var option2={
            tooltip: {trigger: 'axis'},
            title: {
                text: '湿度'
            },
            grid:{
                left:'10%',
                right:'3%',
                top:'15%',
                bottom:'20%'
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
            dataZoom: [{   // 这个dataZoom组件，默认控制x轴。
            type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
            start: 0,      // 左边在 10% 的位置。
            end: 100         // 右边在 60% 的位置。
            }],
            legend: {
                data:['湿度']
            },
            xAxis: {
                data: chartData.times
            },
            yAxis: {
                type:'value',
                scale:true,
            },
            series: [{
                name: '湿度',
                type: 'line',
                data: chartData.humis,
                markLine : {
        　　　　　　 data : [
        　　　　　　　　{type : 'average', name: '平均值'}
        　　　　　　 ]
                },
                markPoint:{
                    data:[
                        {type : 'max', name: '最大值'},
                        {type : 'min', name: '最小值'}
                    ]
                }
            }]
        };
        var myChart = echarts.init($("#tempChart").get(0));
        myChart.setOption(option);
        var myChart2 = echarts.init($("#humiChart").get(0));
        myChart2.setOption(option2);
      };

      $("#datePre").click(function () {
        var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
        var preDate = new Date(selectDate.getTime() - 24 * 60 * 60 * 1000);
        $("#date").val(preDate.getFullYear() + "-" + ((preDate.getMonth()) < 9 ? ("0" + (preDate.getMonth() + 1)) : (preDate.getMonth() + 1)) + "-" + (preDate.getDate() < 10 ? ("0" + preDate.getDate()) : (preDate.getDate())));
        getChartData();
      });

      $("#dateNext").click(function () {
        var d = new Date();
        var nowDate = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate());
        var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
        if (selectDate < nowDate) {
          var nextDate = new Date(selectDate.getTime() + 24 * 60 * 60 * 1000);
          $("#date").val(nextDate.getFullYear() + "-" + ((nextDate.getMonth()) < 9 ? ("0" + (nextDate.getMonth() + 1)) : (nextDate.getMonth() + 1)) + "-" + (nextDate.getDate() < 10 ? ("0" + nextDate.getDate()) : (nextDate.getDate())));
          getChartData();
        } else {
          return;
        }
      });

      new Rolldate({
        el: '#date',
        format: 'YYYY-MM-DD',
        beginYear: 2000,
        endYear: 2100,
        value: $("#date").val(),
        confirm: function (date) {
          var d = new Date(),
            d1 = new Date(date.replace(/\-/g, "\/")),
            d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()); //如果非'YYYY-MM-DD'格式，需要另做调整
          if (d1 > d2) {
            return false;
          }else{
            $("#date").val(date);
            getChartData();
          }
        }
      });
});