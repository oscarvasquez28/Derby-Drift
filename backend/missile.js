import * as cannon from 'cannon-es';
import Socket from './socket.js';
import { v4 as uuidv4 } from 'uuid';

export default class Missile {
    constructor(level, world, player) {
        this.id = uuidv4();
        this.level = level;
        this.world = world;
        this.player = player;
        this.chassis = this.player.player.body.chassis;
        this.damage = 100;
        this.body = this.createMissile();
        this.body.position.copy(this.chassis.position);
        this.body.velocity.copy(this.chassis.velocity);
        this.body.angularVelocity.copy(this.chassis.angularVelocity);
        this.body.quaternion.copy(this.chassis.quaternion);
        this.body.position.vadd(new cannon.Vec3(0, 4, 0), this.body.position);
        this.body.applyLocalForce(new cannon.Vec3(100000, 0, 0), new cannon.Vec3(0, 0, 0));
        this.collided = false;
        this.collideListener = this.handleCollision.bind(this);
        this.remove = false;
        this.body.addEventListener('collide', this.collideListener);
        this.startTimer(5000);
    }

    createMissile() {
        const shape = new cannon.Sphere(0.5);
        const body = new cannon.Body({
            mass: 1,
            position: new cannon.Vec3(),
            shape: shape,
            linearDamping: 0.1,
            angularDamping: 0.1
        });
        this.world.addBody(body);
        return body;
    }

    handleCollision(event) {
        this.body.removeEventListener('collide', this.collideListener);
        this.collided = true;
        this.level.handleMissileCollision(this.id, event);
        this.remove = true;
    }

    getJSON() {
        return {
            id: this.id,
            playerId: this.player.id,
            position: this.body.position,
            quaternion: this.body.quaternion
        }
    }

    getBody() {
        return this.body;
    }

    startTimer(duration) {
        setTimeout(() => {
            console.log(`Missile ${this.id} has been removed after ${duration}ms`);
            Socket.getIO().emit('missileRemoved', {
                id: this.id,
                playerId: this.player.id
            });
            this.remove = true;
        }, duration);
    }

    destroy() {
        this.world.removeBody(this.body);
        this.level.levelProjectiles = this.level.levelProjectiles.filter(projectile => projectile.id !== this.id);
        this.player.projectiles = this.player.projectiles.filter(projectile => projectile.id !== this.id);
        delete this;
    }
}