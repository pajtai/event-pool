'use strict';

var BB = require('bluebird');
BB.longStackTraces();

module.exports = {
    create: create
};

function create() {
    return Object.create({
        register: register,
        trigger: trigger
    });
}

function register(actionName, callback, label) {

    this[actionName] = this[actionName] || [];
    this[actionName].push({
        callback: callback,
        label: label
    });
    return this[actionName].length;
}

function trigger(actionName, payload) {
    return BB
        .map(this[actionName], function(action) {
            var callback = action.callback;
            return callback instanceof BB ?
                callback :
                BB.resolve(callback());
        });
}