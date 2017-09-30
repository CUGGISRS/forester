/*
 * 护林员地图入口，每个自定义类构建
 */


/*
 * 文件依赖
 */
var config = {
    baseUrl: "/gdhly/QueryMap/gis/js/Map",           //依赖相对路径
};

require.config(config);

require([
    'hlymap/HlyMap',
    'hlymap/HlyMapService',
    'hlymap/LayerManager',
    'hlymap/MapDataLoader',
    'hlymap/Hly/HlyThemeService',
    'hlymap/bj/BjThemeService',
    'hlymap/rd/RdThemeService',
    'hlymap/gj/GjThemeService',
    'hlymap/xhq/XhqThemeService',
    'hlymap/kq/KqThemeService',
], function (HlyMap, HlyMapService, LayerManager, MapDataLoader, HlyThemeService,
             BjThemeService, RdThemeService, GjThemeService, XhqThemeService, KqThemeService) {
    'use strict';

    // Array Remove - By John Resig (MIT Licensed)
    Array.prototype.remove = function (from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };
    Date.prototype.Format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "h+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    /**
     * 类接口输出
     */
    var scope = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {};
    scope.Hly = {};
    scope.Hly.HlyMap = HlyMap;
    scope.Hly.HlyMapService = HlyMapService;
    scope.Hly.LayerManager = LayerManager;
    scope.Hly.MapDataLoader = MapDataLoader;
    scope.Hly.HlyThemeService = HlyThemeService;
    scope.Hly.BjThemeService = BjThemeService;
    scope.Hly.RdThemeService = RdThemeService;
    scope.Hly.GjThemeService = GjThemeService;
    scope.Hly.XhqThemeService = XhqThemeService;
    scope.Hly.KqThemeService = KqThemeService;

    return scope.Hly;
});