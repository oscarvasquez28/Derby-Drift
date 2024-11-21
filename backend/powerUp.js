import * as CANNON from 'cannon-es';
import Socket from './socket.js';

export default class PowerUp {  

    static #PowerUpId = 0;

    constructor(params) {
        this.position = params.position != undefined ? new CANNON.Vec3(params.position.x, params.position.y, params.position.z) : new CANNON.Vec3(0, 0, 0);  
        this.radius = params.radius || 1;
        this.collsionRadius = params.collsionRadius || 10;   
        this.type = params.type || 'shield';
        this.spawned = params.spawned || false;
        this.world = params.world || null;
        this.quaternion = params.quaternion || new CANNON.Quaternion();
        this.id = PowerUp.#PowerUpId;
        PowerUp.#PowerUpId++;
    }

    convertToVec3(position) {
        if (position instanceof CANNON.Vec3) {
            return position;
        } else if (position && typeof position === 'object') {
            return new CANNON.Vec3(position.x, position.y, position.z);
        } else {
            return new CANNON.Vec3(0, 0, 0);
        }
    }

    createBody() {
        if (!this.world) {
            throw new Error('PowerUp must have a world to create a body');
        }
        const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
        const body = new CANNON.Body({ mass: 0 });
        body.addShape(shape);
        body.position.set(this.position.x, this.position.y, this.position.z);
        this.world.addBody(body);
        return body;
    }

    getJson() {
        return {
            id: this.id,
            position: this.position,
            quaternion: this.quaternion,
            radius: this.radius,
            type: this.type
        };
    }

    remove() {
        if (!this.world) {
            throw new Error('PowerUp must have a world to remove itself');
        }
        this.world.removeBody(this.body);
    }

    collidedWith(player) {
        const distance = this.position.distanceTo(player.position.chassis);
        if (distance <= this.radius + this.collsionRadius) {
            return true;
        }
        return false;
    }
    
    spawn(type) {
        this.type = type ? type : (Math.random() < 0.1 ? 'shield' : (Math.random() < 0.4 ? 'boost' : 'ammo'));
        const randomX = Math.floor(Math.random() * 500) - 250;
        const randomZ = Math.floor(Math.random() * 500) - 250;
        this.position.set(randomX, 10, randomZ);
        this.spawned = true;
    }

    step(players) {
        for (const id in players) {
            if (players.hasOwnProperty(id)) {
                if (this.collidedWith(players[id].getJson())) {
                    this.applyPowerUp(players[id]);
                    Socket.getIO().emit('powerUpCollected', { id: this.id, playerId: id });
                }
            }
        }
    }

    applyPowerUp(player) {
        switch (this.type) {
            case 'shield':
                player.addShield();
                break;
            case 'boost':
                player.applyBoost();
                break;
            case 'ammo':
                player.addAmmo();
                break;
            default:
                console.warn(`Unknown power-up type: ${this.type}`);
        }
        this.spawned = false;
        // this.remove();
    }
}