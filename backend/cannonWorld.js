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
        this.FPS = 144;

        this.groundMaterial = new cannon.Material("groundMaterial");
        this.wheelMaterial = new cannon.Material("wheelMaterial");
        this.wheelGroundContactMaterial = new cannon.ContactMaterial(this.wheelMaterial, this.groundMaterial, {
            friction: 1,
            restitution: 0,
            contactEquationStiffness: 1000
        });
        this.world.addContactMaterial(this.wheelGroundContactMaterial);
    }

    step() {
        this.world.step(1 / this.FPS);
    }

    getWorld() {
        return this.world;
    }

}