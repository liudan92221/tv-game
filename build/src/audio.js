/**
 * Created by liudan on 15/7/8.
 *
 * 加载Audio模块
 */
'use strict';
var deferred = require('./deferred');
var Util = require('./util');
var isFunction = Util.isFunction;
/**
 *
 * @param obj {object}
 *     - src: {string},  声音地址
 *     - preload: {boolean},  是否自动加载
 *     - autoPlay: {boolean}, 是否自动播放
 *     - loop: {boolean}, 是否循环播放
 *     - callback: {function}, 加载成功之后回调函数
 *
 */
function Audio(obj) {
    this.src = obj.src;

    this.preload = !!obj.preload;
    this.autoPlay = !!obj.autoPlay;
    this.loop = !!obj.loop;
    this.callbackArr = [];

    if (isFunction(obj.callback)) {
        this.callbackArr.push(obj.callback);
    }

    this.isLoad = false;
    this.isPlay = false;

    this.isError = false;

    this.def = new deferred();

    this.init();
}

Audio.prototype.init = function() {
    this.node = document.createElement('audio');

    this.node.preload = this.preload;
    this.node.src = this.src;

    this.addEvent();

    if (this.preload) {
        this.load();
    }
};

//添加事件
Audio.prototype.addEvent = function() {
    var _this = this;

    this.node.addEventListener("canplay", this.canplay, false);
    this.node.addEventListener("error", this.error, false);
    this.node.addEventListener('ended', function() {
        if (_this.loop) {
            _this.play();
        } else {
            _this.isPlay = false;
        }
    }, false);
};

//加载音频
Audio.prototype.load = function() {
    if (!this.isLoad) {
        this.node.load();
    }

    return this;
};

//加载成功事件回调
Audio.prototype.canplay = function() {
    var _this = this;
    this.isLoad = true;
    this.isError = false;
    this.node.removeEventListener('canplay', this.canplay);

    this.callbackArr.forEach(function(cb) {
        cb.call(_this, 'success');
    });

    this.def.resolve(_this);

    if (this.autoPlay) {
        this.play();
    }
};

//加载失败事件回调
Audio.prototype.error = function() {
    var _this = this;
    this.isError = true;

    this.callbackArr.forEach(function(cb) {
        cb.call(_this, 'error');
    });

    this.def.reject(_this);

    throw 'Audio Error ' + this.src;
};

//注册加载成功回调函数
Audio.prototype.addCallback = function(callback) {
    if (isFunction(callback)) {
        this.callbackArr.push(callback);
    }
};

//播放
Audio.prototype.play = function() {
    if (this.isLoad) {
        this.isPlay = true;
        this.node.play();
    }
};

//暂停
Audio.prototype.stop = function() {
    if (this.isPlay) {
        this.isPlay = false;
        this.node.pause();
    }
};

//判断是否加载
Audio.prototype.getIsLoad = function() {
    return this.isLoad;
};

//判断是否正在播放
Audio.prototype.getIsPlay = function() {
    return this.isPlay;
};

//判断是否加载异常
Audio.prototype.getIsError = function() {
    return this.isError;
};

Audio.prototype.getPromise = function() {
    return this.def.promise;
};

//释放对象
Audio.prototype.freed = function() {
    this.node.removeEventListener('canplay', this.canplay);
    this.node.removeEventListener('error', this.error);

    this.src = null;

    this.preload = null;
    this.autoPlay = null;
    this.loop = null;
    this.callbackArr = null;
};

//删除
Audio.prototype.delete = function() {
    this.freed();

    for (var key in this) {
        if (hasOwnProperty.call(this, key)) {
            this[key] = null;
        }
    }
};

module.exports = Audio;