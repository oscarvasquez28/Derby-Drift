import Socket from "./socket.js";
import * as cannon from 'cannon-es';

export default class AI {
    constructor(level) {
        this.level = level;
        this.players = this.level.players;
        this.body = null;
        this.arrived = false;
        this.randomPoint = new cannon.Vec3(50, 5, 50);
        this.timeSinceLastArrival = 0;
        this.init();
    }

    init() {
        this.body = this.level.world.createCollisionBox({ x: 50, y: 4, z: 50 }, { x: 2, y: 3, z: 2 }, 100);
        this.body.tag = "AI";
        this.body.addEventListener('collide', this.handleCollision.bind(this));
    }

    handleCollision(event) {
        // Handle collision logic here
        console.log('AI collided with', event.body.id);
        // Optionally, reduce the velocity upon collision
        this.body.velocity.scale(0.5, this.body.velocity);
        this.body.angularVelocity.scale(0.5, this.body.angularVelocity);
        const collidedPlayer = Object.values(this.players).find(player => player.getBody().chassis.id === event.body.id);
        if (collidedPlayer) {
            collidedPlayer.takeDamage(99999, "El jugador no respetó al peatón")
        }
    }

    update() {
        const aiPosition = this.body.position;
        let closestPlayer = null;
        let closestDistance = Infinity;

        for (const playerId in this.players) {
            const player = this.players[playerId];
            const playerPosition = player.getBody().chassis.position;
            const distance = aiPosition.distanceTo(playerPosition);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestPlayer = player;
            }
        }

        if (closestPlayer && closestDistance < 40) {
            const direction = new cannon.Vec3(
                aiPosition.x - closestPlayer.getBody().chassis.position.x,
                0,
                aiPosition.z - closestPlayer.getBody().chassis.position.z
            ).unit();
            const force = direction.scale(20); // Adjust the force value as needed
            this.body.velocity.set(force.x, force.y, force.z);
        } else {
            if (aiPosition.distanceTo(this.randomPoint) < 5) {
                this.arrived = true;
            }
            if (this.arrived || this.timeSinceLastArrival > 450) {
                this.randomPoint.set(
                    aiPosition.x + (Math.random() * 100 - 50),
                    5,
                    aiPosition.z + (Math.random() * 100 - 50)
                );
                this.arrived = false;
                this.timeSinceLastArrival = 0;
            }
            const pointDirection = new cannon.Vec3(
                this.randomPoint.x - aiPosition.x,
                0,
                this.randomPoint.z - aiPosition.z
            ).unit();
            const randomForce = pointDirection.scale(20); // Adjust the force value as needed
            this.body.velocity.set(randomForce.x, randomForce.y, randomForce.z);
            this.timeSinceLastArrival++;
        }
    }

    getJsonData() {
        return {
            id: this.body.id,
            position: this.body.position,
            velocity: this.body.velocity,
            quaternion: this.body.quaternion
        }
    }
}