/**
 * Created by chenlong on 2017/9/21.
 */
define([
    'core/defineProperties',
], function (defineProperties) {

    /**
     * 用户锁定服务
     * @constructor
     */
    var UserLockOnService = function (option) {
        this._userFeature = option.userFeature;
        this._getUserGpsInfoUrl=option.getUserGpsInfoUrl;
        this._hlyMap = option.hlyMap;
        this._contMap = option.hlyMap.contMap;
        this._layerManage = this._hlyMap.layerManage;
        this._userId = this._userFeature.getId();
    };

    /*
     * 定义属性
     * */
    defineProperties(UserLockOnService.prototype, {

        /**
         * 跟踪的要素
         */
        userFeature: {
            get: function () {
                return this._userFeature;
            }
        }
    });

    /**
     * 跟踪初始化
     */
    UserLockOnService.prototype.init = function () {
        //跟踪用轨迹线初始化
        this._gjTmpLayer = this._layerManage.newGjLayer();
        this._contMap.layerManager.addLayer(this._gjTmpLayer, true);
    };

    /**
     * 开启跟踪对象
     */
    UserLockOnService.prototype.lockOn = function () {
        if (this._lockOnCode) {
            //已启动跟踪，则不做处理
            return;
        }
        //图标位置变更响应
        var that = this;
        this._onUserLockOnEventCallback = function () {
            that._onGeometryUpdated();
        };
        this._userFeature.on("change:geometry", this._onUserLockOnEventCallback);
        //定时更新图标位置
        this._lockOnCode = setInterval(function () {
            //获取用户位置信息
            $.get(that._getUserGpsInfoUrl, {
                userId: that._userId
            }, function (gpsInfo) {
				if (!gpsInfo) {
					return;
				}
                var foundedFeature = that._userFeature;
                //更新图标位置
                if (foundedFeature) {
                    foundedFeature.set("ISVALID", gpsInfo.ISVALID);
                    foundedFeature.setGeometry(new ol.geom.Point([gpsInfo.LONGITUDE, gpsInfo.LATITUDE]));
                }
            });
        }, 3000);
    };

    /**
     * 取消锁定
     */
    UserLockOnService.prototype.unLockOn = function () {
        //取消位置变更时地图响应
        if (this._onUserLockOnEventCallback) {
            var foundedFeature = this._userFeature;
            foundedFeature.un("change:geometry", this._onUserLockOnEventCallback);
            this._userFeature = null;
            this._onUserLockOnEventCallback = null;
        }

        //取消定时更新数据
        if (this._lockOnCode) {
            clearInterval(this._lockOnCode);
            this._lockOnCode = null;
        }
    };

    /**
     * 释放
     */
    UserLockOnService.prototype.dispose = function () {
        this.unLockOn();
        //清除轨迹
        this._contMap.layerManager.removeLayer(this._gjTmpLayer);
    };
    /**
     * 更新要素时处理
     * @private
     */
    UserLockOnService.prototype._onGeometryUpdated = function () {
        //绘制路径，找到最后的feature判断是否当前点有效性与feature一致，一致则追加点，不一致则新起一个feature
        var isvalid = this._userFeature.get("ISVALID");
        isvalid = isvalid === undefined ? "1" : isvalid;
        var point = this._userFeature.getGeometry().getCoordinates();

        var lineId = this._userId + ">用户最终线";
        var gjDateSource = this._gjTmpLayer.getSource();
        if (gjDateSource.getItemById(lineId)) {
            //已存在该线，则追加点
            gjDateSource.addPoint(point, isvalid, lineId);
        } else {
            //不存在该线，则添加该线
            gjDateSource.addDataItem({
                "LineId": lineId,
                "UserName": this._userId,
                "StartTime": "2017/9/13 8:43:06",
                "TimeLength": "0",
                "Distance": "0",
                "GpsInfos": [{
                    "LONGITUDE": point[0],
                    "LATITUDE": point[1],
                    "ISVALID": isvalid
                }]
            });
        }


    };

    return UserLockOnService;
});