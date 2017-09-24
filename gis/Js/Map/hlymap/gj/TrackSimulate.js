/**
 * Created by chenlong on 2017/9/14.
 */
define([
    'core/baseUtil',
], function (baseUtil) {

    /**
     * 轨迹模拟对象
     * @param option
     * @constructor
     */
    var TrackSimulate = function (option) {
        this._contMap = option.contMap;
        this._trackLine = option.trackLine;
        this._simulateMarkerStyle = option.simulateMarkerStyle;
        this._startMarkerStyle = option.startMarkerStyle;
        //被模拟的线要素集合
        this._lineFeatures = option.lineFeatures;

        //线段容器：包含该要素终结点百分值、对应要素、对应turfline
        this._lineContainer = [];
    };

    /**
     * 初始化，创建模拟图标（起点图标、插值点图标）、创建线段容器（百分进度值、对应要素、对应turfline）、跳转到该线等
     */
    TrackSimulate.prototype.init = function () {
        //创建模拟临时图层
        this._tmpLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
        });
        this._tmpLayer.set("altitudeMode", "clampToGround");
        //三维支持
        var that = this;
        this._tmpLayer.getCorridorGeometryWidth = function (feature) {
            //最佳显示
            var extent = that._trackLine.getExtent();
            //转换成3857
            extent = ol.proj.transformExtent(extent, "EPSG:4326", "EPSG:3857")
            var resolution = (extent[2] - extent[0]) / baseUtil.defaultGraphicShowWith;
            return resolution * 6;
        };
        this._contMap.layerManager.addLayer(this._tmpLayer, true);

        var startPoint = this._trackLine.getFirstCoordinate();
        //创建模拟图标要素（起点图标、插值点图标）
        //1、插值模拟点创建
        this._simulateMarkerFeature = new ol.Feature({
            geometry: new ol.geom.Point(startPoint),
        });
        this._simulateMarkerFeature.setStyle(this._simulateMarkerStyle);
        //2、起点创建
        this._startMarkerFeature = new ol.Feature({
            geometry: new ol.geom.Point(startPoint),
        });
        this._startMarkerFeature.setStyle(this._startMarkerStyle);
        var tmpSource = this._tmpLayer.getSource();
        tmpSource.addFeatures([this._simulateMarkerFeature, this._startMarkerFeature]);

        //创建线段容器（百分进度值、对应要素、对应turfline）
        var trackLineLength = this._trackLine.getLength();
        var totalLength = 0;
        for (var i = 0; i < this._lineFeatures.length; i++) {
            var lineFeature = this._lineFeatures[i];
            var lineGeometry = lineFeature.getGeometry();
            var lineLength = lineGeometry.getLength();

            var lineItem = {
                //该段第一个节点的百分进度值
                startPointFraction: totalLength / trackLineLength,
                //最后一个节点的百分进度值
                endPointFraction: (totalLength + lineLength) / trackLineLength,
                olFeature: lineFeature,
                //预生成turf格式的线辅助对象
                turfLine: turf.lineString(lineGeometry.getCoordinates()),
                //被模拟出来的要素
                simulateFeature: null
            };
            totalLength += lineLength;

            this._lineContainer.push(lineItem);
        }

        //跳转到该线
        var padding = .16 * this._contMap.scene.map2d.getSize()[0];
        this._contMap.viewControl.jumpTo(this._trackLine.getExtent(), [padding, padding, padding, padding]);
    };

    /**
     * 销毁，删除模拟图标等
     */
    TrackSimulate.prototype.dispose = function () {
        var tmpSource = this._tmpLayer.getSource();
        //删除起始点及模拟点
        tmpSource.removeFeature(this._startMarkerFeature);
        tmpSource.removeFeature(this._simulateMarkerFeature);
        //删除模拟线要素并清空对象
        this._clearSimulateLineFeatures();
        //移除模拟临时图层
        this._contMap.layerManager.removeLayer(this._tmpLayer);

        this._lineContainer = [];
    };

    /**
     * 清除模拟线要素
     * @private
     */
    TrackSimulate.prototype._clearSimulateLineFeatures = function () {
        var tmpSource = this._tmpLayer.getSource();
        for (var i = 0; i < this._lineContainer.length; i++) {
            var lineItem = this._lineContainer[i];
            if (lineItem.simulateFeature) {
                tmpSource.removeFeature(lineItem.simulateFeature);
                lineItem.simulateFeature = null;
            }
        }
    }

    /**
     * 移动到某一比例点
     * @param fraction 0表示起始点值，1表示终止点值
     */
    TrackSimulate.prototype.moveTo = function (fraction) {
        var tmpSource = this._tmpLayer.getSource();
        //清除线段模拟
        this._clearSimulateLineFeatures();
        //根据线段容器的百分进度值找到需被切分的feature，以前的都被加载
        var location = this._trackLine.getCoordinateAt(fraction);
        for (var i = 0; i < this._lineContainer.length; i++) {
            var lineItem = this._lineContainer[i];
            if (lineItem.startPointFraction < fraction && fraction < lineItem.endPointFraction) {
                //处于被切分的线段中，进行切分并将第一个添加并显示
                var splitter = turf.point(location);
                var split = turf.lineSplit(lineItem.turfLine, splitter);
                var subLine = split.features[0].geometry.coordinates;

                var subLineFeature = this._createFeatrue(new ol.geom.LineString(subLine), lineItem.olFeature);
                tmpSource.addFeatures([subLineFeature]);

                //获取最近点，并根据点信息获取对应时间，同时进行时间显示
                var dateList = lineItem.olFeature.geometryItem.dateList;
                var turfPoints=[];
                for (var j = 0; j < lineItem.turfLine.geometry.coordinates.length; j++) {
                    var point = lineItem.turfLine.geometry.coordinates[j];
                    turfPoints.push(turf.point(point));
                }
                var points=turf.featureCollection(turfPoints);
                var closestPoint = turf.nearest(splitter, points).geometry.coordinates;
                var key = closestPoint[0] + closestPoint[1];
                if (dateList[key]) {
                    var dateTime = dateList[key];
                    var date = new Date(parseInt(dateTime.replace("/Date(", "").replace(")/", ""), 10));
                    var lableText = date.Format("hh:mm:ss.S");
                    var style = this._simulateMarkerFeature.getStyle();
                    style.getText().setText(lableText);
                    this._simulateMarkerFeature.setStyle(style);
                }
                //跳出
                break;
            } else if (lineItem.startPointFraction === fraction) {
                //位于起始点，不使用跳出
                break;
            } else {
                //被使用的线段，添加并进行显示
                var newFeature = this._createFeatrue(lineItem.olFeature.getGeometry(), lineItem.olFeature);
                tmpSource.addFeatures([newFeature]);
            }
        }

        //模拟点移动
        this._simulateMarkerFeature.setGeometry(new ol.geom.Point(location));
    };

    /**
     * 根据样例要素创建图形feature
     * @param geometry
     * @param sampleFeature
     * @private
     */
    TrackSimulate.prototype._createFeatrue = function (geometry, sampleFeature) {
        var feature = new ol.Feature({
            geometry: geometry,
        });
        //风格使用以前的
        var validTag = sampleFeature.get("valid");
        var iconState = sampleFeature.get("iconState") ? sampleFeature.get("iconState") : "normal";
        feature.setStyle(sampleFeature[iconState + validTag]);
        return feature;
    }

    return TrackSimulate;
});