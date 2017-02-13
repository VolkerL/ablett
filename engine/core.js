const Direction = {
    UP : Symbol('UP'),
    DOWN : Symbol('DOWN'),
    LEFT : Symbol('LEFT'),
    RIGHT : Symbol('RIGHT')
};

/**
   A field is a matrix of cells.
   It can be used to keep track of the locations of entities and resolve actions.
 */
class Field {
    /**
       cellDim: the width and height in px of each cell (enforcing square cells)
       width: the number of cells that this field is wide
       hieght: the number of cells that this field is long
     */
    constructor(cellDim, width, height) {
        this.pxWidth = width * cellDim;
        this.pxHeight = height * cellDim;
        this.width = width;
        this.height = height;
        this.cells = [];
        this.cellDim = cellDim;

        for (let x = 0; x < width; x++) {
            let col = [];
            this.cells.push(col);
            for (let y = 0; y < height; y++) {
                col.push(new Cell(this, x, y));
            }
        }
    }

    /**
       Get the cell at horizontal position x and vertical position y.
     */
    getCell(x, y) {
        if (x >= this.width || x < 0 || y < 0 || y >= this.height) {
            return Cell.OutOfBounds;
        }
        return this.cells[x][y];
    }

    /**
       Get the cell neighbouring the given cell in the given direction.
       May return Cell.OutOfBounds.
     */
    getNeighbour(cell, direction) {
        switch(direction) {
        case Direction.UP:
            return this.getCell(cell.x, cell.y - 1);
        case Direction.DOWN:
            return this.getCell(cell.x, cell.y + 1);
        case Direction.LEFT:
            return this.getCell(cell.x - 1, cell.y);
        case Direction.RIGHT:
            return this.getCell(cell.x + 1, cell.y);
        default:
            throw new Error("Unknown direction " + direction);
        }
    }

    /**
       Put the entity into the cell at the given position.
     */
    spawn(entity, x, y) {
        let cell = this.getCell(x, y);
        if (cell === Cell.OutOfBounds) {
            throw new Error("Won't spawn out of bounds.");
        }
        cell.enter(entity);
        entity.cell = cell;
    }

    /**
       Execute the given callback for each cell in this field.
       Execution goes per column, top to bottom in the column,
       left to right to the next column.

       cb: function (cell)
     */
    forEachCell(cb) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                cb(this.cells[x][y]);
            }
        }
    }

    /**
       Prepare the field for the resolution of the next round.
     */
    startRound() {
        this.forEachCell((cell)=>{cell.startRound();});
    }

    /**
       Prepare the field for the resolution of the next tick of the round.
     */
    startTick() {
        this.forEachCell((cell)=>{cell.startTick();});
    }
}

/**
   A cell can contain entities and can be used to
   resolve actions by these entities.
 */
class Cell {
    /**
       field: the field of which this cell is a part
       x: the horizontal position of this cell on the field
       y: the vertical position of this cell on the field
     */
    constructor (field, x, y) {
        this.field = field;
        this.occupants = [];
        this.x = x;
        this.y = y;
        this.pxX = x * field.cellDim;
        this.pxY = y * field.cellDim;

        // used for resolving actions
        this.futureOccupants = [];
    }

    /**
       Prepare for the resolution of actions of a new round.
     */
    startRound() {
        this.futureOccupants = [];

        // collide at the start of round (tick = 0)
        for (let i = 0; i < this.occupants.length; i++) {
            let occupant = this.occupants[i];
            for (let j = 0; j < this.occupants.length; j++) {
                if (j === i) continue;
                occupant.collide(this.occupants[j], this, 0);
            }
        }
    }

    /**
       Prepare for the resolution of actions of the next tick of the round.
     */
    startTick() {
        this.futureOccupants = [];
    }

    /**
       Add the given entity as occupant of this cell.
     */
    enter(entity) {
        this.occupants.push(entity);
    }

    /**
       Remove the given entity from the occupants of this cell.
     */
    leave(entity) {
        for (let i = 0; i < this.occupants.length; i++) {
            if (this.occupants[i] === entity) {
                this.occupants.splice(i, 1);
                return;
            }
        }
    }

