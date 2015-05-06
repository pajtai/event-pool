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
        it('fires the registered callbacks', function() {
            var cb = sinon.spy(),
                test = actions.create();

            test.register('test', cb);

            test.trigger('test');

            process.nextTick(function() {
                cb.should.have.been.called;
            });
        });

        it('raw promises can be passed', function(done) {
            var r,
                p = new BB(function(resolve) {
                    r = resolve
                }),
                test = actions.create();

            test.register('test', p);

            test
                .trigger('test')
                .then(function() {
                    done();
                });

            process.nextTick(function() {
                p.isPending().should.be.true;
                r();
            });
        });

        it('only resolves the hook when all actions are resolved', function(done) {
            var p1, r1, p2, r2, test, promised;

            p1 = new BB(function(resolve) {
                r1 = resolve;
            });
            p2 = new BB(function(resolve) {
                r2 = resolve;
            });

            test = actions.create();
            test.register('test', function() {
                return p1;
            });
            test.register('test', function() {
                return p2;
            });

            promised = test.trigger('test');

            process.nextTick(function() {
                promised.isPending().should.be.true;

                r1();

                p1
                    .then(function() {
                        promised.isPending().should.be.true;
                        r2();
                        return p2;
                    })
                    .then(function() {
                        promised.isResolved().should.be.true;
                        done();
                    });
            });
        });

        it('propagates errors', function(done) {
            var p1, r1, p2, r2, test, promised;

            p1 = new BB(function(resolve) {
                r1 = resolve;
            });

            test = actions.create();
            test.register('test', function() {
                return p1
                    .then(function() {
                        throw new Error('whoops');
                    });
            });

            r1();

            test
                .trigger('test')
                .catch(function(error) {
                    error.message.should.equal('whoops');
                    done();
                });
        });
    });
});
