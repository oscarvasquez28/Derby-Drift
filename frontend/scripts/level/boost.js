import * as THREE from 'three';
import PowerUp from './powerUp.js';
import ObjModel from '../model.js';

export default class Boost extends PowerUp {

    constructor(params) {
        super(params);
    }

    createPowerUpMesh() {

        const gasTank = new ObjModel(this.scene, 'models/GasTank/GasTank.obj', 'models/GasTank/GasTank.mtl', false);
        gasTank.initModel().then((mesh) => {
            this.mesh = mesh;
            this.mesh.scale.set(1.5, 1.5, 1.5);
        });

        return null
    }

    update() {
        super.update();
        this.rotation.y += 0.01;
    }
}