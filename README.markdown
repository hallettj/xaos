Xaos: a prototypal inheritance pattern for JavaScript
=======================================================

JavaScript is a very flexible language.  Its support for prototypal inheritance
is a rare but powerful feature.  And its open objects and first-class methods
make JavaScript ideal for mixins.

Xaos provides a thin layer of support to leverage JavaScript's native features
in a clean, clear way.  Xaos eschews classical inheritance in favor of pure
prototyping.  Xaos also puts heavy emphasis on [mixins][], embraces Crockford's
[module pattern][], and gets along well with other inheritance patterns.

[mixins]: http://en.wikipedia.org/wiki/Mixin
[module pattern]: http://yuiblog.com/blog/2007/06/12/module-pattern/  "A JavaScript Module Pattern"

http://robertnyman.com/2008/10/06/javascript-inheritance-how-and-why/  

Usage example:

    var Parent = Xaos.extend(function(public) {
        function initialize(attrs) {
            for (var k in attrs) {
                this[k] = attrs[k];
            }
        }
        public.include(Enumerable);  // Enumerable is defined in `examples/`.
        public.initialize = initialize;
    });

    var Child = Parent.extend(function(public) {
        function describe() {
            return "My attributes are " +
                this.map(function(k, v) {  // `map` is defined by Enumerable.
                    return k + ": " + String(v);
                }).join(", ");
        }
        public.describe = describe;
    });

    var obj = Child.create({ foo: 1 })
    obj.bar = 2;

    obj.describe();  //=> "My attributes are foo: 1, bar: 2"


## The Basics ##

The most common uses of Xaos will be to create new objects that extend the
behavior of existing objects and to instantiate copies of existing objects.

The `extend()` method creates a new object that inherits from an existing
object.  `extend()` takes a function as an argument that defines new behavior:

    var obj = Xaos.extend(function(public) {
        function initialize(name) {
            this.name = name;
        }
        function introduce() {
            return "Hello, my name is " + this.name + ".";
        }
        public.initialize = initialize
        public.introduce  = introduce;
    });
    obj.introduce();  //=> "Hello, my name is undefined."

The `create()` method also creates a new object that inherits from an existing
object.  If the new object defines a method called `initialize()` then it will
be called with any arguments given to `create()`:

    var jesse = obj.create('Jesse');
    jesse.introduce();  //=> "Hello, my name is Jesse."

Another common use will be to mix in behavior from another object with the
`include()` method:

    jesse.include({ toString: function() { return this.name; } });
    String(jesse);  //=> "Jesse"


## Defining an object ##

`Xaos.extend()` creates a new object that inherits from the original and adds
new behavior to the new object.  This is analogous to creating a subclass in
classical inheritance; the word 'extend' is intended to be reminiscent of a
subclassing operation.

`Xaos` itself is intended to be an abstract object that all other objects can
inherit from.  So in many cases you will call `extend()` directly on `Xaos`.

`extend()` takes a function as an argument which acts as a module to define
behavior.  The function is invoked immediately in the context of the new
object; so `this` in the function definition is bound to the new object.  The
new object is also passed to the function as an argument.

    var clock = Xaos.extend(function(public) {
        function display_time() {
            return "The current time is: " + new Date();
        }
        public.display_time = display_time;
    });

    clock.display_time()  //=> "The current time is: Sun Sep 20 2009 18:26:30 GMT-0700 (PDT)"


### Why a function instead of an object literal? ###

A function that defines object behavior acts as a module.  It lets you hide
implementation details in the function scope.  This way you can define private
methods that give your objects rich behavior while keeping your interfaces
simple:

    var clock = Xaos.extend(function(public) {
        function format_time(time) {
            return String(time.getHours()) + ":" + String(time.getMinutes());
        }

        function display_time() {
            return "The current time is: " + format_time(new Date());
        }

        /* public interface */
        public.display_time = display_time;
    });

    clock.display_time()  //=> "The current time is: 18:26"

Any functions that you define inside the behavior definition are private by
default because they cannot be accessed from outside of the function body.  On
the other hand, functions that you assign to the new object become public
methods.  That is the reason for referring to the new object as `public` within
the behavior definition.


## Instantiating New Objects ##

In a prototypal pattern where there are no classes a method for defining
reusable behavior is to create an abstract object and then to create copies of
that object.  The abstract object fills a role similar to that of a class.

