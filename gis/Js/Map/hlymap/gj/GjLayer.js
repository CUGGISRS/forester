/**
 * Created by chenlong on 2017/9/12.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
    'core/BaseLayer',
    'core/loadImage!hlymap/css/images/arrow.png',
], function (defineProperties, baseUtil, BaseLayer, arrowImage) {

    /**
     * 轨迹图层
     * @constructor
     */
    var GjLayer = function (option) {
        var that=this;
        BaseLayer.call(this, baseUtil.assign({
            style: function (feature, resolution) {
                return that._styleFunction(feature, resolution);
            }
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

        //if (feature[iconState + validTag]) {
        //    return feature[iconState + validTag];
        //}

        var invalidColor = "rgba(170,0,0,.8)";
        var validColor = "rgba(0,179,253,.8)";
        var fillColor = validTag == "1" ? validColor : invalidColor;

        var widthOption = {
            normal: 6,
            selected: 10,
            highlight: 10,
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

        //添加路径行进方向
        if (!this.hideNavDirection) {
            //需要显示路径方向
            //根据轨迹线，按照固定像素距离，插值计算路径方向图标位置；根据点位计算该位置的行进方向；

            //当前分辨率下方向图标点位获取
            var navLocations;
            if (!feature[resolution]) {
                navLocations = this._getPathNavIconLocatins(feature.getGeometry(), resolution);
                feature[resolution] = navLocations;
            } else {
                navLocations = feature[resolution];
            }
            //筛选并绘制当前feature的方向点位
            for (var i = 0; i < navLocations.length; i++) {
                var navLocation = navLocations[i];
                style.push(new ol.style.Style({
                    geometry: new ol.geom.Point(navLocation.location),
                    image: new ol.style.Icon({
                        anchor: [.5, .5],
                        src: arrowImage.src,
                        scale: 1,
                        offset: [64, 0],
                        size: [16, 16],
                        opacity: 1,
                        rotation: navLocation.rotation
                    })
                }));
            }
        }

        feature[iconState + validTag] = style[0];
        return style;
    };

    /**
     * 获取三维线对象宽度（米）
     * @param feature
     */
    GjLayer.prototype.getCorridorGeometryWidth = function (feature) {
        var lineItem = feature.valueItem;
        //最佳显示
        var extent = lineItem.singleLine.getExtent();
        //转换成3857
        var extent3857 = ol.proj.transformExtent(extent, "EPSG:4326", "EPSG:3857");
        var resolution3857 = (extent3857[2] - extent3857[0]) / baseUtil.defaultGraphicShowWith;
        //var resolution4326 = (extent[2] - extent[0]) / baseUtil.defaultGraphicShowWith;
        ////与最小最佳分辨率（16级）对比，如果更小则只能显示到该处，并等比控制3857的分辨率
        //if (resolution4326 < 2.1457672519402802e-5) {
        //	resolution3857 = resolution3857 * (2.1457672519402802e-5 / resolution4326);
        //}

        return resolution3857 * 10;
    };

    /**
     * 获取当前分辨率下路径所有的方向点位
     */
    GjLayer.prototype._getPathNavIconLocatins = function (pathGeometry, resolution) {
        var navLocations=[];
        //计算当前分辨率下的图标间距(度）
        var gap = resolution * 50;
        //取到整条线图形
        var pathLength = pathGeometry.getLength();

        var currentLength = gap;
        while (currentLength < pathLength) {
            //计算当前距离点位置
            var currentLocation = pathGeometry.getCoordinateAt(currentLength / pathLength);
            //前进或后退点距离计算方位
            var tmpLength = currentLength + resolution * 5;
            if (tmpLength > pathLength) {
                tmpLength = currentLength - resolution * 5;
            }
            var tmpLocation = pathGeometry.getCoordinateAt(tmpLength / pathLength);
            var point1 = turf.point(currentLocation);
            var point2 = turf.point(tmpLocation);
            var rotation = turf.degrees2radians(turf.bearingToAngle(turf.bearing(point1, point2)));
            navLocations.push({
                location: currentLocation,
                rotation: rotation + 1.5707963
            });

            currentLength = currentLength + gap;
        }
        return navLocations;
    };

    return GjLayer;
});