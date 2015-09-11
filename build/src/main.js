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