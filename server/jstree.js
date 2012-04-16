var getChildren = require('./getChildren');
var createNode = require('./createNode');
var removeNode = require('./removeNode');
var renameNode = require('./renameNode');
var moveNode = require('./moveNode');

exports.run = function(user, postValue, callback) {
    if (postValue.operation === 'get_children') {
        getChildren.run(user, postValue, callback);
    } else if (postValue.operation === 'create_node') {
        createNode.run(user, postValue, callback);
    } else if (postValue.operation === 'remove_node') {
        removeNode.run(user, postValue, callback);
    } else if (postValue.operation === 'rename_node') {
        renameNode.run(user, postValue, callback);
    } else if (postValue.operation === 'move_node') {
        moveNode.run(user, postValue, callback);
    }
};
