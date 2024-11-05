import * as cannon from 'cannon-es';
import Socket from './socket.js';
import { v4 as uuidv4 } from 'uuid';

export default class Missile {
    constructor(level, world, player) {
        this.id = uuidv4();
        this.level = level;
        this.world = world;
        this.player = player;
        this.body = this.createMissile();
        this.body.position.copy(this.player.position);
        this.body.velocity.copy(this.player.velocity);
        this.body.angularVelocity.copy(this.player.angularVelocity);
        this.body.quaternion.copy(this.player.quaternion);
        this.body.position.vadd(new cannon.Vec3(0, 4, 0), this.body.position);
        this.body.applyLocalForce(new cannon.Vec3(100000, 0, 0), new cannon.Vec3(0, 0, 0));
        this.collided = false;
        this.collideListener = this.handleCollision.bind(this);
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
        console.log('Collided with', event.body.id);
        Socket.getIO().emit('missileCollision', {
            id: this.id,
            playerId: this.player.id,
            collidedWith: event.body.id,
            position: this.body.position,
            quaternion: this.body.quaternion
        });
        delete this;
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
            this.world.removeBody(this.body);
            this.level.levelProjectiles = this.level.levelProjectiles.filter(projectile => projectile.id !== this.id);
            console.log(`Missile ${this.id} has been removed after ${duration}ms`);
            Socket.getIO().emit('missileRemoved', {
                id: this.id,
                playerId: this.player.id
            });
            delete this;
        }, duration);
    }
}