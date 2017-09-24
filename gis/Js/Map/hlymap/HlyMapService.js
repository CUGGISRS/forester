/**
 * Created by chenlong on 2017/9/22.
 */
define([
    'core/baseUtil',
    'core/defineProperties',
    'core/BusinessItem',
    'core/FeatureContainerManager',
    'core/EventObject',
    'hlymap/HlyMap',
    'hlymap/MapDataLoader',
    'hlymap/ThemeObjectManager',
    'hlymap/gj/TrackSimulate',
    'hlymap/Hly/UserLockOnService',
], function (baseUtil, defineProperties, BusinessItem, FeatureContainerManager, EventObject,
             HlyMap, MapDataLoader, ThemeObjectManager, TrackSimulate, UserLockOnService) {

    /**
     * 护林员地图服务
     * @param option
     * @constructor
     */
    var HlyMapService = function (option) {
        this._option = option;
        this._serviceUrlConfig = option.serviceUrlConfig;
        //巡护区地图服务地址
        this._xhqMapUrls = option.xhqMapUrls;
    };

    //集成自EventObject类
    HlyMapService.prototype = new EventObject();

    //定义属性
    defineProperties(HlyMapService.prototype, {
        /**
         * 护林员地图
         */
        hlyMap: {
            get: function () {
                return this._hlyMap;
            }
        },

    });

    /**
     * 初始化
     */
    HlyMapService.prototype.init = function () {
        //地图初始化
        this._hlyMap = new HlyMap({
            baseMapUrls: this._option.baseMapUrls,
            mapContainer: this._option.mapContainer,
            terrainProviderUrl: this._option.terrainProviderUrl,
            clusterDistance: 30,
            isContTmsTerrain: true,
        });
        this._hlyMap.init();

        this._contMap = this._hlyMap.contMap;
        this._layerManage = this._hlyMap.layerManage;
        //业务对象管理器初始化
        this._featureContainerManager = new FeatureContainerManager();
        //专题对象管理器初始化
        this._themeObjectManager = new ThemeObjectManager({
            featureContainerManager: this._featureContainerManager,
        });
        //开启地图数据刷新
        this._mapDataRefresh();
        //开启关键点鼠标划过事件（KeyPointPointermove）
        var that = this;
        this._contMap.scene.on("pointermove", function (e) {
            var olLayer = e.olLayer;
            var feature = e.feature;
            var eventarg;
            if (olLayer === that._layerManage.gjdLayer) {
                //地图高亮
                that._layerManage.gjdLayer.getSource().setHighLight(feature.getId());
                //临时关键点才触发
                eventarg = {
                    itemId: feature.getId(),
                    pointerOn: true
                };
            } else {
                //地图高亮取消
                that._layerManage.gjdLayer.getSource().cancelHighLight();
                //不在关键点上
                eventarg = {
                    pointerOn: false
                };
            }
            for (var i = 0; i < that._evnts.length; i++) {
                if (that._evnts[i].eventType === 'KeyPointPointermove') {
                    if (that._evnts[i].context) {
                        that._evnts[i].callback.call(that._evnts[i].context, eventarg);
                    } else {
                        that._evnts[i].callback(eventarg);
                    }
                }
            }
        });
        //开启专题图层鼠标点击事件（themeLayerPointerClick）
        this._contMap.scene.on("pointerclick", function (e) {
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

            //触发点击事件（点中后,且为专题图层才触发）
            if (feature && olLayer && olLayer.isThemeLayer) {
                //获取点击对象的专题信息
                var itemThemeInfo = that._themeObjectManager.getItemThemeInfo(feature);
                var eventarg = {
                    itemId: feature.getId(),//对象ID
                    layerType: olLayer.LayerType,//对象类型
                    layerName: olLayer.layerName,//图层名
                    themeBelongsTo: itemThemeInfo ? itemThemeInfo.themeName : null,//对象所属专题
                    itemIdBelongsTo: itemThemeInfo ? itemThemeInfo.themeItemId : null,//所属专题ID
                    isThemeItem: itemThemeInfo ? itemThemeInfo.isThemeItem : null//是否为专题要素对象
                };
                for (var i = 0; i < that._evnts.length; i++) {
                    if (that._evnts[i].eventType === 'themeLayerPointerClick') {
                        if (that._evnts[i].context) {
                            that._evnts[i].callback.call(that._evnts[i].context, eventarg);
                        } else {
                            that._evnts[i].callback(eventarg);
                        }
                    }
                }
            }
        });
        //开启鼠标点击查询巡护区事件（xhqMouseClick）
        this._contMap.scene.on("pointerclick", function (e) {
            var position = e.position;
            if (that._canRaiseXhqClickEvent && !e.feature) {
                //可以点击巡护区触发事件
                //查询当前位置，获取巡护区，如果存在则触发事件（外部进行绘制）
                $.get(that._serviceUrlConfig.getPatrolAreaByLocation, {
                    x: position[0],
                    y: position[1]
                }, function (data) {
                    if (data.PatrolAreaInfo) {
                        // 触发事件将此对象传回
                        var eventarg = {
                            item: data,
                            position: position
                        };
                        for (var i = 0; i < that._evnts.length; i++) {
                            if (that._evnts[i].eventType === 'xhqMouseClick') {
                                if (that._evnts[i].context) {
                                    that._evnts[i].callback.call(that._evnts[i].context, eventarg);
                                } else {
                                    that._evnts[i].callback(eventarg);
                                }
                            }
                        }
                    }
                });
            }
        });
    };

    /**
     * 跳到单位区域并标注（到tmp图层）
     * @param esriGeometryString
     */
    HlyMapService.prototype.jumpToUnitZone = function (esriGeometryString) {
        //清除原有的
        this.clearUnitZone();
        //新增
        var format = new ol.format.EsriJSON();
        var geometry = format.readGeometry(esriGeometryString);
        var unitZoneFeature = new ol.Feature({
            geometry: geometry
        });
        unitZoneFeature.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "red",
                width: 3
            })
        }));

        //添加到图层
        var tmpSource = this._hlyMap.tmpLayerDataSource;
        this._featureContainerManager.addFeatureItem("选择的区域", {}, unitZoneFeature, tmpSource, "单位区域", true);
        //转跳到该图形
        var padding = .16 * this._hlyMap.contMap.scene.map2d.getSize()[0];
        this._hlyMap.contMap.viewControl.jumpTo(geometry.getExtent(), [padding, padding, padding, padding]);
    };

    /**
     * 清除原有的单位区域
     */
    HlyMapService.prototype.clearUnitZone = function () {
        //清除原有的
        if (this._featureContainerManager.exist("选择的区域", "单位区域")) {
            this._featureContainerManager.removeMapBusinessItem("选择的区域", "单位区域");
        }
    };


    /*=========================业务模块(护林员专题)============================*/

    /**
     * 显示并跳转到护林员图标且选中（开启护林员专题）
     * @param itemId 数据对象ID
     * @param item 数据对象值
     */
    HlyMapService.prototype.jumpToHly = function (itemId, item) {
        //考虑已有护林员专题情况
        var themeObject=this._getThemmeObject("护林员", itemId);
        if (themeObject) {
            //相同当前专题，直接跳出不做处理
            this._contMap.viewControl.jumpTo(themeObject.businessItem.value.feature.getGeometry());
            this._contMap.viewControl.setResolution(8.583069007761132E-5);
            return;
        }
        //清除以前的
        this.closeCurrentHly();
        //选中取消
        this._hlyMap.hlyLayerDataSource.cancelSelected();
        //获取到新护林员地图要素
        var targetFeature = this._foundOrCreateHlyUser(itemId, item);
        //设置当前专题
        var bItem = new BusinessItem(itemId, targetFeature.valueItem, "护林员", true);
        bItem.addFeature(targetFeature, this._hlyMap.hlyLayerDataSource);
        this._themeObjectManager.setThemeObject("护林员", bItem);
        //跳转到该图标并选中
        this._contMap.viewControl.jumpTo(targetFeature.getGeometry());
        this._contMap.viewControl.setResolution(8.583069007761132E-5);
        this._hlyMap.hlyLayerDataSource.setSelected(targetFeature.getId());
    };

    /**
     * 关闭当前护林员专题
     */
    HlyMapService.prototype.closeCurrentHly = function () {
        //停止播放轨迹、追踪
        this.unTrackOnHly();
        this.gjPlayClose();

        //主题对象转换判断及处理
        var preThemeObject = this._themeObjectManager.getCurrentThemeObject("护林员");
        if (preThemeObject) {
            //有以前的专题对象，清除
            this._themeObjectManager.clearThemeObject("护林员", preThemeObject.id);
        }
        //选中取消
        this._hlyMap.hlyLayerDataSource.cancelSelected();
    };

    /**
     * 锁定（追踪）护林员
     * @param itemId
     */
    HlyMapService.prototype.trackOnHly = function (itemId) {
        //首次先飞到
        this._lockOnFeature = this._hlyMap.hlyLayerDataSource.getFeatureById(itemId);
        this._contMap.viewControl.jumpTo(this._lockOnFeature.getGeometry());
        this._contMap.viewControl.setResolution(8.583069007761132E-5);

        //跟踪不同对象，则释放掉以前的进行重置
        if (this._userLockOnService && this._userLockOnService.userFeature !== this._lockOnFeature) {
            this._userLockOnService.dispose();
            this._userLockOnService = null;
        }
        if (!this._userLockOnService) {
            //初始化并启动新的跟踪
            this._userLockOnService = new UserLockOnService({
                userFeature: this._lockOnFeature,
                hlyMap: this._hlyMap,
                getUserGpsInfoUrl: this._serviceUrlConfig.getUserGpsInfo
            });
            this._userLockOnService.init();
        }
        this._userLockOnService.lockOn();
    };

    /**
     * 取消锁定（追踪）护林员
     */
    HlyMapService.prototype.unTrackOnHly = function () {
        if (this._userLockOnService) {
            this._userLockOnService.unLockOn();
        }
    };


    /*=========================业务模块(轨迹)============================*/

    /**
     * 显示轨迹（到某个专题或成为独立专题）
     * @param themeBelongsTo 所属专题，空时表示为独立专题
     * @param itemIdBelongsTo 所属专题对象ID，空时表示为独立专题
     * @param gjItem 轨迹值
     */
    HlyMapService.prototype.showGj = function (themeBelongsTo, itemIdBelongsTo, gjItem) {
        //同一主题下显示唯一轨迹，删除以前的轨迹
        if (themeBelongsTo && itemIdBelongsTo) {
            var sameTypeTmpOjects = this._themeObjectManager.getSameTypeTmpObjects(themeBelongsTo, itemIdBelongsTo, "轨迹");
            if (sameTypeTmpOjects) {
                //找到有以前的轨迹，删除该轨迹
                for (var i = 0; i < sameTypeTmpOjects.length; i++) {
                    var tmpBItem = sameTypeTmpOjects[i];
                    this._themeObjectManager.removeTmpObject(themeBelongsTo, itemIdBelongsTo, tmpBItem.itemId, tmpBItem.itemType);
                }
            }
        }
        //对象创建并管理
        var gjBusinessItem;
        if (themeBelongsTo && itemIdBelongsTo) {
            //有隶属专题时，创建并显示轨迹，同时归属于专题对象
            if (this._getThemmeObject(themeBelongsTo, itemIdBelongsTo)) {
                //有专题
                gjBusinessItem = this._createGjBusinessItem(gjItem);
                this._themeObjectManager.addTmpObject(themeBelongsTo, itemIdBelongsTo, gjBusinessItem);
            } else {
                //写了所属，但不正确
                return;
            }
        } else {
            //不隶属于任何专题，自己为轨迹专题
            gjBusinessItem = this._createGjBusinessItem(gjItem);
            this._themeObjectManager.setThemeObject("轨迹", gjBusinessItem);
        }
        //跳转到该轨迹
        var padding = .16 * this._hlyMap.contMap.scene.map2d.getSize()[0];
        this._hlyMap.contMap.viewControl.jumpTo(gjBusinessItem.value.singleLine.getExtent(), [padding, padding, padding, padding]);
    };

    /**
     * 关闭轨迹专题
     */
    HlyMapService.prototype.closeCurrentGjTheme = function () {
        //停止播放轨迹、追踪
        this.unTrackOnHly();
        this.gjPlayClose();

        //主题对象清除
        var preThemeObject = this._themeObjectManager.getCurrentThemeObject("轨迹");
        if (preThemeObject) {
            //有以前的专题对象，清除
            this._themeObjectManager.clearThemeObject("轨迹", preThemeObject.id);
        }
    };

    /**
     * 轨迹演示模拟初始化
     * @param gjItem
     */
    HlyMapService.prototype.gjPlayInit = function (gjItem) {
        var dataSource = this._hlyMap.gjLayerDataSource;
        var lineItem = dataSource.getItemById(gjItem.LineId);
        if (!lineItem) {
            //未找到，则不做处理
            return;
        }
        //轨迹图层隐藏
        this._layerManage.gjLayer.setVisible(false);
        this._layerManage.tmpLayer.setVisible(false);
        //模拟
        if (!this._trackSimulate) {
            //未创建
            var iconsUrl = baseUtil.getMapIconsUrl();
            this._trackSimulate = new TrackSimulate({
                contMap: this._hlyMap.contMap,
                trackLine: lineItem.singleLine,
                simulateMarkerStyle: new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [.5, 1],//图标位置对应的地图点
                        src: iconsUrl,
                        scale: 1,
                        offset: [176, 0],
                        size: [30, 37],
                    }),
                    text: new ol.style.Text({
                        font: '18px 微软雅黑',    //字体与大小
                        fill: new ol.style.Fill({    //文字填充色
                            color: 'red'
                        }),
                        text: "",
                        textAlign: 'left',
                        offsetX: 15,
                        offsetY: -20,
                        stroke: new ol.style.Stroke({
                            color: "white",
                            width: 2
                        })
                    })
                }),
                startMarkerStyle: new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [.5, 1],//图标位置对应的地图点
                        src: iconsUrl,
                        scale: 1,
                        offset: [367, 0],
                        size: [33, 46],
                    })
                }),
                lineFeatures: lineItem.features
            });
            this._trackSimulate.init();
        }
    };

    /**
     * 轨迹演示模拟
     * @param fraction 进度（0~1）
     */
    HlyMapService.prototype.gjPlay = function (fraction) {
        //默认已经初始化了
        if (this._trackSimulate) {
            this._trackSimulate.moveTo(fraction);
        }
    };

    /**
     * 关闭轨迹演示模拟
     */
    HlyMapService.prototype.gjPlayClose = function () {
        //模拟器删除
        if (this._trackSimulate) {
            this._trackSimulate.dispose();
            this._trackSimulate = null;
        }
        //轨迹图层显示
        this._layerManage.gjLayer.setVisible(true);
        this._layerManage.tmpLayer.setVisible(true);
    };

    /*=========================业务模块(巡护区)============================*/

    /**
     * 显示某巡护区（及关键点）（到某个专题或成为独立专题）
     * @param themeBelongsTo 所属专题，空时表示为独立专题
     * @param itemIdBelongsTo 所属专题对象ID，空时表示为独立专题
     * @param patrolDetail 巡护区详情
     */
    HlyMapService.prototype.showXhq = function (themeBelongsTo, itemIdBelongsTo, patrolDetail) {
        //同一主题下显示唯一巡护区，删除以前的巡护区
        if (themeBelongsTo && itemIdBelongsTo) {
            var sameTypeTmpOjects = this._themeObjectManager.getSameTypeTmpObjects(themeBelongsTo, itemIdBelongsTo, "巡护区");
            if (sameTypeTmpOjects) {
                //找到有以前的对象，删除该对象
                for (var i = 0; i < sameTypeTmpOjects.length; i++) {
                    var tmpBItem = sameTypeTmpOjects[i];
                    this._themeObjectManager.removeTmpObject(themeBelongsTo, itemIdBelongsTo, tmpBItem.itemId, tmpBItem.itemType);
                }
            }
        }
        //对象创建并管理
        var xhqBusinessItem;
        if (themeBelongsTo && itemIdBelongsTo) {
            //有隶属专题时，创建并显示轨迹，同时归属于专题对象
            if (this._getThemmeObject(themeBelongsTo, itemIdBelongsTo)) {
                //有专题
                xhqBusinessItem = this._createXhqBusinessItem(patrolDetail);
                this._themeObjectManager.addTmpObject(themeBelongsTo, itemIdBelongsTo, xhqBusinessItem);
            } else {
                //写了所属，但不正确
                return;
            }
        } else {
            //不隶属于任何专题，自己为轨迹专题
            xhqBusinessItem = this._createXhqBusinessItem(patrolDetail);
            this._themeObjectManager.setThemeObject("巡护区", xhqBusinessItem);
        }

        //跳转到该区域
        var padding = .16 * this._hlyMap.contMap.scene.map2d.getSize()[0];
        this._hlyMap.contMap.viewControl.jumpTo(xhqBusinessItem.value.feature.getGeometry().getExtent(), [padding, padding, padding, padding]);
    };

    /**
     * （从UI）选择关键点
     * @param patrolPoint
     */
    HlyMapService.prototype.selectKeyPoint = function (patrolPoint) {
        var tmpSource = this._hlyMap.gjdLayerDataSource;
        tmpSource.setSelected(patrolPoint.ID);
    };

    /**
     * （从UI）取消选择关键点
     */
    HlyMapService.prototype.unSelectKeyPoint = function () {
        var tmpSource = this._hlyMap.gjdLayerDataSource;
        tmpSource.cancelSelected();
    };

    /**
     * 关闭巡护区专题
     */
    HlyMapService.prototype.closeCurrentXhqTheme = function () {
        //停止播放轨迹、追踪
        this.unTrackOnHly();
        this.gjPlayClose();

        //主题对象清除
        var preThemeObject = this._themeObjectManager.getCurrentThemeObject("巡护区");
        if (preThemeObject) {
            //有以前的专题对象，清除
            this._themeObjectManager.clearThemeObject("巡护区", preThemeObject.id);
        }
    };

    /**
     * 当搜索全省市的巡护区时触发
     */
    HlyMapService.prototype.onSearchAllXhqWithinProvinceAndCity = function () {
        //只保留全省的切片叠加
        var layerList = this._hlyMap.baseLayerContainer.getLayers();
        var existLayer;
        var otherLayers = [];
        layerList.forEach(function (layer, index) {
            if (layer.layerLevel === "省级") {
                existLayer = layer;
            } else {
                otherLayers.push(layer);
            }
        });
        if (!existLayer) {
            //不存在，则清空并添加
            var xhqLayer = new ol.layer.Tile({
                source: new Cont.EsriOfflineDataSource({
                    url: this._xhqMapUrls["广东省"],
                    format: "png",
                    projection: ol.proj.get('EPSG:4326')
                })
            });
            xhqLayer.layerLevel = "省级";

            layerList.clear();
            layerList.push(xhqLayer);
        } else {
            //存在，则删除其他的
            for (var i = 0; i < otherLayers.length; i++) {
                var otherLayer = otherLayers[i];
                layerList.remove(otherLayer);
            }
        }
        this._hlyMap.baseLayerContainer.changed();

        //启动鼠标点击高亮并显示巡护区事件功能
        this._canRaiseXhqClickEvent = true;
    }

    /**
     * 当搜索全县的巡护区时触发
     * @param countyName 县名
     */
    HlyMapService.prototype.onSearchAllXhqWithinCounty = function (countyName) {
        //只保留XX县的切片叠加
        var layerList = this._hlyMap.baseLayerContainer.getLayers();
        var existLayer;
        var otherLayers = [];
        layerList.forEach(function (layer, index) {
            if (layer.layerLevel === "县级" && layer.layerName === countyName) {
                existLayer = layer;
            } else {
                otherLayers.push(layer);
            }
        });

        if (!existLayer) {
            //不存在，则清空并添加
            layerList.clear();
            if (this._xhqMapUrls[countyName]) {
                //有地图服务，则添加
                var xhqLayer = new ol.layer.Tile({
                    source: new Cont.EsriOfflineDataSource({
                        url: this._xhqMapUrls[countyName],
                        format: "png",
                        projection: ol.proj.get('EPSG:4326')
                    })
                });
                xhqLayer.layerLevel = "县级";
                xhqLayer.layerName = countyName;
                layerList.push(xhqLayer);
            } else {
                //没有地图服务，则不处理
            }
        } else {
            //存在，则删除其他的
            for (var i = 0; i < otherLayers.length; i++) {
                var otherLayer = otherLayers[i];
                layerList.remove(otherLayer);
            }
        }
        this._hlyMap.baseLayerContainer.changed();

        //启动鼠标点击高亮并显示巡护区事件功能
        this._canRaiseXhqClickEvent = true;
    }

    /**
     * 当搜索全乡镇的巡护区时触发
     * @param xhqItems 全乡镇的巡护区数组对象
     */
    HlyMapService.prototype.onSearchAllXhqWithinTown = function (xhqItems, xiangName) {
        //只保留XX乡的矢量图层叠加
        var layerList = this._hlyMap.baseLayerContainer.getLayers();
        var existLayer;
        var otherLayers = [];
        layerList.forEach(function (layer, index) {
            if (layer.layerLevel === "乡级" && layer.layerName === xiangName) {
                existLayer = layer;
            } else {
                otherLayers.push(layer);
            }
        });

        if (!existLayer) {
            //不存在，则清空并添加
            var that = this;
            var xhqLayer = this._layerManage.newXhqLayer(function (feature, resolution) {

                var styles = [
                    //巡护区边框
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: "red",
                            width: 1
                        })
                    })
                ];
                if (resolution < 8.6e-005) {
                    //找到巡护区标注文字背景地址
                    if (!that.hxqLabelGgUrl) {
                        that.hxqLabelGgUrl = baseUtil.getAbsoluteUrl("./css/images/noticeBg.jpg");
                    }

                    var info = feature.getProperties();
                    var labelString = '巡护区：' + info["BH"] + '\n护林员：' + info["UserName"] + '\n面积：' + (info["Area"]).toFixed(1) + " 亩";
                    //小于该分辨率下显示标注
                    styles.push(new ol.style.Style({
                        geometry: function (feature) {
                            return feature.getGeometry().getInteriorPoint();
                        },
                        image: new ol.style.Icon({
                            src: that.hxqLabelGgUrl,
                            anchor: [0.5, 0.5],
                            anchorOrigin: 'top-left'
                            //rotation: 90 * Math.PI / 180
                        }),
                        text: new ol.style.Text({
                            font: '13px Calibri,sans-serif',    //字体与大小
                            fill: new ol.style.Fill({    //文字填充色
                                color: '#FF0000'
                            }),
                            text: labelString,
                            textAlign: 'left',
                            offsetX: -60
                        })
                    }))
                }
                return styles;
            });
            xhqLayer.layerLevel = "乡级";
            xhqLayer.layerName = xiangName;

            //添加数据
            var checkTag = (new Date()).getTime();
            var xhqDatasource = xhqLayer.getSource();
            for (var i = 0; i < xhqItems.length; i++) {
                var xhqItem = xhqItems[i];
                xhqDatasource.addDataItem(xhqItem, checkTag);
            }

            layerList.clear();
            layerList.push(xhqLayer);
        } else {
            //存在，则删除其他的
            for (var i = 0; i < otherLayers.length; i++) {
                var otherLayer = otherLayers[i];
                layerList.remove(otherLayer);
            }
        }
        this._hlyMap.baseLayerContainer.changed();

        //启动鼠标点击高亮并显示巡护区事件功能
        this._canRaiseXhqClickEvent = true;
    };

    /**
     * 清除巡护区的动态地图底图
     */
    HlyMapService.prototype.clearXhqBaseLayer = function () {
        //清除巡护区地图
        var layerList = this._hlyMap.baseLayerContainer.getLayers();
        layerList.clear();
        //关闭鼠标点击高亮并显示巡护区事件功能
        this._canRaiseXhqClickEvent = false;
    };
    /*=========================业务模块（报警）===========================*/

    /**
     * 显示报警
     * @param themeBelongsTo
     * @param itemIdBelongsTo
     * @param bjItem
     */
    HlyMapService.prototype.showBj = function (themeBelongsTo, itemIdBelongsTo, bjItem) {
        //对象创建并管理
        var bjBusinessItem;
        if (themeBelongsTo && itemIdBelongsTo) {
            //有隶属专题时，创建并显示，同时归属于专题对象
            if (this._getThemmeObject(themeBelongsTo, itemIdBelongsTo)) {
                //有专题
                bjBusinessItem = this._createBjBusinessItem(bjItem);
                this._themeObjectManager.addTmpObject(themeBelongsTo, itemIdBelongsTo, bjBusinessItem);
            } else {
                //写了所属，但不正确
                return;
            }
        } else {
            //不隶属于任何专题，自己为专题
            bjBusinessItem = this._createBjBusinessItem(bjItem);
            this._themeObjectManager.setThemeObject("报警", bjBusinessItem);
        }
        //跳转到该图标
        if (!(themeBelongsTo && itemIdBelongsTo)) {
            //自己为专题数据，支持跳到
            this._contMap.viewControl.jumpTo(bjBusinessItem.value.feature.getGeometry());
            this._contMap.viewControl.setResolution(8.583069007761132E-5);
        }
    };

    /**
     * 关闭报警专题
     */
    HlyMapService.prototype.closeCurrentBjTheme = function () {
        //停止播放轨迹、追踪
        this.unTrackOnHly();
        this.gjPlayClose();

        //主题对象清除
        var preThemeObject = this._themeObjectManager.getCurrentThemeObject("报警");
        if (preThemeObject) {
            //有以前的专题对象，清除
            this._themeObjectManager.clearThemeObject("报警", preThemeObject.id);
        }
    };

    /*=========================业务模块（热点）===========================*/

    /**
     * 显示热点
     * @param themeBelongsTo
     * @param itemIdBelongsTo
     * @param rdItem
     */
    HlyMapService.prototype.showRd = function (themeBelongsTo, itemIdBelongsTo, rdItem) {
        //对象创建并管理
        var rdBusinessItem;
        if (themeBelongsTo && itemIdBelongsTo) {
            //有隶属专题时，创建并显示，同时归属于专题对象
            if (this._getThemmeObject(themeBelongsTo, itemIdBelongsTo)) {
                //有专题
                rdBusinessItem = this._createRdBusinessItem(rdItem);
                this._themeObjectManager.addTmpObject(themeBelongsTo, itemIdBelongsTo, rdBusinessItem);
            } else {
                //写了所属，但不正确
                return;
            }
        } else {
            //不隶属于任何专题，自己为专题
            rdBusinessItem = this._createRdBusinessItem(rdItem);
            this._themeObjectManager.setThemeObject("热点", rdBusinessItem);
        }
        //跳转到该图标
        if (!(themeBelongsTo && itemIdBelongsTo)) {
            //自己为专题数据，支持跳到
            this._contMap.viewControl.jumpTo(rdBusinessItem.value.feature.getGeometry());
            this._contMap.viewControl.setResolution(8.583069007761132E-5);
        }
    };

    /**
     * 关闭热点专题
     */
    HlyMapService.prototype.closeCurrentRdTheme = function () {
        //停止播放轨迹、追踪
        this.unTrackOnHly();
        this.gjPlayClose();

        //主题对象清除
        var preThemeObject = this._themeObjectManager.getCurrentThemeObject("热点");
        if (preThemeObject) {
            //有以前的专题对象，清除
            this._themeObjectManager.clearThemeObject("热点", preThemeObject.id);
        }
    };


    /*=========================业务模块（反馈）===========================*/


    /*=========================私有对象============================*/

    /**
     * 创建并选中热点业务对象（考虑数据源与业务对象集合不一致的情况：数据源没有，则创建并添加到业务对象集合；数据源有，则直接添加到业务对象集合；同时兼顾状态）
     * @param rdItem
     * @private
     */
    HlyMapService.prototype._createRdBusinessItem = function (rdItem) {
        var existObj = this._featureContainerManager.exist(rdItem.HOTSPOT_ID, "热点");
        if (!existObj) {
            var dataSource = this._hlyMap.rdLayerDataSource;
            //要素容器里面没有，则从数据源里找（常驻要素原因），并构建
            var feature = dataSource.getFeatureById(rdItem.HOTSPOT_ID);
            if (!feature) {
                //数据源里也没有，创建24小时外的
                //添加报警点
                feature = dataSource.addDataItem(rdItem);
                //设置为realTime状态为非实时数据
                feature.set("realTime", "unRealTime");
            }

            //设置为iconState状态为选择
            feature.set("iconState", "selected");
            //添加到容器
            this._featureContainerManager.addFeatureItem(rdItem.HOTSPOT_ID, feature.valueItem, feature, dataSource, "热点",false,true);

            existObj = this._featureContainerManager.exist(rdItem.HOTSPOT_ID, "热点");
        }
        return existObj.bItem;
    }

    /**
     * 创建并选中报警业务对象（考虑数据源与业务对象集合不一致的情况：数据源没有，则创建并添加到业务对象集合；数据源有，则直接添加到业务对象集合；同时兼顾状态）
     * @param bjItem
     * @private
     */
    HlyMapService.prototype._createBjBusinessItem = function (bjItem) {
        var existObj = this._featureContainerManager.exist(bjItem.ID, "报警");
        if (!existObj) {
            var dataSource = this._hlyMap.bjLayerDataSource;
            //要素容器里面没有，则从数据源里找（常驻要素原因），并构建
            var feature = dataSource.getFeatureById(bjItem.ID);
            if (!feature) {
                //数据源里也没有，创建24小时外的报警点
                //添加报警点
                feature = dataSource.addDataItem(bjItem);
                //设置为realTime状态为非实时数据
                feature.set("realTime", "unRealTime");
            }

            //设置为iconState状态为选择
            feature.set("iconState", "selected");
            //添加到容器
            this._featureContainerManager.addFeatureItem(bjItem.ID, feature.valueItem, feature, dataSource, "报警",false,true);

            existObj = this._featureContainerManager.exist(bjItem.ID, "报警");
        }
        return existObj.bItem;
    }

    /**
     * 创建巡护区业务对象
     * @param patrolDetail
     * @private
     */
    HlyMapService.prototype._createXhqBusinessItem = function (patrolDetail) {
        var existObj = this._featureContainerManager.exist(patrolDetail.PatrolAreaInfo.ID, "巡护区");
        if (!existObj) {
            //不存在
            //显示巡护区
            var dataSource = this._hlyMap.xhqLayerDataSource;
            dataSource.addDataItem(patrolDetail.PatrolAreaInfo);
            dataSource.setSelected(patrolDetail.PatrolAreaInfo.ID);
            //添加到容器
            this._featureContainerManager.addFeatureItem(patrolDetail.PatrolAreaInfo.ID, patrolDetail.PatrolAreaInfo,
                patrolDetail.PatrolAreaInfo.feature, dataSource, "巡护区");

            //显示关键点
            this._showKeyPoints(patrolDetail.PatrolAreaInfo, patrolDetail.PatrolPoints);

            existObj = this._featureContainerManager.exist(patrolDetail.PatrolAreaInfo.ID, "巡护区");
        }
        return existObj.bItem;
    };

    /**
     * 显示巡逻关键点
     * @param patrolPoints 巡逻关键点集合
     * @private
     */
    HlyMapService.prototype._showKeyPoints = function (zoneItem, patrolPoints) {
        var tmpSource = this._hlyMap.gjdLayerDataSource;
        for (var i = 0; i < patrolPoints.length; i++) {
            var point = patrolPoints[i];
            tmpSource.addDataItem(point);

            //设置关键点顺序
            point.feature.set("index", i);

            //添加到容器
            this._featureContainerManager.addFeatureItem(zoneItem.ID, zoneItem, point.feature, tmpSource, "巡护区");
        }
    };

    /**
     * 创建巡护区业务对象
     * @param gjItem
     * @private
     */
    HlyMapService.prototype._createGjBusinessItem = function (gjItem) {
        //检查是否已有显示
        var existObj = this._featureContainerManager.exist(gjItem.LineId, "轨迹");
        if (!existObj) {
            //未显示
            var dataSource = this._hlyMap.gjLayerDataSource;
            //添加并选择新轨迹
            dataSource.addDataItem(gjItem);
            dataSource.setSelected(gjItem.LineId);
            //添加轨迹到容器
            for (var i = 0; i < gjItem.features.length; i++) {
                var feature = gjItem.features[i];
                this._featureContainerManager.addFeatureItem(gjItem.LineId, gjItem, feature, dataSource, "轨迹");
            }

            //标注起始点
            this._addStartAndEndPoint(gjItem, gjItem.GpsInfos[0], gjItem.GpsInfos[gjItem.GpsInfos.length - 1]);

            existObj = this._featureContainerManager.exist(gjItem.LineId, "轨迹");
        }
        return existObj.bItem;
    };


    /**
     * 添加（有且仅有一对）起始点（到tmp图层）
     * @param startGpsInfo
     * @param endGpsInfo
     * @private
     */
    HlyMapService.prototype._addStartAndEndPoint = function (lineItem, startGpsInfo, endGpsInfo) {
        var tmpSource = this._hlyMap.tmpLayerDataSource;

        //创建带风格的要素
        var iconsUrl = baseUtil.getMapIconsUrl();
        var startFeature = new ol.Feature({
            geometry: new ol.geom.Point([startGpsInfo.LONGITUDE, startGpsInfo.LATITUDE]),
        });
        startFeature.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [.5, 1],//图标位置对应的地图点
                src: iconsUrl,
                scale: 1,
                offset: [367, 0],
                size: [33, 46],
            })
        }));
        var endFeature = new ol.Feature({
            geometry: new ol.geom.Point([endGpsInfo.LONGITUDE, endGpsInfo.LATITUDE]),
        });
        endFeature.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [.5, 1],//图标位置对应的地图点
                src: iconsUrl,
                scale: 1,
                offset: [0, 46],
                size: [33, 46],
            })
        }));

        //添加到图层
        tmpSource.addFeatures([startFeature, endFeature]);

        //添加到容器
        this._featureContainerManager.addFeatureItem(lineItem.LineId, lineItem, startFeature, tmpSource, "轨迹");
        this._featureContainerManager.addFeatureItem(lineItem.LineId, lineItem, endFeature, tmpSource, "轨迹");
    };

    /**
     * 获取专题对象
     * @param theme
     * @param itemId
     * @private
     */
    HlyMapService.prototype._getThemmeObject = function (theme, itemId) {
        var preThemeObject = this._themeObjectManager.getCurrentThemeObject(theme);
        if (preThemeObject && preThemeObject.id == itemId) {
            //找到
            return preThemeObject;
        }
        return;
    }
    /**
     * 查找或创建护林员feature
     * @param itemId
     * @param item
     * @private
     */
    HlyMapService.prototype._foundOrCreateHlyUser = function (itemId, item) {
        //找到地图上有的用户，如果没有则创建
        var targetFeature;
        var foundedFeature = this._hlyMap.hlyLayerDataSource.getFeatureById(itemId);
        if (foundedFeature) {
            //地图上有图标
            targetFeature = foundedFeature;
        }
        else {
            //地图上未找到，则请求或直接使用相关信息创建
            var checkTag = (new Date()).getTime();
            targetFeature = this._hlyMap.hlyLayerDataSource.addDataItem(item, checkTag)
        }
        return targetFeature;
    }
    /**
     * 地图实时数据刷新
     * @private
     */
    HlyMapService.prototype._mapDataRefresh = function () {
        var mapDataLoader = new MapDataLoader({
            hlyMap: this._hlyMap
        });
        var that = this;

        var refreshFun = function () {
            //24小时热点数据刷新
            $.get(that._serviceUrlConfig.getHotspotList, function (data) {
                //热点数据刷新
                mapDataLoader.RefreshRdData(data);
            });
            //24小时报警数据刷新
            $.get(that._serviceUrlConfig.getAlarmsByOrgan, function (data) {
                //报警数据刷新
                mapDataLoader.RefreshBjData(data);

            });
            //护林员数据刷新
            $.get(that._serviceUrlConfig.getOnlineUserForMapList, function (data) {
                //护林员数据刷新
                mapDataLoader.RefreshHlyData(data);
            });
            //24小时反馈数据刷新
            $.get(that._serviceUrlConfig.getNoticesByOrgan, function (data) {
                //报警数据刷新
                mapDataLoader.RefreshFkData(data);
            });
        };
        refreshFun();
        //10秒刷新一次
        setInterval(function () {
            refreshFun();
        }, 10000);

    };

    return HlyMapService;
});