//= require <proto>

Screw.Unit(function(unit) { with(unit) {
    describe('Proto', function() {
        it('defines an abstract object', function() {
            expect(Proto).to_not(be_undefined);
        });
    });
} });
