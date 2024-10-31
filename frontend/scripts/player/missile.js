import * as THREE from 'three';
import ObjModel from '../model.js';

export default class Missile {

    constructor(scene, player, id) {
        this.id = id;
        this.scene = scene;
        this.player = player;
        this.body = this.createMissile();
    }

    createMissile() {
        // const missileBody = new ObjModel('Missile', this.player.position, this.player.quaternion);
        const missileBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 2), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        this.scene.add(missileBody);
        return missileBody;
    }

    updateMissileFromJSON(missileJSON) {
        this.body.position.copy(missileJSON?.position ? missileJSON.position : new THREE.Vector3(0, 0, 0));
        this.body.quaternion.copy(missileJSON?.quaternion ? missileJSON.quaternion : new THREE.Quaternion(0, 0, 0, 1));
    }

    removeMissile() {
        this.scene.remove(this.body);
    }

}
