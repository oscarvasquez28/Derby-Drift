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
            if (event.key === 'Escape') {
                const menu = document.getElementById('world-menu');
                if (menu.style.display === 'none' || menu.style.display === '') {
                    menu.style.display = 'block';
                } else {
                    menu.style.display = 'none';
                }
            }
            this.pressedKeys.add(event.key);
            this.updateInput(player, socket);
        });

        document.addEventListener('keyup', (event) => {
            this.pressedKeys.delete(event.key);
            this.updateInput(player, socket);
        });
    
        document.getElementById('world-resume-button').addEventListener('click', function() {
            const menu = document.getElementById('world-menu');
            menu.style.display = 'none';
        });

        // Handle gamepad inputs
        window.addEventListener('gamepadconnected', (event) => {
            console.log('Gamepad connected:', event.gamepad);
            this.pollGamepad(player, socket);
        });
    
        window.addEventListener('gamepaddisconnected', (event) => {
            console.log('Gamepad disconnected:', event.gamepad);
        });

    }

    updateInput(player, socket) {
        const inputInfo = {
            id: player.id,
            type: 'keyboard',
            lookat: { x: 0, y: 0, z: 0 },
            inputs: {
                up: this.pressedKeys.has('ArrowUp') || this.pressedKeys.has('w'),
                down: this.pressedKeys.has('ArrowDown') || this.pressedKeys.has('s'),
                right: this.pressedKeys.has('ArrowRight') || this.pressedKeys.has('d'),
                left: this.pressedKeys.has('ArrowLeft') || this.pressedKeys.has('a'),
                flip: this.pressedKeys.has('f'),
                brake: this.pressedKeys.has('Control'), // Control key
                jump: this.pressedKeys.has(' '), // Space key
            },
        };

        console.log(inputInfo.inputs);
        socket.emit('input', inputInfo);
    }

    pollGamepad(player, socket) {
        const gamepadIndex = 0;
    
        const poll = () => {
            const gamepad = navigator.getGamepads()[gamepadIndex];
            if (gamepad) {
                const inputInfo = {
                    id: player.id,
                    type: 'gamepad',
                    lookat: { x: 0, y: 0, z: 0 },
                    inputs: {
                        up: gamepad.buttons[12].pressed, // D-pad up
                        down: gamepad.buttons[13].pressed, // D-pad down
                        left: gamepad.buttons[14].pressed, // D-pad left
                        right: gamepad.buttons[15].pressed, // D-pad right
                        foward: gamepad.buttons[0].pressed, // A button
                        flip: gamepad.buttons[2].pressed, // X button
                        brake: gamepad.buttons[1].pressed, // B button
                        axes: gamepad.axes, // Joystick axes
                    }
                };
    
                console.log(inputInfo.inputs);
                socket.emit('input', inputInfo);
            }
    
            requestAnimationFrame(poll);
        };
    
        poll();
    }

}