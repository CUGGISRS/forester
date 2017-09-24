/**
 * Created by chenlong on 2017/9/9.
 */
define([
    'core/defineProperties',
], function (defineProperties) {

    /**
     * 地图数据加载
     * @param option
     * @constructor
     */
    var MapDataLoader = function (option) {
        this._option = option;
        this._layerManage = option.hlyMap.layerManage;
        this._contMap = option.hlyMap.contMap;
    };

    //定义属性
    defineProperties(MapDataLoader.prototype, {});

    /**
     * 刷新报警地图数据
     * @param data
     * @constructor
     */
    MapDataLoader.prototype.RefreshBjData = function (data) {
        //获取数据源
        var layerDataSource = this._layerManage.bjLayer.getSource();
        //刷新数据源
        layerDataSource.refresh(data);
    };

    /**
     * 刷新热点地图数据
     * @param data
     * @constructor
     */
    MapDataLoader.prototype.RefreshRdData = function (data) {
        //获取数据源
        var layerDataSource = this._layerManage.rdLayer.getSource();
        //刷新数据源
        layerDataSource.refresh(data);
    };

    /**
     * 刷新护林员地图数据
     * @param data
     * @constructor
     */
    MapDataLoader.prototype.RefreshHlyData = function (data) {
        //获取数据源
        var layerDataSource = this._layerManage.hlyLayer.getSource().getSource();
        //刷新数据源
        layerDataSource.refresh(data);
    };

    /**
     * 刷新反馈地图数据
     * @param data
     * @constructor
     */
    MapDataLoader.prototype.RefreshFkData = function (data) {
        //获取数据源
        var layerDataSource = this._layerManage.fkLayer.getSource();
        //刷新数据源
        layerDataSource.refresh(data);
    };

    return MapDataLoader;
});