var IPServer = 'http://180.76.134.119'
var Home_Ctrl = IPServer + '/gdhly/Home/';
var QueryUser_Ctrl = IPServer + '/gdhly/QueryUser/';
var QueryGPSInfo_Ctrl = IPServer + '/gdhly/QueryGPSInfo/';
var QueryPatrolarea_Ctrl = IPServer + '/gdhly/QueryPatrolarea/';
var QueryAttendance_Ctrl = IPServer + '/gdhly/QueryAttendance/';
var QueryAlrma_Ctrl = IPServer + '/gdhly/QueryAlrma/';
var QueryHotSpot_Ctrl = IPServer + '/gdhly/QueryHotSpot/';
var ManagePatrol_Ctrl = IPServer + '/gdhly/ManagePatrol/';
var Prov_Code = { "OrganID": '2', "OrganName": "广东省" };
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
        link: 'views/blank.html',
        type: 'iframe',
        cached: false,
        needCache: true,
        clsName: 'icon_21'
    },
    {
        id: 'notify',
        name: '通知公告',
        link: '//www.baidu.com/',
        type: 'iframe',
        cached: false,
        needCache: true,
        clsName: 'icon_22'
    },
    {
        id: 'areamange',
        name: '巡护林管理',
        link: 'views/blank.html',
        type: 'iframe',
        cached: false,
        needCache: true,
        clsName: 'icon_23'
    },
    {
        id: 'forestermange',
        name: '护林员管理',
        link: '//www.jd.com',
        type: 'iframe',
        cached: false,
        needCache: true,
        clsName: 'icon_24'
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
    getOnlineUserForMapList: "gis/Demo/data/QueryUser/GetOnlineUserForMapList.json",
    //getOnlineUserForMapList:"http://172.30.3.205:8095/QueryUser/GetOnlineUserForMapList",
    getAlarmsByOrgan: "gis/Demo/data/GetAlarmsByOrgan.json",
    getHotspotList: "gis/Demo/data/GetHotspotList.json",
    getNoticesByOrgan: "gis/Demo/data/GetNoticesByOrgan.json",
    getUserGpsInfo: "gis/Demo/data/GetUserGpsInfo.json",
    getPatrolAreaForEdit: "gis/Demo/data/GetPatrolAreaForEdit.json",
    getPatrolAreaByLocation: "gis/Demo/data/GetPatrolAreaByLocation.json"
};
var BASEMAPURLS = [{
    name: "广东影像图",
    url: 'http://localhost/广东影像地图切片',
    type: 'EsriOffline',
    format: "png",
    project: "EPSG:4326"
}];
var TERRAINPROVIDERURL = 'http://localhost:8035/ContTmsTerrain';
var XHQMAPURLS = {
    "广东省": "http://localhost/测试地图切片/PatrolArea/Layers/_alllayers",
    "阳山县": "http://localhost/测试地图切片/PatrolArea_ysx",
    "兴宁市": "http://localhost/测试地图切片/PatrolArea_xns",//县级市
};
var BASEURL = "/gis/js/Map";
var FILEURL = 'http://120.197.61.115:8081/GDHLYMobileServer/GetAlarmFile/';

var GIS$ = {};
var hlyMap;
var hlyMapService;
