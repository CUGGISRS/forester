/*
 * 护林员地图入口，每个自定义类构建
 */


/*
 * 文件依赖
 */
var config = {
    baseUrl: "/gis/js/Map",           //依赖相对路径
};

require.config(config);

require([
    'hlymap/HlyMap',
    'hlymap/LayerManager',
    'hlymap/MapDataLoader',
    'hlymap/Hly/HlyThemeService',
    'hlymap/bj/BjThemeService',
    'hlymap/fk/FkThemeService',
    'hlymap/rd/RdThemeService',
    'hlymap/gj/GjThemeService',
    'hlymap/xhq/XhqThemeService',
], function (HlyMap, LayerManager, MapDataLoader, HlyThemeService,
             BjThemeService, FkThemeService, RdThemeService,GjThemeService,XhqThemeService) {
    'use strict';

    // Array Remove - By John Resig (MIT Licensed)
    Array.prototype.remove = function (from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };
    /**
     * 类接口输出
     */
    var scope = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {};
    scope.Hly = {};
    scope.Hly.HlyMap = HlyMap;
    scope.Hly.LayerManager = LayerManager;
    scope.Hly.MapDataLoader = MapDataLoader;
    scope.Hly.HlyThemeService = HlyThemeService;
    scope.Hly.BjThemeService = BjThemeService;
    scope.Hly.FkThemeService = FkThemeService;
    scope.Hly.RdThemeService = RdThemeService;
    scope.Hly.GjThemeService = GjThemeService;
    scope.Hly.XhqThemeService = XhqThemeService;

    return scope.Hly;
});