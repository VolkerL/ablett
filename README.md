# Ablett

This repository contains the beginning of my first ever HTML game.
The goal is to provide one or more games that can be interacted with via
[Twitch](http://twitch.tv) chat.

Hopefully these games will one day be used for
[Ablett_26's channel](http://twitch.tv/ablett_26).

## Usage

The awesomeness of Github Pages gives us free static hosting.
So the contents of this repository can be checked at:

- https://volkerl.github.io/ablett/findhorse/ -- for the prototype game
- https://volkerl.github.io/ablett/tests/test.html -- for the tests

### Running Locally
If you want to run it locally, please follow these directions:

To run the first prototype or the tests, you need a web server.
If you have [NodeJS](https://nodejs.org) installed, you can use the server in this rep.

Obtain the code:

```
$ git clone https://github.com/VolkerL/ablett.git  
$ cd ablett
```

Install the requirements for the server and launch it.
You may skip this step if you want to use your own server.

```
$ npm install  
$ node server.js
```

Now the prototype game will be available at `http://localhost:3000/finddaisy`.
For now you can just use the arrow keys to move Ablett around.

#### Running Tests Locally

To try out the tests, start the server as described above.
Then the tests can be viewed at `http://localhost:3000/tests/test.html`.

There are two dropdowns.
One to select the test suite (only the Movement test suite exists at the moment),
and one to select the test case.
After selecting a test case, press the spacebar to start the test.
By pressing spacebar again, the test will be reset.

## Repository Structure

The repository contains:

1. [libraries](libs/)
2. [assets](assets/) (i.e. sprites),
3. the start of a small [game engine](engine)
4. [tests](tests/)
5. a [web server](server.js)
6. and a [prototype game](findhorse/)

### Libraries

#### Pixi JS

We use [Pixi JS](http://www.pixijs.com/) for rendering.
Both the development version and the minified version are copied into this repository.

As Pixi JS uses the same MIT License as we do, there are no licensing issues.

#### Greensock AP

We use [Greensock AP](https://greensock.com/) to move sprites (tweening).

Greensock has a [license](https://greensock.com/standard-license)
that disallows charging users for access to,
or the use of the end product.
As we are not aiming to make money of this project there should be no conflict.

Alternatively, we could switch to [tween.js](https://github.com/tweenjs/tween.js).

#### Assets

The current sprites were provided by [AnonOnAndOn](http://twitch.tv/AnonOnAndOn).
Copyright of those sprites belongs to him.

#### Game Engine

Although [Phaser JS](https://phaser.io/) offer more functionality,
we are making our own little game engine.

It offers an [abstraction over keyboard inputs](engine/keyboard.js) similar to Phaser.
It also offers an [input class](engine/input.js) which can be used
to abstract over the way commands can be given to the game.
For now it only offers one for keyboard inputs,
but in the future we will support inputs through a Twitch channel's chat.

The idea is to make a game where moves are made on a cell grid.
So the player can not move until the previous move has completed.
All actions will be round based, which means that every round
each entity will declare its moves for that round.
Those actions will be resolved to calculate collisions.
After all the effects of the actions are resolved,
the result can be animated.

The [core](engine/core.js) of the engine contains the game grid (the field),
a class to represent entities, and a class to resolve actions for a round.
For now, we only implemented a [move action](engine/actions.js)
which can move an entity 1 or more cells in a straight line during a round.
If it collides with entities that are blocking, the move will be aborted.

#### Prototype Game

The first game will be a quest to find Ablett's horse,
which always wanders off while he is building his castle.
The twitch chat should be able to type commands and at the start of each round
one of their commands will be picked as input for that round.

The player will be chased by:

- zombies -- who deal damage on collision with the player
- creepers -- who will explode if they are close enough to the player
- skeletons -- who will shoot arrows at the player

When the player finds and reaches the horse, the game is won.
Alternatively, we could call it "find the bed" and have the player
look for a bed to safely spent the night.

For now though, it is only possible to move a sprite around
and we don't even have a view that can follow the player across a bigger field.
So finding things would be very easy :P.
