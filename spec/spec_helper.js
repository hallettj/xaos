/*extern Screw */

Screw.Matchers.descend_from = {
    match: function(expected, actual) {
        return actual.descendant_of(expected);
    },

    failure_message: function(expected, actual, not) {
        return 'expected ' + Screw.$.print(actual) + (not ? ' to not ' : ' to ') + 'descend from ' + Screw.$.print(expected);
    }
};

module("Screw", function(c) { with (c) {
  constructor("Context", function() {
    include(Screw.Matchers);
    include(Screw.Keywords);
  });
}});
