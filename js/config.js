var IPServer = 'http://180.76.134.119/gdhly/';
var Home_Ctrl = IPServer + 'Home/';
var QueryUser_Ctrl = IPServer + 'QueryUser/';
var QueryGPSInfo_Ctrl = IPServer + 'QueryGPSInfo/';
var QueryPatrolarea_Ctrl = IPServer + 'QueryPatrolarea/';
var QueryAttendance_Ctrl = IPServer + 'QueryAttendance/';
var QueryAlrma_Ctrl = IPServer + 'QueryAlrma/';
var QueryHotSpot_Ctrl = IPServer + 'QueryHotSpot/';
var ManagePatrol_Ctrl = IPServer + 'ManagePatrol/';
var unitcode = ($.cookie("unitcode")||'').split(',');
var Prov_Code = { "OrganID": unitcode[2], "OrganName": unitcode[1] };
var TIMEOUT = '1000000';
var MENUS = [
    {
        id: 'home',
        name: '首页',
        link: 'views/main/index.html',
        type: 'load',
        cached: false,
        needCache: true,
        clsName: 'icon_20'
    },
    {
        id: 'report',
        name: '统计图表',
        link: '../QueryReport/AttendanceDetail',
        type: 'iframe',
        cached: false,
        needCache: true,
        clsName: 'icon_21'
    },
    {
        id: 'notify',
        name: '通知公告',
        link: '../ManageNotice/Index',
        type: 'iframe',
        cached: false,
        needCache: true,
        clsName: 'icon_22'
    },
    {
        id: 'areamange',
        name: '巡护区管理',
        link: '../ManageMap/LBSPatrol/index.html',
        type: 'iframe',
        cached: false,
        needCache: true,
        clsName: 'icon_23'
    },
    {
        id: 'forestermange',
        name: '护林员管理',
        link: '../ManageUse/UserBrowsing',
        type: 'iframe',
        cached: false,
        needCache: true,
        clsName: 'icon_24'
    },
    {
        id: 'ManageAttendance',
        name: '考勤管理',
        link: '../ManageAttendance/Journal',
        type: 'iframe',
        cached: false,
        needCache: true,
        clsName: 'icon_241'
    }
];
var PANELMENUS = [
    {
        id: 0,
        name: '护林员',
        link: 'views/main/assist/tabs/forester.html',
        clsName: 'icon_00',
        cached: false
    },
    {
        id: 1,
        name: '轨迹',
        link: 'views/main/assist/tabs/road.html',
        clsName: 'icon_01',
        cached: false
    },
    {
        id: 2,
        name: '巡护区',
        link: 'views/main/assist/tabs/area.html',
        clsName: 'icon_02',
        cached: false
    },
    {
        id: 3,
        name: '考勤',
        link: 'views/main/assist/tabs/attend.html',
        clsName: 'icon_07',
        cached: false
    },
    {
        id: 4,
        name: '事件',
        link: 'views/main/assist/tabs/event.html',
        clsName: 'icon_06',
        cached: false
    },
    {
        id: 5,
        name: '报警',
        link: 'views/main/assist/tabs/c119.html',
        clsName: 'icon_39',
        cached: false
    },
    {
        id: 6,
        name: '热点',
        link: 'views/main/assist/tabs/hot.html',
        clsName: 'icon_05',
        cached: false
    }
];
var SECONDMENUS = [
    {
        id: 'forester',
        name: '护林员', //名字
        link: 'views/main/forester.html', //主面板链接
        clsName: 'icon_00', //图标
        cached: false, //是否缓存了
        panelMenus: [
            PANELMENUS[0],
            PANELMENUS[1],
            PANELMENUS[2],
            PANELMENUS[3]
        ]
    },
    {
        id: 'road',
        name: '轨迹',
        link: 'views/main/query.html',
        clsName: 'icon_01',
        cached: false,
        panelMenus: [
            PANELMENUS[1],
            PANELMENUS[0],
            PANELMENUS[2],
            PANELMENUS[4]
        ]
    },
    {
        id: 'area',
        name: '巡护区',
        link: 'views/main/query.html',
        clsName: 'icon_02',
        cached: false,
        panelMenus: [
            PANELMENUS[2],
            PANELMENUS[0],
            PANELMENUS[1],
            PANELMENUS[4]
        ]
    },
    {
        id: 'c119',
        name: '报警',
        link: 'views/main/query.html',
        clsName: 'icon_39',
        cached: false,
        panelMenus: [
            PANELMENUS[5],
            PANELMENUS[0],
            PANELMENUS[1],
            PANELMENUS[2]
        ]
    },
    {
        id: 'hot',
        name: '热点',
        link: 'views/main/query.html',
        clsName: 'icon_05',
        cached: false,
        panelMenus: [
            PANELMENUS[6],
            PANELMENUS[0],
            PANELMENUS[1],
            PANELMENUS[2]
        ]
    },
    {
        id: 'attend',
        name: '考勤',
        link: 'views/main/query.html',
        clsName: 'icon_07',
        cached: false,
    }
];
var TYPE119 = ['一键报警', '毁林案件', '火情火灾', '破坏林业设施', '野生动植物', '病虫害'];
var serviceUrlConfig = {
	getOnlineUserForMapList: QueryUser_Ctrl + "GetOnlineUserForMapList?disconnectTimer=100000",
	getAlarmsByOrgan: QueryAlrma_Ctrl + "GetAlarmNextDayByOrganId?day=3000&organId=2",
	getHotspotList: QueryHotSpot_Ctrl + "GetHotspotNextDayByOrganId?day=200&organId=2",
	getNoticesByOrgan: IPServer + "QueryNotice/GetNoticesByOrgan?day=300&organId=2",
	getUserGpsInfo: IPServer + "/QueryGPSInfo/GetUserGpsInfo",
    getPatrolAreaForEdit: IPServer + "ManagePatrol/GetPatrolAreaForEdit",
    baseMapUrl: "http://172.30.3.209/GDYX/Layers/_alllayers/",
    /*terrainProviderUrl: "http://172.30.3.204:8035/ContTmsTerrain",*/
    terrainProviderUrl: "https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles",
    gdXhqMapUrl: "http://172.30.3.209/PatrolArea/PatrolArea/PatrolArea/Layers/_alllayers/",
    getPatrolAreaByLocation: IPServer + "/QueryPatrolarea/GetPatrolAreaByLocation"
}
var BASEURL = "/gis/Js/Map";
var FILEURL = 'http://120.197.61.115:8081/GDHLYMobileServer/GetAlarmFile/';

var GIS$ = {};
var hlyMap;
var hlyMapService;

var patrolConfig = function () {
    return {
        serverUrl: IPServer,	/*属性数据服务地址*/
        mapUrl: serviceUrlConfig.baseMapUrl  /*地图切片服务地址*/
    }
}();
