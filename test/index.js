'use strict';

var chai = require('chai'),
    actions = require('../index.js'),
    should = chai.should();

describe('actions', function() {

    describe('register', function() {
        it('returns total number of registrations', function() {

            var test = actions.create();
            test.register('test', function() {}).should.equal(1);
            test.register('test', function() {}).should.equal(2);
        });
    });

    describe('trigger', function() {
        it('fires the registered callbacks', function() {

        });
    });
});
