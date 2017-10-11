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
        this.set("altitudeMode", "clampToGround");
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
        var borderWidthOption = {
            normal: 3,
            selected: 4,
            highlight: 5,
        };
        var width = borderWidthOption[iconState];

        var style = new ol.style.Style({
            stroke: new ol.style.Stroke({
            	color: "rgba(123,243,255,.8)",
                width: width
            })
        });

        feature[iconState] = style;
        return style;
    };

    /**
     * 获取三维线对象宽度（米）
     * @param feature
     */
    XhqLayer.prototype.getCorridorGeometryWidth = function (feature) {
        //最佳显示
        var extent = feature.getGeometry().getExtent();
        //转换成3857
	    extent = ol.proj.transformExtent(extent, "EPSG:4326", "EPSG:3857");
        var resolution = (extent[2]-extent[0]) / baseUtil.defaultGraphicShowWith;
        return resolution * 8;
    };



    return XhqLayer;
});