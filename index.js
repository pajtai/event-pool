'use strict';

var BB = require('bluebird');

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
            return BB.resolve(action.callback());
        });
}