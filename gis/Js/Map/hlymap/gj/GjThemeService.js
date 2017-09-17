/**
 * Created by chenlong on 2017/9/10.
 */
define([
    'core/baseUtil',
    'core/defineProperties',
    'core/ThemeBaseService',
    'hlymap/gj/TrackSimulate',
], function (baseUtil, defineProperties, ThemeBaseService,TrackSimulate) {

    /**
     * 轨迹专题业务服务
     * @param option
     * @constructor
     */
    var GjThemeService = function (option) {
        ThemeBaseService.call(this, option);
    };
    //继承自ThemeBaseService
    ol.inherits(GjThemeService, ThemeBaseService);

    //定义属性
    defineProperties(GjThemeService.prototype, {});

    /**
     * 服务初始化
     */
    GjThemeService.prototype.init = function () {
        //中间图层初始化
        //1、临时巡护区图层
        this._xhqLayer = this._layerManage.newXhqLayer();
        this._contMap.layerManager.addLayer(this._xhqLayer, true);
        //2、临时轨迹图层
        this._gjTmpLayer = this._layerManage.newGjLayer();
        this._contMap.layerManager.addLayer(this._gjTmpLayer, true);
        //3、临时关键点图层
        this._gjdTmpLayer = this._layerManage.newGjdLayer();
        this._contMap.layerManager.addLayer(this._gjdTmpLayer, true);
        //4、临时图层
        this._tmpLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
        });
        this._contMap.layerManager.addLayer(this._tmpLayer, true);
        //5、报警点临时图层
        this._bjTmpLayer = this._layerManage.newBjLayer();
        this._contMap.layerManager.addLayer(this._bjTmpLayer, true);
        //6、热点临时图层
        this._rdTmpLayer = this._layerManage.newRdLayer();
        this._contMap.layerManager.addLayer(this._rdTmpLayer, true);

        this._layerManage.tempLayers.gjTmpLayers = {
            tmpLayer: this._tmpLayer,
            gjTmpLayer: this._gjTmpLayer,
            gjdTmpLayer: this._gjdTmpLayer,
            xhqLayer: this._xhqLayer,
            bjTmpLayer: this._bjTmpLayer,
            rdTmpLayer: this._rdTmpLayer
        };

        //地图事件
        //启动图形mouseover触发（所有巡护区的关键点）（地图高亮；使得网页关键点选中，事件名：KeyPointPointermove）
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
     * 关闭护林员专题时调用
     */
    GjThemeService.prototype.onClose = function () {
        //清空临时状态与对象
        this.clearTmp();
    };

    /**
     * 清除临时状态或图形
     */
    GjThemeService.prototype.clearTmp = function () {
        //停止播放轨迹、选中
        this.cancelSelected();
        this.trackPlayClose();

        //清除单位范围、巡护区、轨迹、关键点、报警点、热点等图形
        this._featureContainerManager.clear();
    };

    /*========================================轨迹业务===========================================*/

    /**
     * 显示某条轨迹
     * @param gjItem
     */
    GjThemeService.prototype.showGj = function (gjItem) {
        //轨迹专题下，清除临时对象
        this.clearTmp();

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
    GjThemeService.prototype.closeGj = function (lineId) {
        this._featureContainerManager.removeMapBusinessItem(lineId, "轨迹");
    }

    /**
     * 轨迹演示模拟初始化
     * @param gjItem
     */
    GjThemeService.prototype.trackPlayInit = function (gjItem) {
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
    GjThemeService.prototype.trackPlay = function (fraction) {
        //默认已经初始化了
        if (this._trackSimulate) {
            this._trackSimulate.moveTo(fraction);
        }
    };

    /**
     * 关闭轨迹演示模拟
     */
    GjThemeService.prototype.trackPlayClose = function () {
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
    GjThemeService.prototype.showXhq = function (patrolDetail) {
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
            //重新找到该对象
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
    GjThemeService.prototype.selectKeyPoint = function (patrolPoint) {
        var tmpSource = this._gjdTmpLayer.getSource();
        tmpSource.setSelected(patrolPoint.ID);
    };

    /**
     * （从UI）取消选择关键点
     */
    GjThemeService.prototype.unSelectKeyPoint = function () {
        var tmpSource = this._gjdTmpLayer.getSource();
        tmpSource.cancelSelected();
    };

    /**
     * 关闭某个巡护区显示
     */
    GjThemeService.prototype.closeXhq = function (zoneId) {
        this._featureContainerManager.removeMapBusinessItem(zoneId, "巡护区");
    };

    /*========================================事件业务===========================================*/

    /**
     * 显示报警
     * @param bjItem
     */
    GjThemeService.prototype.showBj = function (bjItem) {
        //使用临时图层进行覆盖（不使用常驻图层，需要与其进行区分）
        var existObj = this._featureContainerManager.exist(bjItem.ID, "报警点");
        if (!existObj) {
            //不存在
            //显示报警点
            var dataSource = this._bjTmpLayer.getSource();
            dataSource.addDataItem(bjItem);

            var feature = bjItem.feature;
            //设置为focus（焦点）状态
            feature.set("iconState", "focus");
            //添加到容器
            this._featureContainerManager.addFeatureItem(bjItem.ID, bjItem, feature, dataSource, "报警点");
        }
    };

    /**
     * 显示热点
     * @param rdItem
     */
    GjThemeService.prototype.showRd = function (rdItem) {
        //使用临时图层进行覆盖（不使用常驻图层，需要与其进行区分）
        var existObj = this._featureContainerManager.exist(rdItem.ID, "热点");
        if (!existObj) {
            //不存在
            //显示报警点
            var dataSource = this._rdTmpLayer.getSource();
            dataSource.addDataItem(rdItem);

            var feature = rdItem.feature;
            //设置为focus（焦点）状态
            feature.set("iconState", "focus");
            //添加到容器
            this._featureContainerManager.addFeatureItem(rdItem.ID, rdItem,
                feature, dataSource, "热点");
        }
    };


    /*========================================私有方法===========================================*/

    /**
     * 获取纯临时图层（实现）
     * @private
     */
    GjThemeService.prototype._getTmpLayer = function () {
        if (!this._tmpLayer) {
            this._LayerDataSource = this._tmpLayer.getSource();
        }
        return this._tmpLayer;
    }

    /**
     * 获取图层数据源对象（实现）
     * @private
     */
    GjThemeService.prototype._getLayerDataSource = function () {
        if (!this._LayerDataSource) {
            this._LayerDataSource = this._gjTmpLayer.getSource();
        }
        return this._LayerDataSource;
    }

    /**
     * 显示巡逻关键点
     * @param patrolPoints 巡逻关键点集合
     * @private
     */
    GjThemeService.prototype._showKeyPoints = function (zoneItem, patrolPoints) {
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
    GjThemeService.prototype._addStartAndEndPoint = function (lineItem, startGpsInfo, endGpsInfo) {
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

    return GjThemeService;
});