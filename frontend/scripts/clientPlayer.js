import Player from './player.js';
import Input from './input.js';
import Connection from '../connection.js';

export default class ClientPlayer {

    constructor(player) {
        this.player = player;
        this.playerInput = new Input(this.player, Connection.getConnection());
        this.playerInput.initInputSystem();
    }

    getPlayerPosition() {
        return this.player.getPlayerPosition();
    }

    update() {
    }

    getPlayer() {
        return this.player;
    }

}

