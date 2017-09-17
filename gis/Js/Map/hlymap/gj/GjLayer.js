/**
 * Created by chenlong on 2017/9/12.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
    'core/BaseLayer',
], function (defineProperties, baseUtil, BaseLayer) {

    /**
     * 轨迹图层
     * @constructor
     */
    var GjLayer = function (option) {
        BaseLayer.call(this, baseUtil.assign({
            style: this._styleFunction
        }, option));
        this.LayerType = "轨迹图层";
    };

    ol.inherits(GjLayer, BaseLayer);

    /**
     * 风格设置
     * @param feature
     * @param resolution
     * @private
     */
    GjLayer.prototype._styleFunction = function (feature, resolution) {
        var validTag = feature.get("valid");
        var iconState = feature.get("iconState") ? feature.get("iconState") : "normal";

        if (feature[iconState + validTag]) {
            return feature[iconState + validTag];
        }

        var validColor = "#ff4141";
        var invalidColor = "#4fedd1";
        var fillColor = validTag == "1" ? validColor : invalidColor;

        var borderColorOption = {
            normal: "transparent",
            selected: "yellow",
            highlight: "white",
        };
        var borderColor = borderColorOption[iconState];

        var width = 4;
        var style = [
           /* new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: borderColor,
                    width: width + 2
                })
            }),*/
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: fillColor,
                    width: width
                })
            })];

        feature[iconState + validTag] = style;
        return style;
    };

    return GjLayer;
});