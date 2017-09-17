/**
 * Created by chenlong on 2017/9/12.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
    'core/LayerBaseDataSource',
], function (defineProperties, baseUtil, LayerBaseDataSource) {

    var XhqLayerDataSource = function () {
        LayerBaseDataSource.call(this, {});
    };
    //继承自LayerBaseDataSource
    ol.inherits(XhqLayerDataSource, LayerBaseDataSource);

    /*
     * 定义属性
     * */
    defineProperties(XhqLayerDataSource.prototype, {});

    /**
     * 获取某项的图形（实现）
     * @param item
     * @private
     */
    XhqLayerDataSource.prototype._getItemGeometry = function (item) {
        var format=new ol.format.EsriJSON();
        return format.readGeometry('{"rings":'+item.GEOMETRY+'}');
    }

    /**
     * 判断该项是否存在（实现）
     * @param item
     * @private
     */
    XhqLayerDataSource.prototype._getItemId = function (item) {
        return item.ID;
    }

    return XhqLayerDataSource;

});