/*
 * 护林员地图入口，每个自定义类构建
 */

require.config({
    baseUrl: BASEURL
});

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