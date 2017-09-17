/**
 * Created by chenlong on 2017/9/10.
 */
define([
    'core/defineProperties',
    'core/ThemeBaseService',
], function (defineProperties, ThemeBaseService) {

    /**
     * 反馈专题业务服务
     * @param option
     * @constructor
     */
    var FkThemeService = function (option) {
        ThemeBaseService.call(this, option);
        //临时图层初始化
        this._layerManage.tempLayers.fkLayersTmpLayers={};
    };
    //继承自ThemeBaseService
    ol.inherits(FkThemeService, ThemeBaseService);

    //定义属性
    defineProperties(FkThemeService.prototype, {});

    /**
     * 获取图层数据源对象（实现）
     * @private
     */
    FkThemeService.prototype._getLayerDataSource = function () {
        return this._layerManage.fkLayer.getSource();
    }


    return FkThemeService;
});