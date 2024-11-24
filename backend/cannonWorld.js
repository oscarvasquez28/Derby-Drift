import Terrain from './terrain.js';
import * as cannon from 'cannon-es';

export default class CannonWorld {

    GRAVITY_FORCE = 9.82;

    constructor(heightmapPath = null, scale = 1) {
        this.world = new cannon.World();
        this.world.broadphase = new cannon.NaiveBroadphase();
        this.world.gravity.set(0, -this.GRAVITY_FORCE * 2, 0);
        this.world.defaultContactMaterial.friction = 0;
        this.world.solver.iterations = 10;
        this.terrain = new Terrain(this.world, heightmapPath, scale);
        this.FPS = 200;

        this.triggerCounter = 0;

        this.groundMaterial = new cannon.Material("groundMaterial");
        this.wheelMaterial = new cannon.Material("wheelMaterial");
        this.wheelGroundContactMaterial = new cannon.ContactMaterial(this.wheelMaterial, this.groundMaterial, {
            friction: 1,
            restitution: 0,
            contactEquationStiffness: 1000
        });
        this.world.addContactMaterial(this.wheelGroundContactMaterial);
    }

    createCircularBoundary(radius, numSegments) {
        const angleStep = (2 * Math.PI) / numSegments;
        const wallHeight = 10;
        const wallThickness = 3;
        const wallLength = (2 * Math.PI * radius) / numSegments;

        for (let i = 0; i < numSegments; i++) {
            const angle = i * angleStep;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);

            const shape = new cannon.Box(new cannon.Vec3(wallLength / 2, wallHeight / 2, wallThickness / 2));
            const body = new cannon.Body({
                mass: 0, // Static body
                position: new cannon.Vec3(x, wallHeight / 2, z),
                shape: shape
            });

            body.tag = "wall";

            body.quaternion.setFromAxisAngle(new cannon.Vec3(0, 1, 0), -angle);

            this.world.addBody(body);
        }
    }

    createTrigger(position, size, callback) {
        const shape = new cannon.Box(new cannon.Vec3(size.x / 2, size.y / 2, size.z / 2));
        const body = new cannon.Body({
            mass: 0, // Static body
            position: new cannon.Vec3(position.x, position.y, position.z),
            shape: shape
        });

        // Set collision response to false to make it a trigger
        body.collisionResponse = false;

        // Add event listener for overlaps
        body.addEventListener('collide', (event) => {
            console.log('Trigger overlapped with body:', event.body.tag);
            event.trigger = body;
            if (event.body.tag === "player" && callback) {
                callback(event);
            }
        });

        this.world.addBody(body);

        return body;
    }

    step() {
        this.world.step(1 / this.FPS);
    }

    getWorld() {
        return this.world;
    }

}