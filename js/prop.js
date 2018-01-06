/**
 * 公共函数
 */
String.prototype.Date = function (fmt) {
    var val = this || '';
    fmt = fmt || 'yyyy-MM-dd';
    val = val.match(/\d+/g);
    if (!val) return '';
    val = new Date(val.length > 1 ? val.map(function (i) {
        return i.length == 1 ? '0' + i : i
    }).join('-') : parseFloat(val[0]));
    var o = {
        "M+": val.getMonth() + 1, //月份 
        "d+": val.getDate(), //日 
        "h+": val.getHours(), //小时 
        "m+": val.getMinutes(), //分 
        "s+": val.getSeconds(), //秒 
        "q+": Math.floor((val.getMonth() + 3) / 3), //季度 
        "S": val.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (val.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

String.prototype.toFixed = function (l) {
    return parseFloat(this || 0).toFixed(l || 2);
};

String.prototype.toDfm = function (l) {
    if(this.indexOf('.') != -1) {
        return formatDegree(this);
    } else {
        return this;
    }
    function formatDegree(value) {
        value = Math.abs(value);
        var v1 = Math.floor(value);
        var v2 = Math.floor((value - v1) * 60);
        var v3 = Math.round((value - v1) * 3600 % 60);
        return v1 + '°' + v2 + '\'' + v3 + '"';
    }
};

Number.prototype.toDfm = function (l) {
    if(this) {
        return formatDegree(this);
    } else {
        return this;
    }
    function formatDegree(value) {
        value = Math.abs(value);
        var v1 = Math.floor(value);
        var v2 = Math.floor((value - v1) * 60);
        var v3 = Math.round((value - v1) * 3600 % 60);
        return v1 + '°' + v2 + '\'' + v3 + '"';
    }
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function thousands(num) {
    num = num.toString();
    num = num.replace(/[^0-9.+-]/g, '');
    num = parseFloat(num) || 0;
    num = num.toString();
    if (/^-?\d+\.?\d+$/.test(num)) {
        if (/^-?\d+$/.test(num)) {
            num = num + ",00";
        } else {
            num = num.replace(/\./, ',');
        }
        while (/\d{4}/.test(num)) {
            num = num.replace(/(\d+)(\d{3}\,)/, '$1,$2');
        }
        num = num.replace(/\,(\d*)$/, '.$1');
    }
    return num
}
