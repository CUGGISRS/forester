define([
    'core/baseUtil',
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
], function (baseUtil,defineProperties, BjLayerDataSource, BjLayer,
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
        this._contMap=option.contMap;
        this._clusterDistance=option.clusterDistance;
        this._tempLayers = {};
    };

    //定义属性
    defineProperties(LayerManager.prototype, {
        /*常驻图层访问*/
        /**
         * 护林员图层
         */
        hlyLayer: {
            get: function () {
                if (!this._hlyLayer) {
                    //创建该图层
                    var hlyLayerCluster = this.newHlyLayerCluster(this._clusterDistance, this._contMap.scene);
                    this._hlyLayer = hlyLayerCluster.layer;
                    this._hlyLayer.hlyLayerCluster = hlyLayerCluster;
                    this._hlyLayer.isThemeLayer = true;
                    this._hlyLayer.isCluster = true;
                }
                return this._hlyLayer;
            }
        },

        /**
         * 反馈图层
         */
        fkLayer: {
            get: function () {
                if (!this._fkLayer) {
                    //创建该图层
                    this._fkLayer = this.newFkLayer();
                    this._fkLayer.isThemeLayer = true;
                }
                return this._fkLayer;
            }
        },
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
         * 轨迹图层
         */
        gjLayer: {
            get: function () {
                if (!this._gjLayer) {
                    //创建该图层
                    this._gjLayer = this.newGjLayer();
                    this._gjLayer.isThemeLayer = true;
                }
                return this._gjLayer;
            }
        },

        /**
         * 巡护区图层
         */
        xhqLayer: {
            get: function () {
                if (!this._xhqLayer) {
                    //创建该图层
                    this._xhqLayer = this.newXhqLayer();
                    this._xhqLayer.isThemeLayer = true;
                }
                return this._xhqLayer;
            }
        },

        /**
         * 关键点图层
         */
        gjdLayer: {
            get: function () {
                if (!this._gjdLayer) {
                    //创建该图层
                    this._gjdLayer = this.newGjdLayer();
                    this._gjdLayer.isThemeLayer = true;
                }
                return this._gjdLayer;
            }
        },

        /**
         * 临时图层
         */
        tmpLayer: {
            get: function () {
                if (!this._tmpLayer) {
                    //创建该图层
                    this._tmpLayer =this.getTmpLayer();
				}
                return this._tmpLayer;
            }
        },

        /**
         * 临时图层集合
         */
        tempLayers: {
            get: function () {
                return this._tempLayers;
            }
        },

        /**
         * 专题点图层组（模块内使用的临时图层）
         */
        themePointLayerGroup:{
            get:function () {
                return this._themePointLayerGroup;
            }
        },

        /**
         * 常驻图层组
         */
        permanentLayerGroup:{
            get:function () {
                return this._permanentLayerGroup;
            }
        },

        /**
         * 专题线、面图层组（模块内使用的临时图层）
         */
        themePlyLayerGroup:{
            get:function () {
                return this._themePlyLayerGroup;
            }
        },
    });

    //定义方法

    /**
     * 初始化（每个组件实例化（非初始化））
     */
    LayerManager.prototype.init = function () {
        //创建常驻图层组、专题图层组进行集中控制
        //专题模块线、面图层组（模块内使用的临时图层）
        this._themePlyLayerGroup = new ol.layer.Group({layers: []});
        this._contMap.layerManager.addLayer(this._themePlyLayerGroup, true);
        //常驻图层放到中间
        this._permanentLayerGroup = new ol.layer.Group({layers: []});
        this._contMap.layerManager.addLayer(this._permanentLayerGroup, true);
        //专题模块点图层组（模块内使用的临时图层）
        this._themePointLayerGroup = new ol.layer.Group({layers: []});
        this._contMap.layerManager.addLayer(this._themePointLayerGroup, true);
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
    LayerManager.prototype.newXhqLayer = function (styleFun) {
        return new XhqLayer({
            source: new XhqLayerDataSource({
                projection: ol.proj.get("EPSG:4326")
            }),
            style:styleFun
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

    /**
     * 创建临时图层
     * @return {ol.layer.Vector}
     */
    LayerManager.prototype.getTmpLayer=function () {
        //创建该图层
        var tmpLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
        });
        tmpLayer.LayerType="临时图层";
        //贴地
        tmpLayer.set("altitudeMode", "clampToGround");
        //三维宽度
        tmpLayer.getCorridorGeometryWidth = function (feature) {
            //最佳显示
            var extent = feature.getGeometry().getExtent();
            //转换成3857
            extent = ol.proj.transformExtent(extent, "EPSG:4326", "EPSG:3857");
            var resolution = (extent[2] - extent[0]) / baseUtil.defaultGraphicShowWith;
            return resolution * 8;
        };
        return tmpLayer;
    }


    return LayerManager;
});