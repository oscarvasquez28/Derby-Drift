import * as THREE from 'three';
import ObjModel from '../model.js';

export default class Missile {

    constructor(scene, player, id) {
        this.id = id;
        this.scene = scene;
        this.player = player;
        this.createMissile().then(mesh => {
            this.body = mesh;
        });
    }

    async createMissile() {
        const missileBody = new ObjModel(this.scene, 'models/Rocket/Rocket.obj', 'models/Rocket/Rocket.mtl', false);
        let missileMesh = null
        await missileBody.initModel().then((mesh) => {
            missileMesh = mesh;
            missileMesh.scale.set(5, 5, 5);
        });
        return missileMesh;
        // const missileBody = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        // this.scene.add(missileBody);
        // return missileBody;
    }

    updateMissileFromJSON(missileJSON) {
        this.body?.position.copy(missileJSON?.position ? missileJSON.position : new THREE.Vector3(0, 0, 0));
        this.body?.quaternion.copy(missileJSON?.quaternion ? missileJSON.quaternion : new THREE.Quaternion(0, 0, 0, 1));
    }

    removeMissile() {
        this.scene.remove(this.body);
    }

}
