const TestUtils = {};

TestUtils.sprite = function(key) {
    return new PIXI.Sprite(PIXI.TextureCache[key]);
};

TestUtils.spawn = function(textureKey, field,  x, y, stage) {
    const sprite = TestUtils.sprite(textureKey);
    sprite.width = field.cellDim;
    sprite.height = field.cellDim;

    const entity = new Entity(sprite);
    field.spawn(entity, x, y);

    stage.addChild(sprite);
    sprite.x = entity.cell.pxX;
    sprite.y = entity.cell.pxY;

    return entity;
};

TestUtils.reset = function(entity, field, x, y) {
    const to = field.getCell(x, y);
    to.moveTo(entity);
    entity.sprite.x = to.pxX;
    entity.sprite.y = to.pxY;
};

class TestCase {
    constructor(w, h, ticks, sPerTick, load, create, reset, rounds, optCtx) {
        this.fieldWidth = w;
        this.fieldHeight = h;
        this.ticks = ticks;
        this.sPerTick = sPerTick;
        this.load = load;
        this.execCtx = optCtx || {};
        this.create = create;
        this.reset = reset;
        this.rounds = rounds;
    };
}
