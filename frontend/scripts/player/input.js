import Connection from "../../connection.js";

export default class InputSystem {
    socket = Connection.getConnection();
    pressedKeys = new Set();

    constructor(player) {
        this.player = player;
        this.collidedWithPlayer = false;
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
            if (event.key === 'm') {
                if (this.collidedWithPlayer)
                    alert('Player Has Collided With Another Player');
                else
                    console.error('Player Has Not Collided With Another Player');
            }
            this.pressedKeys.add(event.key);
            this.updateInput(player, socket);
        });

        document.addEventListener('keyup', (event) => {
            this.pressedKeys.delete(event.key);
            this.updateInput(player, socket);
        });

        document.getElementById('world-resume-button').addEventListener('click', function () {
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
                up: this.pressedKeys.has(localStorage.getItem('controls') ? JSON.parse(localStorage.getItem('controls')).forward.toLowerCase() : 'w'),
                down: this.pressedKeys.has(localStorage.getItem('controls') ? JSON.parse(localStorage.getItem('controls')).backward.toLowerCase() : 's'),
                left: this.pressedKeys.has(localStorage.getItem('controls') ? JSON.parse(localStorage.getItem('controls')).left.toLowerCase() : 'a'),
                right: this.pressedKeys.has(localStorage.getItem('controls') ? JSON.parse(localStorage.getItem('controls')).right.toLowerCase() : 'd'),
                fire: this.pressedKeys.has(localStorage.getItem('controls') ? JSON.parse(localStorage.getItem('controls')).shoot.toLowerCase() : 'r'),
                brake: this.pressedKeys.has(localStorage.getItem('controls') ? JSON.parse(localStorage.getItem('controls')).drift.toLowerCase() : 'c'),
            },
        };

        // console.log(inputInfo.inputs);
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
                        fire: gamepad.buttons[4].pressed, // LB button
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

    collided() {
        this.collidedWithPlayer = true;
    }

}