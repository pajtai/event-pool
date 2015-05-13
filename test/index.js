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

    afterEach(function() {
        actions.clear();
    });

    describe('register', function() {
        it('returns total number of registrations', function() {

            actions.register('test', function() {}).should.equal(1);
            actions.register('test', function() {}).should.equal(2);
        });
    });

    describe('trigger', function() {
        it('fires the registered callbacks', function(done) {
            var cb = sinon.spy();

            actions.register('test', cb);

            actions.trigger('test');

            process.nextTick(function() {
                cb.should.have.been.called;
                done();
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

            actions.register('test', function() {
                return p1;
            });
            actions.register('test', function() {
                return p2;
            });

            promised = actions.trigger('test');

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
                        promised
                            .then(function() {
                                done();
                            });
                    });
            });
        });

        it('runs the hooks in parallel in the order registered', function(done) {
            var p1, r1, test, promised, spy = sinon.spy();

            p1 = new BB(function(resolve) {
                r1 = resolve;
            });

            actions.register('test', function() {
                spy('first hook');
                return p1;
            });

            actions.register('test', function() {
                spy('second hook');
                return 42;
            }, 'answer');

            promised = actions.trigger('test');

            process.nextTick(function() {
                spy.args.length.should.equal(2);
                spy.args[0][0].should.equal('first hook');
                spy.args[1][0].should.equal('second hook');
                r1();
            });

            promised.then(function(response) {
                done();
            });
        });

        it('propagates errors', function(done) {
            var p1, r1, test;

            p1 = new BB(function(resolve) {
                r1 = resolve;
            });

            actions.register('test', function() {
                return p1
                    .then(function() {
                        throw new Error('whoops');
                    });
            });

            r1();

            actions
                .trigger('test')
                .catch(function(error) {
                    error.message.should.equal('whoops');
                    done();
                });
        });

        describe('payloads', function() {
            it('can pass arguments to callback using labels', function(done) {

                actions.register('math', function(numa, numb) {
                    return numa * numb;
                }, 'multiply');

                actions
                    .trigger('math', {
                        multiply : [3, 2]
                    })
                    .then(function(response) {
                        response.multiply.should.deep.equal( [ 6 ] );
                        done();
                    })
                    .catch(done);
            });

            it('can mix async and sync callbacks', function(done) {

                actions.register('math', function(num) {
                    return num * num;
                }, 'square');

                actions.register('math', function(num) {
                    return new BB(function (resolve) {
                        process.nextTick(function() {
                            return resolve(num * num);
                        });
                    });
                }, 'square');

                actions
                    .trigger('math', {
                        square : [3]
                    })
                    .then(function(response) {
                        response.square.should.deep.equal( [ 9, 9 ] );
                        done();
                    });
            });
        });
    });

    describe('info', function() {
        it('returns the total number of registered hooks for an action name', function() {
            actions.register('test', function() {});
            actions.info('test').should.deep.equal({
                count: 1,
                labels: []
            });
            actions.register('test', function() {});
            actions.info('test').should.deep.equal({
                count: 2,
                labels: []
            })
        });

        it('return the label used', function() {
            actions.register('test', function() {}, 'zeta');
            actions.info('test').should.deep.equal({
                count: 1,
                labels: ['zeta']
            });
        });

        it('return all the labels used in order of registration', function() {
            actions.register('test', function() {}, 'zulu');
            actions.register('test', function() {}, 'alpha');
            actions.register('test', function() {}, 'tango');
            actions.info('test').should.deep.equal({
                count: 3,
                labels: ['zulu', 'alpha', 'tango']
            });
        });
    });
});
