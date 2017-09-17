/**
 * Created by chenlong on 2017/9/10.
 */
define([
    'core/defineProperties',
    'core/ThemeBaseService',
], function (defineProperties, ThemeBaseService) {

    /**
     * 热点专题业务服务
     * @param option
     * @constructor
     */
    var RdThemeService = function (option) {
        ThemeBaseService.call(this, option);
        //临时图层初始化
        this._layerManage.tempLayers.rdTmpLayers={};
    };
    //继承自ThemeBaseService
    ol.inherits(RdThemeService, ThemeBaseService);

    //定义属性
    defineProperties(RdThemeService.prototype, {});

    /**
     * 获取图层数据源对象（实现）
     * @private
     */
    RdThemeService.prototype._getLayerDataSource = function () {
        return this._layerManage.rdLayer.getSource();
    }


    return RdThemeService;
});