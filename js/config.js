var IPServer = 'http://180.76.134.119'
var Home_Ctrl = IPServer + '/gdhly/Home/';
var QueryUser_Ctrl = IPServer + '/gdhly/QueryUser/'
var QueryGPSInfo_Ctrl = IPServer + '/gdhly/QueryGPSInfo/'
var QueryPatrolarea_Ctrl = IPServer + '/gdhly/QueryPatrolarea/'
var ManagePatrol_Ctrl = IPServer + '/gdhly/ManagePatrol/'
var TIMEOUT = '1000000';
var MENUS = [
    {
        id: 0,
        name: '首页',
        link: 'views/main/index.html',
        type: 'load',
        cached: false,
        needCache: true,
        clsName: 'icon_20'
    },
    {
        id: 1,
        name: '统计图表',
        link: '//www.mi.com/',
        type: 'iframe',
        cached: false,
        needCache: true,
        clsName: 'icon_21'
    },
    {
        id: 2,
        name: '通知公告',
        link: '//www.baidu.com/',
        type: 'iframe',
        cached: false,
        needCache: true,
        clsName: 'icon_22'
    },
    {
        id: 3,
        name: '巡护林管理',
        link: '//www.google.com/',
        type: 'iframe',
        cached: false,
        needCache: true,
        clsName: 'icon_23'
    },
    {
        id: 4,
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
        clsName: 'icon_00'
    },
    {
        id: 1,
        name: '轨迹',
        link: 'views/main/assist/tabs/road.html',
        clsName: 'icon_01'
    },
    {
        id: 2,
        name: '巡护区',
        link: 'views/main/assist/tabs/area.html',
        clsName: 'icon_02'
    },
    {
        id: 3,
        name: '考勤',
        link: 'views/main/assist/tabs/attend.html',
        clsName: 'icon_07'
    },
    {
        id: 4,
        name: '事件',
        link: 'views/main/assist/tabs/event.html',
        clsName: 'icon_06'
    },
    {
        id: 5,
        name: '报警',
        link: 'views/main/assist/tabs/119.html',
        clsName: 'icon_04'
    },
    {
        id: 6,
        name: '热点',
        link: 'views/main/assist/tabs/hot.html',
        clsName: 'icon_05'
    }
];
var SECONDMENUS = [
    {
        id: 0,
        name: '护林员', //名字
        link: 'views/main/forester.html', //主面板链接
        clsName: 'icon_00', //图标
        cached: false, //是否缓存了
        panelMenus: [ //副面板菜单
            PANELMENUS[0],
            PANELMENUS[1],
            PANELMENUS[2],
            PANELMENUS[3]
        ]
    },
    {
        id: 1,
        name: '轨迹',
        link: 'views/blank.html',
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
        id: 2,
        name: '巡护区',
        link: 'views/blank.html',
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
        id: 3,
        name: '报警',
        link: 'views/blank.html',
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
        id: 4,
        name: '热点',
        link: 'views/blank.html',
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
        id: 5,
        name: '考勤',
        link: 'views/blank.html',
        clsName: 'icon_07',
        cached: false,
    }
];

var serviceUrlConfig = {
    GetOnlineUserForMapList: "gis/Demo/data/QueryUser/GetOnlineUserForMapList.json",
    //GetOnlineUserForMapList:"http://172.30.3.205:8095/QueryUser/GetOnlineUserForMapList",
    GetAlarmsByOrgan: "gis/Demo/data/GetAlarmsByOrgan.json",
    GetHotspotList: "gis/Demo/data/GetHotspotList.json",
    GetNoticesByOrgan: "gis/Demo/data/GetNoticesByOrgan.json",
    GetUserGpsInfo: "gis/Demo/data/GetUserGpsInfo.json",
    GetPatrolAreaForEdit: "gis/Demo/data/GetPatrolAreaForEdit.json",
    GetPatrolAreaByLocation: "gis/Demo/data/GetPatrolAreaByLocation.json",
};
var GIS$ = {};
var hlyMap;
var layerManage;