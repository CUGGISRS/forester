/*
 * 护林员地图入口，每个自定义类构建
 */


/*
 * 文件依赖
 */

require.config({
	baseUrl: 'gis/js/Map',           //依赖相对路径
    paths: {
        'loadImage': './Core/loadImage'
    }
});

require([
    'hlymap/HlyMap',
    'hlymap/HlyMapService',
    'hlymap/LayerManager',
    'hlymap/MapDataLoader',
], function (HlyMap, HlyMapService, LayerManager, MapDataLoader) {
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

    return scope.Hly;
});
