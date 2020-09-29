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
    var url = baseUrlFromAPP + "/powerMonitoring/transformerList";
    var params = {
      fSubid: subidFromAPP
    };
    getData(url, params, function (data) {
      if (data.hasOwnProperty("TransformerList")) {
        showTransNames(data.TransformerList);
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
          this.fTransid +
          "'><img/><p>" +
          this.fTransname +
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
    var url = baseUrlFromAPP + "/powerMonitoring/transformerStatus";
    var selectTrans = $(".trans.select").attr("value");
    var params = {
      fSubid: subidFromAPP,
      fTransid: selectTrans,
      selectParams: "Uab,Ubc,Uca,S,P,Q,Pf,Ia,Ib,Ic,TempA,TempB,TempC,MD,MDTimeStamp,noise,H2,InPa,LJTempA,LJTempB,LJTempC,LJTempN,Olevel,OilTemp"
      // selectParams: "Uab,Ubc,Uca,S,P,Q,Pf,Ia,Ib,Ic,TempA,TempB,TempC,MD,MDTimeStamp,noise,PartialDischarge"
    };
    getData(url, params, function (data) {
      generateTransStatus(data);
      getDateCurveData();
    });
  }

  function getDateCurveData() {
    var url = baseUrlFromAPP + "/getCurveDataOfPowerAndTempABC";
    var selectTrans = $(".trans.select").attr("value");
    var params = {
      fTransid: selectTrans,
      fDate: $("#date").val()
    };
    getData(url, params, function (data) {
      info = data;
      generateChartLine(data);
    });
  }

  //配置变压器状态
  function generateTransStatus(data) {
    if (data.hasOwnProperty("TransformerStatus")) {
      var transStatus = upperJSONKey(data.TransformerStatus);
      showTemperature(transStatus);
      showCurrent(transStatus);
      showPower(transStatus);
      showVoltage(transStatus);
    }
  }

  //显示温度数据
  function showTemperature(temp) {
    var noiseVal = "--";
    var selectTrans = $(".trans.select").attr("name");
    if (selectTrans == 1) {
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
      $("#LJTemp1").css("display", "block");
      $("#LJTemp2").css("display", "block");
      $("#LJTemp3").css("display", "block");
      $("#LJTemp4").css("display", "block");
      $("#Nitrogen").css("display", "block");
      $("#Olevel").css("display", "block");
      $("#InPa").css("display", "block");
      $("#tempLine").css("display", "none");
      $("#tempOilLine").css("display", "block");
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
        } else {
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
    if (capacity == null) {
      $(".Ratedpower").html("--");
      $(".AP").html("--");
      $(".LF").html("--");
      $(".Fp").html("--");
      $(".Fq").html("--");
      $(".Pf").html("--");
      $(".MaxD").html("--");
      $(".MDTime").html("");
    } else {
      if (capacity.FINSTALLEDCAPACITY != null)
        $(".Ratedpower").html(capacity.FINSTALLEDCAPACITY + "kVA");
      else $(".Ratedpower").html("--");

      if (capacity.S != null) $(".AP").html(capacity.S);
      else $(".AP").html("--");

      if (capacity.LOADFACTOR != null)
        $(".LF").html(capacity.LOADFACTOR.toFixed(2) + "%");
      else $(".LF").html("--");

      if (capacity.P != null) $(".Fp").html(capacity.P);
      else $(".Fp").html("--");
      if (capacity.Q != null) $(".Fq").html(capacity.Q);
      else $(".Fq").html("--");
      if (capacity.PF != null) $(".Pf").html(capacity.PF);
      else $(".Pf").html("--");
      if (capacity.MD != null) $(".MaxD").html(capacity.MD);
      else $(".MaxD").html("--");
      if (capacity.MDTIMESTAMP != null) {
        var time = capacity.MDTIMESTAMP.substring(0, 16);
        $(".MDTime").html(time);
      } else {
        $(".MDTime").html("");
      }
    }
  }

  //配置图表
  function generateChartLine(dataObject) {
    var time = [];
    var times = [];
    var timeTemp = [];

    var yesterDayfP = [],
      yesterDayfQ = [],
      yesterDayfS = [];

    var todayfP = [],
      todayfQ = [],
      todayfS = [];

    var seriesA = [],
      seriesB = [],
      seriesC = [];

    var LJTempA = [],
      LJTempB = [],
      LJTempC = [],
      LJTempN = [];

    if (dataObject.yesterdayPowerValue != null) {
      $.each(dataObject.yesterdayPowerValue, function (key, val) {
        times.push(val.fCollecttime.substring(11, 16));
      });
    }
    if (dataObject.PowerValue != null) {
      $.each(dataObject.PowerValue, function (key, val) {
        time.push(val.fCollecttime.substring(11, 16));
      });
    }
    var times = times.length > time.length ? times : time;
    if (dataObject.hasOwnProperty("yesterdayPowerValue")) {
      for (var j = 0; j < dataObject.yesterdayPowerValue.length; j++) {
        for (var i = 0; i < times.length; i++) {
          //            var index = 0;
          if (
            dataObject.yesterdayPowerValue[j].fCollecttime.substring(11, 16) ==
            times[i]
          ) {
            yesterDayfP.push(dataObject.yesterdayPowerValue[j].fP);
            yesterDayfQ.push(dataObject.yesterdayPowerValue[j].fQ);
            yesterDayfS.push(dataObject.yesterdayPowerValue[j].fS);
            //                    index = 1;
          }
        }
        //            if (index == 0) {
        //                yesterDayfP.push(null);
        //                yesterDayfQ.push(null);
        //                yesterDayfS.push(null);
        //            }
      }
    }
    if (
      dataObject.hasOwnProperty("PowerValue") &&
      dataObject.PowerValue != null
    ) {
      //                var index = 0;
      for (var j = 0; j < dataObject.PowerValue.length; j++) {
        for (var i = 0; i < times.length; i++) {
          if (
            dataObject.PowerValue[j].fCollecttime.substring(11, 16) == times[i]
          ) {
            todayfP.push(dataObject.PowerValue[j].fP);
            todayfQ.push(dataObject.PowerValue[j].fQ);
            todayfS.push(dataObject.PowerValue[j].fS);
            //                        index = 1;
          }
        }
        //                if (index == 0) {
        //                    todayfP.push(null);
        //                    todayfQ.push(null);
        //                    todayfS.push(null);
        //                }
      }
    }

    //绕组温度
    if (
      dataObject.hasOwnProperty("tempABC") &&
      dataObject.tempABC != null &&
      dataObject.tempABC != undefined
    ) {
      $.each(dataObject.tempABC, function (key, val) {
        timeTemp.push(val.fCollecttime.substring(11, 16));
        seriesA.push(val.fTempa);
        seriesB.push(val.fTempb);
        seriesC.push(val.fTempc);
      });
    }

    //油浸温度
    if (
      dataObject.hasOwnProperty("LJTempABCN") &&
      dataObject.LJTempABCN != null &&
      dataObject.LJTempABCN != undefined
    ) {
      $.each(dataObject.LJTempABCN, function (key, val) {
        timeTemp.push(val.fCollecttime.substring(11, 16));
        LJTempA.push(val.fLJTempA);
        LJTempB.push(val.fLJTempB);
        LJTempC.push(val.fLJTempC);
        LJTempN.push(val.fLJTempN);
      });
    }

    //TODO：waring
    var transformerName = Operation["ui_trans"];
    var type = $(".s-select")[0].id;
    if (type == "NowPower") {
      var titlefS = transformerName + "  " + Operation["ui_s"];
      var seriesfS = [{
          name: Operation["ui_today"],
          type: "line",
          data: todayfS,
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
        },
        {
          name: Operation["ui_yestoday"],
          type: "line",
          data: yesterDayfS,
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
        }
      ];
      var legendfS = {
        data: [Operation["ui_today"], Operation["ui_yestoday"]],
        bottom: "2%"
      };
      var unitfS = "kVA";
      initLine(seriesfS, legendfS, times, titlefS, unitfS);
    } else if (type == "havePower") {
      var seriesfP = [{
          name: Operation["ui_today"],
          type: "line",
          data: todayfP,
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
        },
        {
          name: Operation["ui_yestoday"],
          type: "line",
          data: yesterDayfP,
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
        }
      ];
      var legendfP = {
        data: [Operation["ui_today"], Operation["ui_yestoday"]],
        bottom: "2%"
      };
      var titlefP = transformerName + "  " + Operation["ui_p"];
      var unitfP = "kW";
      initLine(seriesfP, legendfP, times, titlefP, unitfP);
    } else if (type == "NothingPower") {
      var seriesfQ = [{
          name: Operation["ui_today"],
          type: "line",
          data: todayfQ,
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
        },
        {
          name: Operation["ui_yestoday"],
          type: "line",
          data: yesterDayfQ,
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
        }
      ];
      var legendfQ = {
        data: [Operation["ui_today"], Operation["ui_yestoday"]],
        bottom: "2%"
      };
      var titlefQ = transformerName + "  " + Operation["ui_q"];
      var unitfQ = "kVar";
      initLine(seriesfQ, legendfQ, times, titlefQ, unitfQ);
    } else if (type == "tempLine") {
      var titleTem = transformerName + "  " + Operation["ui_tempLine"];
      // var titleTem = $("#daycalendarBox").val() + "  " + transformerName + "  " + "绕阻温度";
      var seriesTem = [{
          name: Operation["ui_temp"] + "A",
          type: "line",
          data: seriesA,
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
        },
        {
          name: Operation["ui_temp"] + "B",
          type: "line",
          data: seriesB,
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
        },
        {
          name: Operation["ui_temp"] + "C",
          type: "line",
          data: seriesC,
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
        }
      ];
      var legendTem = {
        data: [
          Operation["ui_temp"] + "A",
          Operation["ui_temp"] + "B",
          Operation["ui_temp"] + "C"
        ],
        bottom: "2%"
      };
      var unitTem = "℃";
      initLine(seriesTem, legendTem, timeTemp, titleTem, unitTem);
    } else if (type == "tempOilLine") {
      var titleTem = transformerName + "  " + Operation["ui_tempOilLine"];
      // var titleTem = $("#daycalendarBox").val() + "  " + transformerName + "  " + "绕阻温度";
      var seriesTem = [{
          name: Operation["ui_LJTemp1"],
          type: "line",
          data: LJTempA,
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
        },
        {
          name: Operation["ui_LJTemp2"],
          type: "line",
          data: LJTempB,
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
        },
        {
          name: Operation["ui_LJTemp3"],
          type: "line",
          data: LJTempC,
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
        },
        {
          name: Operation["ui_LJTemp4"],
          type: "line",
          data: LJTempN,
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
        }
      ];
      var legendTem = {
        data: [
          Operation["ui_LJTemp1"],
          Operation["ui_LJTemp2"],
          Operation["ui_LJTemp3"],
          Operation["ui_LJTemp4"]
        ],
        bottom: "2%"
      };
      var unitTem = "℃";
      initLine(seriesTem, legendTem, timeTemp, titleTem, unitTem);
    }
  }

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
  $("#havePower").click(function () {
    $("#havePower")
      .addClass("s-select")
      .siblings("span")
      .removeClass("s-select");
    getDateCurveData();
  });
  $("#NothingPower").click(function () {
    $("#NothingPower")
      .addClass("s-select")
      .siblings("span")
      .removeClass("s-select");
    getDateCurveData();
  });
  $("#NowPower").click(function () {
    $("#NowPower")
      .addClass("s-select")
      .siblings("span")
      .removeClass("s-select");
    getDateCurveData();
  });
  $("#tempLine").click(function () {
    $("#tempLine")
      .addClass("s-select")
      .siblings("span")
      .removeClass("s-select");
    getDateCurveData();
  });
  $("#tempOilLine").click(function () {
    $("#tempOilLine")
      .addClass("s-select")
      .siblings("span")
      .removeClass("s-select");
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