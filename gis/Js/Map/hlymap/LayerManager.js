define([
    'core/defineProperties',
    'hlymap/bj/BjLayerDataSource',
    'hlymap/bj/BjLayer',
    'hlymap/rd/RdLayer',
    'hlymap/rd/RdLayerDataSource',
    'hlymap/xhq/XhqLayer',
    'hlymap/xhq/XhqLayerDataSource',
    'hlymap/gj/GjLayer',
    'hlymap/gj/GjLayerDataSource',
    'hlymap/gjd/GjdLayer',
    'hlymap/gjd/GjdLayerDataSource',
    'hlymap/Hly/HlyLayerCluster',
    'hlymap/Hly/HlyLayerDataSource',
    'hlymap/fk/FkLayer',
    'hlymap/fk/FkLayerDataSource',
], function (defineProperties, BjLayerDataSource, BjLayer,
             RdLayer, RdLayerDataSource,
             XhqLayer, XhqLayerDataSource,
             GjLayer, GjLayerDataSource,
             GjdLayer, GjdLayerDataSource,
             HlyLayerCluster, HlyLayerDataSource,
             FkLayer, FkLayerDataSource) {
    'use strict';

    /**
     * 图层管理（常驻图层访问、各类图层创建）
     * @constructor
     * @param {Object} options 具有以下参数的可选js对象：
     */
    var LayerManager = function (option) {
        this._option = option;
        this._tempLayers = {};
    };

    //定义属性
    defineProperties(LayerManager.prototype, {
        /*常驻图层访问*/
        /**
         * 热点图层
         */
        rdLayer: {
            get: function () {
                if (!this._rdLayer) {
                    //创建该图层
                    this._rdLayer = this.newRdLayer();
                    this._rdLayer.isThemeLayer = true;
                }
                return this._rdLayer;
            }
        },

        /**
         * 报警图层
         */
        bjLayer: {
            get: function () {
                if (!this._bjLayer) {
                    //创建该图层
                    this._bjLayer = this.newBjLayer();
                    this._bjLayer.isThemeLayer = true;
                }
                return this._bjLayer;
            }
        },

        /**
         * 临时图层
         */
        tempLayers: {
            get: function () {
                return this._tempLayers;
            }
        },
    });

    //定义方法

    /**
     * 初始化（每个组件实例化（非初始化））
     */
    LayerManager.prototype.init = function () {


    };

    /**
     * 创建热点图层
     * @return {RdLayer}
     */
    LayerManager.prototype.newRdLayer = function () {
        return new RdLayer({
            source: new RdLayerDataSource({
                projection: ol.proj.get("EPSG:4326")
            }),
        });
    }

    /**
     * 创建报警图层
     * @return {BjLayer}
     */
    LayerManager.prototype.newBjLayer = function () {
        return new BjLayer({
            source: new BjLayerDataSource({
                projection: ol.proj.get("EPSG:4326")
            }),
        });
    }

    /**
     * 创建反馈图层
     * @return {FkLayer}
     */
    LayerManager.prototype.newFkLayer = function () {
        return new FkLayer({
            source: new FkLayerDataSource({
                projection: ol.proj.get("EPSG:4326")
            }),
        });
    }

    /**
     * 创建巡护区图层
     * @return {XhqLayer}
     */
    LayerManager.prototype.newXhqLayer = function () {
        return new XhqLayer({
            source: new XhqLayerDataSource({
                projection: ol.proj.get("EPSG:4326")
            }),
        });
    }

    /**
     * 创建轨迹图层
     * @return {GjLayer}
     */
    LayerManager.prototype.newGjLayer = function () {
        return new GjLayer({
            source: new GjLayerDataSource({
                projection: ol.proj.get("EPSG:4326")
            }),
        });
    };

    /**
     * 创建关键点图层
     * @return {GjdLayer}
     */
    LayerManager.prototype.newGjdLayer = function () {
        return new GjdLayer({
            source: new GjdLayerDataSource({
                projection: ol.proj.get("EPSG:4326")
            }),
        });
    };

    /**
     * 创建护林员聚合
     * @return {hlyLayerCluster}
     */
    LayerManager.prototype.newHlyLayerCluster = function (distance, scene) {
        var hlyLayerCluster = new HlyLayerCluster({
            vectorSource: new HlyLayerDataSource({
                projection: ol.proj.get("EPSG:4326")
            }),
            distance: distance,
            scene: scene
        });
        hlyLayerCluster.init();
        return hlyLayerCluster;
    };


    return LayerManager;
});