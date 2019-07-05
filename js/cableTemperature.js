$(function () {  
    var url = "http://116.236.149.162:8090/SubstationWEB/main/getTempABCResult";
    var params = {
        fSubid: "10100001",
        pageNo:1,
        pageSize:10
    };
    getDataByAjax(url, params, function (data) {
       creatList(data);
    });

    function getDataByAjax(url, params, successCallback) {
        $.ajax({
            type: 'GET',
            url: url,
            data: params,
            // beforeSend: function (request) {
            //     request.setRequestHeader("Authorization", "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjI0MzYxMDMsInVzZXJuYW1lIjoiYWRtaW4ifQ.iyJK8dR2Sw39-mWAZsLlfuY6cAtxjfPpZnsPrR9E0qQ")
            // },
            success: function (result) {
                successCallback(result.data);
            }
        })
    }

   var f_MeterCode;
    function creatList(data) {
        $("#tempContain").html('');
        var string='';
        if(data.length>0){
            $.each(data,function (key,val) {
                var tempA="--";
                var tempB="--";
                var tempC="--";
                if(val.a!=undefined){
                    tempA=val.a;
                }
                if(val.b!=undefined){
                    tempB=val.b;
                }
                if(val.c!=undefined){
                    tempC=val.c;
                }

                string='<div class="tempDiv temperature">' +
                    '<h4>'+val.f_MeterName+'</h4>'+
                    '<div class="tempPic">' +
                    '<img src="app/image/temp.png"/>' +
                    '</div>' +
                    '<div class="tempNum">' +
                    '<p>A:<span>'+tempA+'</span>℃</p>' +
                    '<p>B:<span>'+tempB+'</span>℃</p>' +
                    '<p>C:<span>'+tempC+'</span>℃</p>' +
                    '</div>' +
                    '<button class="search tempBtn" type="button" value="'+val.f_MeterCode+'">查 询</button>' +
                    '</div>';
                $("#tempContain").append(string);
            });

            $(".tempBtn").click(function(){
                var $this = $(this);
                f_MeterCode= $this[0].value;
            });
        }else {
            $("#tempContain").append("暂无温度信息").css("text-align","center");
        }
    }
});