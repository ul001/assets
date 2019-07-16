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

      function getData() {
        var params = {
            fSubid:subidFromAPP
        };
        $.ajax({
          type: 'GET',
          url: baseUrlFromAPP+"/main/app/listWaterInStatus",
          data: params,
          beforeSend: function (request) {
            request.setRequestHeader("Authorization", tokenFromAPP)
          },
          success: function (result) {
            if(result.data!=null){
              if(result.data.length>0){
                $(".container").empty();
                $(result.data).each(function(){
                    $(".container").append('<section><img src="image/big-greenbell.png"/>'+
                                            '<p>'+this.fMeterName+'</p>'+
                                            '<p>'+(this.fStatus=="有水"?"<a class='redColor'>开门</a>":this.fStatus)+'</p></section>');
                });
              }
            }
          },
          error:function(){
            $(".container").html("服务器错误");
          }
        });
      }
      getData();
});