/**
 * Created by chenlong on 2017/9/12.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
    'core/LayerBaseDataSource',
], function (defineProperties, baseUtil, LayerBaseDataSource) {

    var FkLayerDataSource = function () {
        LayerBaseDataSource.call(this, {});
    };
    //继承自LayerBaseDataSource
    ol.inherits(FkLayerDataSource, LayerBaseDataSource);

    /*
     * 定义属性
     * */
    defineProperties(FkLayerDataSource.prototype, {});

    /**
     * 获取某项的图形（待实现）
     * @param item
     * @private
     */
    FkLayerDataSource.prototype._getItemGeometry = function (item) {
        return new ol.geom.Point([item.Longitude, item.Latitude]);
    }

    /**
     * 判断该项是否存在（待实现）
     * @param item
     * @private
     */
    FkLayerDataSource.prototype._getItemId = function (item) {
        return item.EventID;
    }

    return FkLayerDataSource;

});