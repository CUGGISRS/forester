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
        this.set("altitudeMode", "clampToGround");
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

        var invalidColor = "rgba(255,65,65,.8)";
        var validColor = "rgba(79,237,209,.8)";
        var fillColor = validTag == "1" ? validColor : invalidColor;

        var widthOption = {
            normal: 4,
            selected: 8,
            highlight: 8,
        };
        var width = widthOption[iconState];

        var style = [
/*
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: borderColor,
                    width: width + 2
                })
            }),
*/
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: fillColor,
                    width: width
                })
            })];

        feature[iconState + validTag] = style;
        return style;
    };

    /**
     * 获取三维线对象宽度（米）
     * @param feature
     */
    GjLayer.prototype.getCorridorGeometryWidth = function (feature) {
        var lineItem=feature.valueItem;
        //最佳显示
        var extent = lineItem.singleLine.getExtent();
        //转换成3857
        extent = ol.proj.transformExtent(extent, "EPSG:4326", "EPSG:3857")
        var resolution = (extent[2] - extent[0]) / baseUtil.defaultGraphicShowWith;
        return resolution * 8;
    };

    return GjLayer;
});