    /**
       Move the entity to this cell.
       Updates the occupants of the old cell, this cell,
       and the cell property of the entity.
     */
    moveTo(entity) {
        entity.cell.leave(entity);
        this.enter(entity);
        entity.cell = this;
    }
}

/**
   Representation of a cell outside of the field's boundaries.
 */
Cell.OutOfBounds = Symbol('OutOfBounds');

/**
   The RoundResolver resolves the actions for each round.

   Each round consists of a certain amount of ticks.
   These ticks are labelled starting at 1.
   Actions can register handlers for these ticks.

   For example, if there are 10 ticks in the round,
   and an action wants to move 2 cells during the round,
   it could register itself at ticks 3 and 6.
   Causing the entity to be in its starting cell for tick 1-3,
   the next cell for tick 4-6, and its final destination for tick 7-10.

   Ticks allow entities to have different speeds (i.e. make more actions),
   while still keeping action resolution (e.g. collision detection) simple
   and cell based.
 */
class RoundResolver {
    /**
       field: the field to use to keep track of state during the round.
       ticksPerRound: the amount of ticks available for the round.
       sPerRound: the number of seconds each round should take when animating.
       TODO: that probably shouldn't be in this class.
     */
    constructor(field, ticksPerRound, sPerRound) {
        this.ticksPerRound = ticksPerRound;
        this.sPerRound = sPerRound;
        this.field = field;

        this.subscriptions = [];
        this.resetSubscriptions();
    }

    /**
       Subscribe your callbacks to be called during resolution of the round.
       tick: the tick at which you want to perform your action
       action: function(tick): will be called when resolving the tick
       pre: optional function(tick): will be called before resolving
            any subscribed actions for this tick.
            This allows you to update temporary state of the field.
       post: optional function(tick): will be called after resolving all
             subscribed actions.
             This allows you to finalise the temporary state that was required
             during resolution of the actions.
     */
    subscribe(tick, action, pre, post) {
        if (tick <= 0 || tick > this.ticksPerRound) {
            throw new Error("Can't subscribe to tick " + tick
                            + ". Should be 1-" + this.ticksPerRound);
        }
        let cb = {};
        if (action) cb.action = action;
        if (pre) cb.pre = pre;
        if (post) cb.post = post;
        this.subscriptions[tick - 1].push(cb);
    }

    /**
       Resolve the actions that were registered for this round.
     */
    resolveRound() {
        this.field.startRound();
        for (let tick = 1; tick <= this.ticksPerRound; tick++) {
            // prepare for execution of this tick
            this.field.startTick();

            for (let sub of this.subscriptions[tick - 1]) {
                if (sub.pre && typeof sub.pre === 'function') {
                    sub.pre(tick);
                }
            }
            for (let sub of this.subscriptions[tick - 1]) {
                if (sub.action && typeof sub.action === 'function') {
                    sub.action(tick);
                }
            }
            for (let sub of this.subscriptions[tick - 1]) {
                if (sub.post && typeof sub.post === 'function') {
                    sub.post(tick);
                }
            }
        }
        this.resetSubscriptions();
    }

    /**
       Clear the list of subscribed actions of this resolver.
       Is called internally after resolving a round to prepare for the next round.
     */
    resetSubscriptions() {
        this.subscriptions = [];
        for (let i = 0; i < this.ticksPerRound; i++) {
            this.subscriptions[i] = [];
        }
    }
}

/**
   An entity representing something on the field.

   TODO: allow for entities to occupy more than 1 cell.
   This would also involve updating Cell.moveTo.
 */
class Entity {
    constructor(sprite) {
        this.sprite = sprite;
        // whether this entity blocks other entities of occupying the same cell
        this.blocking = true;
        this.cell = Cell.OutOfBounds;
    }

    /**
       Called either at the start of a round
       when multiple entities occupy the same cell.
       Or during resolution of the round when something moves onto us.
     */
    collide(other, cell, tick) {
        // TODO: implement
    }
}
