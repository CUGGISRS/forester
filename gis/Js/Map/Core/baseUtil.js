/**
 * 基础公共方法模块
 * @module baseUrl
 */
define([
    './defined',
    'loadImage!hlymap/css/images/mapicon.png',
], function (defined, mapiconImage) {
	var baseUrl;

	/** 基础方法 @alias module:baseUtil     */
	var baseUtil = {
		/**
         * 默认的图形最佳视角显示像素宽度
         */
		defaultGraphicShowWith: 900,
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
					baseUrl = result[1].substring(0, lastIndex) + '/';
					break;
				}
			}
			return baseUrl;
		},

		/**
         * 根据js库基地址获取 相对路径的绝对地址
         */
		getAbsoluteUrl: function (relativeUrl) {
			return this.getBaseUrl() + relativeUrl;
		},

		/**
         * 剪切图片并叠加文字
         * @param image 被叠加文字的图片
         * @param x 图片剪切x起点
         * @param y 图片剪切y起点
         * @param width 图片宽度
         * @param height 图片高度
         * @param text 叠加的文字
         * @param font 文字风格
         * @param txtX 文字放置位置X起点（文字居中）
         * @param txtY 文字放置位置Y起点（文字居中）
         */
		getImageFromText: function (image, x, y, width, height, text, font, txtX, txtY, fontColor) {
			var canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;

			//生成图片
			var context2D = canvas.getContext('2d');
			context2D.drawImage(image, x, y, width, height, 0, 0, width, height);

			//叠加文字
			context2D.font = font;
			context2D.fillStyle = fontColor ? fontColor : 'white';
			context2D.textAlign = "center";
			context2D.fillText(text, txtX, txtY);

			return canvas.toDataURL();
		},

		/**
         * 剪切图片并叠加图片
         * @param image 被叠加文字的图片
         * @param x 图片剪切x起点
         * @param y 图片剪切y起点
         * @param width 图片宽度
         * @param height 图片高度
         * @param coverImage 叠加的图片
         * @param imgX 叠加图片到X位置
         * @param imgY 叠加图片到Y位置
         */
		getImageCoveredImage: function (image, x, y, width, height, coverImage,imgX,imgY) {
            var imgWidth=coverImage.width+imgX;
            var imgHeight=coverImage.height+imgY;
            imgWidth=width>imgWidth?width:imgWidth;
            imgHeight=height>imgHeight?height:imgHeight;


			var canvas = document.createElement('canvas');
			canvas.width = imgWidth;
			canvas.height = imgHeight;

			//生成图片
			var context2D = canvas.getContext('2d');
			context2D.drawImage(image, x, y, width, height, 0, 0, width, height);

			//叠加图片
            context2D.drawImage(coverImage,imgX,imgY);

			return canvas.toDataURL();
		},

		/**
         * 获取地图图标文件url
         * @returns {*}
         */
		getMapIconsUrl: function () {
			return mapiconImage.src;
		},

		/**
         * 获取地图图标image对象
         * @return {*}
         */
		getMapImage: function () {
			return mapiconImage;
		}
	};

	return baseUtil;
});