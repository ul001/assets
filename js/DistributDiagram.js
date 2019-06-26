$(function(){
	var url = "http://116.236.149.162:8090/SubstationWEBV2/Subimg/getAppSubimgInfo";
	var params = {
		fSubid:"10100002",
	}
	tool.getDataByAjax(url,params,function(data){
		showSVG(data.xmlContent);
		showList(data.list);
		showDataOnSVG(data.SvgInfo);
	})

	function showSVG(path){
		$(".diagram").html("");
		$(".diagram").append(path);
		$('g[name="off"]').hide();
		$(".diagram").overscroll();
	}

	function showList(data){
		$("#subList").html("")
		if(data.length>0){
			$.each(data,function(index, el) {
				var string = "<option>"+el.fCustomname+"</option>";
				$("#subList").append(string);
			});
		}
	}

   $("#subList").change(function (event) {
	    var fCustomname = $("#subList").val();
	  	var url = "http://116.236.149.162:8090/SubstationWEBV2/Subimg/getAppSubimgInfo";
		var params = {
			fSubid:"10100002",
			fCustomname:fCustomname,
		}
		tool.getDataByAjax(url,params,function(data){
			showSVG(data.xmlContent);
			showDataOnSVG(data.SvgInfo);
		})
    });

	function showDataOnSVG(data){
        var map = new Map();
        var group;
        if(data.length>0){
            $.each(data, function (key, val) {
                group = $("#" + val.fCircuitid);
                for (i = 0; i < val.meterParamValues.length; i++) {
                    var paramCode = val.meterParamValues[i].fParamcode;
                    var fvalue = val.meterParamValues[i].fValue;
                    var valjoinunit = val.meterParamValues[i].fValuejoinunit;
                    map.set(paramCode.toLowerCase(), valjoinunit);
                    switch (paramCode.toUpperCase()) {
                        case "SWITCH":
                        case "SWITCHON":
                            (1 === fvalue) ? (group.children('g[name="off"]').hide(), group.children('g[name="on"]').show()) : (group.children('g[name="on"]').hide(),
                                group.children('g[name="off"]').show());
                            break;
                        case "SWITCHOFF":
                            (0 === fvalue) ? (group.children('g[name="off"]').hide(), group.children('g[name="on"]').show()) : (group.children('g[name="on"]').hide(),
                                group.children('g[name="off"]').show());
                            break;
                        default:
                    }
                } 

                $.each(group.children('g text'), function (index, element) {
                    try {
                        var m = element.attributes.name.textContent;
                        if (map.has(m.toLowerCase())) {

                            var v = map.get(m.toLowerCase());
                            var childName = "text[name='" + m + "']";

                            group.children(childName).text(map.get(m.toLowerCase()));
                        }
                    } catch (err) {

                    }
                });
            });
        }
	}
})
