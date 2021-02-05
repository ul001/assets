var MyMqttClient={
    myClient:null,
    connectUrl:'ws://' + '116.236.149.165:18083' + '/mqtt',
    options:{
        clean: true, // true: 清除会话, false: 保留会话
        connectTimeout: 4000, // 超时时间
        // 认证信息
        clientId: Math.ceil(Math.random()*10000000000),
        username:"webuser",
        password:"123456",
    },
    initClient:function(){
        var mqttClient=mqtt.connect(this.connectUrl,this.options);
        mqttClient.on('connect',function (e) {
            console.log('连接成功:', e);
        });
        mqttClient.on('error',function (error) {
            console.log('连接失败:', error);
        });
        this.myClient = mqttClient;
    },
    getClient:function(){
        if (this.myClient==null){
            this.initClient();
        }
        return this.myClient;
    },
    loadMqttJs:function () {
        document.write("<script type='text/javascript' src='lib/mqtt.min.js'></script>");
    },

};

window.onload=MyMqttClient.loadMqttJs();