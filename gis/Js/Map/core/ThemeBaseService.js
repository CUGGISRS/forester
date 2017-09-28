/**
 * Created by chenlong on 2017/9/10.
 */
define([
    'core/defineProperties',
    'core/EventObject',
    'core/FeatureContainerManager',
], function (defineProperties,EventObject,
             FeatureContainerManager) {

    /**
     * 专题业务基本服务
     * @param option
     * @constructor
     */
    var ThemeBaseService = function (option) {
        this._option = option;
        this._hlyMap = option.hlyMap;
        this._contMap = option.hlyMap.contMap;
        this._layerManage = this._hlyMap.layerManage;
        //绘制的要素容器
        this._featureContainerManager = new FeatureContainerManager();
    };
    //集成自EventObject类
    ThemeBaseService.prototype=new EventObject();

    //定义属性
    defineProperties(ThemeBaseService.prototype, {});

    /**
     * 显示专题时调用（可重载）
     */
    ThemeBaseService.prototype.onShow = function () {
    };

    /**
     * 关闭专题时调用（可重载）
     */
    ThemeBaseService.prototype.onClose = function () {
    };

    /**
     * 跳转到专题对象图标并选中
     * @param itemId 数据对象ID
     * @param item 数据对象值
     */
    ThemeBaseService.prototype.jumpTo = function (itemId, item) {
        //找到地图上有的用户，如果没有则创建
        var targetFeature;
        var foundedFeature = this._getLayerDataSource().getFeatureById(itemId);
        if (foundedFeature) {
            //地图上有图标
            targetFeature = foundedFeature;
        }
        else {
            //地图上未找到，则请求或直接使用相关信息创建
            var checkTag = (new Date()).getTime();
            targetFeature = this._getLayerDataSource().addDataItem(item, checkTag)
        }
        //跳转到该图标并选中
        this._contMap.viewControl.jumpTo(targetFeature.getGeometry());
        this._contMap.viewControl.setResolution(8.583069007761132E-5);
        this._getLayerDataSource().setSelected(targetFeature.getId());
    };

    /**
     * 取消选中
     * @param userId
     */
    ThemeBaseService.prototype.cancelSelected=function (userId) {
        this._getLayerDataSource().cancelSelected(userId);
    };


    /*========================================单位区域===========================================*/

    /**
     * 跳到单位区域并标注（到tmp图层）
     * @param esriGeometryString
     */
    ThemeBaseService.prototype.jumpToUnitZone = function (esriGeometryString) {
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
        var tmpSource = this._getTmpLayer().getSource();
        this._featureContainerManager.addFeatureItem("选择的区域", {}, unitZoneFeature, tmpSource, "单位区域", true);
        //转跳到该图形
        var padding = .16 * this._hlyMap.contMap.scene.map2d.getSize()[0];
        this._hlyMap.contMap.viewControl.jumpTo(geometry.getExtent(), [padding, padding, padding, padding]);
    };

    /**
     * 清除原有的单位区域
     */
    ThemeBaseService.prototype.clearUnitZone = function () {
        //清除原有的
        if (this._featureContainerManager.exist("选择的区域", "单位区域")) {
            this._featureContainerManager.removeMapBusinessItem("选择的区域", "单位区域");
        }
    };

    /**
     * 获取纯临时图层（待实现）
     * @private
     */
    ThemeBaseService.prototype._getTmpLayer=function () {

    }

    /**
     * 获取图层数据源对象（待实现）
     * @private
     */
    ThemeBaseService.prototype._getLayerDataSource=function () {

    };

    return ThemeBaseService;
});