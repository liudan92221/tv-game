/**
 * Created by liudan on 15/6/17.
 */
'use strict';
var Util = require('./util');
var isFunction = Util.isFunction;
var isObject = Util.isObject;

var loopFunc = Util.loopFunc;

var RUN = 1, //游戏正在进行
    END = 0, //游戏结束
    STOP = 2,//游戏暂停
    WAIT = -1;//游戏等待中

/**
 *
 * @param obj  {object}
 * {frameCallback: 每帧运行方法, endCallback: 游戏结束回调, stopCallback: 暂停回调, isWriteTime: 是否记录时间, isFps: 是否计算fps}
 * @param extend {object} 扩展方法
 * @param _this  {object} 回调函数的this指向
 */
function GameLoop (obj, extend, _this) {
    this.state = WAIT;  //0: 游戏结束, 1: 游戏正在进行, 2: 游戏暂停
    this.beforeState = WAIT; //上一帧状态

    this.loopState = false; //loop状态

    this.frameCallbackArr = [];
    this.endCallbackArr = [];
    this.stopCallbackArr = [];

    if (isFunction(obj.frameCallback)) {
        this.frameCallbackArr.push(obj.frameCallback);
    }

    if (isFunction(obj.endCallback)) {
        this.endCallbackArr.push(obj.endCallback);
    }

    if (isFunction(obj.stopCallback)) {
        this.stopCallbackArr.push(obj.stopCallback);
    }

    this.isWriteTime = !!obj.isWriteTime;

    this.isFps = !!obj.isFps;

    this.tempStopCallback = null;

    this.gameTime = 0;
    this.runTime = 0;
    this.beginTime = null;
    this.endTime = null;
    this.beforeTime = null;

    this.lastTime = null;
    this.fpsNum = 0;

    this.extend = isObject(extend) ? extend : {};

    this._this = _this || this;

    this.init();
}

GameLoop.prototype.init = function() {
    for (var key in this.extend) {
        this[key] = this.extend[key];
    }

    if (this.isFps) {
        var showFpsNode = this.showFpsNode = document.createElement('span');
        showFpsNode.style.position = 'absolute';
        showFpsNode.style.top = '0px';
        showFpsNode.style.right = '0px';
        showFpsNode.style.background = 'rgba(58, 58, 58, 0.10)';
        showFpsNode.style.fontSize = '34px';
        showFpsNode.style.color = '#000000';

        document.body.appendChild(showFpsNode);
    }
};

GameLoop.prototype.distribution = function() {
    switch (this.state) {
        case END:
            this._endCallback();
            break;

        case RUN:
            this._frame();
            break;

        case STOP:
            this._stopCallback();
            break;
    }
};

GameLoop.prototype.loop = function() {
    var _this = this;
    function loop() {

        _this.distribution();

        if (_this.state === END){
            _this.loopState = false;
            return;
        }

        loopFunc(loop);
        _this.showFps();
        _this.loopState = true;
    }

    loopFunc(loop);
    this.loopState = true;

    return this;
};

//显示fps
GameLoop.prototype.showFps = function() {
    var lastTime = this.lastTime;

    if (!this.isFps || !lastTime || !this.showFpsNode) {
        if (this.isFps) {
            this.lastTime = new Date().getTime();
        }

        return;
    }

    var nowTime = new Date().getTime();
    this.lastTime = nowTime;

    if (this.fpsNum === 10) {
        this.fpsNum = 0;
    } else {
        this.fpsNum++;
        return;
    }

    var fps = Math.floor(1000 / (nowTime - lastTime));


    this.showFpsNode.innerHTML = fps + ' fps';
};

//每帧运行方法
GameLoop.prototype._frame = function() {
    this.frameCallbackArr.forEach(function(cb) {
        isFunction(cb) && cb.call(this._this, this);
    }, this);

    this.beforeState = RUN;
};

//游戏结束运行方法
GameLoop.prototype._endCallback = function() {
    this.endCallbackArr.forEach(function(cb) {
        isFunction(cb) && cb.call(this._this, this);
    }, this);

    this.beforeState = END;
};

