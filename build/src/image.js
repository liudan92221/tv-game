/**
 * Created by liudan on 15/7/9.
 *
 * 加载图片模块
 */
'use strict';
var deferred = require('./deferred');
var Util = require('./util');
var isFunction = Util.isFunction;
/**
 *
 * @param obj {object}
 *     - src: {string},  声音地址
 *     - callback: {function}, 加载成功之后回调函数
 *
 */
function Img(obj) {
    this.src = obj.src;
//    this.preload = !!obj.preload;

    this.callbackArr = [];
    if (isFunction(obj.callback)) {
        this.callbackArr.push(obj.callback);
    }

    this.isLoad = false;
    this.isError = false;

    this.def = new deferred();

    this.init();
}

Img.prototype.init = function() {
    var _this = this;
    this.node = new Image();

    this.node.addEventListener('load', function() {_this.loaded()}, false);
    this.node.addEventListener('error', function() {_this.error()}, false);

    this.node.src = this.src;
//    if (this.preload) {
//        this.load();
//    }
};

//加载图片
//Img.prototype.load = function() {
//    if (!this.isLoad) {
//        this.node.load();
//    }
//
//    return this;
//};

//加载完成回调函数
Img.prototype.loaded = function() {
    var _this = this;
    this.isLoad = true;
    this.isError = false;

    this.callbackArr.forEach(function(cb) {
        cb.call(_this, 'success');
    });

    this.def.resolve(_this);
};

//加载失败回调函数
Img.prototype.error = function() {
    var _this = this;
    this.isError = true;

    this.callbackArr.forEach(function(cb) {
        cb.call(_this, 'error');
    });

    this.def.reject(_this);

    throw 'Image Error ' + this.src;
};

//注册回调函数
Img.prototype.addCallback = function(callback) {
    if (isFunction(callback)) {
        this.callbackArr.push(callback);
    }
};

//判断是否加载成功
Img.prototype.getIsLoad = function() {
    return this.isLoad;
};

//判断是否加载失败
Img.prototype.getIsError = function() {
    return this.isError;
};

//释放对象
Img.prototype.freed = function() {
    this.node.removeEventListener('load');
    this.node.removeEventListener('error');

    this.src = null;
//    this.preload = null;

    this.callbackArr = null;
};

//获取promise
Img.prototype.getPromise = function() {
    return this.def.promise;
};

//删除
Img.prototype.delete = function() {
    for (var key in this) {
        if (hasOwnProperty.call(this, key)) {
            this[key] = null;
        }
    }
};

module.exports = Img;