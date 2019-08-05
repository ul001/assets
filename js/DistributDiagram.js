$(function() {
  //    var baseUrlFromAPP = "http://116.236.149.162:8090/SubstationWEBV2";
  //    var tokenFromAPP = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjQzMTkyMTksInVzZXJuYW1lIjoiYWRtaW4ifQ.5pQCWw5-ebBpM85B1bJLQV-ySiKt3cT9RL-aJ9uIqno";
  //    var subidFromAPP = 10100001;
  //iOS安卓基础传参
  var u = navigator.userAgent,
    app = navigator.appVersion;
  var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1; //安卓系统
  var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios系统
  //判断数组中是否包含某字符串
  var baseUrlFromAPP;
  var tokenFromAPP;
  var subidFromAPP;
  if (isIOS) {
    //ios系统的处理
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

  let toast = new ToastClass();
  var url = baseUrlFromAPP + "/getAppSubimgInfo";
  var params = {
    fSubid: subidFromAPP
  };
  getDataByAjax(url, params, function(data) {
    showSVG(data.xmlContent);
    showList(data.list);
    showDataOnSVG(data.SvgInfo);
  });

  function showSVG(path) {
    $(".diagram").html("");
    $(".diagram").append(path);
    $('g[name="off"]').hide();
    //        $(".diagram").overscroll();
  }

  //放大缩小
  $("#BigDom").on("click", function() {
    $(this).addClass("select");
    $("#SimDom").removeClass("select");
    adjustSVG($("svg"), 1);
  });
  $("#SimDom").on("click", function() {
    $(this).addClass("select");
    $("#BigDom").removeClass("select");
    adjustSVG($("svg"), -1);
  });

  function adjustSVG($svg, type) {
    var width = $svg.width();
    var height = $svg.height();
    switch (type) {
      case 1:
        $svg.width(width * 1.1);
        $svg.height(height * 1.1);
        break;
      case -1:
        $svg.width(width / 1.1);
        $svg.height(height / 1.1);
        break;
    }
  }

  function showList(data) {
    $("#subList").html("");
    if (data.length > 0) {
      $.each(data, function(index, el) {
        var string = "<option>" + el.fCustomname + "</option>";
        $("#subList").append(string);
      });
    }
  }

  function getDataByAjax(url, params, successCallback) {
    toast.show({
      text: "正在加载",
      loading: true
    });
    $.ajax({
      type: "GET",
      url: url,
      data: params,
      beforeSend: function(request) {
        request.setRequestHeader("Authorization", tokenFromAPP);
      },
      success: function(result) {
        toast.hide();
        successCallback(result.data);
      },
      error: function() {
        toast.show({
          text: "数据请求失败",
          duration: 2000
        });
      }
    });
  }

  $("#subList").change(function(event) {
    var fCustomname = $("#subList").val();
    var url = baseUrlFromAPP + "/getAppSubimgInfo";
    var params = {
      fSubid: subidFromAPP,
      fCustomname: fCustomname
    };
    getDataByAjax(url, params, function(data) {
      showSVG(data.xmlContent);
      showDataOnSVG(data.SvgInfo);
    });
  });

  function showDataOnSVG(data) {
    var map = new Map();
    var group;
    if (data.length > 0) {
      $.each(data, function(key, val) {
        group = $("#" + val.fCircuitid);
        for (i = 0; i < val.meterParamValues.length; i++) {
          var paramCode = val.meterParamValues[i].fParamcode;
          var fvalue = val.meterParamValues[i].fValue;
          var valjoinunit = val.meterParamValues[i].fValuejoinunit;
          map.set(paramCode.toLowerCase(), valjoinunit);
          switch (paramCode.toUpperCase()) {
            case "SWITCH":
            case "SWITCHON":
              1 === fvalue
                ? (group.children('g[name="off"]').hide(),
                  group.children('g[name="on"]').show())
                : (group.children('g[name="on"]').hide(),
                  group.children('g[name="off"]').show());
              break;
            case "SWITCHOFF":
              0 === fvalue
                ? (group.children('g[name="off"]').hide(),
                  group.children('g[name="on"]').show())
                : (group.children('g[name="on"]').hide(),
                  group.children('g[name="off"]').show());
              break;
            default:
          }
        }

        $.each(group.children("g text"), function(index, element) {
          try {
            var m = element.attributes.name.textContent;
            if (map.has(m.toLowerCase())) {
              var v = map.get(m.toLowerCase());
              var childName = "text[name='" + m + "']";

              group.children(childName).text(map.get(m.toLowerCase()));
            }
          } catch (err) {}
        });
      });
    }
  }
});