//游戏暂停运行方法
GameLoop.prototype._stopCallback = function() {
    if (this.beforeState === STOP) return;

    this.stopCallbackArr.forEach(function(cb) {
        isFunction(cb) && cb.call(this._this, this);
    }, this);

    if (this.tempStopCallback) {
        this.tempStopCallback.call(this._this, this);
        this.tempStopCallback = null;
    }

    this.beforeState = STOP;
};

//游戏开始
GameLoop.prototype.begin = function() {
    if (this.beforeState === END) {
        this.reset();
    }

    this.state = RUN;

    this.writeTime();
    return this;
};

//游戏结束
GameLoop.prototype.end = function() {
    this.state = END;

    this.writeTime();
    return this;
};

//游戏暂停，可注册本次暂停的临时callback方法
GameLoop.prototype.stop = function(tempStopCallback) {
    this.tempStopCallback = isFunction(tempStopCallback) ? tempStopCallback : null;
    this.state = STOP;

    this.writeTime();
    return this;
};

//重置游戏
GameLoop.prototype.reset = function(callback) {
    if (this.beforeState === END && !this.loopState) {
        this.state = WAIT;
        this.beforeState = WAIT;

        this.writeTime();
        if (isFunction(callback)) {
            callback.call(this);
        }

        this.loop();
    }
};

//获取游戏状态
GameLoop.prototype.getState = function() {
    return this.state;
};

//写入游戏时间
GameLoop.prototype.writeTime = function() {
    if (!this.isWriteTime) {
        return;
    }
    var nowTime = new Date().getTime();

    switch (this.state) {
        case END:
            this.endTime = this.endTime ? this.endTime : nowTime;
            this.gameTime = this.endTime - this.beginTime;

            if (this.beforeState === RUN) {
                this.runTime = this.runTime + nowTime - this.beforeTime;
            }

            break;

        case RUN:
            if (this.beforeState !== RUN || this.beforeState !== END) {
                this.beforeTime = nowTime;
                this.beginTime = this.beginTime ? this.beginTime : nowTime;
            }
            break;

        case STOP:
            if (this.beforeState === RUN) {
                this.runTime = this.runTime + nowTime - this.beforeTime;
            }
            break;
        case WAIT:
            this.gameTime = 0;
            this.runTime = 0;
            this.beginTime = null;
            this.endTime = null;
            this.beforeTime = null;
            break;
    }
};

//获取当前游戏时间
GameLoop.prototype.getTime = function() {
    if (!this.isWriteTime) {
        return {gameTime: 0, runTime: 0};
    }
    var nowTime = new Date().getTime();

    switch (this.state) {
        case END:
            return {
                gameTime: this.gameTime,
                runTime: this.runTime
            };
            break;

        case RUN:
            return {
                gameTime:  nowTime - this.beginTime,
                runTime: this.runTime + nowTime - this.beforeTime
            };
            break;

        case STOP:
            return {
                gameTime: nowTime - this.beginTime,
                runTime: this.runTime
            };
            break;
        case WAIT:
            return {
                gameTime: this.gameTime,
                runTime: this.runTime
            };
            break;
    }
};

//开启计时
GameLoop.prototype.openTime = function() {
    this.isWriteTime = true;
    return this;
};

//关闭计时
GameLoop.prototype.closeTime = function() {
    this.isWriteTime = false;
    return this;
};

//注册帧方法
GameLoop.prototype.frame = function(frameCallback) {
    if (isFunction(frameCallback)) {
        this.frameCallbackArr.push(frameCallback);
    }

    return this;
};

//注册结束方法
GameLoop.prototype.registerEnd = function(endCallback) {
    if (isFunction(endCallback)) {
        this.endCallbackArr.push(endCallback);
    }

    return this;
};

//注册暂停方法
GameLoop.prototype.registerStop = function(stopCallback) {
    if (isFunction(stopCallback)) {
        this.stopCallbackArr.push(stopCallback);
    }

    return this;
};

//删除
GameLoop.prototype.delete = function() {
    if (this.isFps && this.showFpsNode) {
        this.showFpsNode.parentNode.removeChild(this.showFpsNode);
    }

    for (var key in this) {
        if (hasOwnProperty.call(this, key)) {
            this[key] = null;
        }
    }

    this.state = END;
};

module.exports = GameLoop;