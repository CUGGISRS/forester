/**
 * 基础公共方法模块
 * @module baseUrl
 */
define([
    './defined'
], function (defined) {
    var baseUrl;
    var mapIconsUrl;

    return    /** 基础方法 @alias module:baseUtil     */ {
        /**
         *对象合并
         */
        assign: function (target, var_sources) {
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var output = Object(target);
            for (var i = 1, ii = arguments.length; i < ii; ++i) {
                var source = arguments[i];
                if (source !== undefined && source !== null) {
                    for (var key in source) {
                        if (source.hasOwnProperty(key)) {
                            var obj = source[key]
                            if (typeof obj == "object") {
                                if (obj === null) {
                                    output[key] = obj;
                                } else {
                                    if (obj instanceof Array) {
                                        //数组结构
                                        output[key] = obj;
                                    } else {
                                        //嵌套结构
                                        if (typeof output[key] == "object") {
                                            this.assign(output[key], obj);
                                        } else {
                                            output[key] = source[key];
                                        }
                                    }
                                }
                            } else {
                                output[key] = obj;
                            }
                        }
                    }
                }
            }
            return output;
        },

        /**
         * 获取js库基地址
         */
        getBaseUrl: function () {
            if (defined(baseUrl)) {
                return baseUrl;
            }
            //通过查找scrip元素获取
            var scriptRegex = /((?:.*\/)|^)HlyMap[\w-]*\.js(?:\W|$)/i;
            var scripts = document.getElementsByTagName('script');
            for (var i = 0, len = scripts.length; i < len; ++i) {
                var src = scripts[i].getAttribute('src');
                var result = scriptRegex.exec(src);
                if (result !== null) {
                    //找到匹配项
                    var srcUrl = result[1];
                    var lastIndex = srcUrl.lastIndexOf('/');
                    baseUrl = result[1].substring(0, lastIndex)+'/';
                    break;
                }
            }
            return baseUrl;
        },

        /**
         * 根据js库基地址获取 相对路径的绝对地址
         */
        getAbsoluteUrl:function (relativeUrl) {
            return this.getBaseUrl()+relativeUrl;
        },

        /**
         * 剪切图片并叠加文字
         * @param image
         * @param x
         * @param y
         * @param width
         * @param height
         */
        getImageFromText:function (image ,x, y, width, height,text,font) {
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            //生成图片
            var context2D = canvas.getContext('2d');
            context2D.drawImage(image, x, y, width, height, 0, 0, width, height);

            //叠加文字
            context2D.font = font;
            context2D.fillStyle = 'white';
            context2D.textAlign = "center";
            context2D.fillText(text, width/2, height/2+7);

            return canvas.toDataURL();
        },

        /**
         * 获取地图图标文件url
         * @returns {*}
         */
        getMapIconsUrl:function () {
            if (!defined(mapIconsUrl)) {
                mapIconsUrl=this.getAbsoluteUrl("./css/images/mapicon.png");
            }

            return mapIconsUrl;
        }
    };
});