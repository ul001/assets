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

      function getData() {
        var params = {
            fSubid:subidFromAPP
        };
        $.ajax({
          type: 'GET',
          url: baseUrlFromAPP+"/main/app/listDoorStatus",
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
                                            '<p>'+(this.fStatus=="开门"?"<a class='redColor'>开门</a>":this.fStatus)+'</p></section>');
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