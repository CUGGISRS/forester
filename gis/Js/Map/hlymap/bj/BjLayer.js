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
        BaseLayer.call(this, baseUtil.assign({
            style: this._styleFunction
        }, option));
        this.LayerType = "报警图层";
    };

    ol.inherits(BjLayer, BaseLayer);

    /**
     * 风格设置
     * @private
     */
    BjLayer.prototype._styleFunction = function (feature, resolution) {
        //24小时内实时数据
        var realTime = feature.get("realTime") ? feature.get("realTime") : "realTime";
        var iconState = feature.get("iconState") ? feature.get("iconState") : "normal";

        if (feature[iconState + realTime]) {
            return feature[iconState + realTime];
        }


        var iconsUrl = baseUtil.getMapIconsUrl();
        var styleOptions = {
            //24小时内的实时数据
            realTime: {
                normal: {
                    offset: [206, 0],//位置
                    url: iconsUrl,//图片资源
                    anchor: [.5, .5],//图标位置对应的地图点
                    size: [31, 31],//截取大小
                    opacity: 1,//透明度
                },
                selected: {
                    offset: [67, 46],//位置
                    url: iconsUrl,//图片资源
                    anchor: [.5, .5],//图标位置对应的地图点
                    size: [34, 37],//截取大小
                    opacity: 1,//透明度
                },
                highlight: {
                    offset: [134, 140],//位置
                    url: iconsUrl,//图片资源
                    anchor: [.5, .5],//图标位置对应的地图点
                    size: [37, 37],//截取大小
                    opacity: 1,//透明度
                },
            },
            //非实时数据
            unRealTime: {
                normal: {
                    offset: [237, 0],//位置
                    url: iconsUrl,//图片资源
                    anchor: [.5, .5],//图标位置对应的地图点
                    size: [31, 31],//截取大小
                    opacity: 1,//透明度
                },
                selected: {
                    offset: [97, 140],//位置
                    url: iconsUrl,//图片资源
                    anchor: [.5, .5],//图标位置对应的地图点
                    size: [37, 36],//截取大小
                    opacity: 1,//透明度
                },
                highlight: {
                    offset: [33, 46],//位置
                    url: iconsUrl,//图片资源
                    anchor: [.5, .5],//图标位置对应的地图点
                    size: [34, 36],//截取大小
                    opacity: 1,//透明度
                },
            },
        };

        var style = [
            new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: styleOptions[realTime][iconState].anchor,
                    src: styleOptions[realTime][iconState].url,
                    scale: 1,
                    offset: styleOptions[realTime][iconState].offset,
                    size: styleOptions[realTime][iconState].size,
                    opacity: styleOptions[realTime][iconState].opacity
                })
            })
        ];

        feature[iconState + realTime] = style;

        return style;
    };

    return BjLayer;
});