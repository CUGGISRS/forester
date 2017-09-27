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
        BaseLayer.call(this, baseUtil.assign({
            style: this._styleFunction
        }, option));
        this.LayerType = "热点图层";
        this.set("altitudeMode", "clampToGround");
    };

    ol.inherits(RdLayer, BaseLayer);

    /**
     * 风格设置
     * @private
     */
    RdLayer.prototype._styleFunction = function (feature, resolution) {
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
                    offset: [121, 46],//位置
                    url: iconsUrl,//图片资源
                    anchor: [.5, .5],//图标位置对应的地图点
                    size: [26, 25],//截取大小
                    opacity: 1,//透明度
                },
                selected: {
                    offset: [28, 0],//位置
                    url: iconsUrl,//图片资源
                    anchor: [.5, .5],//图标位置对应的地图点
                    size: [29, 30],//截取大小
                    opacity: 1,//透明度
                },
                highlight: {
                    offset: [86, 0],//位置
                    url: iconsUrl,//图片资源
                    anchor: [.5, .5],//图标位置对应的地图点
                    size: [30, 30],//截取大小
                    opacity: 1,//透明度
                },
            },
            //非实时数据
            unRealTime: {
                normal: {
                    offset: [147, 46],//位置
                    url: iconsUrl,//图片资源
                    anchor: [.5, .5],//图标位置对应的地图点
                    size: [26, 25],//截取大小
                    opacity: 1,//透明度
                },
                selected: {
                    offset: [57, 0],//位置
                    url: iconsUrl,//图片资源
                    anchor: [.5, .5],//图标位置对应的地图点
                    size: [29, 30],//截取大小
                    opacity: 1,//透明度
                },
                highlight: {
                    offset: [116, 0],//位置
                    url: iconsUrl,//图片资源
                    anchor: [.5, .5],//图标位置对应的地图点
                    size: [30, 30],//截取大小
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

    return RdLayer;
});