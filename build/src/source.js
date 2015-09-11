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