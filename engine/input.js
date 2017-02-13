 const Input = {
     UP : Symbol('UP'),
     DOWN : Symbol('DOWN'),
     LEFT : Symbol('LEFT'),
     RIGHT : Symbol('RIGHT'),
     ATTACK : Symbol('ATTACK'),
     NONE : Symbol('NONE')
 };

 class KeyboardInput {
     constructor() {
         this.leftKey = new Key(KeyCode.LEFT).listen();
         this.rightKey = new Key(KeyCode.RIGHT).listen();
         this.upKey = new Key(KeyCode.UP).listen();
         this.downKey = new Key(KeyCode.DOWN).listen();
         this.attKey = new Key(KeyCode.SPACE).listen();

     }

     getInput() {
         let down = 0;
         let action = Input.NONE;
         if (this.leftKey.isDown) {
             down++;
             action = Input.LEFT;
         }
         if (this.rightKey.isDown) {
             down++;
             action = Input.RIGHT;
         }
         if (this.upKey.isDown) {
             down++;
             action = Input.UP;
         }
         if (this.downKey.isDown) {
             down++;
             action = Input.DOWN;
         }
         if (down > 1) {
             // too many inputs
             action = Input.NONE;
         }

         if (this.attKey.isDown) {
             // attack action overrides, because I say so
             return Input.ATTACK;
         } else {
             return action;
         }
     }
 }

 class TwitchChatInput {
     constructor() {
         // TODO: connect to twitch chat, and start recording
     }

     getInput() {
         // TODO: return an input command
     }
 }
