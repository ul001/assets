function utils() {
    this.getAjaxJsonHelper = function (header,url, data, callBack) {
        this.ajax(header,url, "get", data, "JSON", callBack)
    }
    this.postAjaxJsonHelper = function (header,url, data, callBack) {
        this.ajax(header,url, "post", data, "JSON", callBack)
    }
    this.postAjaxTextHelper = function (header,url, data, callBack) {
        this.ajax(header,url, "post", data, "text", callBack)
    }
    this.getAjaxHelper = function (header,url, data, returnType, callBack) {
        this.ajax(header,url, "get", data, returnType, callBack)
    }
    this.postAjaxHelper = function (header,url, data, returnType, callBack) {
        this.ajax(header,url, "post", data, returnType, callBack)
    }
    this.ajax = function (header,url, type, data, returnType, callBack) {
        $.ajax({
            "headers":header,
            "url": url,//url路径
            "type": type,//提交请求的方式
            "data": data,//提交的数据
            "dataType": returnType,//提交的数据
            "success": callBack,//调用成功，返回数据后调用的函数
            "error": function () {
                alert("服务器错误");
            }
        })
    }
    this.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  // 匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; // 返回参数值
    }
}

var ajaxUtil = new utils();