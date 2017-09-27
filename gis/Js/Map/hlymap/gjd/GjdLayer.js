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
        BaseLayer.call(this, baseUtil.assign({
            style: this._styleFunction
        }, option));
        this.LayerType = "关键点图层";
        this.set("altitudeMode", "clampToGround");
    };

    ol.inherits(GjdLayer, BaseLayer);

    /**
     * 关键点风格设置
     * @param feature
     * @param resolution
     * @return {*}
     * @private
     */
    GjdLayer.prototype._styleFunction = function (feature, resolution) {
        var iconState = feature.get("iconState") ? feature.get("iconState") : "normal";

        if (feature[iconState]) {
            return feature[iconState];
        }

        var featureIndex = feature.get("index") ? feature.get("index") : 0;
        var iconsUrl = baseUtil.getMapIconsUrl();

        var iconStyleOption = {
            normal: {
                offset: [201, 46],//位置
                url: iconsUrl,//图片资源
                anchor: [0.1, 1],//图标位置对应的地图点
                size: [28, 28],//截取大小
                opacity: 1,//透明度
                textOffset: [20, 16]
            },
            selected: {
                offset: [60, 140],//位置
                url: iconsUrl,//图片资源
                anchor: [.4, .86],//图标位置对应的地图点
                size: [37, 34],//截取大小
                opacity: 1,//透明度
                textOffset: [24, 20]
            },
            highlight: {
                offset: [60, 140],//位置
                url: iconsUrl,//图片资源
                anchor: [.4, .86],//图标位置对应的地图点
                size: [37, 34],//截取大小
                opacity: 1,//透明度
                textOffset: [24, 20]
            },
        };
        var iconUrl = baseUtil.getImageFromText(baseUtil.getMapImage(), iconStyleOption[iconState].offset[0],
            iconStyleOption[iconState].offset[1], iconStyleOption[iconState].size[0], iconStyleOption[iconState].size[1],
            featureIndex.toString(), "13px Calibri,sans-serif",
            iconStyleOption[iconState].textOffset[0], iconStyleOption[iconState].textOffset[1]);

        var style = new ol.style.Style({
            //图标
            image: new ol.style.Icon({
                src: iconUrl,
                scale: 1,
                opacity: iconStyleOption[iconState].opacity
            })
        });

        feature[iconState] = style;

        return style;
    };

    return GjdLayer;
});