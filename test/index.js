'use strict';

var BB =require('bluebird'),
    chai = require('chai'),
    actions = require('../index.js'),
    sinon = require('sinon'),
    should = chai.should(),
    sinonChai = require("sinon-chai");

chai.should();
chai.use(sinonChai);

describe('actions', function() {

    describe('register', function() {
        it('returns total number of registrations', function() {

            var test = actions.create();
            test.register('test', function() {}).should.equal(1);
            test.register('test', function() {}).should.equal(2);
        });
    });

    describe('trigger', function() {
        xit('fires the registered callbacks', function() {
            var cb = sinon.spy(),
                test = actions.create();

            test.register('test', cb);

            test.trigger('test');

            cb.should.have.been.called;
        });

        it('only resolves the action when the component is resolved', function(done) {
            var p1, r1, test, promised;

            p1 = new BB(function(resolve) {
                r1 = resolve;
            });

            test = actions.create();
            test.register('test', function() {
                return p1;
            });

            promised = test
                .trigger('test');

            promised.isPending().should.be.true;

            r1();

            process.nextTick(function() {

                promised.isPending().should.be.false;
                promised.isFulfilled().should.be.true;
                done();
            });
        });
    });
});
