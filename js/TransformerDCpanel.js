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

  function upperJSONKey(jsonobj) {
    for (var key in jsonobj) {
      if (jsonobj[key.toUpperCase()] != jsonobj[key]) {
        jsonobj[key.toUpperCase()] = jsonobj[key];
        delete jsonobj[key];
      }
    }
    return jsonobj;
  }

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

  getTransList();

  function getTransList() {
    //直流屏监测 默认第一个
    var url = baseUrlFromAPP + "/getDCSInfo";
    var params = {
      fSubid: subidFromAPP
    };
    getData(url, params, function (data) {
      if (data.hasOwnProperty("DCSObList")) {
        showTransNames(data.DCSObList);
      }
    });
  }

  function showTransNames(transList) {
    if (transList.length > 0) {
      $(".s-ctn").empty();
      $(transList).each(function () {
        $(".s-ctn").append(
          "<div class='trans' name='" +
          this.fType +
          "' value='" +
          this.F_MeterCode +
          "'><img/><p>" +
          this.F_MeterName +
          "</p></div>"
        );
      });
      $(".trans").click(function () {
        $(this)
          .addClass("select")
          .siblings()
          .removeClass("select");
        getListData();
      });
      $(".trans:first").click();
    }
  }

  var info;
  var time = tool.initDate("YMD", new Date());
  $("#date").val(time);

  function getListData() {
    //直流屏监测 具体数据
    var url = baseUrlFromAPP + "/getDCSInfo";
    var selectTrans = $(".trans.select").attr("value");
    var params = {
      fSubid: subidFromAPP,
      fMetercode: selectTrans,
      time: ""
      // selectParams: "Uab,Ubc,Uca,S,P,Q,Pf,Ia,Ib,Ic,TempA,TempB,TempC,MD,MDTimeStamp,noise,H2,InPa,LJTempA,LJTempB,LJTempC,LJTempN,Olevel,OilTemp"
    };
    getData(url, params, function (data) {
      generateTransStatus(data);
      getDateCurveData();
    });
  }
  //切换调接口
  $("#energySelect").change(function () {
    if (energySelect == 'fDcsac1') {
      // .css("display", "block");
      $("#EnergyContain").css("display", "block");

    } else if (energySelect == 'fDcsac2') {
      //
      $("#EnergyContain").css("display", "block");

    } else if (energySelect == 'fDcspoweroffi') {
      $("#EnergyContain").css("display", "none");
      //合母电压

    } else if (energySelect == 'fDcspoweronu') {
      $("#EnergyContain").css("display", "none");
      //合母电压

    } else if (energySelect == 'fDcspoweroffu') {
      $("#EnergyContain").css("display", "none");

    } else if (energySelect == 'fDcssumbatteryi') {
      $("#EnergyContain").css("display", "none");

    }
    getDateCurveData();
  });

  //直流屏参数曲线
  function getDateCurveData() {
    var url = baseUrlFromAPP + "/getDCSInfoByDate";
    var selectTrans = $(".trans.select").attr("value");
    var params = {
      fSubid: subidFromAPP,
      fMetercode: selectTrans,
      time: $("#date").val()
    };
    getData(url, params, function (data) {
      info = data;
      if (data.hasOwnProperty("DCSInfoByDate")) {
        generateChartLine(data.DCSInfoByDate);
      }
      // DCSInfoByDate;
    });
  }

  //配置变压器状态
  function generateTransStatus(data) {
    if (data.hasOwnProperty("DCSNow")) {
      var transStatus = upperJSONKey(data.DCSNow);
      // showTemperature(transStatus);
      showCurrent(transStatus);
      showPower(transStatus);
      showVoltage(transStatus);
    }
  }

  //显示温度数据
  function showTemperature(temp) {
    var noiseVal = "--";
    var selectTrans = $(".trans.select").attr("name");
    if (selectTrans == 1 || selectTrans == 0) {
      $("#OILTemp")
        .css("display", "none")
        .siblings("li")
        .css("display", "block");
      $("#LJTemp1").css("display", "none");
      $("#LJTemp2").css("display", "none");
      $("#LJTemp3").css("display", "none");
      $("#LJTemp4").css("display", "none");
      $("#Nitrogen").css("display", "none");
      $("#Olevel").css("display", "none");
      $("#InPa").css("display", "none");
      $("#tempLine").css("display", "block");
      $("#tempOilLine").css("display", "none");
    } else {
      $("#OILTemp")
        .css("display", "block")
        .siblings("li")
        .css("display", "none");
      // $("#LJTemp1").css("display", "block");
      // $("#LJTemp2").css("display", "block");
      // $("#LJTemp3").css("display", "block");
      // $("#LJTemp4").css("display", "block");
      // $("#Nitrogen").css("display", "block");
      // $("#Olevel").css("display", "block");
      // $("#InPa").css("display", "block");
      $("#tempLine").css("display", "none");
      // $("#tempOilLine").css("display", "block");
      // 其他
      if (temp.INPA != null) $(".InPa").html(temp.INPA);
      else $(".InPa").html("--");
      // 其他
      if (temp.OLEVEL != null) $(".Olevel").html(temp.OLEVEL);
      else $(".Olevel").html("--");

      if (temp.H2 != null) {
        $(".Nitrogen").html(temp.H2);
      } else {
        $(".Nitrogen").html("--");
      }
    }
    if (temp == null) {
      $(".AphaseTemp").html("--");
      $(".BphaseTemp").html("--");
      $(".CphaseTemp").html("--");
    } else {
      if (temp.OILTEMP != undefined && temp.OILTEMP != null) {
        //油浸变压器
        $("#OILTemp")
          .css("display", "block")
          .siblings("li")
          .css("display", "none");
        $("#LJTemp1").css("display", "block");
        $("#LJTemp2").css("display", "block");
        $("#LJTemp3").css("display", "block");
        $("#LJTemp4").css("display", "block");
        $("#Nitrogen").css("display", "block");
        $("#Olevel").css("display", "block");
        $("#InPa").css("display", "block");
        $("#tempLine").css("display", "none");
        $("#tempOilLine").css("display", "block");
        $(".OILTemp").html(temp.OILTEMP);
        if (temp.LJTEMPA != undefined && temp.LJTEMPA != null) {
          $(".LJTemp1").html(temp.LJTEMPA);
        }
        if (temp.LJTEMPB != undefined && temp.LJTEMPB != null) {
          $(".LJTemp2").html(temp.LJTEMPB);
        }
        if (temp.LJTEMPC != undefined && temp.LJTEMPC != null) {
          $(".LJTemp3").html(temp.LJTEMPC);
        }
        if (temp.LJTEMPN != undefined && temp.LJTEMPN != null) {
          $(".LJTemp4").html(temp.LJTEMPN);
        }
        // 其他
        if (temp.INPA != null) $(".InPa").html(temp.INPA);
        else $(".InPa").html("--");
        // 其他
        if (temp.OLEVEL != null)
          if (temp.OLEVEL == 1) {
            //报警
            $(".Olevel").html(Operation["ui_alarm"]);
          } else {
            //正常
            $(".Olevel").html(Operation["ui_normal"]);
          }
        else $(".Olevel").html("--");

        if (temp.H2 != null) {
          $(".Nitrogen").html(temp.H2);
        } else {
          $(".Nitrogen").html("--");
        }
      } else {
        //10kv变压器
        if (!(temp.TEMPA && temp.TEMPB && temp.TEMPC)) {
          $("#OILTemp")
            .css("display", "block")
            .siblings("li")
            .css("display", "none");
          if (temp.TEMPA != undefined && temp.TEMPA != null) {
            $(".OILTemp").html(temp.TEMPA);
          }
          if (temp.TEMPB != undefined && temp.TEMPB != null) {
            $(".OILTemp").html(temp.TEMPB);
          }
          if (temp.TEMPC != undefined && temp.TEMPC != null) {
            $(".OILTemp").html(temp.TEMPC);
          }
          if ($(".OILTemp").text() == undefined || $(".OILTemp").text() == "") {
            $(".OILTemp").html("--");
          }
        } else if (selectTrans == 1 || selectTrans == 0) {
          $("#OILTemp")
            .css("display", "none")
            .siblings("li")
            .css("display", "block");
          $("#LJTemp1").css("display", "none");
          $("#LJTemp2").css("display", "none");
          $("#LJTemp3").css("display", "none");
          $("#LJTemp4").css("display", "none");
          $("#Nitrogen").css("display", "none");
          $("#Olevel").css("display", "none");
          $("#InPa").css("display", "none");
          $("#tempLine").css("display", "block");
          $("#tempOilLine").css("display", "none");
          $(".AphaseTemp").html(temp.TEMPA);
          $(".BphaseTemp").html(temp.TEMPB);
          $(".CphaseTemp").html(temp.TEMPC);
        }
      }

      //噪声
      if (temp.NOISE != null) $(".noise").html(temp.NOISE);
      else $(".noise").html("--");

      if (temp.PartialDischarge != null) {
        $(".noise").html(temp.PartialDischarge);
      } else {}
    }
    $("#noise").height($("#temp").height() + "px");
  }

  //显示电压数据
  function showVoltage(voltage) {
    if (voltage == null) {
      $(".Uab").html("--");
      $(".Ubc").html("--");
      $(".Uca").html("--");
    } else {
      var UStrA = voltage.UAB;
      if (UStrA != null) {
        if (UStrA.substr(-2, 2).toUpperCase() == "KV") {
          $(".Uab").html(voltage.UAB);
          $(".Ubc").html(voltage.UBC);
          $(".Uca").html(voltage.UCA);
        } else {
          var numa = UStrA.substring(0, UStrA.length - 1);
          if (numa > 1000) {
            var numb = voltage.UBC.substring(0, voltage.UBC.length - 1);
            var numc = voltage.UCA.substring(0, voltage.UCA.length - 1);
            $(".Uab").html((numa / 1000).toFixed(2) + "kV");
            $(".Ubc").html((numb / 1000).toFixed(2) + "kV");
            $(".Uca").html((numc / 1000).toFixed(2) + "kV");
          } else {
            $(".Uab").html(voltage.UAB);
            $(".Ubc").html(voltage.UBC);
            $(".Uca").html(voltage.UCA);
          }
        }
      } else {
        $(".Uab").html("--");
        $(".Ubc").html("--");
        $(".Uca").html("--");
      }
    }
  }

  //显示电流数据
  function showCurrent(current) {
    if (current == null) {
      $(".AphaseI").html("--");
      $(".BphaseI").html("--");
      $(".CphaseI").html("--");
    } else {
      if (current.IA != null) $(".AphaseI").html(current.IA);
      else $(".AphaseI").html("--");

      if (current.IB != null) $(".BphaseI").html(current.IB);
      else $(".BphaseI").html("--");

      if (current.IC != null) $(".CphaseI").html(current.IC);
      else $(".CphaseI").html("--");
    }
  }

  //显示功率
  function showPower(capacity) {
    // FDCSAC1UCUNIT: "V"
    // FDCSAC2UA: 237.4
    // FDCSAC2UAUNIT: "V"
    // FDCSAC2UB: 236.5
    // FDCSAC2UBUNIT: "V"
    // FDCSAC2UC: 240.6
    // FDCSAC2UCUNIT: "V"
    // FDCSPOWEROFFI: 2.2
    // FDCSPOWEROFFIUNIT: "A"
    // FDCSPOWEROFFU: 171.3
    // FDCSPOWEROFFUUNIT: "V"
    // FDCSPOWERONU: 226.4
    // FDCSPOWERONUUNIT: "V"
    // FDCSSUMBATTERYI: 31.2
    // FDCSSUMBATTERYIUNIT: "A"
    // F_METERCODE: "T301011"
    // F_METERNAME: "直流屏#1"
    if (capacity == null) {
      $(".FDCSAC1UA").html("--");
      $(".FDCSAC1UB").html("--");
      $(".FDCSAC1UC").html("--");
      $(".FDCSAC2UA").html("--");
      $(".FDCSAC2UB").html("--");
      $(".FDCSAC2UC").html("--");
      $(".FDCSPOWERONU").html("--");
      $(".FDCSPOWEROFFU").html("--");
      $(".FDCSSUMBATTERYI").html("--");
      $(".FDCSPOWEROFFI").html("--");
    } else {
      if (capacity.FDCSAC1UA != null)
        $(".FDCSAC1UA").html(capacity.FDCSAC1UA + capacity.FDCSAC1UAUNIT);
      else $(".FDCSAC1UA").html("--");

      if (capacity.FDCSAC1UB != null)
        $(".FDCSAC1UB").html(capacity.FDCSAC1UB + capacity.FDCSAC1UBUNIT);
      else $(".FDCSAC1UB").html("--");

      if (capacity.FDCSAC1UC != null)
        $(".FDCSAC1UC").html(capacity.FDCSAC1UC + capacity.FDCSAC1UCUNIT);
      else $(".FDCSAC1UC").html("--");

      if (capacity.FDCSAC2UA != null)
        $(".FDCSAC2UA").html(capacity.FDCSAC2UA + capacity.FDCSAC2UAUNIT);
      else $(".FDCSAC2UA").html("--");

      if (capacity.FDCSAC2UB != null)
        $(".FDCSAC2UB").html(capacity.FDCSAC2UB + capacity.FDCSAC2UBUNIT);
      else $(".FDCSAC2UB").html("--");

      if (capacity.FDCSAC2UC != null)
        $(".FDCSAC2UC").html(capacity.FDCSAC2UC + capacity.FDCSAC2UCUNIT);
      else $(".FDCSAC2UC").html("--");

      if (capacity.FDCSPOWERONU != null)
        $(".FDCSPOWERONU").html(
          capacity.FDCSPOWERONU + capacity.FDCSPOWERONUUNIT
        );
      else $(".FDCSPOWERONU").html("--");

      if (capacity.FDCSPOWEROFFI != null)
        $(".FDCSPOWEROFFI").html(
          capacity.FDCSPOWEROFFI + capacity.FDCSPOWEROFFIUNIT
        );
      else $(".FDCSPOWEROFFI").html("--");

      if (capacity.FDCSSUMBATTERYI != null)
        $(".FDCSSUMBATTERYI").html(
          capacity.FDCSSUMBATTERYI + capacity.FDCSSUMBATTERYIUNIT
        );
      else $(".FDCSSUMBATTERYI").html("--");

      if (capacity.FDCSPOWEROFFU != null)
        $(".FDCSPOWEROFFU").html(
          capacity.FDCSPOWEROFFU + capacity.FDCSPOWEROFFUUNIT
        );
      else $(".FDCSPOWEROFFU").html("--");
      //   if (capacity.MDTIMESTAMP != null) {
      //     var time = capacity.MDTIMESTAMP.substring(0, 16);
      //     $(".MDTime").html(time);
      //   } else {
      //     $(".MDTime").html("");
      //   }
    }
  }

  //配置图表
  function generateChartLine(dataObject) {
    // fCollecttime: "2020-12-12 00:00:00";
    // fDcsac1ua: 238;
    // fDcsac1ub: 228;
    // fDcsac1uc: 225;
    // fDcsac2ua: 243;
    // fDcsac2ub: 230;
    // fDcsac2uc: 230;
    // fDcspoweroffi: 2;
    // fDcspoweroffu: 171;
    // fDcspoweronu: 226;
    // fDcssumbatteryi: 31;
    // fMetercode: "T301011";
    // fSubid: 10100001;
    // var time = [];
    var timeTemp = [];
    //lineA = []
    var yesterDayfP = [],
      yesterDayfQ = [],
      yesterDayfS = [];
    var todayfP = [],
      todayfQ = [],
      todayfS = [];
    var LJTempA = [],
      LJTempB = [],
      LJTempC = [],
      LJTempN = [];

    var times = [];

    var seriesA = [],
      seriesB = [],
      seriesC = [];

    var lineData = [];
    //时间轴赋值
    if (!dataObject.length) {
      return;
    }
    var energySelect = $("#energySelect").val();
    $.each(dataObject, function (key, val) {
      times.push(val.fCollecttime.substring(11, 16));
    });
    //配置数据
    if (energySelect == 'fDcsac1') {
      // .css("display", "block");
      // $("#EnergyContain").css("display", "block");
      $.each(dataObject, function (key, val) {
        seriesA.push(val.fDcsac1ua);
        seriesB.push(val.fDcsac1ub);
        seriesC.push(val.fDcsac1uc);
      });
      var select = $(".btn.s-select");
      $.each(select, function (index, val) {
        if ($(val).attr("value") == 'fPfa') {
          var param = {
            "name": Operation["ui_Avoltage1"],
            "unit": '',
            "data": seriesA
          }
          lineData.push(param);
        } else if ($(val).attr("value") == 'fPfb') {
          var param = {
            "name": Operation["ui_Bvoltage1"],
            "unit": '',
            "data": seriesB
          }
          lineData.push(param);
        } else if ($(val).attr("value") == 'fPfc') {
          var param = {
            "name": Operation["ui_Cvoltage1"],
            "unit": '',
            "data": seriesC
          }
          lineData.push(param);
        }
        makeLine(lineData, times);
      })
    } else if (energySelect == 'fDcsac2') {
      //
      // $("#EnergyContain").css("display", "block");
      $.each(dataObject, function (key, val) {
        seriesA.push(val.fDcsac2ua);
        seriesB.push(val.fDcsac2ub);
        seriesC.push(val.fDcsac2uc);
      });
      var select = $(".btn.s-select");
      $.each(select, function (index, val) {
        if ($(val).attr("value") == 'fPfa') {
          var param = {
            "name": Operation["ui_Avoltage2"],
            "unit": '',
            "data": seriesA
          }
          lineData.push(param);
        } else if ($(val).attr("value") == 'fPfb') {
          var param = {
            "name": Operation["ui_Bvoltage2"],
            "unit": '',
            "data": seriesB
          }
          lineData.push(param);
        } else if ($(val).attr("value") == 'fPfc') {
          var param = {
            "name": Operation["ui_Cvoltage2"],
            "unit": '',
            "data": seriesC
          }
          lineData.push(param);
        }
        makeLine(lineData, times);
      })
    } else if (energySelect == 'fDcspoweronu') {
      // $("#EnergyContain").css("display", "none");
      //合母电压
      $.each(dataObject, function (key, val) {
        seriesA.push(val.fDcspoweronu);
      });
      var param = {
        "name": Operation["ui_DCSPowerOnU"],
        "unit": '',
        "data": seriesA
      }
      lineData.push(param);
      makeLine(lineData, times);
    } else if (energySelect == 'fDcspoweroffu') {
      // $("#EnergyContain").css("display", "none");
      //控母电压
      $.each(dataObject, function (key, val) {
        seriesA.push(val.fDcspoweroffu);
      });
      var param = {
        "name": Operation["ui_DCSPowerOffU"],
        "unit": '',
        "data": seriesA
      }
      lineData.push(param);
      makeLine(lineData, times);
    } else if (energySelect == 'fDcssumbatteryi') {
      // $("#EnergyContain").css("display", "none");
      //电池总电流
      $.each(dataObject, function (key, val) {
        seriesA.push(val.fDcssumbatteryi);
      });
      var param = {
        "name": Operation["ui_DCSum"],
        "unit": '',
        "data": seriesA
      }
      lineData.push(param);
      makeLine(lineData, times);
    } else if (energySelect == 'fDcspoweroffi') {
      // $("#EnergyContain").css("display", "none");
      //电池总电流
      $.each(dataObject, function (key, val) {
        seriesA.push(val.fDcspoweroffi);
      });
      var param = {
        "name": Operation["ui_DCSPowerOffI"],
        "unit": '',
        "data": seriesA
      }
      lineData.push(param);
      makeLine(lineData, times);
    }

  }

  //拿到整理字典遍历
  function makeLine(linedata, times) {
    var seriesTem = [];
    var legend = [];
    for (let index = 0; index < linedata.length; index++) {
      const element = linedata[index];
      var series = {
        name: element.name,
        type: "line",
        data: element.data,
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
      };
      seriesTem.push(series);
      legend.push(element.name);
      // var unitTem = "℃";
    }
    var legendTem = {
      data: legend,
      bottom: "2%"
    };
    var titleTem = $("#energySelect").val();
    initLine(seriesTem, legendTem, times, titleTem);
    // initLine(seriesTem, legendTem, times, titleTem, unitTem);
  }

  //最终绘制
  function initLine(series, legend, time, title, unit) {
    $(".chart").html('<div id="powerChart" class="showDIV"></div>');
    $("#powerChart").removeAttr("_echarts_instance_");
    var line = echarts.init(document.getElementById("powerChart"));
    // var line = echarts.init($("#powerChart").get(0));
    var option = {
      /*            title: {
                                  text: title,
                                  x: 'center'
                              },*/
      color: ["#2EC7C9", "#B6A2DE", "#3CA4E4", "#FFB980"],
      tooltip: {
        trigger: "axis"
      },
      legend: legend,
      toolbox: {
        show: true,
        orient: "horizontal",
        top: -6,
        feature: {
          dataZoom: {
            yAxisIndex: "none"
          },
          dataView: {
            readOnly: true
          },
          restore: {}
        }
      },
      grid: {
        left: "13%",
        right: "12%",
        top: "16%",
        bottom: "25%"
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: time
      },
      yAxis: {
        name: unit,
        type: "value",
        min: function (value) {
          if (value.min <= 0) {
            return (value.min + value.min * 0.2).toFixed(2);
          } else {
            return (value.min - value.min * 0.2).toFixed(2);
          }
        },
        max: function (value) {
          return (value.max + value.max * 0.1).toFixed(2);
        },
        axisLabel: {
          formatter: "{value}"
        }
      },
      dataZoom: [{
        // 这个dataZoom组件，默认控制x轴。
        type: "slider", // 这个 dataZoom 组件是 slider 型 dataZoom 组件
        start: 0, // 左边在 10% 的位置。
        end: 100, // 右边在 60% 的位置。
        height: 25,
        bottom: 38
      }],
      series: series
    };
    line.setOption(option);
  }

  //点击有功、无功、视在的按钮
  // $("#EnergyContain").click(function () {
  //   if ($(this).hasClass('s-select')) {
  //     $(this).removeClass('s-select');
  //   } else {
  //     $(this).addClass('s-select');
  //   }
  //   getDateCurveData();
  // });

  $(document).on("click", ".elec-btn .btn", function () {
    if ($(this).hasClass("s-select")) {
      $(this).removeClass("s-select");
    } else {
      $(this).addClass("s-select");
    }
    getDateCurveData();
  });

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
    getDateCurveData();
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
      getDateCurveData();
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
    getDateCurveData();
  });
});