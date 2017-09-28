/**
 * Created by chenlong on 2017/9/12.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
], function (defineProperties, baseUtil) {

    /**
     * 基础图层数据源类
     * @constructor
     */
    var LayerBaseDataSource = function () {
        this._data = [];
        ol.source.Vector.call(this, {});
    };

    //继承自ol.source.Vector
    ol.inherits(LayerBaseDataSource, ol.source.Vector);

    /*
     * 定义属性
     * */
    defineProperties(LayerBaseDataSource.prototype, {});

    /**
     * 刷新地图数据
     * @param data
     */
    LayerBaseDataSource.prototype.refresh = function (data) {
        var checkTag = (new Date()).getTime();
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            //检查
            var existItem = this._itemExist(item);
            existItem = existItem ? existItem.oldItem : null;
            if (existItem) {
                //对象存在，则更新feature
                baseUtil.assign(existItem, item);
                var feature = existItem.feature;
                var geometry = this._getItemGeometry(item);
                feature.setGeometry(geometry);
                feature.setProperties(item, true);
                this._onUpdateFeature(feature, item);

                existItem.checkTag = checkTag;
            } else {
                //对象不存在，则添加feature
                this.addDataItem(item, checkTag);
            }
        }
        //删除
        for (var i = 0; i < this._data.length; i++) {
            var item = this._data[i];
            if (item.checkTag !== checkTag) {
                //未被检查到的，则normal情况下删除
                var feature = item.feature;
                var iconState = feature.get("iconState") ? feature.get("iconState") : "normal";
                if (iconState === 'normal') {
                    //当前为normal情况的，执行移除
                    this.removeDataItem(item);
                }
            }
        }

        this.onRefresh();
    };

    /**
     * 当刷新地图数据时触发（可覆盖）
     */
    LayerBaseDataSource.prototype.onRefresh = function () {

    }

    /**
     * 添加单个数据项
     * @param item
     * @private
     */
    LayerBaseDataSource.prototype.addDataItem = function (item, checkTag) {
        var geometry = this._getItemGeometry(item);
        var feature = new ol.Feature({
            geometry: geometry,
        });
        feature.setProperties(item, true);
        feature.setId(this._getItemId(item));
        feature.set("iconState", "normal");
        //所属值对象
        feature.valueItem = item;

        this._onAddFeature(feature, item);

        item.feature = feature;
        item.checkTag = checkTag;
        this._data.push(item);
        //三维贴地
        feature.setProperties({"altitudeMode": "clampToGround"}, true);
        this.addFeature(feature);

        return feature;
    }

    /**
     * 移除对象
     * @param itemId
     */
    LayerBaseDataSource.prototype.removeDataItem = function (item) {
        var existItem = this._itemExist(item);
        if (existItem) {
            //从地图移除
            this.removeFeature(existItem.oldItem.feature);
            //从_data移除
            this._data.splice(existItem.index, 1);
        }
    }
    /**
     * 高亮显示
     * @param featureId
     */
    LayerBaseDataSource.prototype.setHighLight = function (featureId) {
        var feature = this.getFeatureById(featureId);
        if (feature) {
            if (this.highLightFeature) {
                //以前有高亮，则取消高亮
                this.cancelHighLight();
            }

            //正常的才能执行高亮
            if (feature.get("iconState") === "normal") {
                //设为高亮
                feature.set("iconState", "highlight");

                this.highLightFeature = feature;
            }
        }
    };

    /**
     * 取消高亮显示
     * @param featureId
     */
    LayerBaseDataSource.prototype.cancelHighLight = function () {
        var feature = this.highLightFeature;
        if (feature) {
            //高亮时才取消高亮
            if (feature.get("iconState") === "highlight") {
                feature.set("iconState", "normal");
                this.highLightFeature = null;
            }
        }
    };

    /**
     * 选中状态
     * @param featureId
     */
    LayerBaseDataSource.prototype.setSelected = function (featureId) {
        var feature = this.getFeatureById(featureId);
        if (feature) {
            if (this.selectedFeature) {
                //有选中则清除选中
                this.cancelSelected();
            }
            //已经为选中，则不处理
            if (feature.get("iconState") === "selected") {
                return;
            }
            feature.set("iconState", "selected");
            this.selectedFeature = feature;
        }
    };

    /**
     * 取消选中状态
     */
    LayerBaseDataSource.prototype.cancelSelected = function () {
        var feature = this.selectedFeature;
        if (feature) {
            feature.set("iconState", "normal");
            this.selectedFeature = null;
        }
    };

    /**
     * 当更新要素（可重载）
     * @param item
     * @private
     */
    LayerBaseDataSource.prototype._onUpdateFeature = function (feature, item) {

    }

    /**
     * 当添加要素（可重载）
     * @param item
     * @private
     */
    LayerBaseDataSource.prototype._onAddFeature = function (feature, item) {

    }

    /**
     * 检查是否存在
     * @param item
     * @private
     */
    LayerBaseDataSource.prototype._itemExist = function (item) {
        var itemId = this._getItemId(item);
        for (var i = 0; i < this._data.length; i++) {
            var oldItem = this._data[i];
            if (this._getItemId(oldItem) === itemId) {
                return {
                    oldItem: oldItem,
                    index: i
                };
            }
        }
        return;
    };

    /**
     * 获取某项的图形（待实现）
     * @param item
     * @private
     */
    LayerBaseDataSource.prototype._getItemGeometry = function (item) {

    }

    /**
     * 判断该项是否存在（待实现）
     * @param item
     * @private
     */
    LayerBaseDataSource.prototype._getItemId = function (item) {

    }

    return LayerBaseDataSource;
});