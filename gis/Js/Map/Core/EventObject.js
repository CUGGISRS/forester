/**
 * Created by chenlong on 2017/3/24.
 */
define(function () {

    /**
     * 事件对象抽象类
     * @constructor
     * @abstract
     * @alias EventObject
     */
    var EventObject=function () {
        this._evnts = [];
    };

    /**
     * 绑定事件
     * @param {string} eventType 事件类型
     * @param {function} callback 事件回调
     * @param {Object} context 事件回调运行上下文
     */
    EventObject.prototype.on = function (eventType, callback, context) {
        this._evnts.push({eventType: eventType, callback: callback, context: context});
    };

    /**
     * 解除事件绑定
     * @param {string} eventType 事件类型
     * @param {function} callback 事件回调
     */
    EventObject.prototype.un = function (eventType, callback) {
        var index = -1;
        for (var i = 0; i < this._evnts.length; i++) {
            if (this._evnts[i].eventType === eventType && this._evnts[i].callback === callback) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            this._evnts.splice(index, 1);
        }
    };

    return EventObject;
});