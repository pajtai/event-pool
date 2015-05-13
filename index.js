'use strict';

var BB = require('bluebird');
BB.longStackTraces();

module.exports = Object.create({
    actions : {},
    labels : {},
    register : register,
    trigger : trigger,
    info : info,
    clear : clear
});

function info(actionName) {
    var keys = Object.keys(this.labels);
    return {
        count: this.actions[actionName].length,
        labels: keys.length ? keys : []
    }
}

function register(actionName, callback, label) {

    if (!this.actions[actionName]) {
        this.actions[actionName] = [];
    }

    if (label && !this.labels[label]) {
        this.labels[label] = true;
    }

    this.actions[actionName] = this.actions[actionName] || [];
    this.actions[actionName].push({
        callback: callback,
        label: label
    });
    return this.actions[actionName].length;
}

function trigger(actionName, payload) {

    var response = {};
    payload = payload || {};

    return BB
        .map(this.actions[actionName], function (action) {
            var callback = action.callback,
                label = action.label,
                res;

            if (payload[label]) {
                res = callback(payload[label]);
                response[label] = response[label] || [];
                return BB
                    .resolve(res)
                    .then(function(resolved) {
                        response[label].push(resolved);
                        return response;
                    });
            } else {
                return BB
                    .resolve(callback())
                    .then(function() {
                        return response;
                    });
            }

        })
        .then(function(r) {
            return response;
        })

}

function clear() {
    this.actions = {};
    this.labels = {};
}