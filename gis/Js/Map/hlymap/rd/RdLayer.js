/**
 * Created by chenlong on 2017/9/12.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
    'core/BaseLayer',
], function (defineProperties, baseUtil, BaseLayer) {

    /**
     * 热点图层
     * @constructor
     */
    var RdLayer = function (option) {
        BaseLayer.call(this, option);
        this.LayerType="热点图层";
    };

    ol.inherits(RdLayer, BaseLayer);

    /**
     * 获取风格配置项（实现）
     * @private
     */
    RdLayer.prototype._getStyleOption = function () {
        var iconsUrl = baseUtil.getMapIconsUrl();
        return {
            normal: {
                offset: [320, 0],//位置
                url: iconsUrl,//图片资源
                anchor: [.5, .5],//图标位置对应的地图点
                size: [40, 40],//截取大小
                opacity: .8,//透明度
            },
            selected: {
                offset: [320, 0],//位置
                url: iconsUrl,//图片资源
                anchor: [.5, .5],//图标位置对应的地图点
                size: [40, 40],//截取大小
                opacity: .8,//透明度
            },
            highlight: {
                offset: [320, 0],//位置
                url: iconsUrl,//图片资源
                anchor: [.5, .5],//图标位置对应的地图点
                size: [40, 40],//截取大小
                opacity: .8,//透明度
            },
            focus: {
                offset: [320, 0],//位置
                url: iconsUrl,//图片资源
                anchor: [.5, .5],//图标位置对应的地图点
                size: [40, 40],//截取大小
                opacity: .8,//透明度
            },
        };
    };

    return RdLayer;
});