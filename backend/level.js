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
                if (this.players[id].remove) {
                    this.removePlayer(id);
                }
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

    handleMissileCollision(missileId, event) {
        const missile = this.levelProjectiles.find(projectile => projectile.id === missileId);
        if (missile) {
            console.log('Collided with', event.body.id);
            Socket.getIO().emit('missileCollision', {
                id: this.id,
                playerId: missile.player.id,
                collidedWith: event.body.id,
                position: missile.body.position,
                quaternion: missile.body.quaternion
            });
            
            
            const collidedPlayer = Object.values(this.players).find(player => player.getBody().chassis.id === event.body.id);
            if (collidedPlayer) {
                missile.player.addScore();
                collidedPlayer.takeDamage(missile.damage);
            }
        }
    }

    updateLevelProjectiles() {
        this.levelProjectiles.forEach(projectile => {
            if (projectile.remove) {
                projectile.destroy();
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
        this.players[id].destroy();
        // this.players[id].getBody().vehicle.removeFromWorld(this.world.getWorld());
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