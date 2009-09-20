/*globals Xaos */

/**
 * Xaos
 *
 * Xaos is an abstract object that includes support for creating inheritance
 * hierarchies and for extending objects with mixins.
 **/
Xaos = (function() {
    var public;

    // From jQuery.
    function inArray( elem, array ) {
        for ( var i = 0, length = array.length; i < length; i++ ) {
            // Use === because on IE, window == document
            if ( array[ i ] === elem ) {
                return i;
            }
        }

        return -1;
    }

    function merge(other/*, attrs */) {
        var k, attrs = Array.prototype.slice.call(arguments, 1);
        for (k in other) {
            if (other.hasOwnProperty(k) && (attrs.length === 0 || inArray(k, attrs) != -1)) {
                this[k] = other[k];
            }
        }
        return this;
    }

    /**
     * Xaos.clone() -> Xaos
     *
     * Returns a new object that inherits from the receiver.  An anynomous
     * object is also injected into the inheritance chain as an ancestor of the
     * new object.  The anonymous object is defined with the following properties:
     *
     * - `prototype`: a reference to the parent object
     * - `private`:   a store for private variables
     * - `include()`: a method to mix behavior into the new object
     **/
    function clone() {
        var F, G, singleton, obj;

        F = function() {};
        F.prototype = this;
        singleton = new F();

        G = function() {};
        G.prototype = singleton;
        obj = new G();

        /**
         * Xaos.prototype
         *
         * Acts as a reference to this object's parent.
         **/
        singleton.prototype = this;

        /**
         * Xaos.private
         *
         * Space to store any private variables.  This is meant to only be used
         * internally.
         **/
        singleton.private = {};

        /**
         * Xaos.include(other[, attr1, attr2, ...]) -> Xaos
         * - other (Object): another object to mix in behavior from
         *
         * Mixes in properties from another object into the receiver.  The
         * properties of `other` are copied onto an anonymous ancestor of the
         * receiver.
         *
         * If any attribute names are specified as string arguments then only
         * those attributes will be copied from `other`.
         **/
        singleton.include = function(other/*, attrs */) {
            var target, receiver;
            if (this === obj) {
                target = singleton;
                receiver = obj;
            } else {
                target = this;
                receiver = this;
            }
            merge.apply(target, Array.prototype.slice.call(arguments));
            return receiver;
        };

        return obj;
    }

    /**
     * Xaos.create([arg1, arg2, ...]) -> Xaos
     *
     * Creates and initializes a new object that inherits from the receiver.
     * If the new object has an `initialize()` method defined it will be called
     * with any arguments passed to `create()`.
     **/
    function create(/* args */) {
        var args = Array.prototype.slice.call(arguments),
            obj  = clone.call(this);
        if (typeof obj.initialize == 'function') {
            obj.initialize.apply(obj, args);
        }
        return obj;
    }

    /**
     * Xaos.extend(module) -> Xaos
     * - module (Function): behavior that defines the new object
     *
     * Creates a new object that inherits from the receiver and imparts the new
     * object with behavior defined by the given `module`.
     *
     * `module` is invoked immediately in the context of the new object - the
     * value of `this` in the definition of `module` will be bound to the new
     * object.  The new object is also passed to `module` as an argument.
     *
     * If `module` has a `prototype` property then that property will be mixed
     * into the new object before `module` is called.
     *
     * Returns the new object, or the return value of `module` if there is one.
     **/
    function extend(module) {
        var obj = clone.call(this);
        if (typeof module != 'function') {
            throw new TypeError('Expected extend() to be given a function as an argument.');
        }
        if (module.prototype) {
            obj.include(module.prototype);
        }
        return module.call(obj, obj) || obj;
    }

    /**
     * Xaos.alias_method_chain(method_name, desc) -> Xaos
     * - method_name (String): name of the method to extend
     * - desc (String): string to identify extended method definition
     *
     * Used as a helper to extend existing method definitions.  For example,
     * given a method of the receiver called `value` consider this invocation:
     *
     *     obj.alias_method_chain('value', 'emphasis');
     *
     * The existing `value` method will be renamed to
     * `value_without_emphasis` and a method called `value_with_emphasis`
     * will be renamed to `value`.  The latter method may define new behavior
     * and call the original method internally.  For example:
     *
     *     obj.value_with_emphasis = function() {
     *         return this.value_without_emphasis() + '!!';
     *     };
     *
     * Returns the receiver.
     **/
    function alias_method_chain(method_name, desc) {
        var old_method = [method_name, 'without', desc].join('_'),
            new_method = [method_name, 'with',    desc].join('_');
        this[old_method]  = this[method_name];
        this[method_name] = this[new_method];
        return this;
    }

    /**
     * Xaos.descendant_of(other) -> true | false
     * - other (Object): alleged ancestor of the receiver
     *
     * Returns true if the receiver inherits from `other` and false otherwise.
     **/
    function descendant_of(other) {
        var r, token = String(new Date());
        other[token] = true;
        r = !!this[token];
        delete other[token];
        return r;
    }

    /**
     * Xaos.ancestor_of(other) -> true | false
     * - other (Object): alleged descendant of the receiver
     *
     * Returns true if `other` inherits from the receiver and false otherwise.
     **/
    function ancestor_of(other) {
        return descendant_of.call(other, this);
    }

    /* public interface */
    public = clone.call(Object.prototype);
    public.clone              = clone;
    public.include            = public.include;  // Assign `include` directly to `public`.
    public.create             = create;
    public.extend             = extend;
    public.alias_method_chain = alias_method_chain;
    public.descendant_of      = descendant_of;
    public.ancestor_of        = ancestor_of;

    return public;
})();
