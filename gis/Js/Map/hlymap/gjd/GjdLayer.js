/**
 * Created by chenlong on 2017/9/12.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
    'core/BaseLayer',
], function (defineProperties, baseUtil, BaseLayer) {

    /**
     * 关键点图层
     * @constructor
     */
    var GjdLayer = function (option) {
        BaseLayer.call(this, option);
        this.LayerType="关键点图层";
    };

    ol.inherits(GjdLayer, BaseLayer);

    /**
     * 获取风格配置项（实现）
     * @private
     */
    GjdLayer.prototype._getStyleOption = function () {
        var iconsUrl = baseUtil.getMapIconsUrl();
        return {
            normal: {
                offset: [335,40],//位置
                url: iconsUrl,//图片资源
                anchor: [0.1, 1],//图标位置对应的地图点
                size: [28, 29],//截取大小
                opacity: 1,//透明度
            },
            selected: {
                offset: [264,40],//位置
                url: iconsUrl,//图片资源
                anchor: [.4, .86],//图标位置对应的地图点
                size: [43, 40],//截取大小
                opacity: 1,//透明度
            },
            highlight: {
                offset: [264,40],//位置
                url: iconsUrl,//图片资源
                anchor: [.4, .86],//图标位置对应的地图点
                size: [43, 40],//截取大小
                opacity: 1,//透明度
            },
        };
    };

    return GjdLayer;
});