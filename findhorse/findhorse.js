var loader = PIXI.loader;
var resources = loader.resources;
var Texture = PIXI.Texture;
var TextureCache = PIXI.utils.TextureCache;
var Sprite = PIXI.Sprite;
var Animation = PIXI.extras.AnimatedSprite;
var Container = PIXI.Container;

const cellDim = 32;
const fieldWidth = 20;
const fieldHeight = 10;
const ticksPerRound = 10;
const sPerRound = 0.5;
const msPerRound = sPerRound * 1000;

const field = new Field(cellDim, fieldWidth, fieldHeight);
const resolver = new RoundResolver(field, ticksPerRound, sPerRound);

const renderer = PIXI.autoDetectRenderer(field.pxWidth, field.pxHeight);
const stage = new Container();

// for now just use keyboard inputs
const input = new KeyboardInput();

var mobs = [];
var abs;
var entities;

// called on body load
function init() {
    document.body.appendChild(renderer.view);
    renderer.backgroundColor = 0x408040;
    renderer.autoResize = true;

    renderer.render(stage);

    // load the assets
    loader
        .add('characters', '../assets/characters.json')
        .load(create);
}

class Mob extends Sprite {
    constructor(textureU, textureD, textureL, textureR) {
        super(textureD);
        this.directionalTextures = {};
        this.directionalTextures[Direction.UP] = textureU;
        this.directionalTextures[Direction.DOWN] = textureD;
        this.directionalTextures[Direction.LEFT] = textureL;
        this.directionalTextures[Direction.RIGHT] = textureR;
    }
    move(direction, timeline) {
        this.texture = this.directionalTextures[direction];
        move(this, direction, timeline);
    }
}

function create() {
    /*
      abs = new Animation([
        TextureCache.absD,
        TextureCache.absL,
        TextureCache.absU,
        TextureCache.absR
    ]);
    */
    let absSprite = new Mob(
        TextureCache.absU,
        TextureCache.absD,
        TextureCache.absL,
        TextureCache.absR
    );
    abs = new Entity(absSprite);
    field.spawn(abs, 0, 0);
    absSprite.width = cellDim;
    absSprite.height = cellDim;
    // abs.animationSpeed = 4 / 60;
    // abs.play();
    stage.addChild(absSprite);
    renderer.render(stage);

    gameLoop();
}

let stopGameLoop = false;
let animationsDone = true;
let timeline = new TimelineLite({paused : true});
function gameLoop() {
    if (!stopGameLoop) {
        requestAnimationFrame(gameLoop);

        renderer.render(stage);

        if (animationsDone) {
            animationsDone = false;

            timeline.eventCallback('onComplete', ()=>{
                animationsDone = true;
                timeline.kill();
                timeline = new TimelineLite({paused : true});
            });

            let action = input.getInput();
            let dir = getDirection(action);
            if (dir) {
                const move = new MoveAction(abs, 1, dir);
                move.prepareRound(resolver);
                resolver.resolveRound();
                move.animate(timeline, resolver);
                timeline.restart();
            } else {
                animationsDone = true;
            }
        }
    }
}

function getDirection(input) {
    switch(input) {
    case Input.UP:
        return Direction.UP;
    case Input.DOWN:
        return Direction.DOWN;
    case Input.LEFT:
        return Direction.LEFT;
    case Input.RIGHT:
        return Direction.RIGHT;
    default:
        return undefined;
    }
}
