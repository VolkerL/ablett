var Test = Test || {};
Test.Movement = Test.Movement || {};
var TestTMP = TestTMP || {};
TestTMP.Movement = TestTMP.Movement || {};
TestTMP.Movement.collide = {};


TestTMP.Movement.collide.createTwoMoves = function(
    width, height,
    texture1, startX1, startY1, speed1, dir1,
    texture2, startX2, startY2, speed2, dir2
) {
    return new TestCase(
        width,height,10,0.5,
        {characters : '../assets/characters.json'},
        function(field, resolver, renderer, stage) {
            this.p1 = TestUtils.spawn(texture1, field, startX1, startY1, stage);
            this.p2 = TestUtils.spawn(texture2, field, startX2, startY2, stage);
            this.field = field;
            this.resolver = resolver;
        },
        function() {
            TestUtils.reset(this.p1, this.field, startX1, startY1);
            TestUtils.reset(this.p2, this.field, startX2, startY2);
        },
        [function(timeline) {
            let move1 = undefined;
            if (speed1 > 0) {
                move1 = new MoveAction(this.p1, speed1, dir1);
                move1.prepareRound(this.resolver);
            }

            let move2 = undefined;
            if (speed2 > 0) {
                move2 = new MoveAction(this.p2, speed2, dir2);
                move2.prepareRound(this.resolver);
            }

            this.resolver.resolveRound();
            if (move1) {
                const t1 = new TimelineLite();
                move1.animate(t1, this.resolver);
                timeline.add(t1, 0);
            }
            if (move2) {
                const t2 = new TimelineLite();
                move2.animate(t2, this.resolver);
                timeline.add(t2, 0);
            }
        }]
    );
};

Test.Movement.CollideHorizontalOne = TestTMP.Movement.collide.createTwoMoves(
    3,1,'absR',0,0,1,Direction.RIGHT,'absL',2,0,1,Direction.LEFT
);
Test.Movement.CollideHorizontalThree = TestTMP.Movement.collide.createTwoMoves(
    5,1,'absR',0,0,3,Direction.RIGHT,'absL',4,0,3,Direction.LEFT
);
Test.Movement.CollideVerticalOne = TestTMP.Movement.collide.createTwoMoves(
    1,3,'absD',0,0,1,Direction.DOWN,'absU',0,2,1,Direction.UP
);
Test.Movement.CollideVerticalThree = TestTMP.Movement.collide.createTwoMoves(
    1,5,'absD',0,0,3,Direction.DOWN,'absU',0,4,3,Direction.UP
);
Test.Movement.CollideCrossOne = TestTMP.Movement.collide.createTwoMoves(
    2,2,'absR',0,0,1,Direction.RIGHT,'absU',1,1,1,Direction.UP
);
Test.Movement.CollideCrossThree = TestTMP.Movement.collide.createTwoMoves(
    3,3,'absL',2,2,3,Direction.LEFT,'absD',0,0,3,Direction.DOWN
);

Test.Movement.CollideSolidOne = TestTMP.Movement.collide.createTwoMoves(
    2,1,'absR',0,0,1,Direction.RIGHT,'absD',1,0,0,Direction.DOWN
);
Test.Movement.CollideSolidThree = TestTMP.Movement.collide.createTwoMoves(
    4,1,'absL',3,0,3,Direction.LEFT,'absD',0,0,0,Direction.DOWN
);
