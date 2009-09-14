/*extern Xaos */
/*globals Enumerable */

//= require <xaos>

/**
 * Enumerable
 *
 * Usage:
 *
 *     obj.include(Enumerable);
 *
 * or:
 *
 *     obj = Xaos.extend(function(public) {
 *         public.include(Enumerable);
 *         public.each = function(func) {
 *             for (var i = 0; i < attribute_array.length; i += 1) {
 *                 func.call(this, attribute_array[i]);
 *             }
 *             return this;
 *         };
 *     });
 **/

Enumerable = Xaos.extend(function(public) {
    function to_value() {
        var args = Array.prototype.slice.call(arguments);
        if (arguments.length == 1) {
            return arguments[0];
        } else {
            return arguments;
        }
    }

    public.each = function(func) {
        var k;
        for (k in this) {
            if (this.hasOwnProperty(k)) {
                func.call(this, k, this[k]);
            }
        }
        return this;
    };

    public.map = function(func) {
        var r = [], that = this;
        this.each(function() {
            r.push(func.apply(that, arguments));
        });
        return r;
    };

    public.inject = function(init, func) {
        var r = init, that = this;
        this.each(function () {
            r = func.apply(that, [r].concat(arguments));
        });
        return r;
    };

    public.select = function(func) {
        return this.inject([], function(l, e) {
            return func(e) ? l.concat(e) : l;
        });
    };

    public.first = function() {
        var f;
        this.each(function() {
            if (typeof f == 'undefined') {
                f = to_value(arguments);
            }
        });
        return f;
    };

    public.last = function() {
        var l;
        this.each(function() {
            l = to_value(arguments);
        });
        return l;
    };
});
