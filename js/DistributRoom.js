let toast;
var baseUrlFromAPP = "http://www.acrelcloud.cn/SubstationWEBV2/v5";
var tokenFromAPP =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1OTc2NTM4OTMsInVzZXJuYW1lIjoieG1weiJ9.l_M0rv6OsYFK5BlEJKESdPEAWxJVE8UwKJxCPIJB1uE";
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
var refreshdata;

//获取页面数据
var mainUrl =
  baseUrlFromAPP.split("SubstationWEBV2")[0] +
  "SubstationWEBV2/main/getSubstationData";
var smogInfo = [];
var doorInfo = [];
var valueInfo = [];
var temphumiInfo = [];
var noiseInfo = [];
var waterInfo = [];
// 获取主进线列表
var cirUrl =
  baseUrlFromAPP.split("SubstationWEBV2")[0] +
  "SubstationWEBV2/main/getSubstationIncomeCir";
var circuitList = [];
var fCircuitid = "";
//获取图片SVG
var SVGurl =
  baseUrlFromAPP.split("SubstationWEBV2")[0] +
  "SubstationWEBV2/Subimg/showExbibitionSVG";
//获取主进线柜展示数据
var cirMaiUrl =
  baseUrlFromAPP.split("SubstationWEBV2")[0] +
  "SubstationWEBV2/main/getSubstationMainData";
//获取电力参数表格数据
var cirEnergyUrl =
  baseUrlFromAPP.split("SubstationWEBV2")[0] +
  "SubstationWEBV2/main/getSubstationTableData";

