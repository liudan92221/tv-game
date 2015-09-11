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