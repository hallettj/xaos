Xaos: in inheritance pattern for JavaScript
==============================================

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
        public.describe = function() {
            return "My attributes are " +
                (this.map(function(k, v) {  // `map` is defined by Enumerable.
                    return k + ": " + String(v);
                })).join(", ");
        }
    });

    var obj = Child.create({ foo: 1 })
    obj.bar = 2;

    obj.describe();  //=> My attributes are foo: 1, bar: 2


http://robertnyman.com/2008/10/06/javascript-inheritance-how-and-why/
http://yuiblog.com/blog/2007/06/12/module-pattern/
