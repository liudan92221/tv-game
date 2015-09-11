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