/**
 * Created by chenlong on 2017/9/10.
 */
define([
    'core/baseUtil',
    'core/defineProperties',
    'core/ThemeBaseService',
    'core/FeatureContainerManager',
    'hlymap/gj/TrackSimulate',
], function (baseUtil, defineProperties, ThemeBaseService,
             FeatureContainerManager, TrackSimulate) {

    /**
     * 护林员专题业务服务
     * @param option
     * @constructor
     */
    var HlyThemeService = function (option) {
        this._clusterDistance = option.clusterDistance
        ThemeBaseService.call(this, option);

        //绘制的要素容器
        this._featureContainerManager = new FeatureContainerManager();
    };
    //继承自ThemeBaseService
    ol.inherits(HlyThemeService, ThemeBaseService);

    //定义属性
    defineProperties(HlyThemeService.prototype, {});

    /**
     * 服务初始化
     */
    HlyThemeService.prototype.init = function () {
        //业务临时图层初始化并加载
        //1、加载在线人员实时聚合图层
        var hlyLayerCluster = this._layerManage.newHlyLayerCluster(this._clusterDistance,this._contMap.scene);
        this._hlyLayer = hlyLayerCluster.layer;
        this._hlyLayer.hlyLayerCluster = hlyLayerCluster;
        this._hlyLayer.isThemeLayer = true;
        this._hlyLayer.isCluster = true;

        this._contMap.layerManager.addLayer(this._hlyLayer, true);

        //2、加载（实时）24小时反馈图层
        this._fkLayer = this._layerManage.newFkLayer();
        this._fkLayer.isThemeLayer = true;
        this._contMap.layerManager.addLayer(this._fkLayer, true);

        //中间图层初始化
        //1、临时巡护区图层
        this._xhqLayer = this._layerManage.newXhqLayer();
        this._contMap.layerManager.addLayer(this._xhqLayer, true);
        //2、临时轨迹图层
        this._gjTmpLayer = this._layerManage.newGjLayer();
        this._contMap.layerManager.addLayer(this._gjTmpLayer, true);
        //3、临时关键点图层
        this._gjdTmpLayer =this._layerManage.newGjdLayer() ;
        this._contMap.layerManager.addLayer(this._gjdTmpLayer, true);
        //4、临时图层
        this._tmpLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
        });
        this._contMap.layerManager.addLayer(this._tmpLayer, true);

        this._layerManage.tempLayers.hlyTmpLayers = {
            tmpLayer: this._tmpLayer,
            gjTmpLayer: this._gjTmpLayer,
            gjdTmpLayer: this._gjdTmpLayer,
            xhqLayer: this._xhqLayer,
            hlyLayer: this._hlyLayer,
            fkLayer: this._fkLayer,
        };

        //地图事件
        //启动图形mouseover触发（地图高亮；使得网页关键点选中，事件名：KeyPointPointermove）
        var that = this;
        this._contMap.scene.on("pointermove", function (e) {
            var olLayer = e.olLayer;
            var feature = e.feature;
            var eventarg;
            if (olLayer === that._gjdTmpLayer) {
                //地图高亮
                that._gjdTmpLayer.getSource().setHighLight(feature.getId());
                //临时关键点才触发
                eventarg = {
                    itemId: feature.getId(),
                    pointerOn: true
                };
            } else {
                //地图高亮取消
                that._gjdTmpLayer.getSource().cancelHighLight();
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
    }
    /**
     * 显示护林员专题时调用
     */
    HlyThemeService.prototype.onShow = function () {
        //显示护林员及24小时反馈数据数据图层
        this._hlyLayer.setVisible(true);
        this._fkLayer.setVisible(true);
        //定时刷新实时数据
        this._periodicRefreshRealtimeData();
    };

    /**
     * 关闭护林员专题时调用
     */
    HlyThemeService.prototype.onClose = function () {
        //关闭定时刷新
        if (this._refreshCode) {
            clearInterval(this._refreshCode);
            this._refreshCode = null;
        }
        //隐藏护林员及24小时反馈数据数据图层
        this._hlyLayer.setVisible(false);
        this._fkLayer.setVisible(false);
        //清空临时状态与对象
        this.clearTmp();
    };

    /**
     * 清除临时状态或图形
     */
    HlyThemeService.prototype.clearTmp = function () {
        //停止播放轨迹、追踪、选中
        this.unLockOn();
        this.cancelSelected();
        this.trackPlayClose();

        //清除单位范围、巡护区、轨迹、关键点等图形
        this._featureContainerManager.clear();
    };

    /*========================================人员业务===========================================*/
    /**
     * 锁定（追踪）护林员
     * @param userId 护林员Id
     */
    HlyThemeService.prototype.lockOn = function (userId) {
        //取消所有锁定
        this.unLockOn();
        //首次先飞到
        this._lockOnFeature = this._LayerDataSource.getFeatureById(userId);
        var that = this;
        this._onUserLockOnEventCallback = function () {
            var foundedFeature = that._lockOnFeature;
            var pointGeometry = foundedFeature.getGeometry();
            //地图跳转
            that._hlyMap.contMap.viewControl.jumpTo(pointGeometry.getCoordinates());
            that._hlyMap._contMap.viewControl.setResolution(8.583069007761132E-5);
        };

        this._onUserLockOnEventCallback();
        //位置变更时地图缩放追踪
        this._lockOnFeature.on("change:geometry", this._onUserLockOnEventCallback);

        //定时更新数据
        this._lockOnCode = setInterval(function () {
            //获取用户位置信息
            $.get(that._option.getUserGpsInfoUrl, {
                userId: userId
            }, function (gpsInfo) {
                var foundedFeature = that._lockOnFeature;
                //更新图标位置
                if (foundedFeature) {
                    foundedFeature.setGeometry(new ol.geom.Point([gpsInfo.LONGITUDE, gpsInfo.LATITUDE]));
                }
            });
        }, 3000);
    }

    /**
     * 取消锁定（追踪）护林员
     */
    HlyThemeService.prototype.unLockOn = function () {
        //取消位置变更时地图缩放追踪
        if (this._onUserLockOnEventCallback) {
            var foundedFeature = this._lockOnFeature;
            foundedFeature.un("change:geometry", this._onUserLockOnEventCallback);
            this._lockOnFeature = null;
            this._onUserLockOnEventCallback = null;
        }

        //取消定时更新数据
        if (this._lockOnCode) {
            clearInterval(this._lockOnCode);
            this._lockOnCode = null;
        }
    }

    /*========================================轨迹业务===========================================*/

    /**
     * 显示某条轨迹
     * @param gjItem
     */
    HlyThemeService.prototype.showGj = function (gjItem) {
        //检查是否已有显示
        var existObj = this._featureContainerManager.exist(gjItem.LineId, "轨迹");
        if (!existObj) {
            //未显示
            var dataSource = this._gjTmpLayer.getSource();
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

        //跳转到该轨迹
        var padding = .16 * this._hlyMap.contMap.scene.map2d.getSize()[0];
        this._hlyMap.contMap.viewControl.jumpTo(existObj.bItem.item.singleLine.getExtent(), [padding, padding, padding, padding]);
    }

    /**
     * 关闭某条轨迹
     */
    HlyThemeService.prototype.closeGj = function (lineId) {
        this._featureContainerManager.removeMapBusinessItem(lineId, "轨迹");
    }

    /**
     * 轨迹演示模拟初始化
     * @param gjItem
     */
    HlyThemeService.prototype.trackPlayInit = function (gjItem) {
        var dataSource = this._gjTmpLayer.getSource();
        var lineItem = dataSource.getItemById(gjItem.LineId);
        if (!lineItem) {
            //未找到，则先显示
            this.showGj(gjItem);
            lineItem = gjItem;
        }
        //模拟
        if (!this._trackSimulate) {
            //未创建
            var iconsUrl = baseUtil.getMapIconsUrl();
            this._trackSimulate = new TrackSimulate({
                contMap: this._hlyMap.contMap,
                tmpLayer: this._tmpLayer,
                trackLine: lineItem.singleLine,
                markerStyle: new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [.5, 1],//图标位置对应的地图点
                        src: iconsUrl,
                        scale: 1,
                        offset: [0, 90],
                        size: [16, 21],
                    })
                })
            });
            this._trackSimulate.init();
        }
    };

    /**
     * 轨迹演示模拟
     * @param fraction 进度（0~1）
     */
    HlyThemeService.prototype.trackPlay = function (fraction) {
        //默认已经初始化了
        if (this._trackSimulate) {
            this._trackSimulate.moveTo(fraction);
        }
    };

    /**
     * 关闭轨迹演示模拟
     */
    HlyThemeService.prototype.trackPlayClose = function () {
        //模拟器删除
        if (this._trackSimulate) {
            this._trackSimulate.dispose();
            this._trackSimulate = null;
        }
    };

    /*========================================巡护区业务===========================================*/
    /**
     * 显示某巡护区（及关键点）
     * @param patrolDetail 巡护区详情
     */
    HlyThemeService.prototype.showXhq = function (patrolDetail) {
        var existObj = this._featureContainerManager.exist(patrolDetail.PatrolAreaInfo.ID, "巡护区");
        if (!existObj) {
            //不存在
            //显示巡护区
            var dataSource = this._xhqLayer.getSource();
            dataSource.addDataItem(patrolDetail.PatrolAreaInfo);
            //添加到容器
            this._featureContainerManager.addFeatureItem(patrolDetail.PatrolAreaInfo.ID, patrolDetail.PatrolAreaInfo,
                patrolDetail.PatrolAreaInfo.feature, dataSource, "巡护区");

            //显示关键点
            this._showKeyPoints(patrolDetail.PatrolAreaInfo, patrolDetail.PatrolPoints);

            existObj = this._featureContainerManager.exist(patrolDetail.PatrolAreaInfo.ID, "巡护区");
        }
        //跳转到该区域
        var padding = .16 * this._hlyMap.contMap.scene.map2d.getSize()[0];
        this._hlyMap.contMap.viewControl.jumpTo(existObj.bItem.item.feature.getGeometry().getExtent(), [padding, padding, padding, padding]);
    };

    /**
     * （从UI）选择关键点
     * @param patrolPoint
     */
    HlyThemeService.prototype.selectKeyPoint = function (patrolPoint) {
        var tmpSource = this._gjdTmpLayer.getSource();
        tmpSource.setSelected(patrolPoint.ID);
    };

    /**
     * （从UI）取消选择关键点
     */
    HlyThemeService.prototype.unSelectKeyPoint = function () {
        var tmpSource = this._gjdTmpLayer.getSource();
        tmpSource.cancelSelected();
    };

    /**
     * 关闭某个巡护区显示
     */
    HlyThemeService.prototype.closeXhq = function (zoneId) {
        this._featureContainerManager.removeMapBusinessItem(zoneId, "巡护区");
    };

    /*========================================私有方法===========================================*/

    /**
     * 获取纯临时图层（实现）
     * @private
     */
    HlyThemeService.prototype._getTmpLayer=function () {
        if (!this._tmpLayer) {
            this._LayerDataSource = this._tmpLayer.getSource();
        }
        return this._tmpLayer;
    }

    /**
     * 获取图层数据源对象（实现）
     * @private
     */
    HlyThemeService.prototype._getLayerDataSource = function () {
        if (!this._LayerDataSource) {
            this._LayerDataSource = this._hlyLayer.getSource().getSource();
        }
        return this._LayerDataSource;
    }

    /**
     * 定时刷新实时数据
     * @private
     */
    HlyThemeService.prototype._periodicRefreshRealtimeData = function () {
        //清除以前刷新机制，保证只有一次刷新
        if (this._refreshCode) {
            clearInterval(this._refreshCode);
            this._refreshCode = null;
        }
        //执行刷新
        var that = this;
        this._locationRefresh = function () {
            //护林员数据刷新
            $.get(that._option.getOnlineUserForMapListUrl, function (data) {
                //护林员数据刷新
                var hlyLayerDataSource = that._hlyLayer.getSource().getSource();
                hlyLayerDataSource.refresh(data);
            });
            //24小时反馈数据刷新
            $.get(that._option.getNoticesByOrganUrl, function (data) {
                //报警数据刷新
                var layerDataSource = that._fkLayer.getSource();
                layerDataSource.refresh(data);
            });
        };
        this._locationRefresh();

        this._refreshCode = setInterval(function () {
            try {
                that._locationRefresh();
            }
            catch (e) {
                console.log("定时刷新护林员数据及4小时反馈数据时失败：" + e);
            }
        }, 10000);
    };

    /**
     * 显示巡逻关键点
     * @param patrolPoints 巡逻关键点集合
     * @private
     */
    HlyThemeService.prototype._showKeyPoints = function (zoneItem, patrolPoints) {
        var tmpSource = this._gjdTmpLayer.getSource();
        for (var i = 0; i < patrolPoints.length; i++) {
            var point = patrolPoints[i];
            tmpSource.addDataItem(point);
            //添加到容器
            this._featureContainerManager.addFeatureItem(zoneItem.ID, zoneItem, point.feature, tmpSource, "巡护区");
        }
    };

    /**
     * 添加（有且仅有一对）起始点（到tmp图层）
     * @param startGpsInfo
     * @param endGpsInfo
     * @private
     */
    HlyThemeService.prototype._addStartAndEndPoint = function (lineItem, startGpsInfo, endGpsInfo) {
        var tmpSource = this._tmpLayer.getSource();

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
                offset: [198, 40],
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
                offset: [231, 40],
                size: [33, 46],
            })
        }));

        //添加到图层
        tmpSource.addFeatures([startFeature, endFeature]);

        //添加到容器
        this._featureContainerManager.addFeatureItem(lineItem.LineId, lineItem, startFeature, tmpSource, "轨迹");
        this._featureContainerManager.addFeatureItem(lineItem.LineId, lineItem, endFeature, tmpSource, "轨迹");
    };


    return HlyThemeService;
});