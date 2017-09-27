/**
 * 加载图片插件
 * Created by chenlong on 2017/9/24.
 */
define({
    load: function (name, req, onload, config) {
        var image=new Image();
        image.onload=function (e) {
            onload(image);
        };
        image.src=req.toUrl(name);
    }
});