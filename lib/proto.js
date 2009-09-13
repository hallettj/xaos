/*globals Proto */

Proto = (function() {
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

    function merge(module/*, attrs */) {
        var k, attrs = Array.prototype.slice.call(arguments, 1);
        for (k in module) {
            if (module.hasOwnProperty(k) && (attrs.length === 0 || inArray(k, attrs) != -1)) {
                this[k] = module[k];
            }
        }
        return this;
    }

    function clone() {
        var F, G, singleton, obj;

        F = function() {};
        F.prototype = this;
        singleton = new F();

        G = function() {};
        G.prototype = singleton;
        obj = new G();

        singleton.prototype = this;
        singleton.singleton = singleton;
        singleton.include = function(module/*, attrs */) {
            merge.apply(singleton, Array.prototype.slice.call(arguments));
            return obj;
        };

        return obj;
    }
    
    function create(/* args */) {
        var args = Array.prototype.slice.call(arguments),
            obj  = clone.call(this);
        if (typeof obj.initialize == 'function') {
            obj.initialize.apply(obj, args);
        }
        return obj;
    }

    function extend(module/*, attrs */) {
        var obj = clone.call(this);
        if (typeof module == 'function') {
            if (module.prototype) {
                obj.include(module.prototype);
            }
            return module.call(obj, obj) || obj;
        } else {
            return merge.apply(obj, Array.prototype.slice.call(arguments));
        }
    }

    function descendant_of(other) {
        if (this === other) {
            return true;
        } else if (this.prototype) {
            return descendant_of.call(this.prototype, other);
        } else {
            return false;
        }
    }

    function ancestor_of(other) {
        return descendant_of.call(other, this);
    }

    /* public interface */
    public = clone.call(Object.prototype);
    public.merge         = merge;
    public.clone         = clone;
    public.create        = create;
    public.extend        = extend;
    public.descendant_of = descendant_of;
    public.ancestor_of   = ancestor_of;

    return public;
})();
