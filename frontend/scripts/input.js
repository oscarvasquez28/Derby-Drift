import Connection from "../connection.js"

export default class InputSystem{

    socket = Connection.getConnection();
    
    constructor(player){
        this.player = player;
    }

    initInputSystem(){

        const player = this.player;
        const socket = this.socket;

        document.addEventListener('keydown', (event) => {
            // Manejar el jugador con las teclas del teclado
            const inputInfo = {
                id: player.id,
                inputs: {
                    up: false,
                    down: false,
                    right: false,
                    left: false,
                    jump: false,
                },
            }

            if (this.player) {
                if (event.key === 'ArrowUp') {
                    inputInfo.inputs.up = true;
                }
                if (event.key === 'ArrowDown') {
                    inputInfo.inputs.down = true;
                }
                if (event.key === 'ArrowLeft') {
                    inputInfo.inputs.left = true;
                }
                if (event.key === 'ArrowRight') {
                    inputInfo.inputs.right = true;
                }
                if (event.code === 'Space') {
                    inputInfo.inputs.jump = true;
                }

                console.log(inputInfo.inputs);

                socket.emit('input', inputInfo);
            }
        });
    }

}