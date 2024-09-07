import Connection from "../../connection.js";

export default class InputSystem {
    socket = Connection.getConnection();
    pressedKeys = new Set();

    constructor(player) {
        this.player = player;
    }

    initInputSystem() {
        const player = this.player;
        const socket = this.socket;

        document.addEventListener('keydown', (event) => {
            this.pressedKeys.add(event.key);
            this.updateInput(player, socket);
        });

        document.addEventListener('keyup', (event) => {
            this.pressedKeys.delete(event.key);
            this.updateInput(player, socket);
        });
    }

    updateInput(player, socket) {
        const inputInfo = {
            id: player.id,
            inputs: {
                up: this.pressedKeys.has('ArrowUp') || this.pressedKeys.has('w'),
                down: this.pressedKeys.has('ArrowDown') || this.pressedKeys.has('s'),
                right: this.pressedKeys.has('ArrowRight') || this.pressedKeys.has('d'),
                left: this.pressedKeys.has('ArrowLeft') || this.pressedKeys.has('a'),
                jump: this.pressedKeys.has(' '), // Space key
            },
        };

        console.log(inputInfo.inputs);
        socket.emit('input', inputInfo);
    }
}