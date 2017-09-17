/**
 * Created by chenlong on 2017/9/15.
 */
define(function () {

    /**
     * 要素容器管理器
     * @constructor
     */
    var FeatureContainerManager = function () {
        this._featureContainer = {};

        //结构
        /*this._featureContainer[moudle].push({
            bid: itemId,
            features: [
                {
                    feature: feature,
                    layer: layer
                }
            ]
        });*/
    };

    /**
     * 添加业务中的要素项（添加到容器及地图）
     * @param itemId
     * @param feature
     * @param dataSource
     * @param moudle
     * @param addToDataSource 添加到数据源，默认不添加
     */
    FeatureContainerManager.prototype.addFeatureItem = function (itemId,item, feature, dataSource,
                                                                 moudle,addToDataSource) {
        //模块容器初始化
        if (!this._featureContainer[moudle]) {
            this._featureContainer[moudle] = [];
        }
        var existObj = this.exist(itemId, moudle);
        var bItem;
        if (!existObj) {
            bItem = {
                bid: itemId,
                item:item,
                features: []
            };
            //没有给业务对象，则初始化
            this._featureContainer[moudle].push(bItem);
        }
        else {
            bItem=existObj.bItem;
        }
        //添加
        if(addToDataSource){
            dataSource.addFeature(feature);
        }
        bItem.features.push({
            feature: feature,
            dataSource: dataSource
        });
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
            if (bItem.bid == itemId) {
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
    FeatureContainerManager.prototype.removeMapBusinessItem=function (itemId, moudle) {
        var existObj = this.exist(itemId, moudle);
        if (existObj) {
            //从地图移除
            for (var i = 0; i < existObj.bItem.features.length; i++) {
                var featureItem = existObj.bItem.features[i];
                featureItem.dataSource.removeFeature(featureItem.feature);
            }
            //从容器中移除
            this._featureContainer[moudle].splice(existObj.index, 1);
        }
    }

    /**
     * 移除所有业务对象
     */
    FeatureContainerManager.prototype.clear=function () {
        //地图对象移除
        for(moudleName in this._featureContainer){
            for (var i = 0; i < this._featureContainer[moudleName].length; i++) {
                var bItem = this._featureContainer[moudleName][i];
                for (var j = 0; j < bItem.features.length; j++) {
                    var featureItem = bItem.features[j];
                    featureItem.dataSource.removeFeature(featureItem.feature);
                }
            }
        }
        //对象容器重置
        this._featureContainer={};
    }

    return FeatureContainerManager;
});