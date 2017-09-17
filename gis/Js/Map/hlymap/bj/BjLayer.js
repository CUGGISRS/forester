/**
 * Created by chenlong on 2017/9/12.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
    'core/BaseLayer',
], function (defineProperties, baseUtil, BaseLayer) {

    /**
     * 报警图层
     * @constructor
     */
    var BjLayer = function (option) {
        BaseLayer.call(this, option);
        this.LayerType="报警图层";
    };

    ol.inherits(BjLayer, BaseLayer);

    /**
     * 获取风格配置项（实现）
     * @private
     */
    BjLayer.prototype._getStyleOption = function () {
        var iconsUrl = baseUtil.getMapIconsUrl();
        return {
            normal: {
                offset: [280, 0],//位置
                url: iconsUrl,//图片资源
                anchor: [.5, .5],//图标位置对应的地图点
                size: [40, 40],//截取大小
                opacity: .8,//透明度
            },
            selected: {
                offset: [280, 0],//位置
                url: iconsUrl,//图片资源
                anchor: [.5, .5],//图标位置对应的地图点
                size: [40, 40],//截取大小
                opacity: .8,//透明度
            },
            highlight: {
                offset: [280, 0],//位置
                url: iconsUrl,//图片资源
                anchor: [.5, .5],//图标位置对应的地图点
                size: [40, 40],//截取大小
                opacity: .8,//透明度
            },
            focus: {
                offset: [280, 0],//位置
                url: iconsUrl,//图片资源
                anchor: [.5, .5],//图标位置对应的地图点
                size: [40, 40],//截取大小
                opacity: .8,//透明度
            },
        };
    };

    return BjLayer;
});