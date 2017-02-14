var Test = Test || {};
Test.Movement = Test.Movement || {};
var TestTMP = TestTMP || {};
TestTMP.Movement = TestTMP.Movement || {};
TestTMP.Movement.outofbounds = {};

TestTMP.Movement.outofbounds.createOne = function(dir) {
    return new TestCase(
        1,1,10,0.5,
        {characters : '../assets/characters.json'},
        function(field, resolver, renderer, stage) {
            this.p1 = TestUtils.spawn('absD', field, 0, 0, stage);
            this.field = field;
            this.resolver = resolver;
        },
        function() {
            this.field.getCell(0, 0).moveTo(this.p1);
        },
        [
            function(timeline) {
                // move the player out of bounds
                const move = new MoveAction(this.p1, 1, dir);
                move.prepareRound(this.resolver);
                this.resolver.resolveRound();

                move.animate(timeline, this.resolver);
            }
        ]
    );
};

Test.Movement.OutOfBoundsDown = TestTMP.Movement.outofbounds.createOne(Direction.DOWN);
Test.Movement.OutOfBoundsUp = TestTMP.Movement.outofbounds.createOne(Direction.UP);
Test.Movement.OutOfBoundsLeft = TestTMP.Movement.outofbounds.createOne(Direction.LEFT);
Test.Movement.OutOfBoundsRight = TestTMP.Movement.outofbounds.createOne(Direction.RIGHT);
