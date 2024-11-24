import * as THREE from 'three';
import PowerUp from './powerUp.js';
import ObjModel from '../model.js';

export default class Ammo extends PowerUp {

    constructor(params) {
        super(params);
    }

    createPowerUpMesh() {

        const missileBody = new ObjModel(this.scene, 'models/Rocket/Rocket.obj', 'models/Rocket/Rocket.mtl', false);
        missileBody.initModel().then((mesh) => {
            this.mesh = mesh;
            this.mesh.scale.set(2.5, 2.5, 2.5);
        });

        return null
    }

    update() {
        super.update();
        this.rotation.y += 0.01;
    }
}