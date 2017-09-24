/**
 * Created by chenlong on 2017/9/9.
 */
define([
    'core/defineProperties',
    'core/LayerBaseDataSource',
    'core/EventObject',
    'core/baseUtil',
], function (defineProperties, LayerBaseDataSource, EventObject, baseUtil) {
    /**
     * 护林员地图
     * @param option
     * @constructor
     */
    var HlyMap = function (option) {
        this._option = option;
    };
    //集成自EventObject类
    HlyMap.prototype = new EventObject();

    //定义属性
    defineProperties(HlyMap.prototype, {
        /**
         * contMap地图
         */
        contMap: {
            get: function () {
                return this._contMap;
            }
        },

        /**
         * 护林员系统图层管理
         */
        layerManage: {
            get: function () {
                return this._layerManager;
            }
        },

        /**
         * 临时图层数据源
         */
        tmpLayerDataSource: {
            get: function () {
                return this._tmpLayer.getSource();
            }
        },

        /**
         * 反馈图层数据源
         */
        fkLayerDataSource: {
            get: function () {
                return this._layerManager.fkLayer.getSource();
            }
        },

        /**
         * 热点图层数据源
         */
        rdLayerDataSource: {
            get: function () {
                return this._layerManager.rdLayer.getSource();
            }
        },

        /**
         * 报警图层数据源
         */
        bjLayerDataSource: {
            get: function () {
                return this._layerManager.bjLayer.getSource();
            }
        },

        /**
         * 护林员图层数据源
         */
        hlyLayerDataSource: {
            get: function () {
                return this._layerManager.hlyLayer.getSource().getSource();
            }
        },

        /**
         * 巡护区图层数据源
         */
        xhqLayerDataSource: {
            get: function () {
                return this._xhqLayer.getSource();
            }
        },

        /**
         * 轨迹图层数据源
         */
        gjLayerDataSource: {
            get: function () {
                return this._gjTmpLayer.getSource();
            }
        },

        /**
         * 关键点图层数据源
         */
        gjdLayerDataSource: {
            get: function () {
                return this._gjdTmpLayer.getSource();
            }
        },

        /**
         * 动态地图底图容器
         */
        baseLayerContainer: {
            get: function () {
                return this._baseLayerContainer;
            }
        }

    });

    /**
     * 护林员系统地图初始化
     */
    HlyMap.prototype.init = function () {
        this._contMap = new Cont.ContMap({
            /*baseMapUrls: {
             map2D: {
             normal: this._option.baseMapUrls,
             satellite: []
             },
             map3D: this._option.baseMapUrls
             },*/
            mapContainer: this._option.mapContainer,
            terrainProviderUrl: this._option.terrainProviderUrl,
            isContTmsTerrain: this._option.isContTmsTerrain,
            initView: {
                center: [113.15, 23.23],
                zoom: 7,
                project: 'EPSG:4326'

            },
            widgets: {
                viewModeSwitcher: false,
                toolBoxPanel: false
            }
        });
        this._contMap.init();
        //各类型预置图层加载
        this._layerManager = new Hly.LayerManager({
            contMap: this._contMap,
            clusterDistance: this._option.clusterDistance
        });
        this._layerManager.init();
        //动态地图底图容器（图层组）初始化
        this._baseLayerContainer = new ol.layer.Group({layers: []});
        this._layerManager.themePlyLayerGroup.getLayers().push(this._baseLayerContainer);
        //1、加载（实时）24小时反馈图层
        this._layerManager.permanentLayerGroup.getLayers().push(this._layerManager.fkLayer);
        //2、加载（实时）24小时热点图层
        this._layerManager.permanentLayerGroup.getLayers().push(this._layerManager.rdLayer);
        //3、加载（实时）24小时报警图层
        this._layerManager.permanentLayerGroup.getLayers().push(this._layerManager.bjLayer);
        //4、加载（实时）24小时护林员图层
        this._layerManager.permanentLayerGroup.getLayers().push(this._layerManager.hlyLayer);
        //5、巡护区业务图层
        this._xhqLayer = this._layerManager.xhqLayer;
        this._layerManager.themePlyLayerGroup.getLayers().push(this._xhqLayer);
        //7、轨迹业务图层
        this._gjTmpLayer = this._layerManager.gjLayer;
        this._layerManager.themePlyLayerGroup.getLayers().push(this._gjTmpLayer);
        //8、关键点业务图层
        this._gjdTmpLayer = this._layerManager.gjdLayer;
        this._layerManager.themePointLayerGroup.getLayers().push(this._gjdTmpLayer);
        //9、临时图层
        this._tmpLayer = this._layerManager.tmpLayer;
        this._layerManager.themePlyLayerGroup.getLayers().push(this._tmpLayer);


        //低高度、倾斜看时，开启DepthTest，以便用山遮蔽图形
        //camera.readonlypositionWC   pitch

        //地图针对鼠标的事件响应
        var that = this;
        //鼠标放置时高亮处理
        this._contMap.scene.on("pointermove", function (e) {
            var olLayer = e.olLayer;
            var feature = e.feature;
            if (e.pickedObj) {
                //三维查询到的结果
                if (e.pickedObj.id instanceof Cesium.Entity) {
                    feature = e.pickedObj.id.feature;
                    olLayer = e.pickedObj.id.olLayer;
                }
            }
            //聚合点要素情况
            if (feature) {
                if (feature.getProperties) {
                    var properties = feature.getProperties();
                    if (properties && properties.features && properties.features.length > 0) {
                        feature = properties.features[0];
                    }
                }
            }

            //先取消全部高亮
            //获取图层，针对专题图层，全部取消地图高亮
            var layers = that._contMap.scene.tmpLayer.getLayers().getArray();
            var layerArray = [];
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                if (layer instanceof ol.layer.Group) {
                    //图层组
                    var subLayers = layer.getLayers().getArray();
                    for (var j = 0; j < subLayers.length; j++) {
                        var subLayer = subLayers[j];
                        if (!(subLayer instanceof ol.layer.Group)) {
                            //只处理非图层组
                            layerArray.push(subLayer);
                        }
                    }
                } else {
                    layerArray.push(layer);
                }
            }
            for (var i = 0; i < layerArray.length; i++) {
                var layer = layerArray[i];
                var layerDataSource;
                if (layer.isCluster) {
                    //聚合图层
                    layerDataSource = layer.getSource().getSource();
                } else {
                    layerDataSource = layer.getSource();
                }
                if (layerDataSource instanceof LayerBaseDataSource) {
                    //取消高亮
                    layerDataSource.cancelHighLight();
                }
            }


            if (olLayer) {
                //高亮显示
                var layerDataSource;
                if (olLayer.isCluster) {
                    //聚合图层
                    layerDataSource = olLayer.getSource().getSource();
                } else {
                    layerDataSource = olLayer.getSource();
                }
                if (feature && layerDataSource instanceof LayerBaseDataSource) {
                    //高亮
                    layerDataSource.setHighLight(feature.getId());
                }
            }
        });

        //计算默认的图形最佳视角显示像素宽度
        var padding = .16 * this._contMap.scene.map2d.getSize()[0];
        var pixelWidth = this._contMap.scene.map2d.getSize()[0] - padding * 2;
        baseUtil.defaultGraphicShowWith = pixelWidth;
    };

    /**
     * 跳转到坐标点位
     * @param x 经度
     * @param y 纬度
     * @param resolution 分辨率，默认为村级
     */
    HlyMap.prototype.gotoLocation = function (x, y, resolution) {
        this._contMap.viewControl.jumpTo([x, y]);
        if (!resolution) {
            resolution = 8.583069007761132E-5;
        }
        this._contMap.viewControl.setResolution(resolution);
    }

    return HlyMap;
});