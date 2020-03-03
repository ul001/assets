//语言字段传参
var languageOption = "zh";

//iOS安卓基础传参
var u = navigator.userAgent,
  app = navigator.appVersion;
var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1; //安卓系统
var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios系统
//判断数组中是否包含某字符串
try{
    if (isIOS) {
      //ios系统的处理
      window.webkit.messageHandlers.iOS.postMessage(null);
      var storage = localStorage.getItem("accessToken");
      // storage = storage ? JSON.parse(storage):[];
      storage = JSON.parse(storage);
      languageOption = storage.languageType;
    } else if (isAndroid) {
      languageOption = android.postLanguage();
    }
}catch(e){
    languageOption = "zh"
}

var Substation = {
  loadLanguageJS: function () {
    if (languageOption == "en") {
      getEnLanguage();
    } else {
      getZhLanguage();
    }
    this.loadLanguageData();
  },
  loadLanguageData: function () {
    $("[data-i18n]").each(function () {
      $(this).html(Operation[$(this).data("i18n")]);
    });
    $("[data-placeholder]").each(function () {
      $(this).attr('placeholder', Operation[$(this).data("placeholder")]);
    });
  },
  showCodeTips: function (code) {
    if (Operation['code_' + code] == undefined || Operation['code_' + code] == null) {
      return Operation['code_other'];
    } else {
      return Operation['code_' + code];
    }
  },
}

$(document).ready(function () {
  Substation.loadLanguageJS();
});