Xaos supports this approach with the `create()` method.  Calling `create()` on
an object will create a new object that inherits from the original.  If the new
object has an `initialize()` method that method will be called with any
arguments passed to `create()`.

    var Timer = Xaos.extend(function(public) {
        function initialize(start_time) {
            this.start_time = start_time;
        }

        function elapsed_time() {
            return Math.round(((new Date()) - this.start_time) / 60);
        }

        public.initialize   = initialize;
        public.elapsed_time = elapsed_time;
    });

    var lap_time = Timer.create(new Date());
    /* ... 28 seconds later ... */
    lap_time.elapsed_time();  //=> 28

You may find it helpful to capitalize names for objects that are intended to be
reused by copying.  But the distinction between abstract and non-abstract
objects is not as inflexible as the distinction between class and instance.
You can call methods on an abstract object and you can extend a non-abstract
object.


## Mixins ##

Mixins allow you to define objects by composition of reusable behaviors.
Mixins provide functionality similar to multiple inheritance but in a cleaner
way.

All objects created by `clone()`, `extend()`, and `create()` come with an
`include()` method.  `include()` copies properties from another object and
makes them available to the receiver.  For example:

    var obj = Xaos.create();
    obj.include(Enumerable);

You can also include mixins when extending an object:

    var obj = Xaos.extend(function(public) {
        public.include(Enumerable);
    });

`Enumerable` is an object defined in `examples/enumerable.js`.  `Enumerable`
defines various methods for operating on collections.  All of those methods are
defined in terms of a method called `each()`.  `Enumerable` has a default
definition for `each()` that iterates over the public properties of the
receiver:

    obj.foo = 1;
    obj.bar = 2;
    obj.each(function(k,v) { print(k + ': ' + v); });
    // outputs:
    // foo: 1
    // bar: 2

`include()` copies mixin properties onto an anonymous ancestor of the receiver;
so when you iterate over properties of `obj` with `each()` the methods included
from `Enumerable` are skipped over.

You can override the default definition of `each()` on any object that includes
`Enumerable` to make the methods of `Enumerable` operate differently:

    var PseudoArray = Xaos.extend(function(public) {
        public.include(Enumerable);

        function initialize(values) {
            this.values = values;
        }

        function each(func) {
            for (var i = 0; i < this.values.length; i += 1) {
                func(values[i]);
            }
        }

        public.each = each;
    });

    var a = PseudoArray.create([1, 2, 3, 4]);
    a.map(function(v) { return v * 2; });  //=> [2, 4, 6, 8]

The order in which you include mixins is important.  If any mixins provide
methods or attributes with the same name the mixin that is included last will
override the others.  But properties defined directly on an object will always
override properties mixed into that object.


## Private Variables ##

According to Crockford's [module pattern][], the way to create private
variables is to hide them in a function closure the same way we can define
private methods.  With Xaos the way to do that is to define private variables
inside an `initialize()` method:

    var counter = Xaos.extend(function(public) {
        function initialize(n) {
            var count = Number(n);
            this.increment = function() { return count += 1; };
            this.get_count = function() { return count; };
        }

        public.initialize = initialize;
    });

This approach can become cumbersome because any methods that access private
data must also be defined in the `initialize()` method.  So Xaos provides an
alternative mechanism for storing private data:

    var counter = Xaos.extend(function(public) {
        function initialize(n) {
            this.private.count = Number(n);
        }

        function increment() {
            return this.private.count += 1;
        }

        function get_count() {
            return this.private.count;
        }

        public.initialize = initialize;
        public.increment  = increment;
        public.get_count  = get_count;
    });

The `private` attribute is a store for private variables.  It is made available
to every object created via `Xaos.clone()`, `Xaos.extend()`, and
`Xaos.create()`.  `private` is assigned to an anonymous ancestor of each
object.  New objects will not inherit private variables from their parents
because Xaos will assign a new `private` attribute to each new object.

Because `private` is an inherited attribute of each object, it is technically
accessible from outside of each object.  So using private is not as secure as
hiding variables in a closure.  Keeping `private` private is a matter of good
practice.  Many languages have some sort of mechanism for accessing private
data in other objects.  But good programmers do not use those mechanisms except
maybe for debugging.

Whether the added convenience of `private` is worth the security tradeoff is up
to you.  Use whichever approach you are most comfortable with.


## License ##

Copyright (c) 2009 Jesse Hallett <hallettj@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

The Software shall be used for Good, not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
