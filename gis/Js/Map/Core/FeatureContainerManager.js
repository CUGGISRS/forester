/**
 * Created by chenlong on 2017/9/15.
 */
define([
    'core/BusinessItem',
], function (BusinessItem) {

    /**
     * 要素容器管理器（移除时包括移除地图图形）
     * @constructor
     */
    var FeatureContainerManager = function () {
        this._featureContainer = {};
    };

    /**
     * 添加业务中的要素项（添加到容器及地图）
     * @param itemId
     * @param feature
     * @param dataSource
     * @param moudle
     * @param addToDataSource 添加到数据源，默认不添加
     * @param isPermanentTypeItem 是否为常驻类型对象，默认为否
     */
    FeatureContainerManager.prototype.addFeatureItem = function (itemId, item, feature, dataSource,
                                                                 moudle, addToDataSource,isPermanentTypeItem) {
        //模块容器初始化
        if (!this._featureContainer[moudle]) {
            this._featureContainer[moudle] = [];
        }
        var existObj = this.exist(itemId, moudle);
        var bItem;
        if (!existObj) {
            bItem = new BusinessItem(itemId, item, moudle,isPermanentTypeItem);
            //没有给业务对象，则初始化
            this._featureContainer[moudle].push(bItem);
        }
        else {
            bItem = existObj.bItem;
        }
        //添加
        bItem.addFeature(feature, dataSource, addToDataSource);
    };

    /**
     * 对象是否存在，存在则找到该对象
     * @param itemId
     * @param moudle
     * @return 找到的要素项
     */
    FeatureContainerManager.prototype.exist = function (itemId, moudle) {
        if (!this._featureContainer[moudle]) {
            return;
        }
        for (var i = 0; i < this._featureContainer[moudle].length; i++) {
            var bItem = this._featureContainer[moudle][i];
            if (bItem.itemId == itemId) {
                return {
                    bItem: bItem,
                    index: i
                };
            }
        }
        return;
    }

    /**
     * 移除（容器及地图上的）某业务对象
     * @param itemId
     * @param moudle
     */
    FeatureContainerManager.prototype.removeMapBusinessItem = function (itemId, moudle) {
        var existObj = this.exist(itemId, moudle);
        if (existObj) {
            //从地图移除
            existObj.bItem.dispose();
            //从容器中移除
            this._featureContainer[moudle].splice(existObj.index, 1);
        }
    }

    /**
     * 移除所有业务对象
     */
    FeatureContainerManager.prototype.clear = function () {
        //地图对象移除
        for (moudleName in this._featureContainer) {
            for (var i = 0; i < this._featureContainer[moudleName].length; i++) {
                var bItem = this._featureContainer[moudleName][i];
                bItem.dispose();
            }
        }
        //对象容器重置
        this._featureContainer = {};
    }

    return FeatureContainerManager;
});