$(function() {
  toast = new ToastClass();
  var url = SVGurl;
  var params = {
    // fSubid: subidFromAPP
  };
  getDataByAjax(url, params, function(data) {
    showSVG(data);
    getInfo();
    showList();
    // showDataOnSVG(data.SvgInfo);
  });

  function showSVG(path) {
    $(".diagram").html("");
    $(".diagram").append(path);
    $('g[name="off"]').hide();
    //        $(".diagram").overscroll();
  }

  function getInfo() {
    //获取数据
    getDataByAjax(
      mainUrl,
      {
        fSubid: subidFromAPP
      },
      function(data) {
        smogInfo = data.smogList;
        doorInfo = data.doorList;
        temphumiInfo = data.humiList;
        noiseInfo = data.noiseList;
        waterInfo = data.waterInList;

        // 烟雾
        if (smogInfo.length > 0) {
          $("#smogName").html(
            smogInfo[0].fMeterName === undefined ? "-" : smogInfo[0].fMeterName
          );
          $("#smog").html(
            smogInfo[0].fStatus === undefined ? "-" : smogInfo[0].fStatus
          );
        } else {
          $("#smogName").html("--");
          $("#smog").html("--");
        }
        $("#smogMore")
          .unbind("click")
          .bind("click", function() {
            showDetail("smog");
          });

        // 门禁
        if (doorInfo.length > 0) {
          $("#doorName").html(
            doorInfo[0].fMeterName === undefined ? "-" : doorInfo[0].fMeterName
          );
          $("#door").html(
            doorInfo[0].fStatus === undefined ? "-" : doorInfo[0].fStatus
          );
        } else {
          $("#doorName").html("--");
          $("#door").html("--");
        }
        $("#doorMore")
          .unbind("click")
          .bind("click", function() {
            showDetail("door");
          });

        // 温湿度
        if (temphumiInfo.length > 0) {
          $("#temHumiName").html(
            temphumiInfo[0].F_MeterName === undefined
              ? "-"
              : temphumiInfo[0].F_MeterName
          );
          $("#temperature").html(
            temphumiInfo[0].temp === undefined ? "-" : temphumiInfo[0].temp
          );
          $("#humidity").html(
            temphumiInfo[0].humi === undefined ? "-" : temphumiInfo[0].humi
          );
        } else {
          $("#temHumiName").html("--");
          $("#temperature").html("--");
          $("#humidity").html("--");
        }
        $("#temphumiMore")
          .unbind("click")
          .bind("click", function() {
            showDetail("temphumi");
          });

        // 噪声
        if (noiseInfo.length > 0) {
          $("#noiseName").html(
            noiseInfo[0].F_MeterName === undefined
              ? "-"
              : noiseInfo[0].F_MeterName
          );
          $("#noise").html(
            noiseInfo[0].noise === undefined ? "-" : noiseInfo[0].noise
          );
        } else {
          $("#noiseName").html("--");
          $("#noise").html("--");
        }
        $("#noiseMore")
          .unbind("click")
          .bind("click", function() {
            showDetail("noise");
          });

        // 水浸
        if (waterInfo.length > 0) {
          $("#waterName").html(
            waterInfo[0].fMeterName === undefined
              ? "-"
              : waterInfo[0].fMeterName
          );
          $("#water").html(
            waterInfo[0].fStatus === undefined ? "-" : waterInfo[0].fStatus
          );
        } else {
          $("#waterName").html("--");
          $("#water").html("--");
        }
        $("#waterMore")
          .unbind("click")
          .bind("click", function() {
            showDetail("water");
          });

        // 配电图
        $("#distribution")
          .unbind("click")
          .bind("click", function() {
            //DistributDiagram 跳转配电图
            window.location.href = "DistributDiagram.html?pushType=1";
          });

        // 视频
        $("#camera")
          .unbind("click")
          .bind("click", function() {
            ////跳转视频

            if (isAndroid) {
              android.videoWatch(subidFromAPP);
            } else if (isIOS) {
              var subParam = {
                Subid: subidFromAPP
                // Subname: params.fSubname
              };
              window.webkit.messageHandlers.pushVideoListVC.postMessage(
                subParam
              );
            }
          });
      }
    );

    // group.unbind("click").on("click", function () {

    // detailData(val.fCircuitid, val.fCircuitname);
    // });
  }

  //主进线柜列表
  function getCircuitInfo(id) {
    $.each(circuitList, function(index, el) {
      //     {
      //     "id": "10100001001",
      //     "name": "主进线柜",
      //     "pId": "-1",
      //     "fCircuitid": "10100001001",
      //     "fCircuitname": "主进线柜",
      //     "fParentid": "-1",
      //     "fSubid": 10100001,
      //     "fIsincoming": true,
      //     "fMetercode": "T201003",
      //     "fSwitchstatus": true,
      //     "fSortnum": 1,
      //     "fState": false
      // }
      if (el.fCircuitid == id) {
        $("#circuitName").html(el.fCircuitname);
        getDataByAjax(
          cirMaiUrl,
          {
            fCircuitid: id
          },
          function(data) {
            var valueInfo = data;
            // 电力参数
            if (valueInfo.paramMap) {
              $("#Ia").html(
                valueInfo.paramMap.Ia === undefined
                  ? "-"
                  : valueInfo.paramMap.Ia
              );
              $("#Ib").html(
                valueInfo.paramMap.Ib === undefined
                  ? "-"
                  : valueInfo.paramMap.Ib
              );
              $("#Ic").html(
                valueInfo.paramMap.Ic === undefined
                  ? "-"
                  : valueInfo.paramMap.Ic
              );
              // 电压
              $("#Ua").html(
                valueInfo.paramMap.Ua === undefined
                  ? "-"
                  : valueInfo.paramMap.Ua
              );
              $("#Ub").html(
                valueInfo.paramMap.Ub === undefined
                  ? "-"
                  : valueInfo.paramMap.Ub
              );
              $("#Uc").html(
                valueInfo.paramMap.Uc === undefined
                  ? "-"
                  : valueInfo.paramMap.Uc
              );
              // 相电压
              $("#Uab").html(
                valueInfo.paramMap.Uab === undefined
                  ? "-"
                  : valueInfo.paramMap.Uab
              );
              $("#Ubc").html(
                valueInfo.paramMap.Ubc === undefined
                  ? "-"
                  : valueInfo.paramMap.Ubc
              );
              $("#Uca").html(
                valueInfo.paramMap.Uca === undefined
                  ? "-"
                  : valueInfo.paramMap.Uca
              );
            } else {
              $("#Ia").html("--");
              $("#Ib").html("--");
              $("#Ic").html("--");
              // 电压
              $("#Ua").html("--");
              $("#Ub").html("--");
              $("#Uc").html("--");
              // 相电压
              $("#Uab").html("--");
              $("#Ubc").html("--");
              $("#Uca").html("--");
            }

            $("#valueMore")
              .unbind("click")
              .bind("click", function() {
                //展示表格
                showDetail("value");
              });
          }
        );
      }
    });
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

  function showList() {
    $("#subList").html("");
    //获取分类接口
    getDataByAjax(
      cirUrl,
      {
        fSubid: subidFromAPP
      },
      function(data) {
        if (data.length > 0) {
          circuitList = data;
          fCircuitid = data[0].fCircuitid;
          $(".circuitSelect").show();
          $(".chooseCir").show();
          $("#circuitMore").show();
          $.each(circuitList, function(index, el) {
            var string =
              '<option name="' +
              el.fCircuitid +
              '">' +
              el.fCircuitname +
              "</option>";
            $("#subList").append(string);
          });
          getCircuitInfo(circuitList[0].fCircuitid);
        } else {
          $(".chooseCir").hide();
          $(".circuitSelect").hide();
          $("#circuitMore").hide();
          $("#circuitName").html("主进线柜");
          $("#Ia").html("--");
          $("#Ib").html("--");
          $("#Ic").html("--");
          // 电压
          $("#Ua").html("--");
          $("#Ub").html("--");
          $("#Uc").html("--");
          // 相电压
          $("#Uab").html("--");
          $("#Ubc").html("--");
          $("#Uca").html("--");
        }
      }
    );
  }

  $("#subList").change(function(event) {
    var fCuiID = $(this)
      .find("option:selected")
      .attr("name");
    fCircuitid = fCuiID;
    getCircuitInfo(fCuiID);
    // var url = baseUrlFromAPP + "/getAppSubimgInfo";
    // var params = {
    //   fSubid: subidFromAPP,
    //   fCustomname: fCustomname
    // };
    // getDataByAjax(url, params, function(data) {
    //   showSVG(data.xmlContent);
    //   showDataOnSVG(data.SvgInfo);
    // });
  });

  function showDataOnSVG(data) {
    var map = new Map();
    var group;
    if (data.length > 0) {
      // $.each(data, function (key, val) {
      //     group = $("#" + val.fCircuitid);
      //     for (i = 0; i < val.meterParamValues.length; i++) {
      //         var paramCode = val.meterParamValues[i].fParamcode;
      //         var fvalue = val.meterParamValues[i].fValue;
      //         var valjoinunit = val.meterParamValues[i].fValuejoinunit;
      //         // if (val.meterParamValues[i].fUnitGroup == "U") {
      //         //     if (fvalue >= 1000) {
      //         //         valjoinunit = (fvalue / 1000).toFixed(2) + "kV";
      //         //     }
      //         // }
      //         // map.set(paramCode.toLowerCase(), valjoinunit);
      //         // switch (paramCode.toUpperCase()) {
      //         //     case "SWITCH":
      //         //     case "SWITCHON":
      //         //         1 === fvalue ?
      //         //             (group.children('g[name="off"]').hide(),
      //         //                 group.children('g[name="on"]').show()) :
      //         //             (group.children('g[name="on"]').hide(),
      //         //                 group.children('g[name="off"]').show());
      //         //         break;
      //         //     case "SWITCHOFF":
      //         //         0 === fvalue ?
      //         //             (group.children('g[name="off"]').hide(),
      //         //                 group.children('g[name="on"]').show()) :
      //         //             (group.children('g[name="on"]').hide(),
      //         //                 group.children('g[name="off"]').show());
      //         //         break;
      //         //     default:
      //         // }
      //         var flag =
      //             val.meterParamValues[i].fValue == undefined ?
      //             -1 :
      //             val.meterParamValues[i].fValue;
      //         if (flag != -1) {
      //             flag = parseInt(flag);
      //             if (val.meterParamValues[i].fUnitGroup == "U") {
      //                 if (fvalue >= 1000) {
      //                     valjoinunit = (fvalue / 1000).toFixed(2) + "kV";
      //                 }
      //             }
      //             map.set(paramCode.toLowerCase(), valjoinunit);
      //             switch (paramCode.toUpperCase()) {
      //                 case "SWITCH":
      //                 case "SWITCHON":
      //                     if (flag != -1) {
      //                         group.children('g[name="offline"]').hide();
      //                         if (flag == 1) {
      //                             group.children('g[name="off"]').hide();
      //                             group.children('g[name="on"]').show();
      //                         }
      //                         if (flag == 0) {
      //                             group.children('g[name="on"]').hide();
      //                             group.children('g[name="off"]').show();
      //                         }
      //                     } else {
      //                         if (group.children('g[name="offline"]').length > 0) {
      //                             group.children('g[name="offline"]').show();
      //                             group.children('g[name="off"]').hide();
      //                         } else {
      //                             group.children('g[name="off"]').show();
      //                         }
      //                         //                                    group.children('g[name="offline"]').show();
      //                         //                                    group.children('g[name="off"]').hide();
      //                         group.children('g[name="on"]').hide();
      //                     }
      //                     break;
      //                 case "SWITCHOFF":
      //                     if (flag != -1) {
      //                         group.children('g[name="offline"]').hide();
      //                         if (flag == 1) {
      //                             group.children('g[name="off"]').show();
      //                             group.children('g[name="on"]').hide();
      //                         }
      //                         if (flag == 0) {
      //                             group.children('g[name="on"]').show();
      //                             group.children('g[name="off"]').hide();
      //                         }
      //                     } else {
      //                         if (group.children('g[name="offline"]').length > 0) {
      //                             group.children('g[name="offline"]').show();
      //                             group.children('g[name="off"]').hide();
      //                         } else {
      //                             group.children('g[name="off"]').show();
      //                         }
      //                         //                                    group.children('g[name="offline"]').show();
      //                         //                                    group.children('g[name="off"]').hide();
      //                         group.children('g[name="on"]').hide();
      //                     }
      //                     break;
      //                 default:
      //                     //其他开关量
      //                     var hideStr, showStr;
      //                     var offlineStr = paramCode + "_offline";
      //                     var onStr = paramCode + "_on";
      //                     var offStr = paramCode + "_off";
      //                     if (flag != -1) {
      //                         group.children('g[name="offline"]').hide();
      //                         if (flag == 1) {
      //                             hideStr = onStr;
      //                             showStr = offStr;
      //                         }
      //                         if (flag == 0) {
      //                             hideStr = offStr;
      //                             showStr = onStr;
      //                         }
      //                         group.children("g[name='" + offlineStr + "']").hide();
      //                         group.children("g[name='" + hideStr + "']").hide();
      //                         group.children("g[name='" + showStr + "']").show();
      //                     } else {
      //                         group.children("g[name='" + onStr + "']").hide();
      //                         group.children("g[name='" + offStr + "']").hide();
      //                         group.children("g[name='" + offlineStr + "']").show();
      //                     }
      //             }
      //         } else {}
      //     }
      //     $.each(group.children("g text"), function (index, element) {
      //         try {
      //             var m = element.attributes.name.textContent;
      //             if (map.has(m.toLowerCase())) {
      //                 var v = map.get(m.toLowerCase());
      //                 var childName = "text[name='" + m + "']";
      //                 group.children(childName).text(map.get(m.toLowerCase()));
      //             }
      //         } catch (err) {
      //             console.log(err);
      //         }
      //     });
      // $.each(group.children("g text"), function (index, element) {
      //     try {
      //         var m = element.attributes.name.textContent;
      //         if (m == "" || m == undefined) {
      //             return ture;
      //         } else {
      //             if (map.has(m.toLowerCase())) {
      //                 var v = map.get(m.toLowerCase());
      //                 var childName = "text[name='" + m + "']";
      //                 if (v == undefined) {
      //                     group.children(childName).text("-");
      //                 } else {
      //                     group.children(childName).text(map.get(m.toLowerCase()));
      //                 }
      //             } else {
      //                 $(this).text("-");
      //             }
      //         }
      //     } catch (err) {}
      // });
      // });
    } else {
      $.each($("text"), function(index, element) {
        try {
          var m = element.attributes.name.textContent;
          if (m == "" || m == undefined) {
            return ture;
          } else {
            $(this).text("-");
          }
        } catch (err) {}
      });
    }
  }
  refreshdata = showDataOnSVG;
});

var tableData = [];

//点击展示表格
function showDetail(type) {
  var cirData;
  $("#modelShow").css("display", "flex");
  $(".nav-tabs li")
    .unbind("click")
    .click(function() {
      tableData = [];
      $(this)
        .addClass("active")
        .siblings()
        .removeClass("active");
      // var paramCode = $(this).attr("id");
      var columns = [
        {
          field: "fMeterCode",
          title: "仪表编号",
          valign: "middle",
          align: "center"
        },
        {
          field: "fMeterName",
          title: "仪表名称",
          valign: "middle",
          align: "center"
        },
        {
          field: "fStatus",
          title: "状态",
          valign: "middle",
          align: "center"
        }
      ];
      switch (type) {
        case "water":
          $("#fCircuitname").text("水浸");
          tableData = waterInfo;
          showTable(tableData, columns);
          break;
        case "smog":
          $("#fCircuitname").text("烟雾");
          tableData = smogInfo;
          showTable(tableData, columns);
          break;
        case "door":
          $("#fCircuitname").text("门状态");
          tableData = doorInfo;
          showTable(tableData, columns);
          break;
        case "noise":
          $("#fCircuitname").text("噪声");
          columns = [
            {
              field: "F_MeterCode",
              title: "仪表编号",
              align: "center"
            },
            {
              field: "F_MeterName",
              title: "仪表名称",
              align: "center"
            },
            {
              field: "noise",
              title: "最新噪声值(dB)",
              align: "center"
            }
          ];
          tableData = noiseInfo;
          showTable(tableData, columns);

          break;
        case "temphumi":
          $("#fCircuitname").text("温湿度");
          columns = [
            {
              field: "F_MeterCode",
              title: "仪表编号",
              align: "center",
              class: "i18n"
            },
            {
              field: "f_MeterName",
              title: "仪表名称",
              align: "center",
              class: "i18n"
            },
            {
              field: "temp",
              title: "最新温度(℃)",
              align: "center",
              class: "i18n"
            },
            {
              field: "humi",
              title: "最新湿度(%)",
              align: "center",
              class: "i18n"
            }
          ];
          tableData = temphumiInfo;
          showTable(tableData, columns);
          break;
        case "value":
          $("#fCircuitname").text("电力参数");
          columns = [
            {
              field: "fParamname",
              title: "参数名称",
              align: "center"
            },
            {
              field: "fValue",
              title: "最新值",
              align: "center"
            },
            {
              field: "fUnitCode",
              title: "单位",
              align: "center"
            }
          ];
          getDataByAjax(
            cirEnergyUrl,
            {
              fCircuitid: fCircuitid
            },
            function(data) {
              tableData = data.meterparamvalueList;
              showTable(tableData, columns);
            }
          );
          break;
      }
    });

  $(".nav-tabs li")[0].click();
}

function pushData(val, paramCode) {
  var row = {};
  row.Paramname = paramCode;
  if (val.fValue != undefined && val.fValue != null) {
    row.fValue = parseFloat(val.fValue).toFixed(2);
  }
  if (val.min != undefined && val.min != null) {
    row.min = parseFloat(val.min).toFixed(2);
  }
  if (val.max != undefined && val.max != null) {
    row.max = parseFloat(val.max).toFixed(2);
  }
  if (val.minTime != undefined && val.minTime != null) {
    row.minTime = val.minTime.substring(5, 16);
  }
  if (val.maxTime != undefined && val.maxTime != null) {
    row.maxTime = val.maxTime.substring(5, 16);
  }
  if (val.avg != undefined && val.avg != null) {
    row.avg = parseFloat(val.avg).toFixed(2);
  }
  tableData.push(row);
}

function closeModel() {
  $("#modelShow").css("display", "none");
}

function showTable(data, columns) {
  // var columns = [
  //     [{
  //             field: "Paramname",
  //             title: Operation["ui_paramname"],
  //             align: "center",
  //             valign: "middle",
  //             align: "center",
  //             colspan: 1,
  //             rowspan: 2
  //         },
  //         {
  //             field: "fValue",
  //             title: Operation["ui_newValue"],
  //             align: "center",
  //             valign: "middle",
  //             align: "center",
  //             colspan: 1,
  //             rowspan: 2
  //         },
  //         {
  //             field: "maxVT",
  //             title: Operation["ui_maxval"],
  //             valign: "middle",
  //             align: "center",
  //             colspan: 2,
  //             rowspan: 1
  //         },
  //         {
  //             field: "minVT",
  //             title: Operation["ui_minval"],
  //             valign: "middle",
  //             align: "center",
  //             colspan: 2,
  //             rowspan: 1
  //         },
  //         {
  //             field: "avg",
  //             title: Operation["ui_avgval"],
  //             valign: "middle",
  //             align: "center",
  //             colspan: 1,
  //             rowspan: 2
  //         }
  //     ],
  //     [{
  //             field: "max",
  //             title: Operation["ui_val"],
  //             valign: "middle",
  //             align: "center"
  //         },
  //         {
  //             field: "maxTime",
  //             title: Operation["ui_time"],
  //             valign: "middle",
  //             align: "center"
  //         },
  //         {
  //             field: "min",
  //             title: Operation["ui_val"],
  //             valign: "middle",
  //             align: "center"
  //         },
  //         {
  //             field: "minTime",
  //             title: Operation["ui_time"],
  //             align: "center"
  //         }
  //     ]
  // ];

  $("#detailTable").empty();
  $("#detailTable").html("<table id='table'></table>");
  $("#table").bootstrapTable({
    columns: columns,
    data: data
  });
}

function refreshDiagramData() {
  var url = baseUrlFromAPP + "/getAppSubimgInfo";
  var params = {
    fSubid: subidFromAPP
  };
  getDataByAjax(url, params, function(data) {
    refreshdata(data.SvgInfo);
  });
}

function getDataByAjax(url, params, successCallback) {
  toast.show({
    text: Operation["ui_loading"],
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
      if (result.code == "5000") {
        var strArr = baseUrlFromAPP.split("/");
        var ipAddress = strArr[0] + "//" + strArr[2];
        $.ajax({
          url:
            "http://www.acrelcloud.cn/SubstationWEBV2/main/uploadExceptionLog",
          type: "POST",
          data: {
            ip: ipAddress,
            exceptionMessage: JSON.stringify(result.data.stackTrace)
          },
          success: function(data) {}
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
    error: function() {
      toast.show({
        text: Operation["code_fail"],
        duration: 2000
      });
    }
  });
}
