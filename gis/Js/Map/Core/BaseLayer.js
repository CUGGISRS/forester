/**
 * Created by chenlong on 2017/9/12.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
], function (defineProperties, baseUtil) {

    /**
     * 基础抽象图层
     * @constructor
     */
    var BaseLayer = function (option) {
        var defaultOption={};
        if(!option.style){
            defaultOption={
                //点图标
                pointIcon: this._getStyleOption()
            };
        }
        this._options = baseUtil.assign(defaultOption, option);
        var rdLayerDataSource=this._options.source;

        var that = this;
        //继承ol.layer.Vector的属性
        ol.layer.Vector.call(this, {
            source: rdLayerDataSource,
            style: this._options.style?this._options.style:function (feature) {
                return [that._styleFunction(feature)];
            }
        });
    };

    ol.inherits(BaseLayer, ol.layer.Vector);

    /**
     * 获取风格配置项（待实现）
     * @private
     */
    BaseLayer.prototype._getStyleOption=function () {

    };

    /**
     * 风格设置
     * @param feature
     * @param resolution
     * @private
     */
    BaseLayer.prototype._styleFunction = function (feature, resolution) {
        var iconState = feature.get("iconState") ? feature.get("iconState") : "normal";
        if (feature[iconState]) {
            return feature[iconState];
        }

        var style = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: this._options.pointIcon[iconState].anchor,
                src: this._options.pointIcon[iconState].url,
                scale: 1,
                offset: this._options.pointIcon[iconState].offset,
                size: this._options.pointIcon[iconState].size,
                opacity: this._options.pointIcon[iconState].opacity
            })
        });
        feature[iconState] = style;
        return style;
    };

    return BaseLayer;
});