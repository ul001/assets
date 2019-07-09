$(function () {
    var url = "http://116.236.149.162:8090/SubstationWEBV2/main/getTempABCResult";
    var params = {
        fSubid: "10100001",
        pageNo:1,
        pageSize:10
    };
    tool.getDataByAjax(url, params, function (data) {
        creatList(data.list);
    });

    var f_MeterCode;

    function creatList(data) {
        $(".container").html('');
        var string = '';
        if (data.length > 0) {
            $.each(data, function (key, val) {
                var tempA = "--";
                var tempB = "--";
                var tempC = "--";
                if (val.a != undefined) {
                    tempA = val.a;
                }
                if (val.b != undefined) {
                    tempB = val.b;
                }
                if (val.c != undefined) {
                    tempC = val.c;
                }

                string = '<section>' +
                    '<div class="tempDiv">' +
                    '<h3>' + val.f_MeterName + '</h3>' +
                    '<div class="tempNum">' +
                    '<p>A:<span>' + tempA + '</span>℃</p>' +
                    '<p>B:<span>' + tempB + '</span>℃</p>' +
                    '<p>C:<span>' + tempC + '</span>℃</p>' +
                    '</div>' +
                    '<button class="search tempBtn" type="button" value="' + val.f_MeterCode + '">查 询</button>' +
                    '</div>' +
                    '</section>';
                $(".container").append(string);
            });

            $(".tempBtn").click(function () {
                var $this = $(this);
                f_MeterCode = $this[0].value;
            });
        } else {
            $(".container").append("暂无温度信息").css("text-align", "center");
        }

        $(".tempBtn").click(function () {
            var F_MeterCode = $(this).attr("value");
            location.href="cableTemperature-modal.html?F_MeterCode="+F_MeterCode;
        })
    }


});