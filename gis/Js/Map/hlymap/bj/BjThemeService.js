/**
 * Created by chenlong on 2017/9/10.
 */
define([
    'core/defineProperties',
    'core/ThemeBaseService',
], function (defineProperties, ThemeBaseService) {

    /**
     * 报警专题业务服务
     * @param option
     * @constructor
     */
    var BjThemeService = function (option) {
        ThemeBaseService.call(this, option);
        //临时图层初始化
        this._layerManage.tempLayers.bjTmpLayers={};
    };
    //继承自ThemeBaseService
    ol.inherits(BjThemeService, ThemeBaseService);

    //定义属性
    defineProperties(BjThemeService.prototype, {});

    /**
     * 获取图层数据源对象（实现）
     * @private
     */
    BjThemeService.prototype._getLayerDataSource = function () {
        return this._layerManage.bjLayer.getSource();
    }


    return BjThemeService;
});