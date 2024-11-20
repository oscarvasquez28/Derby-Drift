import CannonWorld from "./cannonWorld.js";
import Player from "./player.js";
import Socket from "./socket.js";
import Database from "./database.js";
import PowerUp from "./powerUp.js";

export default class Level {

    constructor(heightMapPath = null, worldScale = 1) {
        this.world = new CannonWorld(heightMapPath, worldScale);
        this.players = {};
        this.levelProjectiles = [];
        this.powerUps = [];
        this.powerUps = new Array(5).fill(null).map(() => new PowerUp({ position: { x: 0, y: 0, z: 0 }, world: this.world.getWorld() }));
        this.powerUpTimer = 60;
        this.db = Database.getDb();
    }

    step() {
        this.world.step();
        for (const id in this.players) {
            if (this.players.hasOwnProperty(id)) {
                this.players[id].updateJson();
                if(this.players[id].getJson().position.chassis.y < -10){
                    this.players[id].takeDamage(100, "El jugador cayó al vacío");
                }
                if (this.players[id].remove) {
                    this.removePlayer(id);
                    if (Object.keys(this.players).length === 1) {
                        const remainingPlayerId = Object.keys(this.players)[0];
                        Socket.getIO().emit('playerWon', { id: remainingPlayerId });
                        this.removePlayer(remainingPlayerId);
                    }
                }
            }
        }

        if (Object.keys(this.players).length > 0) {
            this.updateLevelPowerUps();
            this.updateLevelProjectiles();
        }
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
                if (collidedPlayer.getJson().hasShield){
                    // Socket.getIO().emit('playerShielded', { id: collidedPlayer.id });
                    collidedPlayer.removeShield();
                }
                else{
                    if (collidedPlayer.takeDamage(missile.damage, "El jugador fue alcanzado por un misil del jugador: " + missile.player.getJson().name)){
                        missile.player.addScore();                        
                    }

                }
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

    updateLevelPowerUps() {
        this.powerUps.forEach(powerUp => {
            if (powerUp.spawned) {
                powerUp.step(this.players);
            }
        });
        this.powerUpTimer -= 1 / 60;
        if (this.powerUpTimer <= 0) {
            this.spawnPowerUp();
            this.powerUpTimer = 15;
        }
    }
    
    spawnPowerUp() {
        const powerUp = this.powerUps.find(powerUp => !powerUp.spawned);
        if (powerUp) {
            powerUp.spawn();
            Socket.getIO().emit('powerUpSpawned', powerUp.getJson());
        }
    }

    getLevelProjectilesJSON() {
        const levelProjectilesJson = {};
        this.levelProjectiles.forEach((projectile, index) => {
            levelProjectilesJson[index] = projectile.getJSON();
        });
        return levelProjectilesJson;
    }

    getLevelPowerUpsJSON() {
        const powerUpsJson = {};
        this.powerUps.forEach((powerUp, index) => {
            powerUpsJson[index] = powerUp.getJson();
        });
        return powerUpsJson;
    }

    getActivePowerUps() {
        return this.powerUps.filter(powerUp => powerUp.spawned);
    }

    getActivePowerUpsJSON() {   
        const powerUpsJson = {};
        this.getActivePowerUps().forEach((powerUp, index) => {
            powerUpsJson[index] = powerUp.getJson();
        });
        return powerUpsJson;
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

    getWorld() {
        return this.world.getWorld();
    }

}