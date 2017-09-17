/**
 * Created by chenlong on 2017/9/9.
 */
define([
    'core/defineProperties',
    'core/LayerBaseDataSource',
    'core/EventObject',
], function (defineProperties,LayerBaseDataSource,EventObject) {
    /**
     * 护林员地图
     * @param option
     * @constructor
     */
    var HlyMap = function (option) {
        this._option = option;
    };
    //集成自EventObject类
    HlyMap.prototype=new EventObject();

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
        //预置图层加载
        this._layerManager = new Hly.LayerManager({
            contMap: this._contMap,
        });
        this._layerManager.init();
        //2、加载（实时）24小时热点图层
        this._contMap.layerManager.addLayer(this._layerManager.rdLayer, true);
        //3、加载（实时）24小时报警图层
        this._contMap.layerManager.addLayer(this._layerManager.bjLayer, true);

        //低高度、倾斜看时，开启DepthTest，以便用山遮蔽图形
        //camera.readonlypositionWC   pitch

        //地图针对鼠标的事件响应
        var that = this;
        this._contMap.scene.on("pointerclick", function (e) {
            var olLayer = e.olLayer;
            var feature = e.feature;
            if(e.pickedObj){
                //三维查询到的结果
                if(e.pickedObj.id instanceof Cesium.Entity){
                    feature = e.pickedObj.id.feature;
                    olLayer = e.pickedObj.id.olLayer;
                }
            }
            //聚合点要素情况
            if(feature){
                if(feature.getProperties){
                    var properties=feature.getProperties();
                    if(properties&&properties.features&&properties.features.length>0){
                        feature =properties.features[0];
                    }
                }
            }

            //触发点击事件（点中后,且为专题图层才触发）
            if(feature&&olLayer&&olLayer.isThemeLayer){
                var eventarg={
                    itemId:feature.getId(),
                    layerType:olLayer.LayerType,
                    layerName:olLayer.layerName
                };
                for (var i = 0; i < that._evnts.length; i++) {
                    if (that._evnts[i].eventType === 'pointerclick') {
                        if (that._evnts[i].context) {
                            that._evnts[i].callback.call(that._evnts[i].context, eventarg);
                        } else {
                            that._evnts[i].callback(eventarg);
                        }
                    }
                }
            }
        });
        this._contMap.scene.on("pointermove", function (e) {
            var olLayer = e.olLayer;
            var feature = e.feature;
            if(e.pickedObj){
                //三维查询到的结果
                if(e.pickedObj.id instanceof Cesium.Entity){
                    feature = e.pickedObj.id.feature;
                    olLayer = e.pickedObj.id.olLayer;
                }
            }
            //聚合点要素情况
            if(feature){
                if(feature.getProperties){
                    var properties=feature.getProperties();
                    if(properties&&properties.features&&properties.features.length>0){
                        feature =properties.features[0];
                    }
                }
            }
            if(olLayer){
                //专题图层才触发高亮
                if(olLayer.isThemeLayer){
                    //高亮显示
                    var layerDataSource;
                    if (olLayer.isCluster) {
                        //聚合图层
                        layerDataSource = olLayer.getSource().getSource();
                    }else{
                        layerDataSource = olLayer.getSource();
                    }
                    if (feature&&layerDataSource instanceof LayerBaseDataSource) {
                        //高亮
                        layerDataSource.setHighLight(feature.getId());
                    }
                }
            }else{
                //获取图层，针对专题图层，全部取消地图高亮
                var layers= that._contMap.scene.tmpLayer.getLayers();
                layers.forEach(function (olLayer,index) {
                    if(olLayer.isThemeLayer){
                        var layerDataSource;
                        if (olLayer.isCluster) {
                            //聚合图层
                            layerDataSource = olLayer.getSource().getSource();
                        }else{
                            layerDataSource = olLayer.getSource();
                        }
                        if (layerDataSource instanceof LayerBaseDataSource) {
                            //取消高亮
                            layerDataSource.cancelHighLight();
                        }
                    }
                });
            }
        });
    };

    return HlyMap;
});