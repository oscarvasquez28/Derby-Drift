import * as cannon from 'cannon-es';
import Socket from './socket.js';
import { v4 as uuidv4 } from 'uuid';

export default class Missile {
    constructor(level, world, player) {
        this.id = uuidv4();
        this.level = level;
        this.world = world;
        this.player = player;
        this.chassis = this.player.getBody().chassis;
        this.damage = 50;
        this.body = this.createMissile();
        const localOffset = new cannon.Vec3(6, 2, 0);
        const worldOffset = this.chassis.pointToWorldFrame(localOffset);
        this.body.position.copy(worldOffset);
        this.body.velocity.copy(this.chassis.velocity);
        this.body.quaternion.copy(this.chassis.quaternion);
        this.body.applyLocalForce(new cannon.Vec3(50000, 500, 0), new cannon.Vec3(0, 0, 0));
        this.collided = false;
        this.collideListener = this.handleCollision.bind(this);
        this.remove = false;
        this.body.addEventListener('collide', this.collideListener);
        this.startTimer(5000);
    }

    createMissile() {
        const shape = new cannon.Sphere(2);
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
        if (event.body.tag === 'trigger')
            return;
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
            this.remove = true;
        }, duration);
    }

    destroy() {
        this.world.removeBody(this.body);
        Socket.getIO().emit('missileRemoved', {
            id: this.id,
            playerId: this.player.id
        });
        this.level.levelProjectiles = this.level.levelProjectiles.filter(projectile => projectile.id !== this.id);
        this.player.projectiles = this.player.projectiles.filter(projectile => projectile.id !== this.id);
        delete this;
    }
}