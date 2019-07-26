$(function () {
  //  var baseUrlFromAPP="http://116.236.149.162:8090/SubstationWEBV2";
  //  var tokenFromAPP="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjQxNDMxODksInVzZXJuYW1lIjoiYWRtaW4ifQ.t7BbigTS38rYbKXSNWSu2ggIbuLn9nAEneQv_Gkze44";
  //  var subidFromAPP=10100001;
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
    $("body").showLoading();
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

  $(document).on('click', '.elec-btn .btn', function () {
    if ($(this).hasClass('select')) {
      $(this).removeClass('select');
    } else {
      $(this).addClass('select');
    }
  });

  $("#sideClick").click(function () {
    $(".tree").show();
    $("html,body").addClass("ban_body");
  });

  $(".cancel").click(function () {
    $(".tree").hide();
    $("html,body").removeClass("ban_body");
  });

  $("#confirm").click(function () {
    $(".tree").hide();
    $("html,body").removeClass("ban_body");
    $("#meter").html(currentSelectVode.merterName);
  });

  $("#electric").click(function () {
    $(".category").show();
  });

  $(document).on('click', '#search', function () {
    $("body").showLoading();
    var EnergyKind = $("#EnergyKind").attr('value');
    var selectParam = [];
    if (EnergyKind != "fFr") {
      var select = $(".btn.select");
      $.each(select, function (index, val) {
        selectParam.push($(val).attr("value"))
      })
    }
    var fCircuitid = currentSelectVode.merterId;
    var time = $("#date").val();
    var url = baseUrlFromAPP + "/main/app/powerMonitoring/ElectricData";
    var params = {
      fSubid: subidFromAPP,
      fCircuitid: fCircuitid,
      time: time,
      fPhase: selectParam.join("-"),
      EnergyKind: EnergyKind,
    }
    getData(url, params, function (data) {
      $("body").hideLoading();
      showCharts(data.CircuitValueByDate);
    });
  })


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
  }

  /*  $(document).on("click",".category li",function(){
      var type = $(this).children('label').attr("value");
      var text = $(this).children('label').text();
      generateType(type);
      $("#EnergyKind").attr("value",type);
      $("#param").html(text);
      $("#myModal").modal("hide");
    })*/

  function generateType(type) {
    var List = [{
      "id": "PF",
      "name": "功率因数",
      "phase": [{
        "id": "fPf",
        "name": "总"
      }, {
        "id": "fPfa",
        "name": "A相"
      }, {
        "id": "fPfb",
        "name": "B相"
      }, {
        "id": "fPfc",
        "name": "C相"
      }]
    }]
    var arr = $.grep(List, function (obj) {
      return obj.id == type;
    })
    $("#EnergyContain").html("");
    if (arr[0].hasOwnProperty('phase')) {
      $.each(arr[0].phase, function (index, val) {
        var string = '<button type="button" class="btn" value="' + val.id + '">' + val.name + '</button>';
        $("#EnergyContain").append(string);
      })
      $("#EnergyContain button:first").addClass('select');
    }
  }

  function showCharts(data) {
    var time = [];
    var value = [];
    var name = [];
    var tableData = [];
    if (data.length > 0) {
      $.each(data, function (index, el) {
        if ($.inArray(el.fCollecttime.substring(11, 16), time) == -1) {
          time.push(el.fCollecttime.substring(11, 16));
        }
        if (value.length == 0) {
          name.push(el.fParamcode.substring(1));
          value.push({
            name: el.fParamcode.substring(1),
            value: []
          });
          tableData.push({
            name: el.fParamcode.substring(1),
            sum: 0,
            avg: 0,
            max: [el.fParamvalue],
            maxTime: [el.fCollecttime.substring(11, 16)],
            min: [el.fParamvalue],
            minTime: [el.fCollecttime.substring(11, 16)]
          });
        }
        if ($.inArray(el.fParamcode.substring(1), name) != -1) {
          value[$.inArray(el.fParamcode.substring(1), name)].value.push(el.fParamvalue);

          var num = tableData[$.inArray(el.fParamcode.substring(1), name)].sum + el.fParamvalue;
          var length = value[$.inArray(el.fParamcode.substring(1), name)].value.length;
          var avg = (num / length).toFixed(2);
          tableData[$.inArray(el.fParamcode.substring(1), name)].sum = num;
          tableData[$.inArray(el.fParamcode.substring(1), name)].avg = avg;

          if (el.fParamvalue > tableData[$.inArray(el.fParamcode.substring(1), name)].max) {
            tableData[$.inArray(el.fParamcode.substring(1), name)].max = el.fParamvalue;
            tableData[$.inArray(el.fParamcode.substring(1), name)].maxTime = el.fCollecttime.substring(11, 16);
          }

          if (el.fParamvalue < tableData[$.inArray(el.fParamcode.substring(1), name)].min) {
            tableData[$.inArray(el.fParamcode.substring(1), name)].min = el.fParamvalue;
            tableData[$.inArray(el.fParamcode.substring(1), name)].minTime = el.fCollecttime.substring(11, 16);
          }
        } else {
          name.push(el.fParamcode.substring(1));
          value.push({
            name: el.fParamcode.substring(1),
            value: [el.fParamvalue]
          });
          tableData.push({
            name: el.fParamcode.substring(1),
            sum: el.fParamvalue,
            avg: el.fParamvalue,
            max: [el.fParamvalue],
            maxTime: [el.fCollecttime.substring(11, 16)],
            min: [el.fParamvalue],
            minTime: [el.fCollecttime.substring(11, 16)]
          })
        }
      });
    }

    showLine(name, time, value);
    showTable(tableData)
  }

  function showLine(name, time, value) {
    var series = [];
    $.each(value, function (index, el) {
      series.push({
        name: el.name,
        data: el.value,
        type: 'line',
      })
    });
    $("#chartContain").removeAttr('_echarts_instance_');
    var line = echarts.init(document.getElementById('chartContain'));
    var option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        top: 12,
        data: name,
      },
      grid: { // 控制图的大小，调整下面这些值就可以，
        top: '20%',
        left: '12%',
        right: '6%',
        bottom: '29%',
      },
      xAxis: {
        type: 'category',
        data: time,
      },
      yAxis: {
        type: 'value',
        scale: true, //y轴自适应
      },
      toolbox: {
        left: 'right',
        top: -6,
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          dataView: {
            readOnly: true
          },
          restore: {}
        }
      },
      dataZoom: [{
        startValue: time[0]
      }, {
        type: 'inside'
      }],
      calculable: true,
      series: series,
    };
    line.setOption(option);
  }

  function showTable(data) {
    var columns = [
      [{
          field: "name",
          title: "类型",
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
  }


  var time = tool.initDate("YMD", new Date());
  $("#date").val(time);

  var roll = new Rolldate({
    el: '#date',
    format: 'YYYY-MM-DD',
    beginYear: 2000,
    endYear: 2100,
    value: time,
    confirm: function (date) {
      var d = new Date(),
        d1 = new Date(date.replace(/\-/g, "\/")),
        d2 = new Date(d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate()); //如果非'YYYY-MM-DD'格式，需要另做调整
      if (d1 > d2) {
        return false;
      };
    }
  });
  $(".selectTime").click(function () {
    roll.show();
  });
});