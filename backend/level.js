import CannonWorld from "./cannonWorld.js";
import Player from "./player.js";

export default class Level {

    constructor(heightMapPath = null) {
        this.world = new CannonWorld(heightMapPath);
        this.players = {};
    }

    step() {
        this.world.step();
        for (const id in this.players) {
            if (this.players.hasOwnProperty(id)) {
                this.players[id].updateJson();
            }
        }
    }

    executePlayerInputFromJson(id, JSONinput) {
        return this.players[id]?.runInputsFromJSON(JSONinput);
    }

    addPlayer(player) {
        this.players[player.id] = new Player(this.world.getWorld(), player);
    }

    removePlayer(id) {
        if (this.players[id] == null) return;
        this.world.getWorld().removeBody(this.players[id].getBody());
        delete this.players[id];
    }

    getPlayersJSON() {
        const playersJson = {};
        for (const id in this.players) {
            if (this.players.hasOwnProperty(id)) {
            playersJson[id] = this.players[id].getJson();
            }
        }
        return playersJson;
    }

    getPlayerJson(id) {
        return this.players[id].getJson();
    }

    getPlayerBody(id) {
        return this.players[id].getBody();
    }

    getPlayerCount() {
        return this.players.length;
    }

}