/**
 * Created by chenlong on 2017/9/12.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
    'core/LayerBaseDataSource',
], function (defineProperties, baseUtil, LayerBaseDataSource) {

    /**
     * 轨迹数据源
     * @constructor
     */
    var GjLayerDataSource = function () {
        LayerBaseDataSource.call(this, {});
    };
    //继承自LayerBaseDataSource
    ol.inherits(GjLayerDataSource, LayerBaseDataSource);

    /*
     * 定义属性
     * */
    defineProperties(GjLayerDataSource.prototype, {});

    /**
     * 刷新显示的轨迹集合数据（直接清空并重新添加的方式）
     * @param gjItem 轨迹集合信息
     * @private
     */
    GjLayerDataSource.prototype.refresh = function (data) {
        //清空原有轨迹
        this.clear();
        //生成多条轨迹线
        for (var i = 0; i < data.length; i++) {
            var lineItem = data[i];
            this.addDataItem(lineItem);
        }
    };

    /**
     * 清除（覆盖原有方法）
     */
    GjLayerDataSource.prototype.clear = function () {
        //调用父类清除
        LayerBaseDataSource.prototype.clear.call(this);
        this._data = [];
    }
    /**
     * 添加一条轨迹线
     * @param lineItem
     */
    GjLayerDataSource.prototype.addDataItem = function (lineItem) {
        lineItem.features = [];
        lineItem.singleLine = new ol.geom.LineString();

        var geometries = this._getItemGeometries(lineItem);
        for (var j = 0; j < geometries.length; j++) {
            var geometryItem = geometries[j];
            var feature = new ol.Feature({
                geometry: geometryItem.geometry,
            });
            feature.setProperties(lineItem, true);
            feature.setId(lineItem.LineId + j);
            feature.set("iconState", "normal");
            feature.set("valid", geometryItem.valid);

            //生成非拆分的整条线
            var coordinates=geometryItem.geometry.getCoordinates();
            for (var i = 0; i < coordinates.length; i++) {
                var point = coordinates[i];
                lineItem.singleLine.appendCoordinate(point);
            }

            lineItem.features.push(feature);
            //三维贴地
            feature.setProperties({"altitudeMode": "clampToGround"}, true);
            this.addFeature(feature);
        }

        this._data.push(lineItem);
    }

    /**
     * 高亮显示（重载）
     * @param lineId 轨迹线
     */
    GjLayerDataSource.prototype.setHighLight = function (lineId) {
        if (this.highLightLineItem) {
            //已有高亮，则取消高亮
            this.cancelHighLight();
        }
        //根据id找到数据源，再找到features
        var features = this.getItemById(lineId);
        if (features) {
            //高亮找到的所有要素
            for (var i = 0; i < features.length; i++) {
                var feature = features[i];
                feature.set("oldIconState", feature.get("iconState"));
                feature.set("iconState", "highlight");
            }
            this.highLightLineItem = lineItem;
        }
    }

    /**
     * 取消高亮
     */
    GjLayerDataSource.prototype.cancelHighLight = function () {
        if (this.highLightLineItem) {
            if (this.highLightLineItem.features) {
                var features = this.highLightLineItem.features;
                for (var i = 0; i < features.length; i++) {
                    var feature = features[i];
                    feature.set("iconState", feature.get("oldIconState"));
                }
            }
            this.highLightLineItem = null;
        }
    };

    /**
     * 选中状态
     * @param lineId 轨迹ID
     */
    GjLayerDataSource.prototype.setSelected = function (lineId) {
        if (this.selectedLineItem) {
            //有选中则清除原有选中
            this.cancelSelected();
        }
        //选中该线
        var lineItem = this.getItemById(lineId);
        if (lineItem && lineItem.features) {
            var features=lineItem.features;
            for (var i = 0; i < features.length; i++) {
                var feature = features[i];
                feature.set("iconState", "selected");
            }
            this.selectedLineItem = lineItem;
        }
    };

    /**
     * 取消选中状态
     */
    GjLayerDataSource.prototype.cancelSelected = function () {
        if(this.selectedLineItem){
            var features = this.selectedLineItem.features;
            for (var i = 0; i < features.length; i++) {
                var feature = features[i];
                feature.set("iconState", "normal");
            }
            this.selectedLineItem = null;
        }
    };

    /**
     * 根据路径ID获取路径
     * @param lineItemId
     */
    GjLayerDataSource.prototype.getItemById = function (lineItemId) {
        var result;
        for (var i = 0; i < this._data.length; i++) {
            var lineItem = this._data[i];
            if (lineItem.LineId === lineItemId) {
                result = lineItem;
                break;
            }
        }
        return result;
    }

    /**
     * 根据某一条轨迹生成（按区域分的）分段的图层
     * @param item
     * @private
     */
    GjLayerDataSource.prototype._getItemGeometries = function (item) {
        var lines = [];
        //拆分线段
        var currentLineInArea = item.GpsInfos[0].ISVALID;
        for (var i = 0; i < item.GpsInfos.length; i++) {
            var gpsInfo = item.GpsInfos[i];
            if (gpsInfo.ISVALID == currentLineInArea) {
                //与上一点相同有效性，追加到当前线里
                if (lines.length === 0) {
                    //第一条
                    lines.push({
                        valid: gpsInfo.ISVALID,
                        line: [[gpsInfo.LONGITUDE, gpsInfo.LATITUDE]]
                    })
                } else {
                    lines[lines.length - 1].line.push([gpsInfo.LONGITUDE, gpsInfo.LATITUDE]);
                }
            } else {
                //与上一点没有相同有效性，重启新线（添加该点），结束以前的线（添加该点）
                //重启新线
                currentLineInArea = gpsInfo.ISVALID;
                lines.push({
                    valid: gpsInfo.ISVALID,
                    line: [[gpsInfo.LONGITUDE, gpsInfo.LATITUDE]]
                });
                //结束以前的线
                lines[lines.length - 2].line.push([gpsInfo.LONGITUDE, gpsInfo.LATITUDE]);
            }
        }
        //根据线生成geometry
        var geometries = [];
        for (var i = 0; i < lines.length; i++) {
            geometries.push({
                valid: lines[i].valid,
                geometry: new ol.geom.LineString(lines[i].line)
            });
        }
        return geometries;
    };

    return GjLayerDataSource;

});