import Terrain from './terrain.js';
import * as cannon from 'cannon-es';

export default class CannonWorld {

    constructor() {
        this.world = new cannon.World();
        this.world.broadphase = new cannon.NaiveBroadphase();
        this.world.gravity.set(0, -9.82 * 2, 0);
        this.world.defaultContactMaterial.friction = 0;
        this.world.solver.iterations = 10;
        this.terrain = new Terrain(this.world);
        this.FPS = 144;

        this.groundMaterial = new cannon.Material("groundMaterial");
        this.wheelMaterial = new cannon.Material("wheelMaterial");
        this.wheelGroundContactMaterial = new cannon.ContactMaterial(this.wheelMaterial, this.groundMaterial, {
            friction: 0.3,
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