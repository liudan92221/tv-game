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