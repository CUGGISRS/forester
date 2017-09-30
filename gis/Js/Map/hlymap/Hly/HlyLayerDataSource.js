/**
 * Created by chenlong on 2017/9/9.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
    'core/LayerBaseDataSource',
], function (defineProperties, baseUtil, LayerBaseDataSource) {

    var HlyLayerDataSource = function () {
        LayerBaseDataSource.call(this, {});
    };
    //继承自LayerBaseDataSource
    ol.inherits(HlyLayerDataSource, LayerBaseDataSource);

    /*
     * 定义属性
     * */
    defineProperties(HlyLayerDataSource.prototype, {});

    /**
     * 获取某项的图形（实现）
     * @param item
     * @private
     */
    HlyLayerDataSource.prototype._getItemGeometry = function (item) {
        return new ol.geom.Point([item.Longitude, item.Latitude]);
    }

    /**
     * 判断该项是否存在（实现）
     * @param item
     * @private
     */
    HlyLayerDataSource.prototype._getItemId = function (item) {
        return item.UserId;
    }

    /**
     * 当更新要素（重载）
     * @param item
     * @private
     */
    HlyLayerDataSource.prototype._onUpdateFeature = function (feature, item) {
        feature.set("onlineState", "online");
    }

    /**
     * 当添加要素（重载）
     * @param item
     * @private
     */
    HlyLayerDataSource.prototype._onAddFeature = function (feature, item) {
        var onlineState;
        if (item["onlineState"]) {
            onlineState = item["onlineState"];
        } else {
        	onlineState = "offline";
        	if (typeof item["onlineState"] === 'undefined') {
        		onlineState = "online";
	        }
        }
        feature.set("onlineState", onlineState);
    }

    return HlyLayerDataSource;
});