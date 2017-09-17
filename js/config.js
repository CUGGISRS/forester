var IPServer = 'http://180.76.134.119'
var Home_Ctrl = IPServer + '/gdhly/Home/';
var QueryUser_Ctrl = IPServer + '/gdhly/QueryUser/'
var TIMEOUT = '10000';
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
        name: '护林员', //名字
        link: 'views/main/forester.html', //主面板链接
        assist: 'views/main/assist/main.html', //副面板主页
        clsName: 'icon_00', //图标
        panelMenus: [ //副面板菜单
            PANELMENUS[0],
            PANELMENUS[1],
            PANELMENUS[2],
            PANELMENUS[3]
        ]
    },
    {
        name: '轨迹',
        link: 'views/blank.html',
        assist: '',
        clsName: 'icon_01',
        panelMenus: [
            PANELMENUS[1],
            PANELMENUS[0],
            PANELMENUS[2],
            PANELMENUS[4]
        ]
    },
    {
        name: '巡护区',
        link: 'views/blank.html',
        assist: '',
        clsName: 'icon_02',
        panelMenus: [
            PANELMENUS[2],
            PANELMENUS[0],
            PANELMENUS[1],
            PANELMENUS[4]
        ]
    },
    {
        name: '报警',
        link: 'views/blank.html',
        assist: '',
        clsName: 'icon_04',
        panelMenus: [
            PANELMENUS[5],
            PANELMENUS[0],
            PANELMENUS[1],
            PANELMENUS[2]
        ]
    },
    {
        name: '热点',
        link: 'views/blank.html',
        assist: '',
        clsName: 'icon_05',
        panelMenus: [
            PANELMENUS[6],
            PANELMENUS[0],
            PANELMENUS[1],
            PANELMENUS[2]
        ]
    },
    {
        name: '考勤',
        link: 'views/blank.html',
        assist: '',
        clsName: 'icon_07'
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