/*extern Screw Proto */

//= require <proto>

Screw.Unit(function(unit) { with(unit) {
    describe('Proto', function() {
        it('defines an abstract object', function() {
            expect(Proto).to_not(be_undefined);
        });

        describe('clone()', function() {
            var clone;

            before(function() {
                clone = Proto.clone();
            });

            it('creates a clone', function() {
                expect(clone).to_not(be_undefined);
            });

            it('passes its methods to the clone', function() {
                expect(clone.clone).to(be_an_instance_of, Function);
            });

            it('passes a prototype property to the clone', function() {
                expect(clone.prototype).to(equal, Proto);
            });

            it('passes an `include` method to the clone', function() {
                expect(clone.include).to(be_an_instance_of, Function);
            });

            it('assigns `prototype` to an anymous ancestor of the clone', function() {
                expect(clone.hasOwnProperty('prototype')).to(be_false);
            });

            it('assigns `include` to an anonymous ancestor of the clone', function() {
                expect(clone.hasOwnProperty('include')).to(be_false);
            });
        });

        describe('include()', function() {
            var obj, module;

            before(function() {
                obj = Proto.clone();
                module = {
                    foo: 'foo',
                    bar: 'bar',
                    nao: 'nao'
                };
            });

            it('makes given properties available on the receiver', function() {
                obj.include(module);
                expect(obj.foo).to(equal, 'foo');
            });

            it('assigns properties to an anonymous ancestor of the receiver', function() {
                obj.include(module);
                expect(obj.hasOwnProperty('foo')).to(be_false);
            });

            it('filters properties as they are added', function() {
                obj.include(module, 'bar', 'nao');
                expect(obj.foo).to(be_undefined);
                expect(obj.bar).to(equal, 'bar');
                expect(obj.nao).to(equal, 'nao');
            });

            it('returns the modified object', function() {
                expect(obj.include(module)).to(equal, obj);
            });
        });

        describe('create()', function() {
            var obj, Foo;

            before(function() {
                obj = Proto.create();
                Foo = Proto.clone();
            });

            it('creates a new object', function() {
                expect(Proto.create()).to_not(be_undefined);
            });

            it('makes the new object inherit from itself', function() {
                expect(obj.create).to(be_an_instance_of, Function);
                expect(obj.prototype).to(equal, Proto);
            });

            it('calls `initialize` on the new object', function() {
                var called = false;
                Foo.initialize = function() { called = true; }
                Foo.create();
                expect(called).to(be_true);
            });

            it('passes arguments given to `create` on to `initialize`', function() {
                var first, second;
                Foo.initialize = function(a, b) { first = a; second = b; }
                Foo.create('foo', 'bar');
                expect(first).to(equal, 'foo');
                expect(second).to(equal, 'bar');
            });

            it('does not fail if the new object has no `initialize` method', function() {
                expect(Foo.initialize).to(be_undefined);
                expect(function() { Foo.create; }).to_not(throw_exception);
            });
        });

        describe('extend()', function() {
            var Foo;

            before(function() {
                Foo = Proto.clone();
            });

            it('creates a new object', function() {
                expect(Proto.extend(function() {})).to_not(be_undefined);
            });

            it('makes the new object inherit from the receiver', function() {
                var obj = Proto.extend(function() {});
                expect(obj.extend).to(be_an_instance_of, Function);
                expect(obj.prototype).to(equal, Proto);
            });

            it('does not call `initialize` on the new object', function() {
                var called = false;
                Foo.initialize = function() { called = true; }
                Foo.extend(function() {});
                expect(called).to(be_false);
            });

            it('accepts a callback that defines new behavior', function() {
                var called = false;
                Proto.extend(function() { called = true });
                expect(called).to(be_true);
            });

            it('throws an error if no callback is given', function() {
                expect(function() { Proto.extend(); }).to(throw_exception);
            });

            it('passes the new object as the first argument to the callback', function() {
                var first, obj;
                obj = Proto.extend(function(arg) { first = arg; });
                expect(first).to(equal, obj);
            });

            it('assigns the new object as the value of `this` when invoking the callback', function() {
                var first, obj;
                obj = Proto.extend(function() { first = this; });
                expect(first).to(equal, obj);
            });
    
            it('returns the return value of the callback if there is one', function() {
                var obj;
                obj = Proto.extend(function() { return 'foo'; });
                expect(obj).to(equal, 'foo');
            });

            it('mixes in the `prototype` property of the callback', function() {
                var obj, F = function() {};
                F.prototype = { foo: 'bar' };
                obj = Proto.extend(F);
                expect(obj.foo).to(equal, 'bar');
            });

            it('applies properties from the callback prototype to a singleton', function() {
                var obj, F = function() {};
                F.prototype = { foo: 'bar' };
                obj = Proto.extend(F);
                expect(obj.hasOwnProperty('foo')).to(be_false);
            });
        });

        describe('descendant_of()', function() {
            var ancestor, obj;

            describe('when the argument descends from Proto', function() {
                before(function() {
                    ancestor = Proto.clone();
                });

                it('returns true if the receiver descends from the given object', function() {
                    obj = ancestor.clone();
                    expect(obj.descendant_of(ancestor)).to(be_true);
                });

                it('returns false if the receiver does not descend from the given object', function() {
                    obj = Proto.clone();
                    expect(obj.descendant_of(ancestor)).to(be_false);
                });
            });

            describe('when the argument does not descend from Proto', function() {
                before(function() {
                    var C = function() {};
                    ancestor = new C();
                });

                it('returns true if the receiver descends from the given object', function() {
                    obj = Proto.clone.call(ancestor);
                    obj.include(Proto);
                    expect(obj.descendant_of(ancestor)).to(be_true);
                });

                it('returns false if the receiver does not descend from the given object', function() {
                    obj = Proto.clone();
                    expect(obj.descendant_of(ancestor)).to(be_false);
                });
            });
        });

        describe('ancestor_of()', function() {
            var ancestor;

            before(function() {
                ancestor = Proto.clone();
            });

            it('returns true if the argument descends from the receiver', function() {
                obj = ancestor.clone();
                expect(ancestor.ancestor_of(obj)).to(be_true);
            });

            it('returns false if the argument does not descend from the receiver', function() {
                var F = function() {};
                obj = new F();
                expect(ancestor.ancestor_of(obj)).to(be_false);
            });
        });
    });
} });
