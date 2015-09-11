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