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