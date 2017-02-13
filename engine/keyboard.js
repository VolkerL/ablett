/*
  based on:
  - https://github.com/kittykatattack/learningPixi#keyboard
  - https://github.com/photonstorm/phaser/blob/v2.6.2/src/input/Keyboard.js#L611
*/

const KeyCode  = {
    UP : 38,
    DOWN : 40,
    LEFT : 37,
    RIGHT : 39,
    SPACE : 32,
    W : "W".charCodeAt(0),
    A : "A".charCodeAt(0),
    S : "S".charCodeAt(0),
    D : "D".charCodeAt(0)
};

class Key {
    constructor(keyCode) {
        this.code = keyCode;
        this.isDown = false;
        this.isUp = true;
        // whether bubbling up should be stopped
        this.stopBubble = true;
        // whether the listeners are active
        this.listening = false;

        // fired before state change
        this.press = undefined;
        // fired before state change
        this.release = undefined;

        var self = this;

        //The `downHandler`
        this.downHandler = function(event) {
            if (event.keyCode === self.code) {
                if (self.isUp && self.press) self.press();
                self.isDown = true;
                self.isUp = false;
                if (self.stopBubble) {
                    event.preventDefault();
                }
            }
        };

        //The `upHandler`
        this.upHandler = function(event) {
            if (event.keyCode === self.code) {
                if (self.isDown && self.release) self.release();
                self.isDown = false;
                self.isUp = true;
                if (self.stopBubble) {
                    event.preventDefault();
                }
            }
        };
    }

    listen() {
        //Attach event listeners
        window.addEventListener(
            "keydown", this.downHandler, false
        );
        window.addEventListener(
            "keyup", this.upHandler, false
        );

        return this;
    }

    stopListen() {
        // Remove event listeners
        window.removeEventListener('keydown', this.downHandler, false);
        window.removeEventListener('keyup', this.upHandler, false);

        return this;
    }
}
