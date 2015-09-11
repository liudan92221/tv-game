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