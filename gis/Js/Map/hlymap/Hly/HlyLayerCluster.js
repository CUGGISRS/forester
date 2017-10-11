/**
 * Created by gsh on 2017/2/15.
 */
define([
    'core/defineProperties',
    'core/baseUtil',
], function (defineProperties, baseUtil) {
    /**
     * 护林员图层聚合
     * @param option 参数项
     * @param option.vectorSource 聚合数据源
     * @param option.distance 聚合距离参数
     * @constructor
     */
    var HlyLayerCluster = function (option) {
        var iconsUrl = baseUtil.getMapIconsUrl();
        this._image = baseUtil.getMapImage();
        this._imageHeight = this._image.height;
        var that = this;

        //配置项处理
        this._options = baseUtil.assign({
            minClusterResolution: 2.2457672519402802e-5,
            distance: 30,
            textLabelIcon: {
                offset: [0, 140],//位置
                url: iconsUrl,//图片资源
                anchor: [-.2, 1.5],//图标位置对应的地图点
                size: [60, 40],//截取大小
                opacity: 1,//透明度
            },
            //聚合点图标
            clusterIcon: {
                offset: [324,232],//位置
                url: iconsUrl,//图片资源
                anchor: [1, 1],//图标位置对应的地图点
                size: [43, 45],//截取大小
                opacity: 1//透明度
            },
            //离散点图标
            pointIcon: {
                //GPS类型点位的图标
                GPS: {
                    online: {
                        normal: {
                            offset: [0,300],//位置
                            url: iconsUrl,//图片资源
                            anchor: [.5, 1],//图标位置对应的地图点
                            size: [40, 54],//截取大小
                            opacity: 1,//透明度
                        },
                        selected: {
                            offset: [162,232],//位置
                            url: iconsUrl,//图片资源
                            anchor: [.5, .86],//图标位置对应的地图点
                            size: [54, 64],//截取大小
                            opacity: 1//透明度
                        },
                        highlight: {
                            offset: [162,232],//位置
                            url: iconsUrl,//图片资源
                            anchor: [.5, .86],//图标位置对应的地图点
                            size: [54, 64],//截取大小
                            opacity: 1//透明度
                        },
                    },
                    offline: {
                        normal: {
                            offset: [367,232],//位置
                            url: iconsUrl,//图片资源
                            anchor: [.5, 1],//图标位置对应的地图点
                            size: [40, 54],//截取大小
                            opacity: 1,//透明度
                        },
                        selected: {
                            offset: [0,232],//位置
                            url: iconsUrl,//图片资源
                            anchor: [.5, .86],//图标位置对应的地图点
                            size: [54, 64],//截取大小
                            opacity: 1//透明度
                        },
                        highlight: {
                            offset: [0,232],//位置
                            url: iconsUrl,//图片资源
                            anchor: [.5, .86],//图标位置对应的地图点
                            size: [54, 64],//截取大小
                            opacity: 1//透明度
                        },
                    }
                },
                //GPS类型点位的图标
                NETWORK: {
                    online: {
                        normal: {
                            offset: [160,300],//位置
                            url: iconsUrl,//图片资源
                            anchor: [.5, 1],//图标位置对应的地图点
                            size: [40, 54],//截取大小
                            opacity: 1,//透明度
                        },
                        selected: {
                            offset: [270,232],//位置
                            url: iconsUrl,//图片资源
                            anchor: [.5, .86],//图标位置对应的地图点
                            size: [54, 64],//截取大小
                            opacity: 1//透明度
                        },
                        highlight: {
                            offset: [270,232],//位置
                            url: iconsUrl,//图片资源
                            anchor: [.5, .86],//图标位置对应的地图点
                            size: [54, 64],//截取大小
                            opacity: 1//透明度
                        },
                    },
                    offline: {
                        normal: {
                            offset: [120,300],//位置
                            url: iconsUrl,//图片资源
                            anchor: [.5, 1],//图标位置对应的地图点
                            size: [40, 54],//截取大小
                            opacity: 1,//透明度
                        },
                        selected: {
                            offset: [108,232],//位置
                            url: iconsUrl,//图片资源
                            anchor: [.5, .86],//图标位置对应的地图点
                            size: [54, 64],//截取大小
                            opacity: 1//透明度
                        },
                        highlight: {
                            offset: [108,232],//位置
                            url: iconsUrl,//图片资源
                            anchor: [.5, .86],//图标位置对应的地图点
                            size: [54, 64],//截取大小
                            opacity: 1//透明度
                        },
                    }
                },

            }
        }, option);
    };

    defineProperties(HlyLayerCluster.prototype, {
        /**
         * Ol矢量图层
         */
        layer: {
            get: function () {
                return this._olLayer;
            }
        },

        /**
         * 聚合数据源
         */
        clusterSource: {
            get: function () {
                return this._clusterSource;
            }
        },

        /**
         * 聚合数据源
         */
        vectorSource: {
            get: function () {
                return this._vectorSource;
            }
        },
    });

    /**
     * 初始化
     */
    HlyLayerCluster.prototype.init = function () {
        var that = this;
        var styleFun = function (clusterFeature, resolution) {
            var size;
            if (clusterFeature) {
                size = clusterFeature.get('features').length || 1;
            } else {
                size = 1;
            }

            var styles;
            var clusterIcon = new ol.style.Icon({
                anchor: that._options.clusterIcon.anchor,
                src: that._options.clusterIcon.url,
                scale: 1,
                offset: that._options.clusterIcon.offset,
                size: that._options.clusterIcon.size,
                opacity: that._options.clusterIcon.opacity
            });
            if (size >= 2) {
                styles = [new ol.style.Style({
                    image: clusterIcon,
                    text: new ol.style.Text({
                        font: "18px 微软雅黑",
                        textAlign: "center",
                        offsetX: -23,
                        offsetY: -23,
                        fill: new ol.style.Fill({
                            color: [255, 255, 255, 1],
                        }),
                        text: size.toString()
                    })
                })];
            }
            else {
                //离散点
                if (clusterFeature) {
                    var feature = clusterFeature.get('features')[0];
                    var provider = feature.get("Provider");
                    var onlineState = feature.get("onlineState") ? feature.get("onlineState") : "online";
                    var iconState = feature.get("iconState") ? feature.get("iconState") : "normal";
                    if (feature[onlineState + iconState]) {
                        return feature[onlineState + iconState];
                    } else {
                        styles = [new ol.style.Style({
                            zIndex: iconState !== "normal" ? 100 : 0,
                            image: new ol.style.Icon({
                                anchor: that._options.pointIcon[provider][onlineState][iconState].anchor,
                                src: that._options.pointIcon[provider][onlineState][iconState].url,
                                scale: 1,
                                offset: that._options.pointIcon[provider][onlineState][iconState].offset,
                                size: that._options.pointIcon[provider][onlineState][iconState].size,
                                opacity: that._options.pointIcon[provider][onlineState][iconState].opacity
                            })
                        })];
                        //当选中或高亮时，显示人名
                        if (iconState !== "normal") {
                            var userName = feature.get("UserName");
                            styles.push(new ol.style.Style({
                                zIndex: iconState !== "normal" ? 100 : 0,
                                image: new ol.style.Icon({
                                    anchor: that._options.textLabelIcon.anchor,
                                    src: that._options.textLabelIcon.url,
                                    scale: 1,
                                    offset: that._options.textLabelIcon.offset,
                                    size: that._options.textLabelIcon.size,
                                    opacity: that._options.textLabelIcon.opacity
                                }),
                                text: new ol.style.Text({
                                    font: "14px 微软雅黑",
                                    textAlign: "center",
                                    offsetX: 43,
                                    offsetY: -40,
                                    text: userName
                                })
                            }));
                        }
                        feature[onlineState + iconState] = styles;
                    }
                }

            }
            return styles;
        };
        var distance = this._options.distance;
        this._vectorSource = this._options.vectorSource;
        this._clusterSource = new ol.source.Cluster({
            distance: distance,
            source: this._vectorSource,
        });
        this._olLayer = new ol.layer.Vector({
            source: this._clusterSource,
            style: styleFun
        });
        this._olLayer.LayerType = "护林员图层";
        this._olLayer.skipSynchronize = true;
        this._olLayer.set("altitudeMode", "clampToGround");

        //重写this._vectorSource的loadFeatures方法
        //todo 待重构，换版本时可能会有问题（可挂接添加要素事件并另起机制获取当前地图分辨率）
        var oldloadFeatures = this._clusterSource.Oc;
        this._clusterSource.Oc = function (extent, resolution, projection) {
            //先执行聚合
            oldloadFeatures.call(this, extent, resolution, projection);
            //针对已聚合要素，在最后一级比例尺下，将当前视野下的clusterFeature进行拆分，
            //被聚合的全部独立出来作为只有一个包含关系的聚合体
            if (resolution < that._options.minClusterResolution) {
                var visibleFeatures = this.getFeaturesInExtent(extent);
                for (var i = 0; i < visibleFeatures.length; i++) {
                    var visibleClusterFeature = visibleFeatures[i];
                    var subFeatures = visibleClusterFeature.get('features');
                    //删除聚合要素，同时添加独立要素
                    this.removeFeature(visibleClusterFeature);
                    for (var j = 0; j < subFeatures.length; j++) {
                        var subFeature = subFeatures[j];
                        var point = subFeature.getGeometry();
                        var cluster = new ol.Feature(point);
                        cluster.set('features', [subFeature]);
                        this.addFeature(cluster);
                    }
                }
            }
        }

        //三维聚合数据源初始化
        this._clusterDataSourceInit(this._options.scene);

        //同步二维对象到三维对象（增减，变更在三维聚合数据源初始化市已处理
        this._vectorSource.on("addfeature", function (e) {
            //添加对象到三维聚合数据源
            var feature = e.feature;
            that._addEntity(that._clusterDataSource, feature, that._olLayer);
        });
        this._vectorSource.on("removefeature", function (e) {
            //移除对象到三维聚合数据源
            var feature = e.feature;
            that._removeEntity(that._clusterDataSource, feature);
        });

    };

    /**
     * 三维聚合数据源初始化
     * @param {Object}scene 三维场景
     */
    HlyLayerCluster.prototype._clusterDataSourceInit = function (scene) {
        var layer = this._olLayer;
        //聚类
        var features;
        if (layer instanceof ol.layer.Vector) {
            var source = layer.getSource();
            if (source instanceof ol.source.Cluster) {
                source = source.getSource();
                features = source.getFeatures();
            }
        }
        if (features) {
            var modelLayer = new Cesium.CustomDataSource();
            for (var i = 0; i < features.length; i++) {
                var feature = features[i];
                this._addEntity(modelLayer, feature, layer);
            }
            //聚合配置
            var pixelRange = 50;
            var minimumClusterSize = 2;
            var enabled = true;
            modelLayer.clustering.enabled = enabled;
            modelLayer.clustering.pixelRange = pixelRange;
            modelLayer.clustering.minimumClusterSize = minimumClusterSize;
            var removeListener;

            var that = this;
            var clusterOffset = this._options.clusterIcon.offset;
            var clusterSize = this._options.clusterIcon.size;

            customStyle();
            function customStyle() {
                if (Cesium.defined(removeListener)) {
                    removeListener();
                    removeListener = undefined;
                } else {
                    removeListener = modelLayer.clustering.clusterEvent.addEventListener(function (clusteredEntities, cluster) {
                        var clusterIconUrl = baseUtil.getImageFromText(that._image, clusterOffset[0],
                            clusterOffset[1], clusterSize[0], clusterSize[1], clusteredEntities.length.toString(), "18px 微软雅黑",
                            clusterSize[0] / 2-1, clusterSize[1] / 2 + 6);

                        cluster.billboard.show = true;
                        cluster.billboard.image = clusterIconUrl;
                        cluster.billboard.horizontalOrigin = Cesium.HorizontalOrigin.RIGHT;
                        cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                        cluster.billboard.disableDepthTestDistance = 10000;
                        cluster.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                        cluster.label.show = false;
                    });
                }
                // force a re-cluster with the new styling
                var pixelRange = modelLayer.clustering.pixelRange;
                modelLayer.clustering.pixelRange = 0;
                modelLayer.clustering.pixelRange = pixelRange;
            }

            scene.dataSource = modelLayer;

            //设置三维聚合数据源
            this._clusterDataSource = modelLayer;
        }
    };

    /**
     * 添加实体
     * @param feature
     * @private
     */
    HlyLayerCluster.prototype._addEntity = function (modelLayer, feature, olLayer) {
        var provider = feature.get("Provider");
        var onlineState = feature.get("onlineState") ? feature.get("onlineState") : "online";
        var iconState = feature.get("iconState") ? feature.get("iconState") : "normal";
        var offset = this._options.pointIcon[provider][onlineState][iconState].offset;
        var size = this._options.pointIcon[provider][onlineState][iconState].size;
        var iconUrl = this._options.pointIcon[provider][onlineState][iconState].url;

        var geometry = feature.getGeometry();
        var position = geometry.getCoordinates();

        var entity = modelLayer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(position[0], position[1]),
            billboard: {
                image: iconUrl,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                imageSubRegion: new Cesium.BoundingRectangle(offset[0], this._imageHeight - offset[1] - size[1], size[0], size[1]),
                pixelOffset: new Cesium.Cartesian2(0, 0),
                disableDepthTestDistance: 10000,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                translucencyByDistance: new Cesium.NearFarScalar(1.5e4, 1, 1.5e9, 0.2)
            }
        });
        var that = this;
        //与feature同步机制
        feature.on("propertychange", function (e) {
            var feature = e.target;
            var provider = feature.get("Provider");
            var onlineState = feature.get("onlineState") ? feature.get("onlineState") : "online";
            var iconState = feature.get("iconState") ? feature.get("iconState") : "normal";

            //当选中或高亮时，显示人名
            if (iconState !== "normal") {
                var userName = feature.get("UserName");
                var labelOption = that._options.textLabelIcon;
                var lableIconUrl = baseUtil.getImageFromText(that._image, labelOption.offset[0], labelOption.offset[1],
                    labelOption.size[0], labelOption.size[1],
                    userName, "14px 微软雅黑", labelOption.size[0] / 2 + 1, labelOption.size[1] / 2 + 5, "black");
                labelOption = that._options.pointIcon[provider][onlineState][iconState];

                var lableIcon = new Image();
                lableIcon.src = lableIconUrl;
                lableIcon.onload = function (e) {
                	var newiconUrl = baseUtil.getImageCoveredImage(that._image, labelOption.offset[0], labelOption.offset[1],
						labelOption.size[0], labelOption.size[1],
						lableIcon, 39, -5);
                	feature.cesiumEntity.billboard.image = newiconUrl;
                	feature.cesiumEntity.billboard.pixelOffset = new Cesium.Cartesian2(23, 9);
                	feature.cesiumEntity.billboard.imageSubRegion = null;
                };
			} else {
                var offset = that._options.pointIcon[provider][onlineState][iconState].offset;
                var size = that._options.pointIcon[provider][onlineState][iconState].size;
                var imageSubRegion = new Cesium.BoundingRectangle(offset[0], that._imageHeight - offset[1] - size[1], size[0], size[1]);
                feature.cesiumEntity.billboard.image = iconUrl;
                feature.cesiumEntity.billboard.pixelOffset = new Cesium.Cartesian2(0, 0);
                feature.cesiumEntity.billboard.imageSubRegion = imageSubRegion;
			}
        });
        feature.on("change:geometry", function (e) {

            //位置同步
            var feature = e.target;
            var geometry = feature.getGeometry();
            var position = geometry.getCoordinates();
            feature.cesiumEntity.position = Cesium.Cartesian3.fromDegrees(position[0], position[1]);
        });
        feature.cesiumEntity = entity;
        entity.feature = feature;
        entity.olLayer = olLayer;
    };

    /**
     * 移除实体
     * @param modelLayer
     * @param feature
     * @private
     */
    HlyLayerCluster.prototype._removeEntity = function (modelLayer, feature) {
        modelLayer.entities.remove(feature.cesiumEntity);
    };

    return HlyLayerCluster;

});

