import Player from './player.js';
import Input from './input.js';
import Connection from '../../connection.js';

export default class ClientPlayer {

    constructor(player) {
        this.player = player;
        this.playerInput = new Input(this.player, Connection.getConnection());
        this.alive = true;
        this.oribtCameraAlive = false; //TODO Make player camera orbit around player while alive
        this.showLap = false;
    }

    init() {
        this.playerInput.initInputSystem();
        if (!this.showLap) return;
        this.checkpointCanvas = document.createElement('canvas');
        this.checkpointCanvas.width = 200;
        this.checkpointCanvas.height = 50;
        this.checkpointCanvas.style.position = 'absolute';
        this.checkpointCanvas.style.top = '10px';
        this.checkpointCanvas.style.left = '10px';
        document.body.appendChild(this.checkpointCanvas);
        this.checkpointContext = this.checkpointCanvas.getContext('2d');
        this.updateLaps();
    }       

    updateCheckpoint() {
        this.checkpointContext.clearRect(0, 0, this.checkpointCanvas.width, this.checkpointCanvas.height);
        this.checkpointContext.font = '30px Arial';
        this.checkpointContext.fillStyle = 'white';
        this.checkpointContext.fillText('Checkpoint: ' + this.player.currentCheckpoint, 10, 30);
    }

    updateLaps() {
        this.checkpointContext.clearRect(0, 0, this.checkpointCanvas.width, this.checkpointCanvas.height);
        this.checkpointContext.font = '30px Arial';
        this.checkpointContext.fillStyle = 'white';
        this.checkpointContext.fillText('Lap: ' + this.player.currentLap, 10, 30);
    }

    getPlayerPosition() {
        return this.player.getPlayerPosition();
    }

    getPlayerLookAt() {
        return this.player.lookAt;
    }

    getPlayerNormalizedLookAt() {
        return this.player.lookAtNormilized;
    }

    update() {
        if (this.alive) {
            if (!this.showLap) return;
            this.updateLaps();
        }
    }

    getPlayer() {
        return this.player;
    }

    collided() {
        this.playerInput.collided();
    }

}

