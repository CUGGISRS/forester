/**
 * 业务对象结构
 * Created by chenlong on 2017/9/22.
 */
define([
    'core/defineProperties',
    'core/LayerBaseDataSource',
], function (defineProperties, LayerBaseDataSource) {

    /**
     * 业务对象（包括类型、ID、对象值、地图要素及对应数据源集合
     * @param itemId
     * @param valueItem
     * @param itemType
     * @param isPermanentTypeItem 是否为常驻类型对象，默认为否
     * @constructor
     */
    var BusinessItem = function (itemId, valueItem, itemType, isPermanentTypeItem) {
        this._itemId = itemId;
        this._value = valueItem;
        this._itemType = itemType;
        this._isPermanentTypeItem = isPermanentTypeItem ? true : false;
        this._mapFeatures = [];
    };
    //定义属性
    defineProperties(BusinessItem.prototype, {
        /**
         * 业务对象id
         */
        itemId: {
            get: function () {
                return this._itemId;
            }
        },

        /**
         * 业务对象值
         */
        value: {
            get: function () {
                return this._value;
            }
        },

        /**
         * 业务对象类型
         */
        itemType: {
            get: function () {
                return this._itemType;
            }
        },

        /**
         * 业务对象地图要素集合
         */
        mapFeatures: {
            get: function () {
                return this._mapFeatures;
            }
        },

        /**
         * 是否为常驻类型对象
         */
        isPermanentTypeItem: {
            get: function () {
                return this._isPermanentTypeItem;
            }
        },
    });

    /**
     * 添加地图要素到业务对象
     * @param feature 地图要素
     * @param dataSource 地图数据源
     * @param addToDataSource 添加到数据源，默认不添加
     */
    BusinessItem.prototype.addFeature = function (feature, dataSource, addToDataSource) {
        if (addToDataSource) {
            dataSource.addFeature(feature);
        }

        this._mapFeatures.push({
            id: feature.getId(),
            feature: feature,
            dataSource: dataSource
        });
    };

    /**
     * 清除业务对象
     */
    BusinessItem.prototype.dispose = function () {
        //从地图移除
        if (!this.isPermanentTypeItem) {
            //非常驻类型对象从地图删除
            for (var i = 0; i < this._mapFeatures.length; i++) {
                var mapFeature = this._mapFeatures[i];
                var dataSource = mapFeature.dataSource;
                if (dataSource instanceof LayerBaseDataSource) {
                    dataSource.removeDataItem(mapFeature.feature.valueItem);
                } else {
                    dataSource.removeFeature(mapFeature.feature);
                }
            }
        }else{
            //常驻类型对象，鼠标状态设为正常
            for (var i = 0; i < this._mapFeatures.length; i++) {
                var mapFeature = this._mapFeatures[i];
                mapFeature.feature.set("iconState", "normal");
            }
        }
        this._mapFeatures = [];
    }

    return BusinessItem;
});