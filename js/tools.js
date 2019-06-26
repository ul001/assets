var tool = {
	initDate:function(type,date){
		var year = date.getFullYear();
        var month = date.getMonth()+1;
        if(month<10){
		    month = "0"+month;
		}
		var today = date.getDate();
		if(today<10){
		    today = "0"+today;
		}

		var lastDay;
		if(month==0){
            year = year-1;
            var day = new Date(year,12,0);
            lastDay = day.getDate();
        }else {
            var day = new Date(year,month,0);
            lastDay = day.getDate();//获取某月最后一天
        }

		var result="";

		switch(type){
			//年、月
			case "YM":
				result = year+"-"+month;
				break;
			//年、月、日
			case "YMD":
				result = year+"-"+month+"-"+today;
				break;
			//年、月、日
			case "yesteray":
				var yesteray = today-1;
				result = year+"-"+month+"-"+yesteray;
				break;
			//第一天
			case "first":
				result = year+"-"+month+"-"+"01";
				break;
			//最后一天
			case "last":
				result = year+"-"+month+"-"+lastDay;
				break;
		}

		return result;
	},

	getDataByAjax:function(url,params,successCallback){
	    var token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NjE1NzU4NjIsInVzZXJuYW1lIjoiYWRtaW4ifQ.xQSrEuWSsvzBUQpsrHVDXW4qAvKYvRu85wJNlHH9_AA";  
	    $.ajax({
	        type:'GET',
	        url:url,
	        data:params,
	        beforeSend:function(request){
	            request.setRequestHeader("Authorization",token)
	        },
	        success:function(result){
	            successCallback(result.data);
	        }
	    })
	}
}
