/**
 * Created by chenlong on 2017/9/12.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
    'core/BaseLayer',
], function (defineProperties, baseUtil, BaseLayer) {

    /**
     * 巡护区图层
     * @constructor
     */
    var XhqLayer = function (option) {
        BaseLayer.call(this, baseUtil.assign({
            style: this._styleFunction
        }, option));
        this.LayerType = "巡护区图层";
    };

    ol.inherits(XhqLayer, BaseLayer);

    /**
     * 风格设置
     * @param feature
     * @param resolution
     * @private
     */
    XhqLayer.prototype._styleFunction = function (feature, resolution) {
        var iconState = feature.get("iconState") ? feature.get("iconState") : "normal";

        if (feature[iconState]) {
            return feature[iconState];
        }
        var borderColorOption = {
            normal: "white",
            selected: "yellow",
            highlight: "#4fedd1",
        };
        var borderColor = borderColorOption[iconState];

        var width = 4;
        var style = [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: borderColor,
                    width: width
                })
            })];

        feature[iconState] = style;
        return style;
    };

    return XhqLayer;
});