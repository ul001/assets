 pannellum.viewer('panorama', {
     "type": "equirectangular", //Pannellum支持四种处理全景图片的方式：equirectangular,partial,cubic,multi-resolution
     "panorama": "https://pannellum.org/images/alma.jpg", //图片路径
     //  "author": "Na", //展示全景图作者
     //  "showControls": true,
     "allow_user_interactions": false,
     "showControls": false, //是否显示控制按钮，默认true；
     "autoLoad": true,
 });
 window.addEventListener('load', bodyLoad);
 var p;

 function bodyLoad() {
     // 多场景配置
     p = pannellum.viewer('panorama', {
         "default": {
             "firstScene": "circle", //首次加载那个图片
             //  "author": "lyj", //作者
             "sceneFadeDuration": 1000, //全景图场景切换时的持续时间
             "autoLoad": true, //自动加载
             //  "orientationOnByDefault": true, //是否开启重力感应查看全景图，默认false
             //  "showControls": false, //是否显示控制按钮，默认true；
             //  "autoRotate": -2, //是否自动旋转，在加载之后，全景图会水平旋转显示，负数为往右边旋转，整数为往左边旋转，值为数字类型；
             //  "autoRotateInactivityDelay": 2000 //在autoRotate设定的情况下，用户停止操作多长时间后继续自动旋转，单位为毫秒；
         },
         //场景，值为对象，其属性名代表着场景的id（sceneId），属性值为viewer的配置参数，其参数会覆盖默认（上述中的default对象）设置的参数；
         "scenes": {
             "circle": {
                 "title": "盟",
                 "hfov": 110,
                 "pitch": -3,
                 "yaw": 117,
                 "type": "equirectangular",
                 "panorama": "https://pannellum.org/images/alma.jpg", //图片路径
                 "hotSpots": [ //热点，以全景为坐标系的固定点，可以设置链接跳转和点击事件，也可以跳转到不同的场景，该属性的值为对象
                     {
                         "pitch": -2.1, //定位参数， 单位：角度
                         "yaw": 132.9, //定位参数， 单位：角度 y轴，空间中的纵轴
                         "type": "scene", //热点类型，scene 场景切换热点； info 信息展示（外加image\video）；URL 以热点为链接，跳转到其他页面的`url
                         "text": "跳转house",
                         "cssClass": "pnlm-hotspot pnlm-sprite pnlm-scene1", //自定义样式
                         "sceneId": "house" //sceneId 需要切换的场景id，当 type 为 scene使用；
                     },
                     {
                         "pitch": -12,
                         "yaw": 170,
                         "type": "info",
                         "text": "这是一个图标的展示信息"
                     }, {
                         "pitch": -10,
                         "yaw": -50,
                         "type": "info",
                         "text": "This is a link.",
                         "URL": "DistributDiagram.html?pushType=1"
                         //  "URL": "https://github.com/mpetroff/pannellum"
                     }, {
                         "pitch": 0,
                         "yaw": -60,
                         "type": "scene",
                         "text": "跳转room",
                         "sceneId": "room"
                     }
                 ]
             },
             "house": {
                 "title": "House",
                 "hfov": 110,
                 "yaw": 5,
                 "type": "equirectangular",
                 "panorama": "https://pannellum.org/images/alma.jpg", //图片路径
                 "hotSpots": [{
                     "pitch": -0.6,
                     "yaw": 37.1,
                     "type": "scene",
                     "text": "Click2",
                     "sceneId": "room",
                     "targetYaw": -23,
                     "targetPitch": 2
                 }, {
                     "pitch": -2.1, //定位参数， 单位：角度
                     "yaw": 232.9, //定位参数， 单位：角度 y轴，空间中的纵轴
                     "type": "scene", //热点类型，scene 场景切换热点； info 信息展示；URL 以热点为链接，跳转到其他页面的`url
                     "text": "back",
                     "sceneId": "circle" //sceneId 需要切换的场景id，当 type 为 scene使用；
                 }]
             },
             "room": {
                 "title": "Room",
                 "hfov": 110,
                 "yaw": 5,
                 "type": "equirectangular",
                 "panorama": "https://pannellum.org/images/alma.jpg", //图片路径
                 "hotSpots": [{
                     "pitch": -0.6,
                     "yaw": 37.1,
                     "type": "info",
                     "text": "showRoomInfo",
                     "targetYaw": -23,
                     "targetPitch": 2
                 }, {
                     "pitch": -2.1, //定位参数， 单位：角度
                     "yaw": 232.9, //定位参数， 单位：角度 y轴，空间中的纵轴
                     "type": "scene", //热点类型，scene 场景切换热点； info 信息展示；URL 以热点为链接，跳转到其他页面的`url
                     "text": "back",
                     "sceneId": "circle" //sceneId 需要切换的场景id，当 type 为 scene使用；
                 }]
             }
         }
     });
 }