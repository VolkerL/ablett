/**
   A move action represents a move of 1 or more cells
   that should be done during 1 round.
 */
class MoveAction {
    /**
       entity: the entity to move.
       speed: the number of cells to move.
           TODO: for now you can't move more cells
           than the number of ticks per round.
           We can change that, but for now it's not required.
       direction: the Direction to move in.
           TODO: for now we can only move in one direction per round.
           We can change that, but for now it's not required.
     */
    constructor(entity, speed, direction) {
        this.entity = entity;
        this.speed = speed;
        this.direction = direction;
        this.deltaX = 0;
        this.deltaY = 0;

        /*
          Will be updated to represent the amount of ticks this move action
          should spend in each cell.
          This can be used to animate the move action.
         */
        this._ticksPerCell = undefined;

        // properties that may be set during resolution of the round
        this._toCell = undefined;
        this._moveFailedAt = undefined;

        let cellDim = entity.cell.field.cellDim;
        switch (direction) {
        case Direction.UP:
            this.deltaY -= cellDim;
            break;
        case Direction.DOWN:
            this.deltaY += cellDim;
            break;
        case Direction.LEFT:
            this.deltaX -= cellDim;
            break;
        case Direction.RIGHT:
            this.deltaX += cellDim;
            break;
        }
    }

    /*
      Spread this move action over the ticks for this round
     */
    prepareRound(resolver) {
        if (this.speed > resolver.ticksPerRound) {
            throw new Error("Can't move faster than the ticks per round");
        }

        if (this.speed === 0) {
            // we're not moving at all, kind of lame
            return;
        }

        // split the move into moves of 1 cell
        // spread these out over the available ticks

        const numCellsCovered = this.speed + 1;
        const ticksPerCell = Math.floor(resolver.ticksPerRound / numCellsCovered);
        this._ticksPerCell = ticksPerCell;
        const remainingTicks = resolver.ticksPerRound % numCellsCovered;

        for (let i = 1; i <= this.speed; i++) {
            let tick = i * ticksPerCell;

            // subscribe to the round resolver
            resolver.subscribe(
                tick,
                this._tick.bind(this),
                this._preTick.bind(this),
                this._postTick.bind(this)
            );
        }
    }

    // Subscription methods for the round resolver

    /*
      Before we make the move, we need to notify the field where we want to go.
      NOTE: be sure to bind its context to this move action
     */
    _preTick(tick) {
        // bail out if the move already failed
        if (this._moveFailedAt != undefined) return;

        let field = this.entity.cell.field;
        let fromCell = this.entity.cell;
        this._toCell = field.getNeighbour(fromCell, this.direction);
        if (this._toCell != Cell.OutOfBounds) {
            this._toCell.futureOccupants.push(this.entity);
        }
    }

    /*
      Check to see if the move is allowed and deal with whatever we walk into
      NOTE: be sure to bind its context to this move action
     */
    _tick(tick) {
        // bail out if the move already failed
        if (this._moveFailedAt != undefined) return;

        let moveFailed = false;

        if (this._toCell === Cell.OutOfBounds) {
            // moving out of bounds is not allowed
            moveFailed = true;
        } else {
            // collide with whatever is already in the cell
            for (let occupant of this._toCell.occupants) {
                this.entity.collide(occupant, this._toCell, tick);
                occupant.collide(this.entity, this._toCell, tick);
                moveFailed = moveFailed || occupant.blocking;
            }
            // collide with whatever is also trying to move into the cell
            for (let occupant of this._toCell.futureOccupants) {
                if (occupant === this.entity) continue;
                // the other entity should call collide on our entity
                // when its move is resolved, so no need to do that
                occupant.collide(this.entity, this._toCell, tick);
                moveFailed = moveFailed || occupant.blocking;
            }
        }

        if (moveFailed) {
            this._moveFailedAt = tick;
        }
    }

    /*
      Actually move if the move succeeded
      NOTE: be sure to bind its context to this move action
     */
    _postTick(tick) {
        // we succeeded this move
        if (this._moveFailedAt == undefined) {
            this._toCell.moveTo(this.entity);
        }
        // we didn't move if the move failed
        // futureOccupants will be cleared at the start of the next tick
    }

    /*
      Call this after the round has been resolved to create the move animation
     */
    animate(timeline, resolver) {
        if (this.speed == 0) return;

        if (this._moveFailedAt == undefined) {
            // the move succeeded
            timeline.to(
                this.entity.sprite,
                resolver.sPerRound,
                // _toCell points to the latest successful 1 cell move
                {
                    x : this._toCell.pxX,
                    y : this._toCell.pxY,
                    ease : Power0.easeNone
                }
            );
        } else {
            // the move failed at some point

            // figure out how many moves were successful.
            /*
              Each move happens after waiting ticksPerCell ticks.
              So we can calculate how many cells we covered successfully.
             */
            let numCellsCovered =
                Math.floor(this._moveFailedAt / this._ticksPerCell);

            let moveTime = 0;
            const curCell = this.entity.cell;
            if (numCellsCovered > 1) {
                const moveTicks = numCellsCovered * this._ticksPerCell;
                const moveRatio = moveTicks / resolver.ticksPerRound;
                moveTime = moveRatio * resolver.sPerRound;

                timeline.to(
                    this.entity.sprite,
                    moveTime,
                    {x : curCell.pxX, y : curCell.pxY, ease : Power0.easeNone}
                );
            }

            // now we need to animate the fact that we bumped into something
            // Q: how long should we spend doing that?
            // A: the time we spend in 1 cell
            // TODO: if a spd > ticks/round is allowed, this needs to be updated
            const oneMoveRatio = this._ticksPerCell / resolver.ticksPerRound;
            let oneMoveTime = oneMoveRatio * resolver.sPerRound;

            const bumpForwardRatio = 0.75;
            const bumpBackwardRatio = 1 - bumpForwardRatio;
            // move forward toward the occupied cell
            timeline.to(
                this.entity.sprite,
                bumpForwardRatio * oneMoveTime,
                {
                    x : curCell.pxX + this.deltaX * bumpForwardRatio,
                    y : curCell.pxY + this.deltaY * bumpForwardRatio,
                    ease : Power0.easeNone
                }
            );
            // bump backward to where successfully landed
            timeline.to(
                this.entity.sprite,
                bumpBackwardRatio * oneMoveTime,
                {x : curCell.pxX, y : curCell.pxY}
            );
        }
    }
}
