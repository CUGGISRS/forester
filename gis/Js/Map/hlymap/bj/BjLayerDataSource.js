/**
 * Created by chenlong on 2017/9/12.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
    'core/LayerBaseDataSource',
], function (defineProperties, baseUtil, LayerBaseDataSource) {

    var BjLayerDataSource = function () {
        LayerBaseDataSource.call(this, {});
    };
    //继承自LayerBaseDataSource
    ol.inherits(BjLayerDataSource, LayerBaseDataSource);

    /*
     * 定义属性
     * */
    defineProperties(BjLayerDataSource.prototype, {});

    /**
     * 获取某项的图形（待实现）
     * @param item
     * @private
     */
    BjLayerDataSource.prototype._getItemGeometry = function (item) {
        return new ol.geom.Point([item.LONGITUDE, item.LATITUDE]);
    }

    /**
     * 判断该项是否存在（待实现）
     * @param item
     * @private
     */
    BjLayerDataSource.prototype._getItemId = function (item) {
        return item.ID;
    }

    return BjLayerDataSource;

});