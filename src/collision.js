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