/**
 * 专题对象管理器
 * Created by chenlong on 2017/9/22.
 */
define(function () {
    'use strict';

    /**
     * 专题对象管理器，构建隶属关系并通过featureContainerManager管理对象生命周期
     * @param option
     * @constructor
     */
    var ThemeObjectManager = function (option) {
        this._option = option;
        //整个地图要素的管理器
        this._featureContainerManager = option.featureContainerManager;
        //专题对象
        this._themeObjectContainer = {
            "护林员": null,
            "轨迹": null,
            "巡护区": null,
            "报警": null,
            "热点": null,
            "考勤": null,
        };
    };

    /**
     * 设置专题对象，开启新主题
     * @param themeName 专题名称
     * @param businessItem 业务对象
     */
    ThemeObjectManager.prototype.setThemeObject = function (themeName, businessItem) {
        if (businessItem.value.themeName) {
            //已被打上过标签，则不处理
            return;
        }

        var itemId = businessItem.itemId;
        //清除已有的
        this.clearThemeObject(themeName, itemId);
        //设置新专题对象
        var newThemeObject = {
            id: itemId,
            businessItem: businessItem,
            tmpItems: []
        };
        this._themeObjectContainer[themeName] = newThemeObject;
        //为专题对象打上专题标签
        businessItem.value.themeName = themeName;

        return newThemeObject;
    };

    /**
     * 获取当前专题对象
     * @param themeName
     */
    ThemeObjectManager.prototype.getCurrentThemeObject = function (themeName) {
        return this._themeObjectContainer[themeName];
    };

    /**
     * 添加临时业务对象
     * @param themeName
     * @param itemId
     * @param businessItem 标准的业务对象
     */
    ThemeObjectManager.prototype.addTmpObject = function (themeName, itemId, businessItem) {
        if (businessItem.value.themeName) {
            //已被打上过标签，则不处理
            return;
        }
        var themeObj = this._themeObjectContainer[themeName];
        if (!themeObj || themeObj.id !== itemId) {
            //不存在专题对象
            console.log("不存在专题对象,不能添加临时对象");
            return;
        }
        //添加对象到临时集合
        themeObj.tmpItems.push(businessItem);
        //为对象打上专题标签
        businessItem.value.themeName = themeName;
    };

    /**
     * 移除临时业务对象
     * @param themeName
     * @param itemId
     */
    ThemeObjectManager.prototype.removeTmpObject = function (themeName, itemId, tmpItemId, tmpItemType) {
        var existObj = this.getTmpObject(themeName, itemId, tmpItemId, tmpItemType);
        if (existObj) {
            existObj.bItem.value.themeName=null;
            //对象释放
            this._featureContainerManager.removeMapBusinessItem(existObj.bItem.itemId, existObj.bItem.itemType);
            //从容器中移除
            existObj.themeObj.tmpItems.splice(existObj.index, 1);
        }
    };

    /**
     * 获取临时业务对象
     * @param themeName
     * @param itemId
     * @param tmpItemId 标准的临时业务对象ID
     */
    ThemeObjectManager.prototype.getTmpObject = function (themeName, itemId, tmpItemId, tmpItemType) {
        var themeObj = this._themeObjectContainer[themeName];
        if (!themeObj || themeObj.id !== itemId) {
            //不存在专题对象
            return;
        }
        //获取临时对象
        for (var i = 0; i < themeObj.tmpItems.length; i++) {
            var tmpItem = themeObj.tmpItems[i];
            if (tmpItem.itemId === tmpItemId && tmpItem.itemType === tmpItemType) {
                return {
                    themeObj: themeObj,
                    bItem: tmpItem,
                    index: i
                };
            }
        }
        return;
    }

    /**
     * 获取某对象的专题信息
     * @param feature
     */
    ThemeObjectManager.prototype.getItemThemeInfo = function (feature) {
        if (!feature) {
            return;
        }
        for (var key in this._themeObjectContainer) {
            var themeItem = this._themeObjectContainer[key];
            if(!themeItem){
                continue;
            }
            //专题对象中查找
            for (var i = 0; i < themeItem.businessItem.mapFeatures.length; i++) {
                var mapFeature = themeItem.businessItem.mapFeatures[i];
                if (feature === mapFeature.feature) {
                    //找到为专题对象的要素
                    return {
                        themeName: key,
                        themeItemId: themeItem.businessItem.itemId,
                        isThemeItem: true
                    }
                }
            }
            //专题对象中的临时业务对象中查找
            for (var i = 0; i < themeItem.tmpItems.length; i++) {
                var tmpBItem = themeItem.tmpItems[i];
                for (var j = 0; j < tmpBItem.mapFeatures.length; j++) {
                    var mapFeature = tmpBItem.mapFeatures[j];
                    if (feature === mapFeature.feature) {
                        //找到为专题对象的要素
                        return {
                            themeName: key,
                            themeItemId: themeItem.businessItem.itemId,
                            isThemeItem: false
                        }
                    }
                }
            }
        }
        //都没找到
        return;
    }
    /**
     * 获取某专题某类型的临时对象集合
     * @param themeName
     * @param itemId
     * @param tmpItemType
     * @return {Array}
     */
    ThemeObjectManager.prototype.getSameTypeTmpObjects = function (themeName, itemId, tmpItemType) {
        var themeObj = this._themeObjectContainer[themeName];
        if (!themeObj || themeObj.id !== itemId) {
            //不存在专题对象
            return;
        }
        //获取临时对象
        var sameTypeTmpOjects = [];
        for (var i = 0; i < themeObj.tmpItems.length; i++) {
            var tmpItem = themeObj.tmpItems[i];
            if (tmpItem.itemType === tmpItemType) {
                sameTypeTmpOjects.push(tmpItem);
            }
        }
        return sameTypeTmpOjects;
    }
    /**
     * 清除专题对象
     * @param themeName 专题名称
     * @param itemId
     */
    ThemeObjectManager.prototype.clearThemeObject = function (themeName, itemId) {
        var themeObj = this._themeObjectContainer[themeName];
        if (!themeObj || themeObj.id !== itemId) {
            //没有该专题对象
            return;
        }
        //删除专题对象的临时对象
        for (var i = 0; i < themeObj.tmpItems.length; i++) {
            var tmpItem = themeObj.tmpItems[i];
            tmpItem.value.themeName=null;
            this._featureContainerManager.removeMapBusinessItem(tmpItem.itemId, tmpItem.itemType);
        }
        //已有专题对象，删除该对象
        this._featureContainerManager.removeMapBusinessItem(themeObj.businessItem.itemId, themeObj.businessItem.itemType);
        themeObj.businessItem.value.themeName=null;
        this._themeObjectContainer[themeName] = null;
    };

    return ThemeObjectManager
});