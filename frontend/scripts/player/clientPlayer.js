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
        this.showAmmo = false;
    }

    init() {
        this.playerInput.initInputSystem();
        if (this.showLap) {
            this.checkpointCanvas = document.createElement('canvas');
            this.checkpointCanvas.width = 200;
            this.checkpointCanvas.height = 50;
            this.checkpointCanvas.style.position = 'absolute';
            this.checkpointCanvas.style.top = '50px';
            this.checkpointCanvas.style.left = '50px';
            document.body.appendChild(this.checkpointCanvas);
            this.checkpointContext = this.checkpointCanvas.getContext('2d');
            this.updateLaps();
        }
        this.ammoCanvas = document.createElement('canvas');
        this.ammoCanvas.width = 200;
        this.ammoCanvas.height = 50;
        this.ammoCanvas.style.position = 'absolute';
        this.ammoCanvas.style.top = '80px';
        this.ammoCanvas.style.left = '50px';
        document.body.appendChild(this.ammoCanvas);
        this.ammoContext = this.ammoCanvas.getContext('2d');
        this.loadAmmoImage();
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

    loadAmmoImage() {
        this.ammoImage = new Image();
        this.ammoImage.src = 'textures/RocketRender.png';
        this.ammoImage.onload = () => {
            this.updateAmmo();
            this.showAmmo = true;
        };
    }

    updateAmmo() {
        this.ammoContext.clearRect(0, 0, this.ammoCanvas.width, this.ammoCanvas.height);
        this.ammoContext.drawImage(this.ammoImage, 0, 0, 50, 50);
        this.ammoContext.font = '30px Arial';
        this.ammoContext.fillStyle = 'white';
        this.ammoContext.fillText(this.player.ammo, 50, 40);
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
            if (this.showLap)
                this.updateLaps();
            if (this.showAmmo)
                this.updateAmmo();
        }
    }

    getPlayer() {
        return this.player;
    }

    collided() {
        this.playerInput.collided();
    }

}

