(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./deferred":3,"./util":14}],2:[function(require,module,exports){
/**
 * Created by liudan on 15/6/21.
 */
'use strict';
var Util = require('./util');
var isObject = Util.isObject;
var isArray = Util.isArray;
var isFunction = Util.isFunction;

/**
 *
 * @param colls  {array}
 * [
 *      {
 *          name: string 碰撞名字,
 *          obj1: object || array 对象1,
 *          obj2: object || array 对象2,
 *          state: boolean 检测是否打开 true:开启, false:关闭
 *          scope: number 碰撞范围
 *          //scopeX: number X方向上碰撞范围
 *          //scopeY: number Y方向上碰撞范围
 *          callback: function 碰撞触发回调函数
 *      }
 * ]
 *
 */
function Collision(colls, _this) {
    this.colls = isArray(colls) ? colls : isObject(colls) ? [colls] : [];

    this._this = _this || this;

    this.nameObj = {};
    this.init();
}

Collision.prototype.init = function() {
    var colls = this.colls;
    var temp = null;

    for (var i = 0, len = colls.length; i < len; i++) {
        temp = colls[i];
        temp.obj1 = isFunction(temp.obj1) ? temp.obj1.call(this._this) : temp.obj1;
        temp.obj2 = isFunction(temp.obj2) ? temp.obj2.call(this._this) : temp.obj2;
        temp.scope = temp.scope || 20;
//        temp.scopeX = temp.scopeX || temp.scope || 20;
//        temp.scopeY = temp.scopeY || temp.scope || 20;
        this.nameObj[temp.name] = temp;
    }
};

//注册一个碰撞
Collision.prototype.register = function(coll) {
    if (isObject(coll)) {
        this.colls.push(coll);
    } else if (isArray(coll)) {
        this.colls = this.colls.concat(coll);
    }

    return this;
};

Collision.prototype.getCollision = function() {
    return this.colls;
};

//开启指定name碰撞
Collision.prototype.openByName = function(name) {
    var coll = this.nameObj[name];
    if (coll) {
        coll.state = true;
    }

    return this;
};

//关闭指定name碰撞
Collision.prototype.closeByName = function(name) {
    var coll = this.nameObj[name];
    if (coll) {
        coll.state = false;
    }

    return this;
};

//检测碰撞入口
Collision.prototype.detect = function() {
    var colls = this.colls;
    var temp = null;

    for (var i = 0, len = colls.length; i < len; i++) {
        temp = colls[i];
        if (temp.state) {
            this._detect(temp);
        }
    }
};

//检测指定name的碰撞
Collision.prototype.detectByName = function(name) {
    var coll = this.nameObj[name];
    if (coll) {
        this._detect(coll);
    }

    return this;
};

//碰撞检测
Collision.prototype._detect = function(coll) {
    var _this = this;
    var obj1 = coll.obj1;
    var obj2 = coll.obj2;
    obj1 = isArray(obj1) ? obj1 : [obj1];
    obj2 = isArray(obj2) ? obj2 : [obj2];
//    var temp1 = null;
//    var temp2 = null;
    var x = 0;
    var y = 0;
    var scope = 0;

    obj1.forEach(function(temp1) {
        if (!temp1.centerPosition || !temp1.state) {
            return;
        }

        obj2.forEach(function(temp2) {
            if (!temp2.centerPosition || !temp2.state) {
                return;
            }

            x = Math.abs(temp1.centerPosition.x - temp2.centerPosition.x);
            y = Math.abs(temp1.centerPosition.y - temp2.centerPosition.y);
            scope = Math.sqrt((x*x)+(y*y));


            if (scope < coll.scope) {
                coll.callback.call(_this._this, temp1, temp2);
            }
        });
    });
//    for (var i = 0,len1 = obj1.length;i < len1;i++) {
//        for (var j = 0,len2 = obj2.length;j < len2;j++) {
//
//            temp1 = obj1[i];
//            temp2 = obj2[j];
//            x = Math.abs(temp1.position.x - temp2.position.x);
//            y = Math.abs(temp1.position.y - temp2.position.y);
//
//            if (x < scope && y < scope) {
//                callback(temp1, temp2);
//            }
//        }
//    }
};

//删除对象
Collision.prototype.delete = function() {
    for (var key in this) {
        if (hasOwnProperty.call(this, key)) {
            this[key] = null;
        }
    }
};

module.exports = Collision;
},{"./util":14}],3:[function(require,module,exports){
/**
 * Created by liudan on 15/7/10.
 *
 * deferred模块
 */
var forEach = (function(){
    if(Array.prototype.forEach){
        return function(arr, fn){
            Array.prototype.forEach.call(arr, fn);
        }
    }else {
        return function(arr, fn){
            for(var i= 0, ln = arr.length;i < ln;i++){
                fn(arr[i], i);
            }
        }
    }
})();

var deferred = function(){
    var _this = this;
    _this.state = "default";
    _this.value = "";
    _this.successCallbacklist = [];
    _this.errorCallbacklist = [];

    _this.promise = new promise(_this);
};

//deferred失败接口，接收失败或者错误参数
deferred.prototype.resolve = function (value){
    if(this.state == "default"){
        this.state = "resolved";
        this.value = value;

        var _this = this;
        forEach(this.successCallbacklist, function(item){
            _this.promise.success(item);
        });
    }
};

//deferred成功接口，接收数据参数
deferred.prototype.reject = function (value){
    if(this.state == "default"){
        this.state = "rejected";
        this.value = value;

        var _this = this;
        forEach(this.errorCallbacklist, function(item){
            _this.promise.error(item);
        });
    }
};

function promise(def){
    this.def = def;

    this.__type__ = "promiseA";
}

//注册成功回调方法和失败回调方法
promise.prototype.then = function (succCallback, errCallback){
    return this.success(succCallback).error(errCallback);
};

//注册成功或者失败的回调方法
promise.prototype.always = function(callback){
    return this.success(callback).error(callback);
};

//注册成功回调方法
promise.prototype.success = function (callback){
    if(this.def.state == "resolved"){
        var tempValue = callback.call(this, this.def.value);
        if(tempValue){
            if(tempValue.__type__ == "promiseA"){
                this.def.promise = tempValue;
            }else{
                this.def.value = tempValue
            }
        }
    }else{
        this.def.successCallbacklist.push(callback);
    }
    return this.def.promise;
};

//注册失败回调方法
promise.prototype.error = function(callback){
    if(this.def.state == "rejected"){
        var tempValue = callback.call(this, this.def.value);
        if(tempValue){
            if(tempValue.__type__ == "promiseA"){
                this.def.promise = tempValue;
            }else{
                this.def.value = tempValue
            }
        }
    }else{
        this.def.errorCallbacklist.push(callback);
    }
    return this.def.promise;
};

//私有方法，获取deferred当前的状态
promise.prototype._getState = function(){
    return this.def.state;
};

//私有方法，获取deferred的value
promise.prototype._getValue = function(){
    return this.def.value;
};

//注册所有promise对象
promise.prototype.all = function(promises){
    var _this = this;
    promises = promises instanceof Array ? promises : [promises];

    forEach(promises, function(item){
        item.always(function(){
            var state = true,
                isState = true,
                args = [];

            forEach(promises, function(pro){
                if(isState){
                    if(pro._getState() === "default"){
                        state = false;
                    }else {
                        if(pro._getState() === "rejected"){
                            isState = false;
                            args = pro._getValue();
                        }else {
                            args.push(pro._getValue());
                        }
                    }
                }
            });

            if(isState){
                if(state){
                    _this.def.resolve(args);
                }
            }else {
                _this.def.reject(args);
            }
        });
    });

    return this;
};

//注册所有promise对象和成功回调函数、失败回调函数
promise.prototype.when = function(promise, succCallback, errCallback){
    if((promise instanceof Array && promise.length) || promise.__type__ == "promiseA"){
        return this.all(promise).success(succCallback).error(errCallback);
    }else{
        this.def.resolve(promise);
        return this.success(succCallback).error(errCallback);
    }
};

module.exports = deferred;
},{}],4:[function(require,module,exports){
/**
 * Created by liudan on 15/6/17.
 */
'use strict';
var Util = require('./util');
var isArray = Util.isArray;
var isNumber = Util.isNumber;
var isObject = Util.isObject;
var isString = Util.isString;

var loopFunc = Util.loopFunc;

/**
 *
 * @param node  {object}  目标节点
 * @param classNames  {array}  gif所有图片对应的class数组
 * @param timeout  {number}  一次动画所需时间
 * @param state  {boolean} 是否马上开始动画
 * @param loop  {number} 动画循环次数，不传就是无限循环
 *
 */
function Gif(node, classNames, timeout, state, loop) {
    if (!node) {
        throw 'Gif node is not defined';
    }
    this.node = node;
    this.classNames = isArray(classNames) ? classNames : [];
    this.pageSize = classNames.length;
    this.nowPage = 0;
    this.timeout = isNumber(timeout) ? timeout : 2000;

    this.loop = isNumber(loop) ? loop : false;

    this.state = true; //gif图状态，true: 正常, false: 暂停
    this.pageTime = parseInt(this.timeout / 1000 / this.pageSize * 60, 10); //每张图片所占用帧数

//    var one = classNames[0];
//    this.addStyle(one);

    if (state) {
        this.run();
    }
}

Gif.prototype.removeStyle = function() {
    for (var i = 0,len = this.classNames.length;i < len;i++) {
        this.node.classList.remove(this.classNames[i]);
    }
};

Gif.prototype.addStyle = function(style) {
    if (isString(style)) {
        this.removeStyle();
        this.node.classList.add(style);

    } else if (isObject(style)) {

        for (var k in style) {
            if (style.hasOwnProperty(k)) {
                this.node.style[k] = style[k];
            }
        }
    }
};

Gif.prototype.run = function(nowPage) {
    var _this = this;
    var time = 0;
    var pageTime = this.pageTime;
    this.nowPage = nowPage ? nowPage : 0;
    var maxPage = this.pageSize - 1;

    var loop = this.loop;

    var prev = '';
    var next = '';

    this.addStyle(this.classNames[this.nowPage]);

    function run() {
        if (_this.state) {
            if (time === pageTime) {
                prev = _this.classNames[_this.nowPage];
                _this.nowPage++;

                if (isNumber(loop) && _this.nowPage === maxPage) {
                    loop--;
                }

                _this.nowPage = _this.nowPage > maxPage ? 0 : _this.nowPage;
                next = _this.classNames[_this.nowPage];

                _this._run(prev, next);

                time = 0;
            } else {
                time++;
            }
        } else {
            return;
        }

        if (isNumber(loop) && loop === 0) {
            return;
        }

        loopFunc(run);
    }

    this.state = true;
    loopFunc(run);
    return this;
};

Gif.prototype._run = function(prev, next) {
    var key = '';

    if (isString(prev)) {
        this.node.classList.remove(prev);
    } else if (isObject(prev)) {
//        var keyExp = '';

        if (isObject(next)) {
            for (key in prev) {
                if (prev.hasOwnProperty(key) && !next.hasOwnProperty(key)) {
//                    keyExp += '|'+key;
                    delete this.node.style[key];
                }
            }
        } else {
            for (key in prev) {
                if (prev.hasOwnProperty(key)) {
//                    keyExp += '|'+key;
                    delete this.node.style[key];
                }
            }
        }

//        var cssText = this.node.cssText;
//
//        if (keyExp) {
//            keyExp = keyExp.slice(1, keyExp.length)+'(.+)?;';
//            var exp = new RegExp(keyExp, 'g');
//
//            cssText = cssText.replace(exp, function(){
//                return '';
//            });
//        }
//
//        this.node.cssText = cssText;
    }


    if (isString(next)) {
        this.node.classList.add(next);
    } else if (isObject(next)) {
//        var styleText = '';

        for (key in next) {
            if (next.hasOwnProperty(key)) {
//                styleText += key + ':' +next[key] + ';';
                this.node.style[key] = next[key];
            }
        }
//        this.node.cssText = this.node.cssText ? this.node.cssText + styleText : styleText;
    }

//    console.log(this.node.style['zIndex']);
};

Gif.prototype.getShowFrame = function() {
    return this.nowPage;
};

Gif.prototype.reset = function() {
    this.run(0);
};

Gif.prototype.clear = function() {
    this.stop();
    this.removeStyle();
};

Gif.prototype.go = function() {
    this.run(this.nowPage);
    return this;
};

Gif.prototype.stop = function() {
    this.state = false;
    return this;
};

module.exports = Gif;
},{"./util":14}],5:[function(require,module,exports){
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
},{"./deferred":3,"./util":14}],6:[function(require,module,exports){
/**
 * Created by liudan on 15/7/20.
 */
'use strict';
var Util = require('./util');
var isNumber = Util.isNumber;

function Integration(obj) {
    this.int = isNumber(obj.initInt) ? obj.initInt : 0;
    this.changeNum = isNumber(obj.changeNum) ? obj.changeNum : 1;
}

Integration.prototype.add = function(changeNum) {
    this.int += isNumber(changeNum) ? changeNum : this.changeNum;
};

Integration.prototype.sub = function(changeNum) {
    this.int -= isNumber(changeNum) ? changeNum : this.changeNum;
};

Integration.prototype.getInt = function() {
    return this.int;
};

Integration.prototype.delete = function() {
    this.int = null;
    this.changeNum = null;
};

module.exports = Integration;
},{"./util":14}],7:[function(require,module,exports){
/**
 * Created by liudan on 15/6/18.
 */
'use strict';
var Gif = require('./gif');
var Util = require('./util');
var isObject = Util.isObject;
var isArray = Util.isArray;
var isString = Util.isString;
var isFunction = Util.isFunction;
/**
 *
 * @param target {object} 容器节点
 * @param obj {object}
 *     - position: {x:0, y:0},  初始位置
 *     - suffix 'rem', 单位
 *     - speed: 10, 移动速度
 *     - pxToRem: 192  px转rem的换算值
 * @param extend {object} 扩展方法
 * @param gif {object}  gif动画
 *     - change: [],
 *     - time: 1000
 */
function Lead(target, obj, extend, gif) {
    if (!target) {
        throw 'target is not define';
    }

    this.node = null;
    this.target = target;
    if (obj.target && isString(obj.target)) {
      this.target = target.querySelectorAll(obj.target)[0];
    }
    this.width = obj.width || 0;
    this.height = obj.height || 0;
    this.position = obj.position || {x: 0, y: 0};
    this.centerPosition = {x: this.position.x + this.width/2, y: this.position.y + this.height/2};

    this.templateNode = obj.templateNode || 'div';
    this.template = obj.template || '';

    this.suffix = obj.suffix || 'px';
    this.speed = obj.speed || 10;
    this.pxToRem = obj.pxToRem || 1;

    if (obj.className) {
        this.className = obj.className.split(' ');
    } else {
        this.className = [];
    }
    this.style = obj.style || {};
    this.extend = isObject(extend) ? extend : {};
    this.gif = null;

    this.isGo = true;

    this.state = 1;

    this.init(gif);
    this.move();
}

Lead.prototype.init = function(gif) {
    this.node = document.createElement(this.templateNode);

    for (var i = 0,len = this.className.length;i < len;i++) {
        this.node.classList.add(this.className[i]);
    }

    this.node.innerHTML = this.template;
    this.target.appendChild(this.node);

    for (var styleKey in this.style) {
        if (this.style.hasOwnProperty(styleKey)) {
            this.node.style[styleKey] = this.style[styleKey];
        }
    }
    
    for (var key in this.extend) {
        if (this.extend.hasOwnProperty(key) && !this[key]) {
            this[key] = this.extend[key];
        }
    }

    if (isObject(gif)) {
        this.gif = new Gif(this.node, gif.change, gif.time, gif.state, gif.loop);
    } else if (isArray(gif)) {
        this.gif = {};
        for (var i = 0;i < gif.length;i++) {
            if (gif[i].name)
                this.gif[gif[i].name] = new Gif(this.node, gif[i].change, gif[i].time, gif[i].state, gif[i].loop);
        }
    }
//    this.node.style.willChange = 'transform';
//    this.node.style.webkitTransition = 'transform .2s linear';
};

//获取节点对象
Lead.prototype.getDOMNode = function() {
    return this.node;
};

//渲染出目标
Lead.prototype.move = function() {
    var x = this.position.x / this.pxToRem;
    var y = this.position.y / this.pxToRem;
    var suffix = this.suffix;
    this.node.style.webkitTransform = 'translate3d('+ x + suffix +', '+ y + suffix +', 0)';
};

//获取位置
Lead.prototype.getPosition = function() {
    return this.position;
};

//获取中心位置
Lead.prototype.getCenterPosition = function() {
    return this.centerPosition;
};

//向上移动
Lead.prototype.up = function(speed) {
    if (!this.isGo) {
        return;
    }
    speed = speed ? speed : this.speed;

    this.position.y -= speed;
    this.centerPosition.y -= speed;
    this.move();
};

//向下移动
Lead.prototype.down = function(speed) {
    if (!this.isGo) {
        return;
    }
    speed = speed ? speed : this.speed;

    this.position.y += speed;
    this.centerPosition.y += speed;
    this.move();
};

//向左移动
Lead.prototype.left = function(speed) {
    if (!this.isGo) {
        return;
    }
    speed = speed ? speed : this.speed;

    this.position.x -= speed;
    this.centerPosition.x -= speed;
    this.move();
};

//向右移动
Lead.prototype.right = function(speed) {
    if (!this.isGo) {
        return;
    }
    speed = speed ? speed : this.speed;

    this.position.x += speed;
    this.centerPosition.x += speed;
    this.move();
};

//开启移动
Lead.prototype.go = function() {
    this.isGo = true;
};

//关闭移动
Lead.prototype.stop = function() {
    this.isGo = false;
};

//获取当前移动开启状态
Lead.prototype.getIsGo = function() {
    return this.isGo;
};

//删除对象
Lead.prototype.delete = function() {
    this.node.parentNode.removeChild(this.node);

    for (var key in this) {
        if (hasOwnProperty.call(this, key)) {
            this[key] = null;
        }
    }
};

module.exports = Lead;
},{"./gif":4,"./util":14}],8:[function(require,module,exports){
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
},{"./util":14}],9:[function(require,module,exports){
/**
 * Created by liudan on 15/7/14.
 */
var Stage = require('./stage');
var Loop = require('./loop');
var Gif = require('./gif');
var Lead = require('./lead');
var MonsterModule = require('./monsterModule');
var Collision = require('./collision');
var Track = require('./track');
var Integration = require('./integration');
var Source = require('./source');
var Util = require('./util');

var isObject = Util.isObject;
var isArray = Util.isArray;
var isFunction = Util.isFunction;

/**
 *
 * @param obj {object}
 *      - config: {     配置项
 *          suffix: 'px',
            pxToRem: 1
 *      }
 *
 *      - resource: {   资源
 *          source: [   资源数组
 *              {
 *                  type: 'image',  类型
 *
 *              }
 *          ],
 *
 *          success: {function},
 *          error: {function}
 *      }
 *
 *      - stage: {  舞台对象
 *          node: {node}, 舞台节点对象(必传)
 *          gif: {
 *              change: [], 改变数组
 *              time: 1000  一组动画时间长度,毫秒
 *          }
 *      },
 *
 *      - lead: {  主角对象
 *          node: {node}, 主角对象(选传)
 *          gif: {},
 *
 *          parameter: {object}, 参数
 *          extend: {object}, lead对象上新增方法
 *      },
 *
 *      - monster: [  生成怪兽模板
 *          {
 *              name: '', 模板唯一名字
 *              init: {function}, 初始化函数
 *              gif: {
 *                  change: [], 改变数组
 *                  time: 1000  一组动画时间长度,毫秒
 *              }
 *              parameter: {object}, 参数
 *              extend: {object} 生成对象上新增方法
 *          }
 *      ],
 *
 *      - track: {  生成道路
 *          node: {node}, 道路节点
 *          parameter: {object}, 参数
 *      },
 *
 *      - integration: {
 *          init: {function},  初始化函数
 *          parameter: {
 *              initInt: 0,    初始化积分
 *              changeNum: 1   每次改变积分
 *          }
 *      },
 *
 *      - collision: [  碰撞检测
 *          {
 *
 *          }, 参数
 *      ],
 *
 *      - loop: {
 *          init: {function}, 初始化函数
 *
 *          frameCallback: {function}, 每帧回调函数
 *
 *          endCallback: {function}, 结束回调函数
 *
 *          stopCallback: {function}, 暂停回调函数
 *
 *          isWriteTime: true
 *      }
 */
function Game(obj) {
    if (!obj || !obj.stage || !obj.stage.node) {
        throw 'param is error';
    }

    //配置项
    this.config = isObject(obj.config) ? obj.config : {};

    //生成舞台
    this.stage = makeStage(obj.stage);

    //生成lead
    this.lead = null;
    this.setLead(obj.lead);

    //生成怪兽模板
    this.monster = {};
    this.setMonsterModule(obj.monster);

    //生成道路
    this.track = null;
    this.setTrack(obj.track);

    //生成积分
    this.integration = null;
    this.setInt(obj.integration);

    //生成碰撞检测
    this.collision = makeCollision(obj.collision, this);

    //生成loop
    this.loop = makeLoop(isObject(obj.loop) ? obj.loop : {}, this);

    //资源加载
    this.resource = null;
    this.setResource(obj.resource);

    if (obj.loop && isFunction(obj.loop.init)) {
        obj.loop.init.call(this.loop);
    }

//    if (isFunction(obj.init)) {
//        obj.init.call(this);
//    }
}

Game.util = Util;

//删除
Game.prototype.delete = function() {
    this.loop && this.loop.delete && this.loop.delete();
    this.collision && this.collision.delete && this.collision.delete();
    this.resource && this.resource.delete && this.resource.delete();
    for (var k in this.monster) {
        if (hasOwnProperty.call(this.monster, k)) {
            this.monster[k].delete();
        }
    }
    this.lead && this.lead.delete && this.lead.delete();
    this.integration && this.integration.delete && this.integration.delete();
    this.track && this.track.delete && this.track.delete();
    this.stage && this.stage.delete && this.stage.delete();
};

//加载资源
Game.prototype.setResource = function(resource) {
    if (isObject(resource) && !this.resource) {
        this.resource = new Source(resource, this);
    }
};

//生成lead
Game.prototype.setLead = function(lead) {
    if (isObject(lead) && !this.lead) {
        this.makeLead(lead);
    }
    return this;
};

Game.prototype.makeLead = function(lead) {
    this.lead = new Lead(this.stage.node, extendConfig(this.config, lead.parameter), lead.extend, lead.gif);
};

//生成怪兽模板
Game.prototype.setMonsterModule = function(arr) {
    if (isArray(arr) && arr.length) {
        this.makeMonster(arr, this.stage);
    }
    return this;
};

Game.prototype.makeMonster = function(monsterList, stage) {
    var _this = this;
    var monsterModule = this.monster;

    monsterList.forEach(function(monster) {
        if (!monster.name) {
            throw 'monster.name is not defined';
        }
        var m = new MonsterModule(monster.name, stage.node, extendConfig(_this.config, monster.parameter), monster.extend, monster.gif, _this);
        monsterModule[monster.name] = m;

        if (isFunction(monster.init)) {
            monster.init.call(m);
        }
    });
};

//生成道路
Game.prototype.setTrack = function(track) {
    if (isObject(track) && !this.track) {
        this.track = new Track(this.stage.node, extendConfig(this.config, track.parameter));
    }

    return this;
};

//生成积分
Game.prototype.setInt = function(int) {
    if (isObject(int) && !this.integration) {
        this.integration = new Integration(int.parameter);

        if (isFunction(int.init)) {
            int.init.call(this.integration);
        }
    }
};

function extendConfig(config, item) {
    for (var key in config) {
        if (hasOwnProperty.call(config, key)) {
            item[key] = item[key] ? item[key] : config[key];
        }
    }

    return item;
}

//生成stage
function makeStage(stage) {
    var s = new Stage(stage.node);

    if (stage.gif) {
        s.gif = new Gif(stage.node, stage.gif.change, stage.gif.time);
    }

    return s;
}

//生成lead
//function makeLead(lead) {
//    return new Lead(lead.node, lead.parameter, lead.extend, lead.gif);
//}

//生成碰撞检测
function makeCollision(collision, game) {
    return new Collision(collision, game);
}

//生成loop
function makeLoop(loop, game) {
    return new Loop(loop, loop.extend, game);
}

window.Game = Game;

module.exports = Game;
},{"./collision":2,"./gif":4,"./integration":6,"./lead":7,"./loop":8,"./monsterModule":10,"./source":11,"./stage":12,"./track":13,"./util":14}],10:[function(require,module,exports){
/**
 * Created by liudan on 15/6/20.
 */

'use strict';

var Gif = require('./gif');
var Util = require('./util');
var isObject = Util.isObject;
var isArray = Util.isArray;
var isFunction = Util.isFunction;
var isNumber = Util.isNumber;
var isString = Util.isString;
/**
 *
 * @param name  {string} module名字
 * @param target {object} 容器节点
 * @param obj {object}
 *     - position: {x:0, y:0},  初始位置
 *     - style: {},  初始css属性
 *     - target: string, stage中的节点class或者id
 *     - className: string, 类名
 *     - templateNode: 'div', 外部节点
 *     - template: '<div></div>', 节点模板
 *     - suffix: 'px', 单位
 *     - speed: 10, 移动速度
 *     - pxToRem: 192,  px转rem的换算值
 *     - width: 0,  对象宽度
 *     - height: 0, 对象高度
 *     - border: {top: 0, bottom: 1080, left: 0, right: 1920} 对象活动的范围
 *     - detectBorder: {top: false, bottom: false, left: true, right: false}
 * @param extend {object} 扩展方法
 * @param gif {object}
 *     - change {array}, 改变class或者样式数组
 *     - time 1000, 一轮播放的时间
 *  @param _this {object} 回调函数的this指向
 */
function MonsterModule(name, target, obj, extend, gif, _this) {
    if (!name || !target) {
        throw 'param is error';
    }

    this.name = name || "";
    this.target = target;
    this.singleArr = [];

    if (obj.target && isString(obj.target)) {
        this.target = target.querySelectorAll(obj.target)[0];
    }

    this.style = obj.style || {};
    if (obj.className) {
        this.className = obj.className.split(' ');
    } else {
        this.className = [];
    }
    this.templateNode = obj.templateNode || 'div';
    this.template = obj.template || '';
    this.suffix = obj.suffix || 'px';
    this.speed = obj.speed || 30;
    this.pxToRem = obj.pxToRem || 1;

    this.width = obj.width || 0;
    this.height = obj.height || 0;
    this.position = obj.position || {x: 0, y: 0};
    this.centerPosition = {x: this.position.x + this.width/2, y: this.position.y + this.height/2};
    this.border = obj.border || {top: 0, bottom: 1080, left: 0, right: 1920};
    this.detectBorder = obj.detectBorder || {top: true, bottom: true, left: true, right: true};

    this.borderCallback = isFunction(obj.borderCallback) ? obj.borderCallback : function(){};

    this.gif = gif;

    this._this = _this || this;

    this.events = {};

    this.extend = extend || {};
}

function Single(_super, id, position, centerPosition) {
    this._super = _super;
    this.node = null;
    this.id = id;
    this.state = 1;

    this.position = {
        x: position.x || 0,
        y: position.y || 0
    };

    this.centerPosition = {
        x: centerPosition.x || this._super.centerPosition.x,
        y: centerPosition.y || this._super.centerPosition.y
    };

    this.init();
}

//产生一个对象
MonsterModule.prototype.make = function(position) {
    var id = new Date().getTime();

    position = position ? position : this.position;
    var centerPosition = {x: position.x + this.width/2, y: position.y + this.height/2};
    var item = new Single(this, id, position, centerPosition);

    var extend = this.extend;
    for (var key in extend) {
        if (hasOwnProperty.call(extend, key) && !item[key]) {
            item[key] = extend[key];
        }
    }

    item.gif = null;
    if (isObject(this.gif)) {
        item.gif = new Gif(item.node, this.gif.change, this.gif.time, this.gif.state, this.gif.loop);
    } else if (isArray(this.gif)) {
        item.gif = {};
        for (var i = 0;i < this.gif.length;i++) {
            item.gif[this.gif[i].name] = new Gif(item.node, this.gif[i].change, this.gif[i].time, this.gif[i].state, this.gif[i].loop);
        }
    }

    this.singleArr.push(item);

    return item;
};

//删除指定对象
MonsterModule.prototype.remove = function(param, cb, timeout) {
    var id = '';

    if (isObject(param) && param._super && param._super.name === this.name) {
        id = param.id;
    } else {
        id = param;
    }

    var arr = this.singleArr;
    var temp = null;

    for (var i = 0, len = arr.length; i < len; i++) {
        temp = arr[i];

        if (id === temp.id) {
//            arr.splice(i, 1);
            temp._remove(cb, timeout);
            break;
        }
    }
};

//清除对象
MonsterModule.prototype.clearSingle = function() {
    var arr = this.singleArr;
    for (var i = arr.length - 1;i >= 0;i--) {
        if (!arr[i].state) {
            arr[i] = arr[arr.length-1];
            arr.pop();
        }
    }
};

//获取所有对象
MonsterModule.prototype.getSingles = function() {
    this.clearSingle();
    return this.singleArr;
};

//获取所有对象
MonsterModule.prototype.getSinglesNum = function() {
    return this.singleArr.length;
};

//事件绑定
MonsterModule.prototype.on = function(type, callback) {
    var _this = this;
    var cb = [];

    if (isFunction(callback)) {
        cb.push(callback);
    } else if (isArray(callback)) {
        for (var i = 0,len = callback.length;i < len;i++) {
            var tempCb = callback[i];
            if (isFunction(tempCb)) {
                cb.push(tempCb);
            }
        }
    }

    if (this.events[type]) {
        this.events[type] = this.events[type].concat(cb);
    } else {
        this.events[type] = cb;
    }

    document.addEventListener(type, function(e) {
        var node = e.target;

        if (node.getAttribute('data-monster-type') !== _this.name) {
            while(node = node.parentNode) {
                if (node.getAttribute && node.getAttribute('data-monster-type') === _this.name) {
                    break;
                }
            }
        }

        if (!node) {
            return;
        }

        var events = _this.events[type];
        _this.getSingles().forEach(function(item) {
            if (item.node === node) {
                for (var i = 0,len = events.length;i < len; i++) {
                    events[i].call(item._super, {target: item, type: type});
                }
            }
        });
    }, false);
};

//删除
MonsterModule.prototype.delete = function() {
    var len = this.singleArr.length;
    for (var i = 0;i < len;i++) {
        this.singleArr[i].remove();
    }

    for (var key in this) {
        if (hasOwnProperty.call(this, key)) {
            this[key] = null;
        }
    }
};

//----Single-----

//初始化
Single.prototype.init = function() {
    var node = this.node = document.createElement(this._super.templateNode);
    var _super = this._super;
    var style = _super.style;

    for (var i = 0,len = _super.className.length;i < len;i++) {
        node.classList.add(_super.className[i]);
    }

    node.setAttribute('data-monster-type', _super.name);

    for (var key in style) {
        node.style[key] = style[key];
    }
    this.move();

    node.innerHTML = _super.template;
    _super.target.appendChild(node);
};

//移动
Single.prototype.move = function() {
    var x = this.position.x / this._super.pxToRem;
    var y = this.position.y / this._super.pxToRem;
    var suffix = this._super.suffix;

    this.node.style.webkitTransform = 'translate3d('+ x + suffix +', '+ y + suffix +', 0)';
};

//向上移动
Single.prototype.up = function(speed) {
    if (!this.state) {
        return;
    }
    speed = speed ? speed : this._super.speed;

    this.position.y -= speed;
    this.centerPosition.y -= speed;
    this.move();
    this.detectBorder();
};

//向下移动
Single.prototype.down = function(speed) {
    if (!this.state) {
        return;
    }
    speed = speed ? speed : this._super.speed;

    this.position.y += speed;
    this.centerPosition.y += speed;
    this.move();
    this.detectBorder();
};

//向左移动
Single.prototype.left = function(speed) {
    if (!this.state) {
        return;
    }
    speed = speed ? speed : this._super.speed;

    this.position.x -= speed;
    this.centerPosition.x -= speed;
    this.move();
    this.detectBorder();
};

//向右移动
Single.prototype.right = function(speed) {
    if (!this.state) {
        return;
    }

    speed = speed ? speed : this._super.speed;

    this.position.x += speed;
    this.centerPosition.x += speed;
    this.move();
    this.detectBorder();
};

//边界判断
Single.prototype.detectBorder = function() {
    var detectBorder = this._super.detectBorder;
    var border = this._super.border;
    var x = this.centerPosition.x;
    var y = this.centerPosition.y;

    if (detectBorder.left && x < border.left) {
        this._super.borderCallback.call(this._super._this, {target: this, type: 'left'});
        return;
    }

    if (detectBorder.bottom && y > border.bottom) {
        this._super.borderCallback.call(this._super._this, {target: this, type: 'bottom'});
        return;
    }

    if (detectBorder.right && x > border.right) {
        this._super.borderCallback.call(this._super._this, {target: this, type: 'right'});
        return;
    }

    if (detectBorder.top && y < border.top) {
        this._super.borderCallback.call(this._super._this, {target: this, type: 'top'});
    }
};

//获取位置
Single.prototype.getPosition = function() {
    return this.position;
};

//获取中心位置
Single.prototype.getCenterPosition = function() {
    return this.centerPosition;
};

//获取对象的name
Single.prototype.getName = function() {
    return this._super.name;
};

//获取对象的DOM
Single.prototype.getDOM = function() {
  return this.node;
};

//对象绑定事件
Single.prototype.on = function(type, callback) {
    this.node.addEventListener(type, callback, false);

    return this;
};

//删除自己
Single.prototype.remove = function(cb, timeout) {
    this._super.remove(this.id, cb, timeout);
};

Single.prototype._remove = function(cb, timeout) {
    var _this = this;
    this.state = 0;
    if (isFunction(cb)) {
        cb.call(this);
    }

    timeout = isNumber(timeout) ? timeout : 1;

    setTimeout(function() {
        _this.node.parentNode.removeChild(_this.node);

        for (var key in _this) {
            if (hasOwnProperty.call(_this, key)) {
                _this[key] = null;
            }
        }
        _this.state = 0;
        _this = null;
    }, timeout);
};

module.exports = MonsterModule;
},{"./gif":4,"./util":14}],11:[function(require,module,exports){
/**
 * Created by liudan on 15/7/10.
 *
 * 资源加载模块
 */
'use strict';
var deferred = require('./deferred');
var Img = require('./image');
var Audio = require('./audio');
var Util = require('./util');
var isObject = Util.isObject;
var isString = Util.isString;
var isArray = Util.isArray;
var isFunction = Util.isFunction;
/**
 *
 * @param obj {object}
 *     - source: [
 *          {
 *              type: 'image', 资源类型 image/audio
 *              name: '', 唯一name
 *              parameter: {
 *
 *              }
 *          }
 *     ],
 *
 *     - success: {function}
 *     - error: {function}
 * @param _this {object} 回调函数的this指向
 */
function Source(obj, _this) {
    this.source = isArray(obj.source) ? obj.source : [];
    this.success = isFunction(obj.success) ? obj.success : function(){};
    this.error = isFunction(obj.error) ? obj.error : function(){};

    this._this = _this || this;

    //存放资源对象
    this.tree = {
        image: {},
        audio: {}
    };

    this.init();
}

Source.prototype.init = function() {
    var _this = this;
    var _def = new deferred();
    var _defs = [];

    this.source.forEach(function(item) {
        var oLoad = null;
        if (isObject(item.parameter) && item.name) {
            switch (item.type) {
                case 'image':
                    oLoad = new Img(item.parameter);
                    _this.tree.image[item.name] = oLoad;
                    _defs.push(oLoad.getPromise());
                    break;
                case 'audio':
                     oLoad = new Audio(item.parameter).load();
                    _this.tree.audio[item.name] = oLoad;
                    _defs.push(oLoad.getPromise());
                    break;
            }
        } else if (isString(item)) {
            _defs.push(new Img({src: item}).getPromise());
        }
    });

//    var k = null;
//    var image = this.tree.image;
//    var audio = this.tree.audio;
//    for (k in image) {
//        if (hasOwnProperty.call(image, k) && image[k].getPromise) {
//            _defs.push(image[k].getPromise());
//        }
//    }
//
//    for (k in audio) {
//        if (hasOwnProperty.call(audio, k) && audio[k].getPromise) {
//            _defs.push(audio[k].getPromise());
//        }
//    }

    _def.promise.when(_defs, function(arr) {
        _this.success.call(_this._this, arr);
    }, function(err) {
        _this.error.call(_this._this, err);
    })
};

//获取指定资源对象
Source.prototype.get = function(type, name) {
    if (!type) {
        return this.tree;
    }

    if (!name) {
        return this.tree[type];
    }

    return this.tree[type][name];
};

//删除
Source.prototype.delete = function() {
    var tree = this.tree;

    for (var type in tree) {
        if (hasOwnProperty.call(tree, key)) {
            var typeSource = tree[type];
            for (var name in typeSource) {
                if (hasOwnProperty.call(typeSource, name)) {
                    typeSource[name].delete();
                    typeSource[name] = null;
                }
            }
            typeSource = null;
        }
    }

    for (var key in this) {
        if (hasOwnProperty.call(this, key)) {
            this[key] = null;
        }
    }
};

module.exports = Source;
},{"./audio":1,"./deferred":3,"./image":5,"./util":14}],12:[function(require,module,exports){
/**
 * Created by liudan on 15/7/3.
 */

/**
 *
 * @param node  {object} 目标节点
 *
 */
function Stage(node) {
    if (!node) {
        throw 'node is not define';
    }

    this.node = node;
}

//Stage.prototype.add = function(module) {
//    this.node.appendChild(module.node);
//};

Stage.prototype.delete = function() {
    this.node = null;
};

module.exports = Stage;
},{}],13:[function(require,module,exports){
/**
 * Created by liudan on 15/7/14.
 */
var Util = require('./util');
var isObject = Util.isObject;
/**
 *
 * @param target  {object}  容器节点
 * @param obj  {object}
 *     - type: 'left', left向左，right向右，top向上，bottom向下
 *     - suffix: 'rem', 单位
 *     - speed: 10, 移动速度
 *     - start: 0, 起始位置
 *     - end: 100, 结束位置
 *     - pxToRem: 192  px转rem的换算值
 */

function Track(target, obj) {
    if (!target) {
        throw 'node is not defined';
    }

    this.node = null;
    this.target = target;
    this.type = obj.type || 'left';
    this.suffix = obj.suffix || 'px';
    this.speed = obj.speed || 10;
    this.start = obj.start || 0;
    this.end = obj.end || 0;
    this.pxToRem = obj.pxToRem || 1;

    this.className = obj.className || '';
    this.templateNode = obj.templateNode || 'div';
    this.template = obj.template || '';
    this.style = isObject(obj.style) ? obj.style : {};

    this.position = this.start;
    this.transformText = 'translate3d({num}, 0, 0)';

    this.state = true;

    this.init();
}

Track.prototype.init = function() {
    this.node = document.createElement(this.templateNode);

    this.node.classList.add(this.className);

    this.node.innerHTML = this.template;
    this.target.appendChild(this.node);

    if (this.type === 'left' || this.type === 'right') {
        this.transformText = 'translate3d({num}, 0, 0)';
    } else if (this.type === 'top' || this.type === 'bottom') {
        this.transformText = 'translate3d(0, {num}, 0)';
    } else {
        throw 'type is error';
    }

    if (this.type === 'top' || this.type === 'left') {
        this.speed = -this.speed;
        this.start = -this.start;
        this.end = -this.end;
        this.position = -this.position;
    }

    for (var key in this.style) {
        if (hasOwnProperty.call(this.style, key)) {
            this.node.style[key] = this.style[key];
        }
    }

    this.move();
};

Track.prototype.move = function() {
    this.node.style.webkitTransform = this.transformText.replace(/\{num\}/g, (this.position / this.pxToRem)+this.suffix);
};

//跑起来
Track.prototype.run = function() {
    if (!this.state) {
        return;
    }

    if (this.type === 'top' || this.type === 'left') {
        var value = Math.abs(this.position) - Math.abs(this.end);
    } else {
        value = this.position - this.end;
    }

    if (value < 0) {
        this.position += this.speed;
    } else {
        this.position = this.start;
    }

    this.move();
};

//开启
Track.prototype.go = function() {
    this.state = true;
};

//关闭
Track.prototype.stop = function() {
    this.state = false;
};

//删除
Track.prototype.delete = function() {
    this.node.parentNode.removeChild(this.node);

    for (var key in this) {
        if (hasOwnProperty.call(this, key)) {
            this[key] = null;
        }
    }
};

module.exports = Track;
},{"./util":14}],14:[function(require,module,exports){
/**
 * Created by liudan on 15/6/21.
 *
 * util模块
 */
var deferred = require('./deferred');

function isType(type) {
    return function(value) {
        return Object.prototype.toString.call(value) === '[object '+ type +']';
    }
}

var Util = {
    isArray: Array.isArray || isType('Array'),
    isNumber: isType('Number'),
    isFunction: isType('Function'),
    isObject: isType('Object'),
    isString: isType('String'),

    loopFunc: window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (cb) {
            return setTimeout(cb, 16);
        },

    deferred: deferred
};

module.exports = Util;
},{"./deferred":3}]},{},[9]);
