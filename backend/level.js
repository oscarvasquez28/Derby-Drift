import CannonWorld from "./cannonWorld.js";
import Player from "./player.js";
import Socket from "./socket.js";

export default class Level {

    constructor(heightMapPath = null, worldScale = 1) {
        this.world = new CannonWorld(heightMapPath, worldScale);
        this.players = {};
        this.levelProjectiles = [];
    }

    step() {
        this.world.step();
        for (const id in this.players) {
            if (this.players.hasOwnProperty(id)) {
                this.players[id].updateJson();
            }
        }
        this.updateLevelProjectiles();
    }

    executePlayerInputFromJson(id, JSONinput) {
        const result = this.players[id]?.runInputsFromJSON(JSONinput);
        if (this.players[id]?.hasShotProjectile()) {
            this.levelProjectiles.push(this.players[id].getLastProjectile());
            Socket.getIO().emit('newProjectile', {
                id: this.players[id].getLastProjectile().id,
                playerId: id,
                position: this.players[id].getLastProjectile().position,
                quaternion: this.players[id].getLastProjectile().quaternion
            });
        }
        return result;
    }

    addPlayer(player) {
        this.players[player.id] = new Player(this, this.world.getWorld(), player);
    }

    updateLevelProjectiles() {
        this.levelProjectiles.forEach(projectile => {
            if (projectile.collided || !projectile) {
                projectile.player.projectiles?.splice(projectile.player.projectiles.indexOf(projectile), 1);
            }
        });
        this.levelProjectiles = this.levelProjectiles.filter(projectile => !projectile.collided);
        if (this.levelProjectiles.length > 0)
            Socket.getIO().emit('updateMissiles', this.getLevelProjectilesJSON());
    }

    getLevelProjectilesJSON() {
        const levelProjectilesJson = {};
        this.levelProjectiles.forEach((projectile, index) => {
            levelProjectilesJson[index] = projectile.getJSON();
        });
        return levelProjectilesJson;
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