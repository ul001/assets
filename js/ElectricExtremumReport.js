$(function () {
//    var baseUrlFromAPP="http://116.236.149.162:8090/SubstationWEBV2";
//    var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjQyMzE3NzMsInVzZXJuYW1lIjoiYWRtaW4ifQ.pfgcsrczhtQN9jwzgeM568npgMAUVsca-cd1AJoc6_s";
//    var subidFromAPP=10100001;
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

  var currentSelectVode = {}; //选中节点

  initFirstNode(); //初始化第一个回路
  var isClick = 0;

  function initFirstNode() {
    var url = baseUrlFromAPP + "/main/getfCircuitidsList";
    var params = {
      fSubid: subidFromAPP,
    }
    getData(url, params, function (data) {
      setListData(data);
      $("#search").click();
    });
  }

  $("#CircuitidsList").click(function () {
    var search = $("#CircuitidsInput").val();
    var url = baseUrlFromAPP + "/main/getfCircuitidsList";
    var params = {
      fSubid: subidFromAPP,
      search: search,
    }
    getData(url, params, function (data) {
      setListData(data);
    });
    isClick = 1;
  });

  $(document).on('click', '.clear', function () {
    $("#CircuitidsInput").val("");
    if (isClick == 1) {
      var url = baseUrlFromAPP + "/main/getfCircuitidsList";
      var params = {
        fSubid: subidFromAPP,
      }
      getData(url, params, function (data) {
        setListData(data);
      });
      isClick = 0;
    }
  });

  $("#sideClick").click(function () {
    $(".tree").show();
    $("html,body").addClass("ban_body")
  });

  $(".cancel").click(function () {
    $(".tree").hide();
  });

  $("#confirm").click(function () {
    $(".tree").hide();
    $("#meter").html(currentSelectVode.merterName);
  });

  $(document).on('click', '#search', function () {
    var EnergyKind = $("#energySelect").val();
    var fCircuitid = currentSelectVode.merterId;
    var time = $("#date").val();
    var selectVal = $(".elec-btn .select").attr('value');
    var url = baseUrlFromAPP + "/main/elecMaxMinAvgValue";
    if (selectVal == "month") {
      time = time + "-01";
    }
    var params = {
      fSubid: subidFromAPP,
      fCircuitids: fCircuitid,
      time: time,
      selectType: selectVal,
      selectParam: EnergyKind,
    };
    if (EnergyKind == "Voltage2") {
      params.selectParam = "Voltage";
    };

    getData(url, params, function (data) {
      switch (EnergyKind) {
        case "P":
          generateType(EnergyKind, data.P);
          break;
        case "I":
          generateType(EnergyKind, data.I);
          break;
        case "Voltage":
          generateType(EnergyKind, data.Voltage);
          break;
        case "Voltage2":
          params.selectParam = "Voltage";
          generateType(EnergyKind, data.Voltage);
          break;
        case "UnBalance":
          generateType(EnergyKind, data.UnBalance);
          break;
        case "UHR":
          generateType(EnergyKind, data.UHR);
          break;
        case "IHR":
          generateType(EnergyKind, data.IHR);
          break;
      }
    });
  });

  function getData(url, params, successCallback) {
    var token = tokenFromAPP;
    $.ajax({
      type: 'GET',
      url: url,
      data: params,
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", token)
      },
      success: function (result) {
        successCallback(result.data);
      }
    })
  }

  function setListData(data) {
    $('#treeview').treeview({
      data: data,
      showIcon: true,
      showBorder: true,
      expandIcon: "glyphicon glyphicon-plus",
      collapseIcon: "glyphicon glyphicon-minus",
    });
    $('#treeview').treeview('selectNode', 0);
    currentSelectVode.merterId = $('#treeview').treeview('getSelected')[0].id;
    currentSelectVode.merterName = $('#treeview').treeview('getSelected')[0].text;
    $("#meter").html(currentSelectVode.merterName);
    $('#treeview').on('nodeSelected', function (event, node) {
      currentSelectVode.merterId = node.id;
      currentSelectVode.merterName = node.text;
    })
  };

  function setTableData(arr, list) {
    var listVal = list[0];
    var tableData = [];
    var selectVal = $(".elec-btn .select").attr('value');
    $.each(list, function (key, obj) {
      $.each(arr, function (key1, obj1) {
        if (selectVal == "day") {
          tableData.push({
            paramName: obj1.name,
            avg: obj[obj1.id + "avg"],
            max: obj[obj1.id + "maxvalue"],
            maxTime: obj[obj1.id + "maxtime"].substring(11, 16),
            min: obj[obj1.id + "minvalue"],
            minTime: obj[obj1.id + "mintime"].substring(11, 16)
          });
        } else if (selectVal == "month") {
          tableData.push({
            paramName: obj1.name,
            avg: obj[obj1.id + "avg"],
            max: obj[obj1.id + "maxvalue"],
            maxTime: (obj[obj1.id + "maxtimeS"].substring(8, 10) + "日" + obj[obj1.id + "maxtimeS"].substring(10, 16)),
            min: obj[obj1.id + "minvalue"],
            minTime: (obj[obj1.id + "mintimeS"].substring(8, 10) + "日" + obj[obj1.id + "mintimeS"].substring(10, 16))
          });
        }
      });
    });
    showTable(tableData);
  };

  function generateType(type, list) {
    var paramList = [{
        "id": "P",
        "name": "功率",
        "phase": [{
          "id": "fP",
          "name": "有功功率(kW)"
        }, {
          "id": "fQ",
          "name": "无功功率(kVar)"
        }, {
          "id": "fS",
          "name": "视在功率(kVA)"
        }, {
          "id": "fPf",
          "name": "功率因数"
        }]
      },
      {
        "id": "I",
        "name": "电流",
        "phase": [{
          "id": "fIa",
          "name": "A相电流(A)"
        }, {
          "id": "fIb",
          "name": "B相电流(A)"
        }, {
          "id": "fIc",
          "name": "C相电流(A)"
        }]
      },
      {
        "id": "Voltage",
        "name": "相电压",
        "phase": [{
          "id": "fUa",
          "name": "A相电压(V)"
        }, {
          "id": "fUb",
          "name": "B相电压(V)"
        }, {
          "id": "fUc",
          "name": "C相电压(V)"
        }]
      },
      {
        "id": "Voltage2",
        "name": "线电压",
        "phase": [{
          "id": "fUab",
          "name": "AB线电压(V)"
        }, {
          "id": "fUbc",
          "name": "BC线电压(V)"
        }, {
          "id": "fUca",
          "name": "CA线电压(V)"
        }]
      },
      {
        "id": "UnBalance",
        "name": "不平衡度",
        "phase": [{
          "id": "fVub",
          "name": "电压三相不平衡度(%)"
        }, {
          "id": "fCub",
          "name": "电流三相不平衡度(%)"
        }]
      },
      {
        "id": "UHR",
        "name": "电压谐波",
        "phase": [{
          "id": "fUahr",
          "name": "A相电压总谐波含有率(%)"
        }, {
          "id": "fUbhr",
          "name": "B相电压总谐波含有率(%)"
        }, {
          "id": "fUchr",
          "name": "C相电压总谐波含有率(%)"
        }]
      },
      {
        "id": "IHR",
        "name": "电流谐波",
        "phase": [{
          "id": "fIahr",
          "name": "A相电流总谐波含有率(%)"
        }, {
          "id": "fIbhr",
          "name": "B相电流总谐波含有率(%)"
        }, {
          "id": "fIchr",
          "name": "C相电流总谐波含有率(%)"
        }]
      }
    ];
    var arr = $.grep(paramList, function (obj) {
      return obj.id == type;
    });
    setTableData(arr[0].phase, list);
  };

  function showTable(data) {
    var columns = [
      [{
          field: "paramName",
          title: "参数名称",
          align: "center",
          valign: "middle",
          align: "center",
          colspan: 1,
          rowspan: 2
        },
        {
          field: "maxVT",
          title: "最大值",
          valign: "middle",
          align: "center",
          colspan: 2,
          rowspan: 1
        },
        {
          field: "minVT",
          title: "最小值",
          valign: "middle",
          align: "center",
          colspan: 2,
          rowspan: 1
        },
        {
          field: "avg",
          title: "平均值",
          valign: "middle",
          align: "center",
          colspan: 1,
          rowspan: 2
        }
      ],
      [{
          field: "max",
          title: "值",
          valign: "middle",
          align: "center"
        },
        {
          field: "maxTime",
          title: "时间",
          valign: "middle",
          align: "center"
        },
        {
          field: "min",
          title: "值",
          valign: "middle",
          align: "center"
        },
        {
          field: "minTime",
          title: "时间",
          align: "center"
        }
      ]
    ];
    $("#tableContain").html("");
    $("#tableContain").html("<table id='table'></table>");
    $("#table").bootstrapTable({
      columns: columns,
      data: data,
    })
  };


  var time = tool.initDate("YMD", new Date());
  $(document).on('click', '.elec-btn .btn', function () {
    var obj = $(this);
    $(this).addClass('select').siblings("button").removeClass('select');
    var selectParam = $(this).attr('value');
    if (selectParam == "day") {
      showtimeForElectSum = tool.initDate("YMD", new Date());
      $("#date").val(showtimeForElectSum);
      roll.config.format = "YYYY-MM-DD";
      $("#preVal").text("上一日");
      $("#nextVal").text("下一日");
    } else if (selectParam == "month") {
      showtimeForElectSum = tool.initDate("YM", new Date());
      $("#date").val(showtimeForElectSum);
      roll.config.format = "YYYY-MM";
      $("#preVal").text("上一月");
      $("#nextVal").text("下一月");
    }
    initQuick(selectParam);
    roll.value = showtimeForElectSum;
  });
  $("#date").val(time);
  var roll = new Rolldate({
    el: '#date',
    format: 'YYYY-MM-DD',
    beginYear: 2000,
    endYear: 2100,
    value: time,
    /*      confirm: function (date) {
            var d = new Date(),
            d1 = new Date(date.replace(/\-/g, "\/")),
            d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()); //如果非'YYYY-MM-DD'格式，需要另做调整
            if (d1 > d2) {
              return false;
            };
          }*/
  });
  var selectReport = $(".elec-btn .select").attr('value');
  initQuick(selectReport);

  function initQuick(type) {
    $("#datePre").unbind("click");
    $("#dateNext").unbind("click");
    if (type == "day") {
      $("#datePre").click(function () {
        var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
        var preDate = new Date(selectDate.getTime() - 24 * 60 * 60 * 1000);
        $("#date").val(preDate.getFullYear() + "-" + ((preDate.getMonth()) < 9 ? ("0" + (preDate.getMonth() + 1)) : (preDate.getMonth() + 1)) + "-" + (preDate.getDate() < 10 ? ("0" + preDate.getDate()) : (preDate.getDate())));
      });
      $("#dateNext").click(function () {
        var d = new Date();
        var nowDate = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate());
        var selectDate = new Date($("#date").val().replace(/\-/g, "\/"));
        if (selectDate < nowDate) {
          var nextDate = new Date(selectDate.getTime() + 24 * 60 * 60 * 1000);
          $("#date").val(nextDate.getFullYear() + "-" + ((nextDate.getMonth()) < 9 ? ("0" + (nextDate.getMonth() + 1)) : (nextDate.getMonth() + 1)) + "-" + (nextDate.getDate() < 10 ? ("0" + nextDate.getDate()) : (nextDate.getDate())));
        } else {
          return;
        }
      });
    } else if (type == "month") {
      $("#datePre").click(function () {
        var selectDate = new Date(($("#date").val() + "-01").replace(/\-/g, "\/"));
        var preDate = new Date(selectDate.setMonth(selectDate.getMonth() - 1));
        $("#date").val(preDate.getFullYear() + "-" + ((preDate.getMonth()) < 9 ? ("0" + (preDate.getMonth() + 1)) : (preDate.getMonth() + 1)));
      });
      $("#dateNext").click(function () {
        var d = new Date();
        var nowDate = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + '01');
        var selectDate = new Date(($("#date").val() + "-01").replace(/\-/g, "\/"));
        if (selectDate < nowDate) {
          var nextDate = new Date(selectDate.setMonth(selectDate.getMonth() + 1));
          $("#date").val(nextDate.getFullYear() + "-" + ((nextDate.getMonth()) < 9 ? ("0" + (nextDate.getMonth() + 1)) : (nextDate.getMonth() + 1)));
        } else {
          return;
        }
      });
    }
  }
});