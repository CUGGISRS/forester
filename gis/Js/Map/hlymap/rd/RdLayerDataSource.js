/**
 * Created by chenlong on 2017/9/12.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
    'core/LayerBaseDataSource',
], function (defineProperties, baseUtil, LayerBaseDataSource) {

    var RdLayerDataSource = function () {
        LayerBaseDataSource.call(this, {});
    };
    //继承自LayerBaseDataSource
    ol.inherits(RdLayerDataSource, LayerBaseDataSource);

    /*
     * 定义属性
     * */
    defineProperties(RdLayerDataSource.prototype, {});

    /**
     * 获取某项的图形（待实现）
     * @param item
     * @private
     */
    RdLayerDataSource.prototype._getItemGeometry = function (item) {
        return new ol.geom.Point([item.LONGITUDE, item.LATITUDE]);
    }

    /**
     * 判断该项是否存在（待实现）
     * @param item
     * @private
     */
    RdLayerDataSource.prototype._getItemId = function (item) {
        return item.HOTSPOT_ID;
    }

    return RdLayerDataSource;

});