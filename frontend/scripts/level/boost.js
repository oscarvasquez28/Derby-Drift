import * as THREE from 'three';
import PowerUp from './powerUp.js';

export default class Boost extends PowerUp {

    constructor(params) {
        super(params);
    }

    createPowerUpMesh() {
        const sphereGeometry = new THREE.SphereGeometry(4.3, 8, 8);
        const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

        const dev = new THREE.Mesh(sphereGeometry, sphereMaterial);

        dev.receiveShadow = true;

        this.scene.add(dev);

        dev.position.copy(this.position);
        dev.quaternion.copy(this.quaternion);

        return dev;
    }

    update() {
        super.update();
    }
}