$(function () {
  var baseUrlFromAPP = "http://116.236.149.165:8090/SubstationWEBV2/v5";
  var tokenFromAPP =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1OTM5MTYxMTUsInVzZXJuYW1lIjoiaGFoYWhhIn0.lLzdJwieIO-xMhob6PW06MRyzK4oCZVCfcs9196Iec8";
  var subidFromAPP = 10100001;
  //iOS安卓基础传参
  var u = navigator.userAgent,
    app = navigator.appVersion;
  var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1; //安卓系统
  var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios系统
  //判断数组中是否包含某字符串
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

  let toast = new ToastClass(); //实例化toast对象

  function getData(url, params, successCallback) {
    toast.show({
      text: Operation["ui_loading"],
      loading: true
    });
    $.ajax({
      type: "GET",
      url: url,
      data: params,
      headers: {
        Accept: "application/json; charset=utf-8",
        Authorization: tokenFromAPP
      },
      success: function (result) {
        if (result.code == "5000") {
          var strArr = baseUrlFromAPP.split("/");
          var ipAddress = strArr[0] + "//" + strArr[2];

          $.ajax({
            url: "http://www.acrelcloud.cn/SubstationWEBV2/main/uploadExceptionLog",
            type: "POST",
            data: {
              ip: ipAddress,
              exceptionMessage: JSON.stringify(result.data.stackTrace)
            },
            success: function (data) {}
          });
        }
        toast.hide();
        if (result.code != "200") {
          toast.show({
            text: Substation.showCodeTips(result.code),
            duration: 2000
          });
        }
        successCallback(result.data);
      },
      error: function () {
        toast.show({
          text: Operation["code_fail"],
          duration: 2000
        });
      }
    });
  }

  var time = tool.initDate("YMD", new Date());
  var allSF6Unit = "ppm";
  var allO2Unit = "%";
  $("#date").val(time);
  getListData();

  function getListData() {
    var url = baseUrlFromAPP + "/getSF6AndO2";
    var params = {
      fSubid: subidFromAPP
    };
    getData(url, params, function (data) {
      if (data.SF6AndO2ObList != null) {
        if (data.SF6AndO2ObList.length > 0) {
          $("#cardList").empty();
          $(data.SF6AndO2ObList).each(function () {
            var tempVal = "--";
            var humiVal = "--";
            if (this.fSF6 != undefined && this.fSF6 != null) {
              tempVal = parseFloat(this.fSF6).toFixed(1);
            }
            if (this.fO2 != undefined && this.fO2 != null) {
              humiVal = parseFloat(this.fO2).toFixed(1);
            }
            if (this.fSF6Unit != undefined) {
              allSF6Unit = this.fSF6Unit;
            }
            if (this.fO2Unit != undefined) {
              allO2Unit = this.fO2Unit;
            }
            $("#cardList").append(
              '<section class="sectionCard" value="' +
              this.F_MeterCode +
              '">' +
              "<p>" +
              this.F_MeterName +
              "</p>" +
              '<img src="image/qiti.png"/>' +
              "<p>" +
              Operation["ui_SF6"] +
              ":" +
              tempVal +
              this.fSF6Unit +
              "</p>" +
              "<p>" +
              Operation["ui_O2"] +
              ":" +
              humiVal +
              this.fO2Unit +
              "</p></section>"
            );
          });
          $("#cardList section:first").addClass("sectionSelect");
          $(".sectionCard").on("click", function () {
            $(this)
              .addClass("sectionSelect")
              .siblings()
              .removeClass("sectionSelect");
            //                        $("#date").val(time);
            getChartData();
          });
          getChartData();
        }
      }
    });
  }

  function getChartData() {
    var chartData = {};
    var time = [];
    var temp = [];
    var humi = [];
    var selectCode = $(".sectionSelect").attr("value");
    var url = baseUrlFromAPP + "/getSF6AndO2";
    var params = {
      fSubid: subidFromAPP,
      fMetercode: selectCode,
      time: $("#date").val()
    };
    getData(url, params, function (data) {
      if (data.FSF6AndO2ByDate != null) {
        if (data.FSF6AndO2ByDate.length > 0) {
          $(data.FSF6AndO2ByDate).each(function () {
            time.push(this.fCollecttime.substring(11, 16));
            temp.push(this.fSF6);
            humi.push(this.fO2);
          });
        }
      }
      chartData = {
        times: time,
        temps: temp,
        humis: humi
      };
      setChart(chartData);
    });
  }

  function initLineAnal(value, time, name, unit) {
    var option = {
      color: ["#2EC7C9", "#B6A2DE", "#3CA4E4", "#FFB980"],
      tooltip: {
        trigger: "axis"
      },
      toolbox: {
        show: true,
        orient: "horizontal",
        top: -6,
        feature: {
          dataView: {
            readOnly: true
          },
          dataZoom: {
            yAxisIndex: "none"
          },
          restore: {}
        }
      },
      dataZoom: [{
        // 这个dataZoom组件，默认控制x轴。
        type: "slider", // 这个 dataZoom 组件是 slider 型 dataZoom 组件
        start: 0, // 左边在 10% 的位置。
        end: 100, // 右边在 60% 的位置。
        height: 25,
        bottom: 8
      }],
      grid: {
        left: "12%",
        right: "12%",
        top: "20%",
        bottom: "28%"
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: time
      },
      yAxis: {
        type: "value",
        scale: true,
        axisLabel: {
          formatter: "{value}"
        },
        name: unit
      },
      series: [{
        name: name,
        type: "line",
        data: value,
        color: ["#2EC6C9"],
        markPoint: {
          symbol: "circle",
          symbolSize: 10,
          data: [{
              name: Operation["ui_maxval"],
              type: "max",
              label: {
                normal: {
                  formatter: "Max:{c}"
                }
              }
            },
            {
              name: Operation["ui_minval"],
              type: "min",
              label: {
                normal: {
                  formatter: "Min:{c}"
                }
              }
            }
          ],
          itemStyle: {
            normal: {
              label: {
                position: "top"
              }
            }
          }
        },
        markLine: {
          data: [{
            name: Operation["ui_avgval"],
            type: "average"
          }]
        }
      }]
    };
    return option;
  }

  function setChart(chartData) {
    var option = initLineAnal(
      chartData.temps,
      chartData.times,
      Operation["ui_SF6"],
      allSF6Unit
    );
    var option2 = initLineAnal(
      chartData.humis,
      chartData.times,
      Operation["ui_O2"],
      allO2Unit
    );
    var myChart = echarts.init($("#tempChart").get(0));
    myChart.setOption(option);
    var myChart2 = echarts.init($("#humiChart").get(0));
    myChart2.setOption(option2);
  }

  $("#datePre").click(function () {
    var selectDate = new Date(
      $("#date")
      .val()
      .replace(/\-/g, "/")
    );
    var preDate = new Date(selectDate.getTime() - 24 * 60 * 60 * 1000);
    $("#date").val(
      preDate.getFullYear() +
      "-" +
      (preDate.getMonth() < 9 ?
        "0" + (preDate.getMonth() + 1) :
        preDate.getMonth() + 1) +
      "-" +
      (preDate.getDate() < 10 ? "0" + preDate.getDate() : preDate.getDate())
    );
    getChartData();
  });

  $("#dateNext").click(function () {
    var d = new Date();
    var nowDate = new Date(
      d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate()
    );
    var selectDate = new Date(
      $("#date")
      .val()
      .replace(/\-/g, "/")
    );
    if (selectDate < nowDate) {
      var nextDate = new Date(selectDate.getTime() + 24 * 60 * 60 * 1000);
      $("#date").val(
        nextDate.getFullYear() +
        "-" +
        (nextDate.getMonth() < 9 ?
          "0" + (nextDate.getMonth() + 1) :
          nextDate.getMonth() + 1) +
        "-" +
        (nextDate.getDate() < 10 ?
          "0" + nextDate.getDate() :
          nextDate.getDate())
      );
      getChartData();
    } else {
      return;
    }
  });

  //初始化时间控件
  var calendar1 = new LCalendar();
  calendar1.init({
    trigger: "#date", //标签id
    type: "date", //date 调出日期选择 datetime 调出日期时间选择 time 调出时间选择 ym 调出年月选择
    minDate: "2000-1-1", //最小日期 注意：该值会覆盖标签内定义的日期范围
    maxDate: "2050-1-1" //最大日期 注意：该值会覆盖标签内定义的日期范围
  });
  $("#date").on("input", function () {
    getChartData();
  });
});