'use strict';

var _ = require('lodash');

module.exports = {
    create: create
};

function create() {
    return Object.create({
        register: register
    });
}

function register(actionName, callback, label) {

    this[actionName] = this[actionName] || [];
    this[actionName].push({
        callback: callback,
        lable: label
    });
    return this[actionName].length;
}