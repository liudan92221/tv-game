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