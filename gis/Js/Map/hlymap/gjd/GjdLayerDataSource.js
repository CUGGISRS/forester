/**
 * Created by chenlong on 2017/9/12.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
    'core/LayerBaseDataSource',
], function (defineProperties, baseUtil, LayerBaseDataSource) {

    var GjdLayerDataSource = function () {
        LayerBaseDataSource.call(this, {});
    };
    //继承自LayerBaseDataSource
    ol.inherits(GjdLayerDataSource, LayerBaseDataSource);

    /*
     * 定义属性
     * */
    defineProperties(GjdLayerDataSource.prototype, {});

    /**
     * 获取某项的图形（实现）
     * @param item
     * @private
     */
    GjdLayerDataSource.prototype._getItemGeometry = function (item) {
        return new ol.geom.Point([item.LONGITUDE, item.LATITUDE]);
    }

    /**
     * 判断该项是否存在（实现）
     * @param item
     * @private
     */
    GjdLayerDataSource.prototype._getItemId = function (item) {
        return item.ID;
    }

    return GjdLayerDataSource;

});