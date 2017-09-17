/**
 * Created by chenlong on 2017/9/14.
 */
define(function () {

    /**
     * 轨迹模拟对象
     * @param option
     * @constructor
     */
    var TrackSimulate = function (option) {
        this._contMap = option.contMap;
        this._tmpLayer = option.tmpLayer;
        this._trackLine = option.trackLine;
        this._markerStyle = option.markerStyle;
    };

    /**
     * 初始化，创建模拟图标、跳转到该线等
     */
    TrackSimulate.prototype.init = function () {
        var startPoint = this._trackLine.getFirstCoordinate();
        //创建模拟图标要素
        this._markeFeature = new ol.Feature({
            geometry: new ol.geom.Point(startPoint),
        });
        this._markeFeature.setStyle(this._markerStyle);
        var tmpSource = this._tmpLayer.getSource();
        tmpSource.addFeatures([this._markeFeature]);
        //跳转到该线
        var padding = .16 * this._contMap.scene.map2d.getSize()[0];
        this._contMap.viewControl.jumpTo(this._trackLine.getExtent(), [padding, padding, padding, padding]);
    };

    /**
     * 销毁，删除模拟图标等
     */
    TrackSimulate.prototype.dispose = function () {
        var tmpSource = this._tmpLayer.getSource();
        tmpSource.removeFeature(this._markeFeature);
    };


    /**
     * 移动到某一比例点
     * @param fraction 0表示起始点值，1表示终止点值
     */
    TrackSimulate.prototype.moveTo = function (fraction) {
        var location = this._trackLine.getCoordinateAt(fraction);
        this._markeFeature.setGeometry(new ol.geom.Point(location));
    };

    return TrackSimulate;
});